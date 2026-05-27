import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  
  const { task, data } = req.body;
  console.log(`[Backend] Received task: ${task}`);

  try {
    const promptFilename = task === 'manifest' ? 'manifest_prompt.md' : 'script_prompt.md';
    const promptPath = path.join(process.cwd(), 'prompts', promptFilename);
    const systemPrompt = fs.readFileSync(promptPath, 'utf-8');

    console.log(`[Backend] Calling gpt-4o-mini for ${task}...`);
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Process: ${JSON.stringify(data)}` }
      ],
    });

    console.log(`[Backend] Successfully generated ${task}`);
    res.status(200).json({ output: completion.choices[0].message.content });
  } catch (err) {
    console.error("[Backend Error]", err.message);
    res.status(500).json({ error: err.message });
  }
}