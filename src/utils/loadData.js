// src/utils/loadData.js
export async function loadData(loader) {
  if (!loader) return [];

  if (loader.type === "csv") {
    const res = await fetch(loader.url);
    const text = await res.text();
    return parseCsv(text, loader.delimiter || ",");
  }

  if (loader.type === "json") {
    const res = await fetch(loader.url);
    return res.json();
  }

  throw new Error(`Unsupported dataLoader type: ${loader.type}`);
}

function parseCsv(text, delimiter) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length === 0) return [];

  const headers = lines[0].split(delimiter).map((h) => h.trim());

  return lines.slice(1).map((line) => {
    const cols = line.split(delimiter);
    const row = {};
    headers.forEach((h, i) => {
      row[h] = cols[i] !== undefined ? cols[i].trim() : null;
    });
    return row;
  });
}
