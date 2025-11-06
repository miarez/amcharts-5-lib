// src/main.js
import { loadData } from "./utils/loadData.js";
import { createChart } from "./core/createChart.js";

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
  ];
  const file = files[8];

  const config = await fetch(file).then((r) => r.json());

  // Resolve data before passing into chart core
  const data = await loadData(config.data);

  const { root, chart, cleanup } = createChart({
    ...config,
    data, // attach resolved data
  });

  // Expose for debugging
  window.currentChart = { root, chart, cleanup };
})();
