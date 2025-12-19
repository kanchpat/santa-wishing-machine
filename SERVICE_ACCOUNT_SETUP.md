# Service Account Setup for Santa Wishing Machine

To deploy and run this application securely on Google Cloud, you should use a dedicated Service Account with the minimum required permissions.

## 1. Create a Service Account

Run the following command to create a new service account (replace `[PROJECT_ID]` with your Google Cloud Project ID):

```bash
gcloud iam service-accounts create santa-wisher-sa \
    --display-name="Santa Wishing Machine Service Account"
```

The email address for this account will be:
`santa-wisher-sa@[PROJECT_ID].iam.gserviceaccount.com`

## 2. Assign Required Roles

Assign the necessary roles to the service account. This application requires access to Vertex AI (for Gemini) and potentially Cloud Storage.

### Essential Roles

*   **Vertex AI User:** Required to use Gemini models (Veo, Imagen, Flash TTS).
    ```bash
    gcloud projects add-iam-policy-binding [PROJECT_ID] \
        --member="serviceAccount:santa-wisher-sa@[PROJECT_ID].iam.gserviceaccount.com" \
        --role="roles/aiplatform.user"
    ```

*   **Service Usage Consumer:** Required to inspect service quotas/status.
    ```bash
    gcloud projects add-iam-policy-binding [PROJECT_ID] \
        --member="serviceAccount:santa-wisher-sa@[PROJECT_ID].iam.gserviceaccount.com" \
        --role="roles/serviceusage.serviceUsageConsumer"
    ```

### Deployment Roles (If using this SA for deployment/Cloud Build)

If you are using this service account within Cloud Build or to deploy Cloud Run services, add these roles:

*   **Cloud Run Developer:**
    ```bash
    gcloud projects add-iam-policy-binding [PROJECT_ID] \
        --member="serviceAccount:santa-wisher-sa@[PROJECT_ID].iam.gserviceaccount.com" \
        --role="roles/run.developer"
    ```

*   **Storage Object Viewer:** (For pulling container images)
    ```bash
    gcloud projects add-iam-policy-binding [PROJECT_ID] \
        --member="serviceAccount:santa-wisher-sa@[PROJECT_ID].iam.gserviceaccount.com" \
        --role="roles/storage.objectViewer"
    ```

*   **Artifact Registry Writer:** (If pushing images to Artifact Registry)
    ```bash
    gcloud projects add-iam-policy-binding [PROJECT_ID] \
        --member="serviceAccount:santa-wisher-sa@[PROJECT_ID].iam.gserviceaccount.com" \
        --role="roles/artifactregistry.writer"
    ```

## 3. Update Deployment Script

Once created, update your `deploy.sh` script to use this new service account:

```bash
# In deploy.sh
export SA=santa-wisher-sa@[PROJECT_ID].iam.gserviceaccount.com
```

## 4. API Key vs. Service Account

**Note:** The current implementation of the application (`santa-react/server.js`) primarily uses an **API Key** (`GEMINI_API_KEY`) to authenticate with the Gemini API (`generativelanguage.googleapis.com`).

While the Service Account Identity is used for the *Cloud Run environment* (logging, internal quotas), the **Gemini API calls themselves still require the API Key to be set as an Environment Variable.**

Ensure you set the secret when deploying:

```bash
gcloud run deploy santa-wishing-machine \
  ... \
  --set-env-vars GEMINI_API_KEY="your_actual_api_key_here"
```
