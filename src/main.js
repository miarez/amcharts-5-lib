// src/main.js
import { loadData } from "./utils/loadData.js";
import { createChart } from "./core/createChart.js";

(async function bootstrap() {
  const files = [
    "./config/line-timeseries.json",
    "./config/category-columns.json",
    "./config/scatter-basic.json",
  ];
  const file = files[2];

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
