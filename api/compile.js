import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  // 1. Debugging: Log if the API Key is missing BEFORE calling OpenAI
  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: "OpenAI API Key is not configured in Vercel environment variables!" });
  }

  try {
    const { task, data } = req.body;
    
    // 2. Robust pathing
    const promptDir = path.join(process.cwd(), 'prompts');
    const promptFile = task === 'manifest' ? 'manifest_prompt.md' : 'script_prompt.md';
    const filePath = path.join(promptDir, promptFile);

    // 3. Debugging: Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(500).json({ error: `Prompt file not found at: ${filePath}` });
    }

    const systemPrompt = fs.readFileSync(filePath, 'utf-8');

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Process this data: ${JSON.stringify(data)}` }
      ],
    });

    res.status(200).json({ output: completion.choices[0].message.content });
  } catch (error) {
    // 4. Send the ACTUAL error back to the browser for debugging
    res.status(500).json({ error: error.message, stack: error.stack });
  }
}