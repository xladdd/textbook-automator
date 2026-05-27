# Role: Adobe InDesign Automation Engineer

Convert the provided JSON manifest into an executable ExtendScript (.jsx) file.

## RULES:

1. Pagination: If `page_number` increments, execute `app.activeDocument.pages.add()`.
2. Placement: Place `.idms` snippets using coordinates derived from `image_metrics` (convert 300 DPI pixels to points: `pixels * 72 / 300`).
3. Injection: Search snippet for placeholders (e.g., `{{question_text}}`). Replace with JSON values, strictly preserving `ParagraphStyle`.
4. Tables: Use `grid_metrics` to resize tables in the snippet before population.
5. Layers: If `annotation` exists, move objects to the 'Annotations' layer.
6. Debug: Include `$.writeln()` statements for every major step.
7. Output: Return ONLY the valid .jsx code block.
