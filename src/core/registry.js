// src/core/registry.js

import { columnChart } from "../charts/xy/catSeries/column.js";
import { lineChart } from "../charts/xy/catSeries/line.js";

const registry = {
  xy: {
    column: columnChart,
    line: lineChart,
    // later: area, stackedColumn, etc.
  },
};

export function resolveChartBuilder(engineType, chartType) {
  if (!engineType || !chartType) return null;

  const eKey = String(engineType).toLowerCase();
  const cKey = String(chartType).toLowerCase();

  const engineBucket = registry[eKey];
  if (!engineBucket) return null;

  return engineBucket[cKey] || null;
}
