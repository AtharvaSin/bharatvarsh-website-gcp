---
name: deploy_cloudrun
description: Helper skill for deploying the application to Google Cloud Run.
---
# Deploy Cloud Run Skill

This skill streamlines the deployment process to Google Cloud Run, ensuring the application is built and revisioned correctly.

## Pre-requisites
- Google Cloud SDK (`gcloud`) must be installed and authenticated.
- The project ID must be set (check `gcloud config get-value project`).
- Docker must be running if performing a local build (though Cloud Build is preferred).

## Process

### 1. Submit Build to Cloud Build
This builds the container image in the cloud, tagging it with `latest` and the current timestamp/SHA if configured.
```bash
gcloud builds submit --config cloudbuild.yaml .
```

### 2. Deploy to Cloud Run (Manual)
If the `cloudbuild.yaml` does not automatically trigger a deploy (continuous deployment), effectively "release" the image:
```bash
gcloud run deploy bharatvarsh-website \
  --image gcr.io/PROJECT_ID/bharatvarsh-website \
  --platform managed \
  --region asia-south1 \
  --allow-unauthenticated
```
*Note: Replace `PROJECT_ID` with the actual GCP project ID.*

### 3. Check Revision Status
Verify the deployment was successful and traffic is routed.
```bash
gcloud run services describe bharatvarsh-website --platform managed --region asia-south1 --format="value(status.url)"
```
