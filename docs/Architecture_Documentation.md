
## Appendix: Documentation Asset Generation Prompts

The following prompts were used with the `gemini-3-pro-image-preview` ("Nano Banana Pro") model to generate the visual architecture diagrams in the `docs/` directory.

Each of these used the core architecture.png as the design style and aesthetic reference.

### 1. System Architecture (`visual_system_architecture.png`)
> Create a technical architecture diagram for the 'Santa Wishing Machine' system, matching the visual style of the provided reference image (festive, clean vector art, flat design, white background).
>
> The diagram should visualize the following structure:
> 1. **User** (icon: festive avatar) interacts with the **Frontend** (icon: laptop/screen with React logo).
> 2. **Frontend** sends requests to the **Backend** (icon: server rack with Node.js logo).
> 3. **Backend** connects to two Google Cloud AI services:
>     - **Veo** (icon: movie camera/film strip) for video generation.
>     - **Gemini TTS** (icon: sound wave/music note) for speech synthesis.
> 4. **Backend** also contains a **Compositor Service** (icon: gear/process combining items) that uses FFmpeg to merge the video and audio.
> 5. Draw arrows to show the flow: User -> Frontend -> Backend -> AI Services/Compositor, and the data flowing back (Video URI, Audio, Combined MP4).
>
> Use the same color palette (greens, reds, whites, golds) and illustrative style as the reference image. The text labels should be clear and legible.

### 2. Generation Workflow (`visual_generation_workflow.png`)
> Create a workflow diagram titled 'Generation Workflow' for the 'Santa Wishing Machine', matching the visual style of the provided reference image (festive, clean vector art, flat design, white background).
>
> The diagram should visualize this process from Left to Right:
> 1. **Start** node.
> 2. The flow splits into two parallel branches:
>     - Top Branch: **Generate Speech** -> **Gemini AI** -> **Audio Ready**.
>     - Bottom Branch: **Generate Video** -> **Veo AI (Long Running)** -> **Poll Loop** (circular arrow) -> **Video Ready**.
> 3. Both branches merge into a **Compositing** phase (icon: mixing bowl or gear).
> 4. Inside Compositing: **Download** -> **FFmpeg Process** (Loop & Mix) -> **Cleanup**.
> 5. Final node: **End**.
>
> Use the same color palette (greens, reds, whites, golds) and illustrative style as the reference image. Use simple icons for each step (microphone for speech, camera for video, clock for polling).

### 3. Compositor Architecture (`visual_compositor_architecture.png`)
> Create a technical architecture diagram for the 'Compositor Service' flow of the 'Santa Wishing Machine', matching the visual style of the provided reference image (festive, clean vector art, flat design, white background).
>
> The diagram should visualize this specific data flow from Left to Right:
> 1. **React Client** (icon: laptop) sends a request (Video URL + TTS Audio) to the **Node.js Backend**.
> 2. **Node.js Backend** (icon: server) passes data to the **Compositor Service**.
> 3. **Compositor Service** (icon: gear or processor with FFmpeg logo hint) processes the media.
> 4. Output is a **Final MP4** (icon: video file).
> 5. A return arrow goes from **Final MP4** back to **React Client** (Download URL).
>
> Use the same color palette (greens, reds, whites, golds) and illustrative style as the reference image.