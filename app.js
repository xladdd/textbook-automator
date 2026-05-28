// app.js

// Verbose logging helper
const log = (msg) => { console.log(`[Frontend] ${msg}`); return msg; };
const status = document.getElementById("status");

// 1. Markdown guide display
fetch('data/howto.md')
  .then(response => response.text())
  .then(text => document.getElementById('guide').innerHTML = marked.parse(text))
  .catch(err => log(`Guide load error: ${err}`));

// 2. File UI logic
["pdfInput", "csvInput"].forEach((id) =>
  document.getElementById(id).addEventListener("change", (e) => {
    log(`UI Event: ${id} changed.`);
    const label = document.getElementById(id.replace("Input", "Label"));
    label.innerText = "File loaded";
    label.classList.add("loaded");
  })
);

const dl = (content, name) => {
  log(`Triggering download: ${name}`);
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([content], { type: 'text/plain' }));
  a.download = name;
  a.click();
};

document.getElementById("runBtn").onclick = async () => {
  const csvInput = document.getElementById("csvInput");
  if (!csvInput.files[0]) return alert("Select CSV first!");

  // Start Animation
  status.classList.add("active-status");
  status.style.color = "transparent"; 
  
  const csvText = await new Response(csvInput.files[0]).text();
  const sanitize = (text) => text.replace(/```[a-z]*\n?/g, '').trim();

  try {
    // TASK 1
    status.innerText = log("Step 1/2: Generating Manifest...");
    const mRes = await fetch("/api/compile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task: "manifest", data: { csv: csvText } }),
    });
    
    const mJson = await mRes.json();
    const manifest = sanitize(mJson.output);
    dl(manifest, "manifest.json");

    status.innerText = log("Manifest generated. Building script...");
    await new Promise(r => setTimeout(r, 2000));

    // TASK 2
    status.innerText = log("Step 2/2: Generating Script...");
    const sRes = await fetch("/api/compile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task: "script", data: manifest }),
    });
    
    const sJson = await sRes.json();
    dl(sanitize(sJson.output), "automation.jsx");
    
    // Finished: Reset UI
    status.classList.remove("active-status");
    status.style.color = "#000";
    status.innerText = log("Finished! 🎉 Files downloaded.");
    
  } catch (e) {
    // Error: Reset UI
    status.classList.remove("active-status");
    status.style.color = "#000";
    status.innerText = log("Error - Check Console");
    console.error(e);
  }
};