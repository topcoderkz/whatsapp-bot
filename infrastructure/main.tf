# ---------- Enable APIs ----------

resource "google_project_service" "apis" {
  for_each = toset([
    "run.googleapis.com",
    "sqladmin.googleapis.com",
    "sql-component.googleapis.com",
    "logging.googleapis.com",
    "monitoring.googleapis.com",
    "iam.googleapis.com",
    "artifactregistry.googleapis.com",
    "cloudbuild.googleapis.com",
    "secretmanager.googleapis.com",
  ])

  service            = each.value
  disable_on_destroy = false
}

data "google_project" "current" {
  project_id = var.project_id
}

# ---------- Service Account ----------

resource "google_service_account" "bot" {
  account_id   = "fitness-bot"
  display_name = "Fitness Bot Service Account"
  depends_on   = [google_project_service.apis]
}

resource "google_project_iam_member" "bot_roles" {
  for_each = toset([
    "roles/cloudsql.client",
    "roles/logging.logWriter",
    "roles/monitoring.metricWriter",
    "roles/secretmanager.secretAccessor",
  ])

  project = var.project_id
  role    = each.value
  member  = "serviceAccount:${google_service_account.bot.email}"
}

# ---------- Cloud SQL (PostgreSQL) ----------

resource "google_sql_database_instance" "postgres" {
  name             = "fitness-bot-db"
  database_version = "POSTGRES_16"
  region           = var.region

  settings {
    tier              = var.db_tier
    availability_type = "ZONAL"
    edition           = "ENTERPRISE"

    ip_configuration {
      ipv4_enabled = true
      authorized_networks {
        name  = "allow-all"
        value = "0.0.0.0/0"
      }
    }

    backup_configuration {
      enabled                        = true
      start_time                     = "03:00"
      point_in_time_recovery_enabled = false
    }
  }

  deletion_protection = true
  depends_on          = [google_project_service.apis]
}

resource "google_sql_database" "fitness_bot" {
  name     = "fitness_bot"
  instance = google_sql_database_instance.postgres.name
}

resource "google_sql_user" "fitness" {
  name     = "fitness"
  instance = google_sql_database_instance.postgres.name
  password = var.db_password
}

# ---------- Secret Manager (DATABASE_URL for Cloud Build migrations) ----------

resource "google_secret_manager_secret" "database_url" {
  secret_id = "DATABASE_URL"

  replication {
    auto {}
  }

  depends_on = [google_project_service.apis]
}

resource "google_secret_manager_secret_version" "database_url" {
  secret      = google_secret_manager_secret.database_url.id
  secret_data = "postgresql://fitness:${var.db_password}@/${google_sql_database.fitness_bot.name}?host=/cloudsql/${google_sql_database_instance.postgres.connection_name}"
}

# TCP-based URL for migrations (Cloud Build can't use Unix sockets)
resource "google_secret_manager_secret" "database_url_tcp" {
  secret_id = "DATABASE_URL_TCP"
  replication {
    auto {}
  }
  depends_on = [google_project_service.apis]
}

resource "google_secret_manager_secret_version" "database_url_tcp" {
  secret      = google_secret_manager_secret.database_url_tcp.id
  secret_data = "postgresql://fitness:${var.db_password}@${google_sql_database_instance.postgres.public_ip_address}:5432/${google_sql_database.fitness_bot.name}?sslmode=disable"
}

resource "google_secret_manager_secret_iam_member" "cloudbuild_database_url_tcp" {
  secret_id = google_secret_manager_secret.database_url_tcp.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${data.google_project.current.number}-compute@developer.gserviceaccount.com"
}

# Grant Cloud Build access to the secret
resource "google_secret_manager_secret_iam_member" "cloudbuild_database_url" {
  secret_id = google_secret_manager_secret.database_url.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${data.google_project.current.number}@cloudbuild.gserviceaccount.com"
}

# ---------- Cloud Run: Bot ----------

resource "google_cloud_run_v2_service" "bot" {
  name     = "fitness-bot"
  location = var.region

  template {
    service_account = google_service_account.bot.email

    volumes {
      name = "cloudsql"
      cloud_sql_instance {
        instances = [google_sql_database_instance.postgres.connection_name]
      }
    }

    containers {
      image = var.bot_image != "" ? var.bot_image : "${var.region}-docker.pkg.dev/${var.project_id}/fitness-bot/bot:latest"

      ports {
        container_port = 8080
      }

      env {
        name  = "DATABASE_URL"
        value = "postgresql://fitness:${var.db_password}@localhost:5432/fitness_bot?host=/cloudsql/${google_sql_database_instance.postgres.connection_name}"
      }
      env {
        name  = "WHATSAPP_ACCESS_TOKEN"
        value = var.whatsapp_access_token
      }
      env {
        name  = "WHATSAPP_PHONE_NUMBER_ID"
        value = var.whatsapp_phone_number_id
      }
      env {
        name  = "WHATSAPP_VERIFY_TOKEN"
        value = var.whatsapp_verify_token
      }
      env {
        name  = "ADMIN_JWT_SECRET"
        value = var.admin_jwt_secret
      }
      env {
        name  = "ADMIN_PASSWORD"
        value = var.admin_password
      }
      env {
        name  = "NODE_ENV"
        value = "production"
      }

      resources {
        limits = {
          cpu    = "1"
          memory = "512Mi"
        }
      }

      volume_mounts {
        name       = "cloudsql"
        mount_path = "/cloudsql"
      }
    }
  }

  depends_on = [google_project_service.apis]
}

# Public access for bot (WhatsApp webhook must be publicly reachable)
resource "google_cloud_run_v2_service_iam_member" "bot_public" {
  name     = google_cloud_run_v2_service.bot.name
  location = var.region
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# ---------- Cloud Run: Admin ----------

resource "google_cloud_run_v2_service" "admin" {
  name     = "fitness-admin"
  location = var.region

  template {
    service_account = google_service_account.bot.email

    volumes {
      name = "cloudsql"
      cloud_sql_instance {
        instances = [google_sql_database_instance.postgres.connection_name]
      }
    }

    containers {
      image = var.admin_image != "" ? var.admin_image : "${var.region}-docker.pkg.dev/${var.project_id}/fitness-bot/admin:latest"

      ports {
        container_port = 8080
      }

      env {
        name  = "DATABASE_URL"
        value = "postgresql://fitness:${var.db_password}@localhost:5432/fitness_bot?host=/cloudsql/${google_sql_database_instance.postgres.connection_name}"
      }
      env {
        name  = "ADMIN_JWT_SECRET"
        value = var.admin_jwt_secret
      }
      env {
        name  = "BOT_INTERNAL_URL"
        value = google_cloud_run_v2_service.bot.uri
      }
      env {
        name  = "NODE_ENV"
        value = "production"
      }

      resources {
        limits = {
          cpu    = "1"
          memory = "512Mi"
        }
      }

      volume_mounts {
        name       = "cloudsql"
        mount_path = "/cloudsql"
      }
    }
  }

  depends_on = [google_project_service.apis]
}

# Public access for admin panel
resource "google_cloud_run_v2_service_iam_member" "admin_public" {
  name     = google_cloud_run_v2_service.admin.name
  location = var.region
  role     = "roles/run.invoker"
  member   = "allUsers"
}
