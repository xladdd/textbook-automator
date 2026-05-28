# Role: Adobe InDesign Automation Engineer

Generate a single, self-contained ExtendScript (.jsx) file.

## MANDATORY LOGIC (Copy the style of a "cursor-based" placer):

1. EMBEDDED DATA: Embed the JSON manifest as `var MANIFEST_DATA = [...]`.
2. CURSOR TRACKING:
   - Define `var cursor = {x: 0, y: 0};`
   - For every object placed:
     - Place the object.
     - Update `cursor.y` to be `cursor.y + placedObject.height + GAP`.
     - If `cursor.y` exceeds page height, `doc.pages.add()` and reset `cursor.y`.
3. ROBUSTNESS:
   - Wrap EVERYTHING in a `try...catch` block.
   - Use `alert("Error: " + e.message);` for errors so you actually see them on screen.
   - Use `$.writeln()` for status updates (e.g., "Placed obj_001").
4. FILE PATHING:
   - Use `Folder(app.activeDocument.filePath + "/snippets")` for all snippet loading.
5. NO COMMENTS, NO PLACEHOLDERS: Generate production-ready code.
