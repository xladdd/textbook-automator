# How to use the Compiler

### 1. Prepare your Files

- **Manuscript:** Ensure your PDF text is clean.
- **CSV Map:** Create a CSV with two columns: `id` and `type`.
  - The `id` must match your manuscript's reference markers.
  - The `type` must match your InDesign object style names.

### 2. Run the Compiler

- Select your files in the middle column and click **COMPILE**.
- Download the generated `manifest.json` to review the mapping.
- Download `automation.jsx`.

### 3. Run in InDesign

- Open your InDesign document.
- Go to **Window > Utilities > Scripts**.
- Right-click "User" and select **Reveal in Finder/Explorer**.
- Drop `automation.jsx` into that folder.
- Double-click it in InDesign to execute.
