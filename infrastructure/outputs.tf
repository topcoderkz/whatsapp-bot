output "bot_url" {
  description = "URL of the bot service (webhook endpoint)"
  value       = google_cloud_run_v2_service.bot.uri
}

output "admin_url" {
  description = "URL of the admin panel"
  value       = google_cloud_run_v2_service.admin.uri
}

output "database_connection_name" {
  description = "Cloud SQL connection name"
  value       = google_sql_database_instance.postgres.connection_name
}

output "database_ip" {
  description = "Cloud SQL public IP"
  value       = google_sql_database_instance.postgres.public_ip_address
}

output "service_account" {
  description = "Bot service account email"
  value       = google_service_account.bot.email
}

output "webhook_url" {
  description = "WhatsApp webhook URL (set this in Meta Developer Console)"
  value       = "${google_cloud_run_v2_service.bot.uri}/webhook"
}
