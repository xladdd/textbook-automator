import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  
  const { task, data } = req.body;
  console.log(`[Backend] Received task: ${task}`);

  try {
    // 1. Determine Prompt Path
    const promptFilename = task === 'manifest' ? 'manifest_prompt.md' : 'script_prompt.md';
    const promptPath = path.join(process.cwd(), 'prompts', promptFilename);
    
    // 2. Read System Prompt
    if (!fs.existsSync(promptPath)) {
      throw new Error(`Prompt file not found: ${promptFilename}`);
    }
    const systemPrompt = fs.readFileSync(promptPath, 'utf-8');

    // 3. Call OpenAI with GPT-4o-mini (Cost-effective & reliable)
    console.log(`[Backend] Initiating GPT-4o-mini generation for: ${task}`);
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Process: ${JSON.stringify(data)}` }
      ],
    });

    const output = completion.choices[0].message.content;
    
    // 4. Log Success and Return
    console.log(`[Backend] Successfully generated ${task} output`);
    res.status(200).json({ output });

  } catch (err) {
    console.error(`[Backend Error] Task: ${task} | Details: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
}