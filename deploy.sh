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

# Check if Gemini API Key is set
if [ -z "$GEMINI_API_KEY" ]; then
  echo "Error: GEMINI_API_KEY variable is not set."
  echo "Please set export GEMINI_API_KEY='your-gemini-api-key'"
  exit 1
fi

export SERVICE_NAME="santa-wishing-machine"
export IMAGE_TAG="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

echo "Deploying $SERVICE_NAME to $PROJECT_ID..."

# Build the container image using the context of the santa-react directory
echo "Submitting to Cloud Build..."
# We use --project explicitly to ensure we are building in the right project
# We use cloudbuild.yaml to support build args
gcloud builds submit santa-react \
  --config santa-react/cloudbuild.yaml \
  --substitutions=_VITE_GEMINI_API_KEY="$GEMINI_API_KEY",_IMAGE_TAG="$IMAGE_TAG"

echo "Deploying to Cloud Run..."
# Note: Using --allow-unauthenticated for the public demo.
# If this should be internal-only like 'scream', replace with:
# --iap --no-allow-unauthenticated
gcloud beta run deploy $SERVICE_NAME \
  --image $IMAGE_TAG \
  --service-account $SA \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GOOGLE_CLOUD_PROJECT=${PROJECT_ID},GEMINI_API_KEY=${GEMINI_API_KEY}
