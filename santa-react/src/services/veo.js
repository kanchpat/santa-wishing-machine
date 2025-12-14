
export async function generateVideo(script, data) {
  try {
    const { name, interests, location } = data;
    // Create a prompt that puts Santa in the "background" (non-speaking) but contextually relevant
    // We emphasize "reading a letter" or "checking list" to avoid lip-sync expectation
    const visualPrompt = `Cinematic, photorealistic video of Santa Claus in his cozy North Pole workshop. 
    He is holding a magical parchment with the name "${name}" written on it. 
    He is smiling warmly and checking his Nice List. 
    Background includes vague shapes of toys like ${interests}.
    He nods approvingly (without speaking). 
    Warm fireplace lighting, 4k, magical atmosphere.`;

    const response = await fetch('/api/generate-video', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: visualPrompt,
      }),
    });

    if (!response.ok) {
      throw new Error(`Video Service Error: ${response.statusText}`);
    }

    const result = await response.json();
    console.log("Video Generation Result:", result);
    return result;
  } catch (error) {
    console.error("Veo Service Failed:", error);
    throw error;
  }
}
