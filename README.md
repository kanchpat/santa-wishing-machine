# 🎅 Santa's Wishing Machine (Gemini + Veo Edition)

A magical, AI-powered web experience where Santa moves, speaks, and creates personalized messages for children. Built with **React**, **Node.js**, **Google Gemini**, **Veo**, and **Gemini TTS**.

## ✨ Features

*   **Personalized Script Generation**: Uses **Gemini 2.0 Flash** to write unique, 60-second stories based on a child's name, age, location, and interests.
*   **Cinematic Video Generation**: Uses **Google Veo (veo-3.1-fast-generate-preview)** to create a photorealistic background video of Santa in his workshop (Context-Aware: Santa holds a parchment with the child's name!).
*   **Gemini Text-to-Speech**: Uses **Gemini 2.5 Flash Preview TTS** (Voice: Charon) for a natural, expressive Santa voice.
*   **Smart Looping**: Video seamlessly loops while the longer audio story plays.
*   **Dual-Stack Architecture**:
    *   **Frontend**: React + Vite + Tailwind CSS (Port 5173+)
    *   **Backend**: Node.js + Express Proxy (Port 3001) - Securely handles API keys and CORS.

---

## 🛠️ Setup & Prerequisites

### 1. API Keys
You need a **Google Cloud Project** with the following APIs enabled:
*   **Generative Language API** (for Gemini/Veo/TTS)

Create a `.env` file in the `santa-react` directory:
```env
VITE_GEMINI_API_KEY=your_api_key_here
GEMINI_API_KEY=your_api_key_here
```

### 2. Install Dependencies
```bash
cd santa-react
npm install
```

---

## 🚀 How to Run

We have a magical "One Click" start script that launches both the Backend (Santa's Brain) and Frontend (Santa's Face).

**Run this command in the project root:**
```bash
./start.sh
```

This will:
1.  Start the **Node.js Server** on port `3001` (Logs: `🎄 Starting Backend Server...`).
2.  Start the **Vite Dev Server** on port `5173` (or next available).
3.  Automatically proxy API requests.

**Access the App:** Open the URL shown in the terminal (usually `http://localhost:5173`).

### System Architecture Info-Graphic
![Santa App Architecture](architecture.png)

---

## 🧙‍♂️ Troubleshooting

### "Santa lost his voice!" (API Error)
If you click Play and get an error:
1.  Check your **server terminal logs**.
2.  Ensure your **Gemini API Key** is valid and has access to the `gemini-2.5-flash-preview-tts` model.

### Video Generation Fails?
*   Check if your project has access to `veo-3.1-fast-generate-preview` (Trusted Tester / Vertex AI access may be required).
*   The app falls back to "Mock Mode" if the API key is missing or invalid.

### "Port in Use"?
The `start.sh` script tries to use standard ports. If they are busy, Vite will auto-increment (5174, 5175...). Check the terminal for the actual localhost link.

---

## 📂 Project Structure
*   `src/components/PersonalizedMessage.jsx`: The core UI. Handles video looping, audio sync, and playback.
*   `src/services/gemini.js`: Frontend logic for Script Generation.
*   `src/services/veo.js`: Frontend logic for Video prompting.
*   `server.js`: The Backend.
    *   `/api/generate-video`: Calls Veo API (Authenticated).
    *   `/api/proxy-video`: Streams the video file (CORS fix).
    *   `/api/generate-speech`: Calls Gemini TTS API.
*   `node_env/`: Local Node.js environment (Self-contained).
*   `start.sh`: Universal launch script.

---
*Built with Holiday Magic by Stitch + Jetski ❄️*
