import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  // Set CORS headers so your GitHub Pages frontend can talk to this API
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: "Method not allowed" });

  console.log("[Backend] Request received");

  try {
    const { task, data } = req.body;
    
    // Validate request
    if (!task || !data) {
      console.error("[Backend] Missing task or data in request body");
      return res.status(400).json({ error: "Invalid payload" });
    }

    // Resolve prompt path
    const promptFilename = task === 'manifest' ? 'manifest_prompt.md' : 'script_prompt.md';
    const promptPath = path.join(process.cwd(), 'prompts', promptFilename);
    
    console.log(`[Backend] Reading prompt from: ${promptPath}`);
    const systemPrompt = fs.readFileSync(promptPath, 'utf-8');

    // Call OpenAI
    console.log(`[Backend] Calling OpenAI for task: ${task}`);
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Here is the manuscript and CSV data: ${JSON.stringify(data)}` }
      ],
    });

    console.log("[Backend] OpenAI response received successfully");
    res.status(200).json({ output: completion.choices[0].message.content });

  } catch (error) {
    console.error("[Backend] Critical Error:", error.message);
    res.status(500).json({ error: error.message });
  }
}