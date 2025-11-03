// src/main.js
import { loadData } from "./utils/loadData.js";
import { createChart } from "./core/createChart.js";

(async function bootstrap() {
  const file = "./config/line-timeseries.json";
  // const file = "./config/category-columns.json";

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
