
export async function generateScript(data, apiKey) {
  if (!apiKey) {
    console.warn("No API Key provided, using mock script.");
    return generateMockScript(data);
  }

  const prompt = `
    You are Santa Claus. Write a personalized video message script for a child named ${data.name}, aged ${data.age}.
    They live in ${data.location} and are interested in ${data.interests}.
    Their recent achievement is: ${data.achievements}.
    They have been ${data.behavior}% good this year (0=Naughty, 100=Angel).
    Their wish quote was: "${data.wishQuote}".
    Areas for improvement: "${data.improvements}".
    Top gift suggestion: "${data.giftSuggestion}".
    
    IMPORTANT: The script should be approximately 60 seconds long when spoken (about 130-160 words).
    Make it warm, magical, and engaging.
    Start with a friendly greeting using their name.
    
    Structure the response as a monologue script for Santa. 
    Keep it warm, magical, and specific. 
    Mention the behavior specifically.
    Mention the gift suggestion as something the elves are working on.
    End with a Merry Christmas.

    CRITICAL INSTRUCTIONS:
    1. Output ONLY the spoken words. 
    2. DO NOT include *stage directions* like (smiles), [looks at camera], or (pauses).
    3. DO NOT include intro text like "Here is the script" or "Okay".
    4. Start immediately with "Ho ho ho!" or "Hello".
    5. The text you generate will be sent directly to a Text-to-Speech engine, so it must be clean spoken English only.
  `;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    console.log("🎅 Contacting Gemini API...");
    // Using verified available model
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Gemini API Error: ${err}`);
    }

    const json = await response.json();
    return json.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Gemini Generation Failed:", error);
    return `(Error generating script: ${error.message}).\n\n` + generateMockScript(data);
  }
}

function generateMockScript(data) {
  return `Ho Ho Ho! Hello ${data.name}!

My elves here at the North Pole have been watching you very closely. They tell me you are ${data.age} years old now! My, how you've grown!

I've been checking my list, and I see you have been ${getBehaviorText(data.behavior)} this year. ${data.behavior > 50 ? "Keep up the great work!" : "I know you can do better before Christmas Eve!"}

I heard you whispered specifically about "${data.wishQuote}"? Well, Mrs. Claus and I think that is a wonderful thought.

Now, about that ${data.giftSuggestion}... The elves in the workshop are tinkering away. We'll see what fits in the sleigh!

Remember to work on ${data.improvements || "being kind"}.

Merry Christmas, ${data.name}!`;
}

function getBehaviorText(val) {
  if (val < 25) return "struggling a bit to stay on the Nice List";
  if (val < 50) return "trying your best, but sometimes forgetting to listen";
  if (val < 75) return "very good";
  return "extraordinarily angelic";
}
