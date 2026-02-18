# GCP Deployment Guide: Bhoomi Voice Agent Service

This guide explains how to deploy the `agent-service` (Python) to Google Cloud Run and connect it to your main website.

## 1. Prerequisites
- [x] GCP Project ID available
- [x] Secrets created in Secret Manager (`OPENAI_API_KEY`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`)
- [x] LiveKit Cloud project URL (e.g., `wss://bharatvarsh-....livekit.cloud`)

---

## 2. Step-by-Step Deployment

### Step A: Build the Container Image
The agent service needs to be containerized to run on Cloud Run.
1. Open a terminal in the `agent-service/` directory.
2. Run the following command to build the image using Cloud Build:
   ```bash
   gcloud builds submit --tag gcr.io/[PROJECT_ID]/bhoomi-voice-agent
   ```

### Step B: Create the Cloud Run Service
Once the image is built, deploy it as a service:
1. Run this command to deploy:
   ```bash
   gcloud run deploy bhoomi-voice-agent \
     --image gcr.io/[PROJECT_ID]/bhoomi-voice-agent \
     --region [YOUR_REGION] \
     --allow-unauthenticated \
     --min-instances 0 \
     --memory 1Gi \
     --cpu 1 \
     --update-secrets=OPENAI_API_KEY=OPENAI_API_KEY:latest,LIVEKIT_API_KEY=LIVEKIT_API_KEY:latest,LIVEKIT_API_SECRET=LIVEKIT_API_SECRET:latest \
     --set-env-vars LIVEKIT_URL=[YOUR_LIVEKIT_URL]
   ```
   *Note: Using `1Gi` memory and `1` CPU is recommended for smooth audio processing.*

### Step C: Update Frontend Website
Your **main website** service needs to know how to connect to LiveKit:
1. Go to your **existing** Cloud Run service for the website.
2. Update its Environment Variables:
   - `NEXT_PUBLIC_LIVEKIT_URL`: `wss://your-project.livekit.cloud`
   - `LIVEKIT_API_KEY`: (Reference to secret)
   - `LIVEKIT_API_SECRET`: (Reference to secret)

---

## 3. How the Connection Works (The "Secret Sauce")

You might wonder: *How does the website find the agent?*

1. **The Signaling Middleman**: Both the Website and the Agent Service connect to **LiveKit Cloud**. Think of LiveKit as the "switchboard."
2. **Room Request**: When a user clicks "Voice Mode", the website generates a token for a room named something like `bhoomi-4235`.
3. **Agent Activation**: Because the `agent-service` is running and connected to your LiveKit Project, it receives a signal: *"A new room has started!"*
4. **Auto-Join**: The Python agent automatically joins the same room. No manual IP addresses or direct links between services are needed. LiveKit Cloud handles the handshake. 

---

## 4. Verification in Production
1. Open your website (must be `https`).
2. Open the browser console (F12).
3. Click "Voice Mode".
4. You should see:
   - `DEBUG: Connected to LiveKit Cloud`
   - The status change to `LISTENING`.
   - The Python logs in Cloud Run showing `Starting Agent Session...`.
