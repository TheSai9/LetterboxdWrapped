/**
 * A simple CSV parser that handles basic quoted strings.
 * For a production app, use a library like papaparse or d3-dsv.
 */
export const parseCSV = <T>(csvText: string): T[] => {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const result: T[] = [];

  for (let i = 1; i < lines.length; i++) {
    const currentLine = lines[i];
    if (!currentLine) continue;

    const values: string[] = [];
    let inQuotes = false;
    let currentValue = '';

    for (let charIndex = 0; charIndex < currentLine.length; charIndex++) {
      const char = currentLine[charIndex];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(currentValue);
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    values.push(currentValue);

    if (values.length === headers.length) {
      const obj: any = {};
      headers.forEach((header, index) => {
        // Clean quotes from values
        obj[header] = values[index].trim().replace(/^"|"$/g, '');
      });
      result.push(obj as T);
    }
  }

  return result;
};