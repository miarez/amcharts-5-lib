// src/utils/loadData.js

// I/O: fetch + parse
export async function loadData(dataConfig) {
  if (!dataConfig) return [];

  if (dataConfig.type === "csv") {
    const text = await fetch(dataConfig.url).then((r) => r.text());
    return parseCsv(text, dataConfig.delimiter || ",");
  }

  if (dataConfig.type === "json") {
    const data = await fetch(dataConfig.url).then((r) => r.json());
    // Make sure JSON data is an array of rows
    return Array.isArray(data) ? data : [];
  }

  console.warn("Unknown dataConfig.type, returning []", dataConfig);
  return [];
}

// --- CSV parsing with basic coercion (optional; keep or simplify) ---

function parseCsv(text, delimiter = ",") {
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");
  if (!lines.length) return [];

  const headers = lines[0].split(delimiter).map((h) => h.trim());

  return lines.slice(1).map((line) => {
    const values = line.split(delimiter);
    const row = {};
    headers.forEach((h, i) => {
      row[h] = values[i] ?? "";
    });
    return row;
  });
}

/**
 * Normalize data based on engine config:
 *  - detect numeric fields from engine.series (field, xField, yField, radiusField)
 *  - coerce stringy numbers ("12000") into real numbers (12000)
 *
 * This is where we fix your "revenue: '12000'" problem globally.
 */
export function normalizeDataForEngine(data, engine) {
  if (!Array.isArray(data) || !data.length) return data || [];

  const e = engine || {};
  const numericCandidates = [];

  const series = Array.isArray(e.series) ? e.series : [];

  for (const s of series) {
    if (!s) continue;
    if (s.field) numericCandidates.push(s.field);
    if (s.xField) numericCandidates.push(s.xField);
    if (s.yField) numericCandidates.push(s.yField);
    if (s.radiusField) numericCandidates.push(s.radiusField);
    if (s.sizeField) numericCandidates.push(s.sizeField);
  }

  const numericFields = [...new Set(numericCandidates)].filter(Boolean);
  if (!numericFields.length) return data;

  return data.map((row) => {
    const copy = { ...row };
    for (const f of numericFields) {
      const v = copy[f];
      if (v === null || v === undefined || v === "") continue;
      const n = Number(v);
      if (!Number.isNaN(n)) copy[f] = n;
    }
    return copy;
  });
}
