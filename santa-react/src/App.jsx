import { useState } from 'react'
import WishingConsole from './components/WishingConsole'
import PersonalizedMessage from './components/PersonalizedMessage'
import HeaderOps from './components/HeaderOps'
import { generateVideo } from './services/veo'
import { generateScript } from './services/gemini'

function App() {
  const [screen, setScreen] = useState('console') // 'console' | 'message'
  const [script, setScript] = useState('')
  const [formData, setFormData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [videoData, setVideoData] = useState(null) // { videoUrl, mode }
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false)

  const handleSend = async (data) => {
    console.log("🚀 [App] handleSend triggered", data);
    try {
      setLoading(true)
      setFormData(data)
      setVideoData(null) // Reset video on new wish
      // Use env var for key
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY
      console.log("🔑 [App] API Key detected:", !!apiKey);

      console.log("⏳ [App] Calling generateScript...");
      const generated = await generateScript(data, apiKey)
      console.log("✅ [App] generateScript returned:", generated?.substring(0, 50) + "...");

      setScript(generated)
      setLoading(false)
      setScreen('message')
    } catch (err) {
      console.error("💥 [App] handleSend Error:", err);
      setLoading(false);
      alert("Something went wrong! Check console.");
    }
  }

  const handleReset = () => {
    setScreen('console')
    setScript('')
    setFormData(null)
    setVideoData(null)
  }

  const handleGenerateVideo = async () => {
    if (!script || !formData) return
    setIsGeneratingVideo(true)
    try {
      const data = await generateVideo(script, formData)
      setVideoData(data)
    } catch (e) {
      console.error(e)
      alert("Failed to generate video. Check console.")
    } finally {
      setIsGeneratingVideo(false)
    }
  }

  if (screen === 'message') {
    return (
      <PersonalizedMessage
        name={formData?.name}
        script={script}
        videoData={videoData}
        isGeneratingVideo={isGeneratingVideo}
        onGenerateVideo={handleGenerateVideo}
        onReset={handleReset}
      />
    )
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark font-display text-gray-900 dark:text-gray-100 flex flex-col">
      <HeaderOps />
      <main className="flex-grow">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)]">
            <span className="material-symbols-outlined text-6xl text-primary animate-spin">cyclone</span>
            <p className="mt-4 text-xl font-bold">Contacting North Pole...</p>
            <p className="text-sm text-gray-500">Elves are typing...</p>
          </div>
        ) : (
          <WishingConsole onSubmit={handleSend} />
        )}
      </main>
    </div>
  )
}

export default App
