import { createXYSeriesChart } from "../families/xySeries.js";

export function createChart(config) {
  const family = config.family || "xy-series";

  switch (family) {
    case "xy-series":
      return createXYSeriesChart(config);

    default:
      throw new Error(`Unsupported chart family: ${family}`);
  }
}
// Stubs for later, per specs.md – we'll fill these in when we add diffing
export function updateChart(chartContext, nextConfig) {
  console.warn("updateChart() not implemented yet");
}

export function disposeChart(chartContext) {
  if (!chartContext) return;
  const { root, cleanup } = chartContext;
  if (typeof cleanup === "function") cleanup();
  else if (root && !root.isDisposed()) root.dispose();
}
