// src/main.js
import { loadData } from "./utils/loadData.js";
import { createChart } from "./core/createChart.js";

const files = [
  "./config/line-timeseries.json",
  "./config/category-columns.json",
  "./config/scatter-basic.json",
  "./config/scatter-complex.json",
  "./config/pie-config.json",
  "./config/donut-config.json",
  "./config/force-tree-basic.json",
  "./config/beeswarm-basic.json",
  "./config/heatmap-basic.json",
  "./config/gauge-basic.json",
  "./config/radar-stacked.json",
  "./config/polar-basic.json",
  "./config/polar-scatter.json",
];

(async function bootstrap() {
  const dashboard = document.getElementById("dashboard");
  const instances = [];

  for (const file of files) {
    const config = await fetch(file).then((r) => r.json());

    // Derive a stable base name for IDs
    const baseName = (
      config.id ||
      file
        .split("/")
        .pop()
        .replace(/\.json$/i, "")
    ).replace(/[^a-zA-Z0-9_-]/g, "_");

    const containerId = `chart_${baseName}`;

    // Build card DOM
    const card = document.createElement("section");
    card.className = "chart-card";

    const titleEl = document.createElement("h3");
    titleEl.className = "chart-title";
    titleEl.textContent =
      (config.options && config.options.title) || config.id || baseName;
    card.appendChild(titleEl);

    const containerEl = document.createElement("div");
    containerEl.className = "chart-container";
    containerEl.id = containerId;
    card.appendChild(containerEl);

    dashboard.appendChild(card);

    // Load data for this config
    const data = await loadData(config.data);

    // Override container with unique ID, attach resolved data
    const chartConfig = {
      ...config,
      container: containerId,
      data,
    };

    const instance = createChart(chartConfig);
    instances.push(instance);
  }

  // Handy for debugging/cleanup in console
  window.charts = instances;
})();
