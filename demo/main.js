// demo/main.js
import { createChart } from "../src/core/createChart.js";
import { loadData, normalizeDataForEngine } from "../src/utils/loadData.js";

async function bootstrap() {
  try {
    const res = await fetch("./config/column.json");
    const config = await res.json();

    let data = [];
    if (config.dataLoader) {
      const raw = await loadData(config.dataLoader);
      data = normalizeDataForEngine(raw, config.engine);
    } else if (config.data) {
      data = normalizeDataForEngine(config.data, config.engine);
    }

    console.log("Config:", config);
    console.log("Data rows:", data.length, data.slice(0, 5));

    config.data = data;

    const { root, chart } = createChart(config);

    window.root = root;
    window.chart = chart;

    console.log("Chart created:", chart);
  } catch (err) {
    console.error("Error creating chart:", err);
  }
}

bootstrap();
