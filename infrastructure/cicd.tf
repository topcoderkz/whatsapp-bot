# ---------- Artifact Registry ----------

resource "google_artifact_registry_repository" "fitness_bot" {
  location      = var.region
  repository_id = "fitness-bot"
  format        = "DOCKER"
  description   = "100% Fitness Bot container images"

  depends_on = [google_project_service.apis]
}

# ---------- Cloud Build trigger ----------
# Created manually after connecting GitHub repo in Cloud Build console.
# To create via CLI:
#   gcloud builds triggers create github \
#     --repo-name=whatsapp-bot --repo-owner=<OWNER> \
#     --branch-pattern="^main$" --build-config=cloudbuild.yaml \
#     --region=us-central1 --project=<PROJECT_ID>

# ---------- Cloud Build IAM ----------

locals {
  cloudbuild_sa = "serviceAccount:${data.google_project.current.number}@cloudbuild.gserviceaccount.com"
}

resource "google_project_iam_member" "cloudbuild_run_admin" {
  project = var.project_id
  role    = "roles/run.admin"
  member  = local.cloudbuild_sa
}

resource "google_project_iam_member" "cloudbuild_sa_user" {
  project = var.project_id
  role    = "roles/iam.serviceAccountUser"
  member  = local.cloudbuild_sa
}

resource "google_project_iam_member" "cloudbuild_ar_writer" {
  project = var.project_id
  role    = "roles/artifactregistry.writer"
  member  = local.cloudbuild_sa
}

resource "google_project_iam_member" "cloudbuild_sql_client" {
  project = var.project_id
  role    = "roles/cloudsql.client"
  member  = local.cloudbuild_sa
}
