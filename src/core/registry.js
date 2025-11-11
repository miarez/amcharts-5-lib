// src/core/registry.js

import { columnChart } from "../charts/xy/catSeries/column.js";

const registry = {
  xy: {
    column: columnChart,
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
