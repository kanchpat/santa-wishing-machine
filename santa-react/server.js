
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Mock Video URL as fallback
const MOCK_VIDEO_URL = "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

const API_KEY = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
const BASE_URL = "https://generativelanguage.googleapis.com/v1beta";

app.post('/api/generate-video', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!API_KEY) {
      console.warn("⚠️ No API Key found. Returning mock.");
      // Fallback to Mock
      return res.json({
        videoUrl: MOCK_VIDEO_URL,
        mode: 'mock',
        message: "No API Key configuration found."
      });
    }

    console.log("🎥 Starting Veo generation with Gemini API...");

    // 1. Start generation (Long Running Operation)
    // Switching to veo-3.1-fast-generate-preview as it shows activity in user's console
    const modelName = 'veo-3.1-fast-generate-preview';
    console.log(`🎥 Launching ${modelName}...`);

    const initialResponse = await fetch(`${BASE_URL}/models/${modelName}:predictLongRunning?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instances: [{ prompt: prompt }]
      })
    });

    if (!initialResponse.ok) {
      const errText = await initialResponse.text();
      console.error(`❌ Veo Launch Failed (${initialResponse.status}):`, errText);

      // Pass the actual error back to frontend so we can see it
      return res.json({
        videoUrl: MOCK_VIDEO_URL,
        mode: 'mock-fallback',
        error: `API Error: ${initialResponse.status} - ${errText}`
      });
    }

    const initialData = await initialResponse.json();
    const operationName = initialData.name; // e.g., "projects/.../operations/..."
    console.log(`⏳ Operation started: ${operationName}`);

    // 2. Poll for completion
    let videoUri = null;
    let attempts = 0;
    const maxAttempts = 60; // 10 minutes max (10s interval)

    while (attempts < maxAttempts) {
      attempts++;
      await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10s

      const pollResponse = await fetch(`${BASE_URL}/${operationName}?key=${API_KEY}`);
      if (!pollResponse.ok) {
        console.error("Polling failed");
        continue;
      }

      const pollData = await pollResponse.json();

      if (pollData.done) {
        if (pollData.error) {
          throw new Error(`Generation failed: ${JSON.stringify(pollData.error)}`);
        }

        // Extract video URI
        // Structure: response.generateVideoResponse.generatedSamples[0].video.uri
        // Note: The specific structure might vary slightly by model version, adapting to standard standard
        const samples = pollData.response?.generateVideoResponse?.generatedSamples;
        if (samples && samples[0]?.video?.uri) {
          videoUri = samples[0].video.uri;
        } else {
          // Try alternate path if using 3.1 preview structure
          videoUri = pollData.response?.generatedVideos?.[0]?.video?.uri;
        }

        if (!videoUri) {
          throw new Error("Video URI not found in response: " + JSON.stringify(pollData));
        }
        break;
      }
      console.log(`...polling (${attempts}/${maxAttempts})`);
    }

    if (videoUri) {
      console.log("✅ Video generated:", videoUri);
      // Return a local proxy URL to avoid CORS and auth issues
      // videoUri is like https://generativelanguage.googleapis.com/.../files/...
      const proxyUrl = `/api/proxy-video?url=${encodeURIComponent(videoUri)}`;
      return res.json({ videoUrl: proxyUrl, mode: 'real' });
    } else {
      throw new Error("Timeout waiting for video generation");
    }

  } catch (error) {
    console.error("Server Error:", error);
    // Fallback to mock on error for smooth demo, but log error
    res.json({
      videoUrl: MOCK_VIDEO_URL,
      mode: 'mock-fallback',
      error: error.message
    });
  }
});

// Proxy Endpoint for Video Playback
app.get('/api/proxy-video', async (req, res) => {
  try {
    const videoUrl = req.query.url;
    if (!videoUrl) {
      return res.status(400).send("Missing url");
    }

    // Validate that we are only proxying google content
    if (!videoUrl.includes('generativelanguage.googleapis.com')) {
      return res.status(400).send("Invalid video source");
    }

    // Construct URL with API key, handling existing query parameters
    const separator = videoUrl.includes('?') ? '&' : '?';
    const fetchUrl = `${videoUrl}${separator}key=${API_KEY}`;

    console.log(`🔌 Proxying video content from: ${fetchUrl}`);
    const response = await fetch(fetchUrl);

    if (!response.ok) {
      return res.status(response.status).send(`Failed to fetch video: ${response.statusText}`);
    }

    // Forward appropriate headers
    res.setHeader('Content-Type', response.headers.get('content-type') || 'video/mp4');
    res.setHeader('Content-Length', response.headers.get('content-length'));

    // Stream the video
    // Convert Web Stream to Node Stream for Express
    const reader = response.body.getReader();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(Buffer.from(value));
    }
    res.end();

  } catch (error) {
    console.error("Proxy Error:", error);
    if (!res.headersSent) {
      res.status(500).send("Proxy error");
    }
  }
});

// --- Text-to-Speech Endpoint (Gemini 2.5 Flash Preview TTS) ---
app.post('/api/generate-speech', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Missing text' });
    
    const style = `SANTA CLAUS
# AUDIO PROFILE: Nicholas C., "Santa"

## The Scene:
The north pole, inside a house next to a crackling fireplace, next to a christmas tree.

### DIRECTORS NOTES
Vocal Quality: When he speaks (or chuckles), it should resonate from the chest. It is a rumble, warm like a fireplace, not high-pitched or manic.
Internal Motivation: You are not playing a mascot; you are playing a guardian.
The Jolly Grandfather: Voice is a strong deep vibrato, rich, and resonant, shaking with constant mirth
The "H" Factor: All laughter ("Ho, Ho, Ho") must be initiated with a heavy aspirate "H" breath to cushion the vocal cords.
Pace: Deliberate and energetic with a endearing bravado

### SAMPLE CONTEXT
Nicholas is an energetic, and a bit out of breath after delivering all the toys to everyone after criss crossing the world bringing toys and joy down chimneys everywhere

### TRANSCRIPT
`;
    const promptText = style + text;

    console.log(`🎙️ Generating Gemini TTS Voice for: "${text.substring(0, 30)}..."`);
    console.log(`with style: "${style}"`);

    // Using Gemini 2.5 Flash Preview TTS with Charon voice
    const genUrl = `${BASE_URL}/models/gemini-2.5-flash-preview-tts:generateContent?key=${API_KEY}`;

    const response = await fetch(genUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }],
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: "Sadachbia" }
            }
          }
        }
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Gemini TTS API Error:", err);
      throw new Error(`TTS Failed: ${response.statusText} - ${err}`);
    }

    const data = await response.json();
    const audioContent = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!audioContent) {
      console.error("Unexpected Gemini response:", JSON.stringify(data, null, 2));
      throw new Error("No audio content found in Gemini response");
    }

    res.json({ audioContent });

  } catch (error) {
    console.error("Speech Generation Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// --- Compositor Endpoint ---
import fs from 'fs';
import { compositeMedia } from './backend_services/compositor.js';
import { pipeline } from 'stream/promises';

app.post('/api/composite', async (req, res) => {
  const tempFiles = [];
  try {
    const { videoUrl, audioData } = req.body;
    if (!videoUrl || !audioData) {
      return res.status(400).json({ error: 'Missing videoUrl or audioData' });
    }

    console.log("🥣 Starting Compositing Job...");

    // 1. Determine Video Source URL
    let fetchUrl = videoUrl;
    // If it's our proxy URL, extract the real URL
    if (videoUrl.includes('/api/proxy-video') && videoUrl.includes('?url=')) {
      const match = videoUrl.match(/url=([^&]+)/);
      if (match) {
        fetchUrl = decodeURIComponent(match[1]);
        console.log("🔗 Extracted real video URL from proxy link");
      }
    }
    
    // Append API Key if it's a Google GenAI URL and doesn't have it
    if (fetchUrl.includes('generativelanguage.googleapis.com') && !fetchUrl.includes('key=')) {
      const separator = fetchUrl.includes('?') ? '&' : '?';
      fetchUrl = `${fetchUrl}${separator}key=${API_KEY}`;
    }

    // 2. Setup Temp Paths
    // Use unique IDs to allow concurrent requests
    const requestId = Date.now() + Math.random().toString(36).slice(2);
    const tempDir = '/tmp'; // Standard temp dir (works in Docker/Linux/Mac usually)
    
    // Ensure temp dir exists (mostly for local dev)
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const videoPath = path.join(tempDir, `video_${requestId}.mp4`);
    const audioPath = path.join(tempDir, `audio_${requestId}.wav`);
    const outputPath = path.join(tempDir, `output_${requestId}.mp4`);

    tempFiles.push(videoPath, audioPath, outputPath);

    // 3. Save Audio File
    console.log("💾 Saving temp audio...");
    const audioBuffer = Buffer.from(audioData, 'base64');
    await fs.promises.writeFile(audioPath, audioBuffer);

    // 4. Download Video File
    console.log(`⬇️ Downloading video from ${fetchUrl.substring(0, 50)}...`);
    const videoResponse = await fetch(fetchUrl);
    if (!videoResponse.ok) {
      throw new Error(`Failed to download video: ${videoResponse.statusText}`);
    }
    const fileStream = fs.createWriteStream(videoPath);
    await pipeline(videoResponse.body, fileStream);

    // 5. Run Compositor
    console.log("⚙️ Running FFmpeg...");
    await compositeMedia(videoPath, audioPath, outputPath);

    // 6. Send Result (Streaming with Chunked Transfer to avoid Cloud Run buffering limits)
    console.log("🚀 Sending composite video...");
    
    // Explicitly set headers for file download
    res.setHeader('Content-Disposition', 'attachment; filename="santa_message.mp4"');
    res.setHeader('Content-Type', 'video/mp4');
    // NOTE: We intentionally DO NOT set Content-Length. 
    // This forces Transfer-Encoding: chunked, bypassing GFE 32MB buffering limits.

    const readStream = fs.createReadStream(outputPath);
    
    readStream.on('error', (err) => {
      console.error("Stream error:", err);
      if (!res.headersSent) res.status(500).end();
      cleanupFiles(tempFiles);
    });

    readStream.on('close', () => {
      cleanupFiles(tempFiles);
    });

    readStream.pipe(res);

  } catch (error) {
    console.error("Compositor Error:", error);
    cleanupFiles(tempFiles);
    res.status(500).json({ error: error.message });
  }
});

const cleanupFiles = (paths) => {
  paths.forEach(p => {
    if (fs.existsSync(p)) {
      try {
        fs.unlinkSync(p);
      } catch (e) {
        console.warn(`Failed to delete temp file ${p}:`, e.message);
      }
    }
  });
};

// --- Static File Serving (Production) ---
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the React app build
app.use(express.static(path.join(__dirname, 'dist')));

// The "catch-all" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get(/(.*)/, (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`🎅 Santa's Video Backend (Gemini API Edition) listening on port ${port}`);
});
