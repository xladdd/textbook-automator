// app.js

// 1. Initialize Markdown guide display
// Loads howto.md from the /data directory and parses it to HTML
fetch('data/howto.md')
  .then(response => {
    if (!response.ok) throw new Error("Could not find data/howto.md");
    return response.text();
  })
  .then(text => {
    document.getElementById('guide').innerHTML = marked.parse(text);
  })
  .catch(err => console.error("[Frontend] Guide load error:", err));

// 2. Restore UI logic for file inputs
// Changes button appearance to "loaded" state upon file selection
["pdfInput", "csvInput"].forEach((id) =>
  document.getElementById(id).addEventListener("change", (e) => {
    const label = document.getElementById(id.replace("Input", "Label"));
    label.innerText = "File loaded";
    label.classList.add("loaded");
  })
);

// 3. Helper: Trigger file download in browser
const dl = (content, name) => {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([content], { type: 'text/plain' }));
  a.download = name;
  a.click();
};

// 4. Compilation Logic
document.getElementById("runBtn").onclick = async () => {
  const status = document.getElementById("status");
  const csvInput = document.getElementById("csvInput");
  
  if (!csvInput.files[0]) return alert("Please select a CSV map first!");

  // Activate the gradient animation
  status.classList.add("active-status");
  
  const csvText = await new Response(csvInput.files[0]).text();
  
  // Sanitizer to strip markdown code blocks that the AI might include
  const sanitize = (text) => text.replace(/```[a-z]*\n?/g, '').trim();

  try {
    // TASK 1: Generate Manifest
    status.innerText = "Step 1/2: Generating Manifest...";
    const mRes = await fetch("/api/compile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task: "manifest", data: { csv: csvText } }),
    });
    
    if (!mRes.ok) throw new Error("Manifest generation failed");
    const mJson = await mRes.json();
    const manifest = sanitize(mJson.output);
    
    // Immediate download of the manifest
    dl(manifest, "manifest.json");
    status.innerText = "Manifest downloaded. Building script...";

    // Buffer delay for API rate limits
    await new Promise(r => setTimeout(r, 2000));

    // TASK 2: Generate Script
    status.innerText = "Step 2/2: Generating Script...";
    const sRes = await fetch("/api/compile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task: "script", data: manifest }),
    });
    
    if (!sRes.ok) throw new Error("Script generation failed");
    const sJson = await sRes.json();
    const script = sanitize(sJson.output);
    
    // Final download of the JSX script
    dl(script, "automation.jsx");
    
    status.innerText = "Finished! Files downloaded.";
  } catch (e) {
    status.innerText = "Error - Check Console";
    status.classList.remove("active-status");
    console.error("[Frontend Error]", e);
  }
};