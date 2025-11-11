// src/core/registry.js

// catSeries
import { columnChart } from "../charts/xy/catSeries/column.js";
import { lineChart } from "../charts/xy/catSeries/line.js";
import { areaChart } from "../charts/xy/catSeries/area.js";
import { stackedColumnChart } from "../charts/xy/catSeries/stackedColumn.js";
import { stackedAreaChart } from "../charts/xy/catSeries/stackedArea.js";
import { comboChart } from "../charts/xy/catSeries/combo.js";
import { dotChart } from "../charts/xy/catSeries/dot.js";
import { streamChart } from "../charts/xy/catSeries/stream.js";
import { waterfallChart } from "../charts/xy/catSeries/waterfall.js";

// catCat
import { heatmapChart } from "../charts/xy/catCat/heatmap.js";

const registry = {
  xy: {
    // catSeries
    column: columnChart,
    line: lineChart,
    area: areaChart,
    stackedcolumn: stackedColumnChart,
    stackedarea: stackedAreaChart,
    combo: comboChart,
    dot: dotChart,
    stream: streamChart,
    waterfall: waterfallChart,
    // catCat
    heatmap: heatmapChart,
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
