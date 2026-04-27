variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "region" {
  description = "GCP region"
  type        = string
  default     = "us-central1"
}

variable "bot_image" {
  description = "Container image for bot (override for manual deploy)"
  type        = string
  default     = ""
}

variable "admin_image" {
  description = "Container image for admin panel (override for manual deploy)"
  type        = string
  default     = ""
}

variable "db_tier" {
  description = "Cloud SQL machine type"
  type        = string
  default     = "db-f1-micro"
}

variable "db_password" {
  description = "PostgreSQL password for fitness user"
  type        = string
  sensitive   = true
}

variable "redis_url" {
  description = "Redis connection URL (Upstash or Memorystore)"
  type        = string
  default     = ""
}

variable "whatsapp_access_token" {
  description = "WhatsApp Business API access token"
  type        = string
  sensitive   = true
  default     = ""
}

variable "whatsapp_phone_number_id" {
  description = "WhatsApp phone number ID"
  type        = string
  default     = ""
}

variable "whatsapp_verify_token" {
  description = "WhatsApp webhook verify token"
  type        = string
  default     = "fitness-verify-token"
}

variable "admin_jwt_secret" {
  description = "JWT secret for admin panel"
  type        = string
  sensitive   = true
}

variable "admin_password" {
  description = "Default admin password"
  type        = string
  sensitive   = true
  default     = "changeme"
}

variable "github_owner" {
  description = "GitHub repository owner"
  type        = string
  default     = ""
}

variable "github_repo" {
  description = "GitHub repository name"
  type        = string
  default     = "whatsapp-bot"
}

variable "alert_email" {
  description = "Email for monitoring alerts"
  type        = string
  default     = "iluhaha1984@gmail.com"
}
