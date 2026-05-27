import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  // Ensure we always return JSON, even if we crash
  res.setHeader('Content-Type', 'application/json');

  console.log("[Backend] Log: Request started");

  try {
    const { task, data } = req.body;
    console.log("[Backend] Log: Task is", task);

    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is missing in Environment Variables");
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const promptFilename = task === 'manifest' ? 'manifest_prompt.md' : 'script_prompt.md';
    const promptPath = path.join(process.cwd(), 'prompts', promptFilename);

    console.log("[Backend] Log: Attempting to read file at", promptPath);
    
    if (!fs.existsSync(promptPath)) {
      throw new Error(`Prompt file missing at ${promptPath}`);
    }

    const systemPrompt = fs.readFileSync(promptPath, 'utf-8');
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Process: ${JSON.stringify(data)}` }
      ],
    });

    return res.status(200).json({ output: completion.choices[0].message.content });

  } catch (err) {
    console.error("[Backend] CRITICAL ERROR:", err.message);
    // Return the actual error message so the browser console prints it instead of SyntaxError
    return res.status(500).json({ error: err.message });
  }
}
