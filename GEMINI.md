# Gemini Project Context: Santa Wishing Machine

## Technical Learnings & Patterns

### Gemini TTS (Preview Models)
*   **Audio Format**: The `gemini-2.5-flash-preview-tts` model via `generateContent` returns raw audio data (likely PCM/WAV without header in some contexts) in the `inlineData`.
*   **Browser Playback**: To play this audio in a browser using a Blob, you must wrap the raw PCM bytes with a valid WAV header (RIFF/WAVE chunks) client-side.
*   **Styling**: The model responds very well to "Persona" prompting. Prepending a style guide (e.g., `style + text`) effectively changes the voice's prosody and emotion.
*   **Schema**: As of early 2025 previews, `audioConfig` (like `audioEncoding: "MP3"`) might not be supported in the `speechConfig` block for `generateContent`. Rely on default output and wrap it.

### Google Veo (Video Generation)
*   **Internal Errors**: Error Code 13 ("Internal Server Issue") is a known transient failure mode. The best strategy is to retry the request.
*   **Model Versions**: `veo-3.1-fast-generate-preview` provides faster generation but can be less stable than `veo-2.0-generate-001`.

### Backend (Node.js/Express)
*   **Express 5**: The wildcard route `*` is no longer supported by the `path-to-regexp` dependency. Use `/(.*)/` for catch-all routes (like serving an SPA).
*   **Media Payloads**: When handling large base64 media uploads (audio/video), explicitly increase the body parser limit (e.g., `app.use(express.json({ limit: '50mb' }));`) to prevent `PayloadTooLargeError`.

### Deployment (Cloud Run)
*   **Vite Env Vars**: Vite environment variables (`VITE_*`) are baked in at *build time*. When deploying via Docker/Cloud Build, you must pass these as `ARG` in the Dockerfile and `--build-arg` in the build command. They cannot be set only at runtime.

## Documentation & Visuals
*   **Planning First**: Complex features must start with a written plan in `docs/` (e.g., `COMPOSITOR_PLAN.md`) outlining architecture, rationale, and implementation steps.
*   **Diagrams**:
    *   **Structural**: Use Graphviz (`.dot` files) for technical accuracy and flow validation.
    *   **Stylized**: Use Gemini Image Generation (e.g., `gemini-3-pro-image-preview`) for presentation-grade assets. **Style Reference**: Use an existing `architecture.png` (if available) as a style/aesthetic reference in your prompt to ensure consistency.
    *   **Prompt Recording**: Always record the exact prompt used to generate a visual asset in an "Appendix" of the corresponding plan document.

## Task Management & Workflow (bd)

This project uses **bd** (beads) for issue tracking.

### Quick Reference
*   `bd ready` - Find available work
*   `bd show <id>` - View issue details
*   `bd create "Task description"` - Create a new task
*   `bd update <id> --status in_progress` - Claim work
*   `bd close <id>` - Complete work

### Session Completion ("Landing the Plane")
When ending a work session, you **MUST** complete the following workflow:

1.  **File Remaining Work**: Create issues for any incomplete tasks or follow-ups.
2.  **Run Quality Gates**: Execute tests and build commands if code was changed.
3.  **Update Issue Status**: Close completed issues.
4.  **Sync & Push**:
    ```bash
    git pull --rebase
    bd sync  # Syncs issue database with git
    git push
    ```
5.  **Verify**: Ensure `git status` shows "up to date with origin".

### Changelog Management
*   **Maintenance**: A `CHANGELOG.md` file is maintained in the project root.
*   **Generation**: Regenerate it using `bd` and `jq`:
    ```bash
    bd list --status closed --json | jq -r 'sort_by(.closed_at) | reverse | map(select(.closed_at != null)) | group_by(.closed_at[0:10]) | reverse | .[] | "## " + (.[0].closed_at[0:10]) + "\n" + (map("- " + .title + " (" + .id + ")") | join("\n")) + "\n"' > CHANGELOG.md
    ```

## Media Processing Architecture
*   **Compositing Strategy**: For complex media tasks (looping, mixing, trimming), prefer **Server-Side FFmpeg** (via `fluent-ffmpeg` wrapper) over client-side WASM.
    *   **Rationale**: Higher quality, better performance on mobile, and centralized control over the environment.
    *   **Infrastructure**: Ensure `ffmpeg` is installed in the runtime environment (e.g., `apk add ffmpeg` in Docker).
