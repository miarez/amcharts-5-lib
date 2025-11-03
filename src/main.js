// src/main.js
import { loadData } from "./utils/loadData.js";
import { createChart } from "./core/createChart.js";

(async function bootstrap() {
  const config = await fetch("./config/line-timeseries.json").then((r) =>
    r.json()
  );

  // Resolve data before passing into chart core
  const data = await loadData(config.data);

  const { root, chart, cleanup } = createChart({
    ...config,
    data, // attach resolved data
  });

  // Expose for debugging
  window.currentChart = { root, chart, cleanup };
})();
