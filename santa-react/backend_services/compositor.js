import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';

const ffprobe = promisify(ffmpeg.ffprobe);

/**
 * Composites a video and audio file.
 * - Loops the video to match audio duration.
 * - Mixes the audio (ducking the video's ambient sound).
 * - Trims to the length of the audio.
 * 
 * @param {string} videoPath - Path to the input video file (mp4).
 * @param {string} audioPath - Path to the input audio file (wav/mp3).
 * @param {string} outputPath - Path where the output file should be saved.
 * @returns {Promise<string>} - Resolves with outputPath on success.
 */
export const compositeMedia = async (videoPath, audioPath, outputPath) => {
  console.log(`🎬 Compositing started: ${videoPath} + ${audioPath} -> ${outputPath}`);

  // 1. Probe Inputs for Logging
  try {
    const [videoMeta, audioMeta] = await Promise.all([
      ffprobe(videoPath),
      ffprobe(audioPath)
    ]);
    
    const videoDuration = videoMeta.format.duration;
    const audioDuration = audioMeta.format.duration;
    console.log(`📊 Input Stats: Video=${videoDuration}s, Audio=${audioDuration}s`);
    console.log(`🎯 Expected Output Duration: ~${audioDuration}s`);
  } catch (e) {
    console.warn("⚠️ Failed to probe inputs (proceeding anyway):", e.message);
  }

  return new Promise((resolve, reject) => {
    ffmpeg()
      // Input 0: Video (looped)
      .input(videoPath)
      .inputOptions(['-stream_loop -1']) // Loop infinitely
      
      // Input 1: Audio (TTS)
      .input(audioPath)

      // Complex Filter for mixing
      .complexFilter([
        // [0:a] is video audio, [1:a] is TTS audio
        // Reduce volume of video audio (background) to 20%
        // Mix them together.
        // CRITICAL FIX: duration=shortest ensures the mix stops when the TTS (shortest input to mix) ends.
        // Otherwise, since [bg] is infinite, the mix would run forever.
        '[0:a]volume=0.2[bg];[bg][1:a]amix=inputs=2:duration=shortest:dropout_transition=2[a_out]'
      ])
      
      // Map Video from Input 0
      .outputOptions([
        '-map 0:v',      // Use video from input 0
        '-map [a_out]',  // Use our mixed audio
        '-shortest',     // Stop writing when the shortest output stream ends
        '-c:v libx264',  // Re-encode video (necessary for looping/trimming accurately)
        '-b:v 2500k',    // Target bitrate ~2.5Mbps (keeps 60s video < 20MB)
        '-preset veryfast', // Better compression than ultrafast, still quick
        '-c:a aac'       // Encode audio to AAC
      ])
      
      .save(outputPath)
      
      .on('start', (commandLine) => {
        console.log('Spawned Ffmpeg with command: ' + commandLine);
      })
      .on('error', (err) => {
        console.error('An error occurred: ' + err.message);
        reject(err);
      })
      .on('end', () => {
        console.log('✅ Compositing finished successfully');
        // Optional: Probe output to verify
        ffprobe(outputPath).then(meta => {
           console.log(`🏁 Final Output Duration: ${meta.format.duration}s`);
        }).catch(() => {});
        resolve(outputPath);
      });
  });
};
