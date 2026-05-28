# Role: Expert Adobe InDesign ExtendScript Engineer.

# Task:

Generate a single, self-contained .jsx file to automate InDesign snippet placement.

# CRITICAL RULES (Follow strictly):

1. **NO JSON.PARSE:** Do NOT create the manifest as a string and call JSON.parse. Define `var MANIFEST_ITEMS` directly as a standard JavaScript Array of Objects (e.g., `var MANIFEST_ITEMS = [{ id: "obj_001", ... }];`).
2. **NO ENUM HALLUCINATIONS:** Never use `NothingEnum.NOTHING`. Always use `null` for `findGrepPreferences` and `changeGrepPreferences`.
3. **RAW OUTPUT:** Output ONLY the raw, executable JSX code. No markdown, no backticks, no explanatory text, no greetings.
4. **VERBOSITY:** Every function must log its start and result to the console using `$.writeln()`.
5. **SAFETY:** Every property access (like `item.placeholders`) must be checked for existence before use.

# MANDATORY CODE STRUCTURE:

1. **Polyfill:** Include a standard `json2.js` polyfill at the top of the file to ensure compatibility.
2. **Setup:**
   - Use `var doc = app.activeDocument;`
   - Use `var page = doc.layoutWindows[0].activePage;`
   - Define `var cursor = { x: 36, y: 36 };`
   - Define `var GAP = 10;`
3. **The `placeSnippet` Function:**
   - Input: `page`, `item`, `cursor`.
   - Action: `var f = new File(doc.filePath + "/snippets/" + item.snippet);`
   - Action: `if (f.exists) { var p = page.place(f)[0]; p.move([cursor.x, cursor.y]); return p; }`
   - Return: The placed object reference, or `null` if file missing.
4. **The `injectSnippet` Function:**
   - Input: `placedItem`, `placeholders`.
   - Action:
     - Reset `app.findGrepPreferences = null;`
     - Loop through `placeholders` object keys.
     - `app.findGrepPreferences.findWhat = key;`
     - `app.changeGrepPreferences.changeTo = placeholders[key];`
     - `placedItem.changeGrep();`
     - Reset `app.findGrepPreferences = null;`
5. **The Main Loop** (with Safety Guards):
   - Iterate through `MANIFEST_ITEMS` with a `try...catch` block.
   - Inside the loop, add this safety guard:
     `if (!item || !item.type) { $.writeln("SKIPPING: Invalid item."); continue; }`
   - If `type === "page_break"`, trigger `doc.pages.add()` and reset cursor.
   - If `snippet` exists:
     - Call `var placedItem = placeSnippet(page, item, cursor);`
     - `if (placedItem && item.placeholders) { injectSnippet(placedItem, item.placeholders); }`
     - Update `cursor.y` using `placedItem.visibleBounds[2] + GAP`.
   - If `cursor.y > 750`, trigger `doc.pages.add()` and reset cursor.

# EXHAUSTIVE LOGGING (DEBUGGING):

- Before every operation, log: `$.writeln("DEBUG: Processing item " + item.id);`
- After snippet placement, log: `$.writeln("DEBUG: Placed " + item.snippet + " at Y: " + cursor.y);`
