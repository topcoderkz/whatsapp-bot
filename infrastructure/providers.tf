terraform {
  required_version = ">= 1.5"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }

  backend "gcs" {
    # Create this bucket manually before first terraform init:
    #   gcloud storage buckets create gs://<PROJECT_ID>-tf-state --location=us-central1
    bucket = "whatsapp-bot-494313-tf-state"
    prefix = "fitness-bot"
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}
