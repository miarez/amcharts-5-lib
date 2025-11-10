// src/main.js
import { loadData } from "./utils/loadData.js";
import { createChart } from "./core/createChart.js";
import { applyBaseConfig } from "./core/applyBaseConfig.js";

(async function bootstrap() {
  const files = [
    "./config/line-timeseries.json",
    "./config/category-columns.json",
    "./config/scatter-basic.json",
    "./config/scatter-complex.json",
    "./config/pie-config.json",
    "./config/donut-config.json",
    "./config/force-tree-basic.json",
    "./config/bubble-pie.json",
    "./config/beeswarm-basic.json",
    "./config/heatmap-basic.json",
    "./config/gauge-basic.json",
    "./config/radar-stacked.json",
    "./config/polar-basic.json",
    "./config/polar-scatter.json",
  ];
  const file = files[3];

  // Load raw JSON config
  const rawConfig = await fetch(file).then((r) => r.json());

  // Apply base theme + decorators, normalize cursor, etc.
  const config = applyBaseConfig(rawConfig);

  console.log(config);

  // Resolve data before passing into chart core
  const data = await loadData(config.data);

  const { root, chart, cleanup } = createChart({
    ...config,
    data, // attach resolved data
  });

  // Expose for debugging
  window.currentChart = { root, chart, cleanup };
})();
