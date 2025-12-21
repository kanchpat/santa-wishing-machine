
import React, { useState } from 'react';

export default function PersonalizedMessage({ name, script, videoData, isGeneratingVideo, onGenerateVideo, onReset }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioBase64, setAudioBase64] = useState(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [isCompositing, setIsCompositing] = useState(false);
  const videoRef = React.useRef(null);
  const audioRef = React.useRef(null);

  const handlePlayMessage = async () => {
    // If playing, stop everything
    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
      setIsPlaying(false);
      return;
    }

    if (!script) return;

    // If we already have audio, just play it
    if (audioUrl) {
      startPlayback();
      return;
    }

    // Otherwise generate it
    setIsLoadingAudio(true);
    try {
      const response = await fetch('/api/generate-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: script })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("TTS Error:", errorData);
        throw new Error('TTS Failed');
      }

      // Helper to Write String to DataView
      const writeString = (view, offset, string) => {
        for (let i = 0; i < string.length; i++) {
          view.setUint8(offset + i, string.charCodeAt(i));
        }
      };

      // Helper to add WAV header to raw PCM data
      const withWavHeader = (samples) => {
        const buffer = new ArrayBuffer(44 + samples.length);
        const view = new DataView(buffer);
        const sampleRate = 24000; // Gemini default
        const numChannels = 1;

        // RIFF chunk descriptor
        writeString(view, 0, 'RIFF');
        view.setUint32(4, 36 + samples.length, true);
        writeString(view, 8, 'WAVE');

        // fmt sub-chunk
        writeString(view, 12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true); // PCM format (1)
        view.setUint16(22, numChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * numChannels * 2, true); // byte rate
        view.setUint16(32, numChannels * 2, true); // block align
        view.setUint16(34, 16, true); // bits per sample

        // data sub-chunk
        writeString(view, 36, 'data');
        view.setUint32(40, samples.length, true);

        // Write samples
        const sampleBytes = new Uint8Array(buffer, 44);
        sampleBytes.set(samples);

        return buffer;
      };

      const data = await response.json();
      console.log("Received audio content length:", data.audioContent?.length);

      // Create a blob URL from the base64 audio
      const binaryString = window.atob(data.audioContent);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Convert PCM to WAV for playback
      const wavBuffer = withWavHeader(bytes);
      
      // Store raw WAV bytes (base64 encoded) for compositing
      // We need to convert the WAV buffer back to base64 or just use the raw PCM data?
      // The backend expects 'audioData' as base64. 
      // Option 1: Send the original PCM base64 (data.audioContent) and let backend add WAV header.
      // Option 2: Send the WAV file as base64.
      // The current backend code (server.js) writes the base64 directly to a .wav file:
      // await fs.promises.writeFile(audioPath, audioBuffer);
      // If we send PCM bytes to a .wav file, ffmpeg might complain if it lacks a header.
      // So we should send the WAV-headered buffer as base64.
      
      // Helper to buffer to base64
      let binary = '';
      const wavBytes = new Uint8Array(wavBuffer);
      const len = wavBytes.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(wavBytes[i]);
      }
      const wavBase64 = window.btoa(binary);
      setAudioBase64(wavBase64);

      const blob = new Blob([wavBuffer], { type: 'audio/wav' });
      console.log("Created audio blob size:", blob.size);
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);

      // Need a small timeout to let React update state/ref before playing? 
      // Actually we can just play directly after state update or pass url to helper
      setTimeout(() => startPlayback(url), 100);

    } catch (e) {
      console.error("Audio generation failed:", e);
      alert("Santa lost his voice! (Check console for API errors)");
    } finally {
      setIsLoadingAudio(false);
    }
  };

  const handleDownloadVideo = async () => {
    if (!videoData?.videoUrl || !audioBase64) {
      alert("Please play the message first to generate the audio!");
      return;
    }

    setIsCompositing(true);
    try {
      const response = await fetch('/api/composite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoUrl: videoData.videoUrl,
          audioData: audioBase64
        })
      });

      if (!response.ok) throw new Error('Compositing failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Santa_Message_${name || 'Believer'}.mp4`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to create video. Please try again.");
    } finally {
      setIsCompositing(false);
    }
  };

  const startPlayback = (urlOverride) => {
    const src = urlOverride || audioUrl;
    if (!src || !audioRef.current) return;

    // Force reload src if needed (usually auto-handled by react but explicit is safer for race conditions)
    if (audioRef.current.src !== src) {
      audioRef.current.src = src;
    }

    audioRef.current.play().then(() => {
      setIsPlaying(true);
      if (videoRef.current) videoRef.current.play();
    }).catch(e => console.error("Playback error:", e));
  };

  // Sync Video Stop with Audio End
  const onAudioEnded = () => {
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  // Sync Video Pause/Play with Audio (optional, if user manually pauses audio controls)
  const onAudioPause = () => {
    if (videoRef.current && !videoRef.current.paused) {
      videoRef.current.pause();
    }
  };

  // Pre-load voices - REMOVED as no longer using window.speechSynthesis
  // React.useEffect(() => {
  //   window.speechSynthesis.getVoices();
  // }, []);

  return (
    <div className="min-h-screen flex flex-col font-display bg-background-light dark:bg-background-dark text-ink dark:text-white">
      {/* Hidden Audio Player */}
      <audio
        ref={audioRef}
        onEnded={onAudioEnded}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
      />

      {/* Header */}
      <header className="relative z-10 w-full bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-[#f4e8e7] dark:border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 text-ink dark:text-white">
            <div className="text-primary-mail">
              <span className="material-symbols-outlined text-4xl">forest</span>
            </div>
            <h2 className="text-xl font-bold leading-tight tracking-tight">Santa's Workshop</h2>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <button onClick={onReset} className="text-sm font-medium hover:text-primary-mail transition-colors">Create New Wish</button>
            <a className="text-sm font-medium hover:text-primary-mail transition-colors" href="#">Track Gift</a>
            <a className="text-sm font-medium hover:text-primary-mail transition-colors" href="#">Contact Santa</a>
          </nav>
        </div>
      </header>

      {/* Main */}
      <main className="flex-grow relative w-full flex flex-col items-center justify-start pt-12 pb-24 px-4 md:px-8 overflow-hidden">
        <div className="absolute inset-0 w-full h-full z-0">
          <img
            alt="Bustling North Pole factory"
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDfm0vU6NOuhJHl2h3MWI6JOuT5Kv8Wnnv-ad0UlhbLkRRDmvsz2GoBxoS3v6S8-z6hYB15mGUvvXhXA40ySuZrBmiA5PbjyOsar7wK-c5gRgGwXuF3RhvjitVrsI2A2hBpaAafVs1rpyqRx4suEgjdPGsAx816V9o4rKMgj-swM_X23zgCm3Xci4wUq9SMXZmeSUpyZnIWvo0Crgx4H17PW-lb_a7SlWvyYNRiu3hHSceWaZguUqUy-_fGYmLHkIKBm1XMHMC-Lsc"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80 backdrop-blur-[1px]"></div>
        </div>

        <div className="relative z-10 w-full max-w-5xl flex flex-col items-center">
          {/* Header Text */}
          <div className="w-full text-center mb-8 animate-fade-in-down">
            <div className="inline-flex items-center justify-center p-2 bg-white/95 backdrop-blur-sm rounded-full mb-6 shadow-xl border border-white/20">
              <span className="material-symbols-outlined text-primary-mail mr-2">videocam</span>
              <span className="text-primary-mail font-bold text-sm uppercase tracking-wider">Video Message Received</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight drop-shadow-2xl">A Message from Santa</h1>
            <p className="text-lg text-white/90 font-medium drop-shadow-lg max-w-2xl mx-auto">
              {videoData ? "Click play to watch Santa Claus deliver his special message!" : "Santa has written a letter. Want him to read it?"}
            </p>
          </div>

          {/* Video Player Section */}
          <div className="w-full max-w-4xl aspect-video bg-black rounded-2xl shadow-2xl border-4 border-[#d4af37]/60 relative overflow-hidden group mb-10 ring-4 ring-black/30">
            {isGeneratingVideo ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white">
                <span className="material-symbols-outlined text-6xl text-primary-mail animate-spin mb-4">auto_videocam</span>
                <p className="text-xl font-bold animate-pulse">Elves are filming...</p>
                <p className="text-sm opacity-70">This typically takes 3-5 seconds</p>
              </div>
            ) : videoData ? (
              // Active Video Player
              <div className="relative w-full h-full">
                <video
                  ref={videoRef}
                  src={videoData.videoUrl}

                  className="w-full h-full object-cover"
                  loop
                  playsInline
                  muted // Muted initially to allow autoplay if browser restricts, but we are controlling via button
                />

                {/* Overlay Play Button */}
                {!isPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/30 transition-colors cursor-pointer" onClick={handlePlayMessage}>
                    <button className="bg-white/90 text-primary-mail rounded-full p-6 shadow-2xl transform hover:scale-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed" disabled={isLoadingAudio}>
                      {isLoadingAudio ? (
                        <span className="material-symbols-outlined text-6xl animate-spin">refresh</span>
                      ) : (
                        <span className="material-symbols-outlined text-6xl">play_arrow</span>
                      )}
                    </button>
                  </div>
                )}

                {/* Playing Indicator */}
                {isPlaying && (
                  <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    Santa is speaking...
                  </div>
                )}
              </div>
            ) : (
              // Placeholder with Generate Button
              <>
                <img
                  alt="Video Thumbnail"
                  className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-1000"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDDiTEpltENHlhULYfHeB2ke-ZElx1SA7QqnFFYqI1Wu3tUobD6m-50KjhMAMqdsACDSSL9vM1TAa9RIY9ZwWxQ1mJBEREMK3PkGZ4wd61aVXO_34qzBcNeer05xLe3tKD77OGUFevfcCqSYnDj0w7_ovwRUHcKNwzXmkibh6HQcjMbffeUvgh81Uxtz4zgo3U2ueNODeLTmvcwEdQ9vqKmEXo02Xwj1xRIeLozhyNAIXkm2uV8IaGLCJOZNgRKMuVfbZ3_ElacLl8"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                    onClick={onGenerateVideo}
                    className="flex flex-col items-center gap-2 bg-primary-mail/90 hover:bg-primary-mail text-white rounded-xl py-4 px-8 shadow-[0_0_30px_rgba(242,32,13,0.5)] transform transition-all duration-300 hover:scale-105 group-hover:shadow-[0_0_50px_rgba(242,32,13,0.7)] backdrop-blur-sm border-2 border-white/20"
                  >
                    <span className="material-symbols-outlined text-5xl drop-shadow-md">magic_button</span>
                    <span className="font-bold text-lg">Generate Video</span>
                  </button>
                </div>
              </>
            )}

            {/* Mock Mode Badge */}
            {videoData?.mode === 'mock' && (
              <div className="absolute top-4 right-4 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded shadow-lg">
                MOCK MODE
              </div>
            )}
          </div>

          {/* Letter / Script */}
          <div className="w-full max-w-4xl relative">
            <div className="absolute -top-12 -left-12 w-48 h-48 bg-primary-mail/40 rounded-full blur-3xl z-0"></div>
            <div className="absolute -bottom-12 -right-12 w-56 h-56 bg-green-500/40 rounded-full blur-3xl z-0"></div>

            <div className="relative z-10 bg-parchment dark:bg-[#2c1810] rounded-xl paper-shadow overflow-hidden border border-[#eaddcf] dark:border-[#3e2a22]">
              <div className="w-full p-8 md:p-12 flex flex-col relative">
                <div className="absolute top-6 right-6 text-green-700/20 dark:text-green-500/20 rotate-12">
                  <span className="material-symbols-outlined text-6xl select-none">eco</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-4 mb-6">
                  <div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white">Dearest <span className="text-primary-mail decoration-wavy underline decoration-primary-mail/30">{name || 'Believer'}</span>,</h2>
                    <p className="text-xs font-bold tracking-widest text-gray-400 mt-1 uppercase">Written Transcription of Video Message</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-500">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                  </div>
                </div>

                {/* THE SCRIPT */}
                <div className="prose prose-lg dark:prose-invert text-gray-800 dark:text-gray-200 leading-relaxed font-normal mb-8 max-w-none font-serif whitespace-pre-line">
                  {script ? script : (
                    <p className="italic text-gray-500">
                      [Script will appear here...]
                    </p>
                  )}
                </div>

                <div className="mt-auto flex items-end justify-between">
                  <div>
                    <p className="text-xl font-bold text-ink dark:text-white mb-1 font-serif italic">Merry Christmas,</p>
                    <p className="text-2xl font-black text-primary-mail font-serif">Santa Claus</p>
                  </div>
                  <div className="wax-seal w-20 h-20 rounded-full flex items-center justify-center transform rotate-12 border-4 border-red-700/50 relative group cursor-help" title="Official North Pole Seal">
                    <div className="absolute inset-0 rounded-full border border-white/20"></div>
                    <div className="text-red-900 flex flex-col items-center justify-center leading-none text-center">
                      <span className="text-[0.6rem] font-bold uppercase tracking-tighter block mb-0.5">Official</span>
                      <span className="material-symbols-outlined text-2xl drop-shadow-sm">verified</span>
                      <span className="text-[0.6rem] font-bold uppercase tracking-tighter block mt-0.5">Seal</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="w-full max-w-4xl mt-10">
            <div className="flex flex-wrap items-center justify-center gap-4">
              <button className="group flex items-center justify-center gap-2 bg-white/90 backdrop-blur-sm border-2 border-white hover:border-primary-mail text-ink px-6 h-12 rounded-full font-bold transition-all shadow-lg hover:shadow-xl hover:bg-white">
                <span className="material-symbols-outlined text-primary-mail group-hover:scale-110 transition-transform">picture_as_pdf</span>
                Download Letter
              </button>
              <button 
                onClick={handleDownloadVideo}
                disabled={isCompositing || !videoData || !audioBase64}
                className="group flex items-center justify-center gap-2 bg-primary-mail hover:bg-red-600 text-white px-8 h-12 rounded-full font-bold transition-all shadow-xl hover:shadow-primary-mail/50 hover:-translate-y-0.5 border-2 border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCompositing ? (
                  <>
                    <span className="material-symbols-outlined animate-spin">autorenew</span>
                    Compositing...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined group-hover:animate-bounce">download</span>
                    Download Video
                  </>
                )}
              </button>
              <button onClick={onReset} className="group flex items-center justify-center gap-2 bg-black/40 backdrop-blur-md border-2 border-white/30 hover:border-white text-white px-6 h-12 rounded-full font-bold transition-all shadow-lg hover:shadow-xl">
                <span className="material-symbols-outlined group-hover:rotate-180 transition-transform duration-500">autorenew</span>
                Create Another
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
