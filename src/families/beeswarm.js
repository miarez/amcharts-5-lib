// src/families/beeswarm.js
import { withLegend } from "../decorators/withLegend.js";
import { withCursor } from "../decorators/withCursor.js";
import { withScrollbars } from "../decorators/withScrollbars.js";
import { applyChartBackground } from "../core/applyChartBackground.js";

// root is injected from createChart(config)
export function createBeeswarmChart(root, config) {
  const options = config.options || {};
  const fields = config.fields || {};

  const xField = fields.x || "x";
  const jitter = typeof options.jitter === "number" ? options.jitter : 0.1;
  const rowSpacing =
    typeof options.rowSpacing === "number" ? options.rowSpacing : jitter;
  const radius = typeof options.radius === "number" ? options.radius : 6;

  // ---- build stacked beeswarm layout per x ----
  const sourceData = Array.isArray(config.data) ? config.data : [];

  const groups = new Map();
  for (const row of sourceData) {
    const x = Number(row[xField]);
    if (!groups.has(x)) groups.set(x, []);
    groups.get(x).push(row);
  }

  let maxLevel = 0;
  const stackedData = [];

  for (const [, rows] of groups) {
    rows.forEach((row, index) => {
      const level = Math.floor(index / 2); // 0,1,1,2,2,3,3...
      const sign = index % 2 === 0 ? 1 : -1; // +,-,+,-,...
      const y = level * rowSpacing * sign;

      maxLevel = Math.max(maxLevel, level);

      stackedData.push({
        ...row,
        __jitter: y,
      });
    });
  }

  const yExtentBase = rowSpacing * (maxLevel + 1 || 1);

  // ---- chart + axes ----
  const chart = root.container.children.push(
    am5xy.XYChart.new(root, {
      panX: true,
      panY: false,
      wheelX: "panX",
      wheelY: "zoomX",
      layout: root.verticalLayout,
    })
  );

  applyChartBackground(root, chart, config);

  const axesCfg = config.axes || {};
  const xCfg = axesCfg.x || {};
  const yCfg = axesCfg.y || {};

  const xRenderer = am5xy.AxisRendererX.new(root, { minGridDistance: 40 });
  const yRenderer = am5xy.AxisRendererY.new(root, { minGridDistance: 20 });

  const xAxis = chart.xAxes.push(
    am5xy.ValueAxis.new(root, {
      renderer: xRenderer,
      min: xCfg.min ?? undefined,
      max: xCfg.max ?? undefined,
      strictMinMax: xCfg.strictMinMax ?? false,
    })
  );

  const yAxis = chart.yAxes.push(
    am5xy.ValueAxis.new(root, {
      renderer: yRenderer,
      min: yCfg.min ?? -yExtentBase,
      max: yCfg.max ?? yExtentBase,
      strictMinMax: true,
    })
  );

  const series = chart.series.push(
    am5xy.LineSeries.new(root, {
      xAxis,
      yAxis,
      valueXField: xField,
      valueYField: "__jitter",
      calculateAggregates: false,
    })
  );

  // no connecting line, just dots
  series.strokes.template.setAll({
    strokeOpacity: 0,
  });

  // dots
  series.bullets.push((root) => {
    return am5.Bullet.new(root, {
      sprite: am5.Circle.new(root, {
        radius,
        fill: am5.color(0x4fc3f7),
        stroke: am5.color(0x000000),
        strokeWidth: 1,
        fillOpacity: 1,
      }),
    });
  });

  series.data.setAll(stackedData);

  if (config.decorators?.cursor?.enabled) {
    withCursor(root, chart, { domainAxis: xAxis, config });
  }

  if (config.decorators?.scrollbarX?.enabled) {
    withScrollbars(root, chart, { axis: "x" });
  }

  if (config.decorators?.legend?.enabled) {
    withLegend(root, chart, { series });
  }

  return {
    root,
    chart,
    series,
    cleanup: () => {
      if (!root.isDisposed()) root.dispose();
    },
  };
}
