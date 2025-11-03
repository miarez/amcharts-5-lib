// src/utils/loadData.js
export async function loadData(dataConfig) {
  if (!dataConfig) return [];

  if (dataConfig.type === "csv") {
    const text = await fetch(dataConfig.url).then((r) => r.text());
    return parseCsv(text, dataConfig.delimiter || ",");
  }

  if (dataConfig.type === "json") {
    return fetch(dataConfig.url).then((r) => r.json());
  }

  console.warn("Unknown dataConfig.type, returning []", dataConfig);
  return [];
}

function parseCsv(text, delimiter) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length === 0) return [];

  const headers = lines[0].split(delimiter).map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const values = line.split(delimiter);
    const row = {};
    headers.forEach((h, i) => {
      row[h] = coerce(values[i]);
    });
    return row;
  });
}

function coerce(value) {
  const v = value?.trim();
  if (v === "" || v == null) return null;
  const n = Number(v);
  return Number.isNaN(n) ? v : n;
}
