// src/core/createChart.js
import { createXYSeriesChart } from "../families/xySeries.js";
import { createXYScatterChart } from "../families/xyScatter.js";
import { createPieChart } from "../families/pie.js";
import { createForceTreeChart } from "../families/forceTree.js";
import { createBeeswarmChart } from "../families/beeswarm.js";
import { createHeatmapChart } from "../families/heatmap.js";
import { createGaugeChart } from "../families/gauge.js";
import { createRadialSeriesChart } from "../families/radialSeries.js";

// Centralized root + theme creation
function createRoot(config) {
  const containerId = config.container || "chartdiv";
  const root = am5.Root.new(containerId);

  const themes = [];

  // Animated theme
  if (config.theme?.animated && window.am5themes_Animated) {
    themes.push(am5themes_Animated.new(root));
  }

  // Dark / light mode
  const mode = (
    config.theme?.mode ||
    config.theme?.name ||
    "light"
  ).toLowerCase();
  if (mode === "dark" && window.am5themes_Dark) {
    themes.push(am5themes_Dark.new(root));
  }

  if (themes.length) {
    root.setThemes(themes);
  }

  return root;
}

export function createChart(config) {
  const family = config.family || "xy-series";
  const root = createRoot(config);

  switch (family) {
    case "xy-series":
      return createXYSeriesChart(root, config);

    case "xy-scatter":
      return createXYScatterChart(root, config);

    case "pie":
    case "donut":
      return createPieChart(root, config);

    case "force-tree":
      return createForceTreeChart(root, config);

    case "beeswarm":
      return createBeeswarmChart(root, config);

    case "heatmap":
    case "category-matrix": // optional alias
      return createHeatmapChart(root, config);

    case "gauge":
      return createGaugeChart(root, config);

    case "radial-series":
      return createRadialSeriesChart(root, config);

    default:
      // avoid leaking a root on bad config
      if (!root.isDisposed()) root.dispose();
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
