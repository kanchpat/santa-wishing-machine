#!/bin/bash
# Deploy Santa Wishing Machine
set -e

export PROJECT_ID=$(gcloud config get project)

# Check if Service Account is set
if [ -z "$SA" ]; then
  echo "Error: Service Account (SA) variable is not set."
  echo "Please set export SA='your-service-account@...'"
  echo "See SERVICE_ACCOUNT_SETUP.md for instructions on creating one."
  exit 1
fi

export SERVICE_NAME="santa-wishing-machine"
export IMAGE_TAG="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

echo "Deploying $SERVICE_NAME to $PROJECT_ID..."

# Build the container image using the context of the santa-react directory
# We assume the Dockerfile is inside santa-react/
echo "Submitting to Cloud Build..."
# We use --project explicitly to ensure we are building in the right project
gcloud builds submit --tag $IMAGE_TAG santa-react

echo "Deploying to Cloud Run..."
# Note: Using --allow-unauthenticated for the public demo.
# If this should be internal-only like 'scream', replace with:
# --iap --no-allow-unauthenticated
gcloud beta run deploy $SERVICE_NAME \
  --image $IMAGE_TAG \
  --service-account $SA \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GOOGLE_CLOUD_PROJECT=${PROJECT_ID}
