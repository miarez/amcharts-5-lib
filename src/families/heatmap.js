// src/families/heatmap.js
import { applyChartBackground } from "../core/applyChartBackground.js";
import { withCursor } from "../decorators/withCursor.js";
import { withScrollbars } from "../decorators/withScrollBars.js";
import { withLegend } from "../decorators/withLegend.js";

function resolveColor(value, fallback) {
  if (typeof value === "number") {
    return am5.color(value);
  }
  if (typeof value === "string") {
    if (value.startsWith("0x")) {
      return am5.color(parseInt(value, 16));
    }
    return am5.color(value); // "#fffb77", "red", etc.
  }
  return am5.color(fallback);
}

export function createHeatmapChart(root, config) {
  // ----- CHART -----
  const chart = root.container.children.push(
    am5xy.XYChart.new(root, {
      panX: false,
      panY: false,
      wheelX: "none",
      wheelY: "none",
      paddingLeft: 0,
      layout: root.verticalLayout, // so legend can sit under chart
    })
  );

  applyChartBackground(root, chart, config);

  // ----- CONFIG FIELDS -----
  const fields = config.fields || {};
  const categoryXField = fields.x || "hour";
  const categoryYField = fields.y || "weekday";
  const valueField = fields.value || "value";

  const data = Array.isArray(config.data) ? config.data : [];

  // Build UNIQUE categories for each axis
  const xCategories = [];
  const xSeen = new Set();
  const yCategories = [];
  const ySeen = new Set();

  for (const row of data) {
    const cx = row[categoryXField];
    const cy = row[categoryYField];

    if (cx != null && !xSeen.has(cx)) {
      xSeen.add(cx);
      xCategories.push({ [categoryXField]: cx });
    }

    if (cy != null && !ySeen.has(cy)) {
      ySeen.add(cy);
      yCategories.push({ [categoryYField]: cy });
    }
  }

  // ----- AXES -----
  const yRenderer = am5xy.AxisRendererY.new(root, {
    minGridDistance: 20,
    inversed: true,
    minorGridEnabled: false,
  });
  yRenderer.grid.template.set("visible", false);

  const yAxis = chart.yAxes.push(
    am5xy.CategoryAxis.new(root, {
      maxDeviation: 0,
      renderer: yRenderer,
      categoryField: categoryYField,
    })
  );

  const xRenderer = am5xy.AxisRendererX.new(root, {
    minGridDistance: 30,
    opposite: true,
    minorGridEnabled: false,
  });
  xRenderer.grid.template.set("visible", false);

  const xAxis = chart.xAxes.push(
    am5xy.CategoryAxis.new(root, {
      renderer: xRenderer,
      categoryField: categoryXField,
    })
  );

  // Feed axes UNIQUE categories, not full row data
  xAxis.data.setAll(xCategories);
  yAxis.data.setAll(yCategories);

  // For cursor/decorators: treat xAxis as categorical domain
  xAxis._domainMode = "category";
  xAxis._domainField = categoryXField;

  // ----- SERIES (heat cells) -----
  const series = chart.series.push(
    am5xy.ColumnSeries.new(root, {
      calculateAggregates: true,
      clustered: false,
      stroke: am5.color(0xffffff),
      xAxis,
      yAxis,
      categoryXField,
      categoryYField,
      valueField,
    })
  );

  series.columns.template.setAll({
    tooltipText: `{${categoryYField}} {${categoryXField}}: {${valueField}}`,
    strokeOpacity: 1,
    strokeWidth: 2,
    width: am5.percent(100),
    height: am5.percent(100),
  });

  // ----- HEAT RULES -----
  const minColor = resolveColor(config.options?.minColor, 0xfffb77);
  const maxColor = resolveColor(config.options?.maxColor, 0xfe131a);

  series.set("heatRules", [
    {
      target: series.columns.template,
      min: minColor,
      max: maxColor,
      dataField: valueField,
      key: "fill",
    },
  ]);

  // ----- HEAT LEGEND -----
  const heatLegend = chart.bottomAxesContainer.children.push(
    am5.HeatLegend.new(root, {
      orientation: "horizontal",
      startColor: maxColor, // high at left
      endColor: minColor, // low at right
    })
  );

  series.events.on("datavalidated", function () {
    const high = series.getPrivate("valueHigh");
    const low = series.getPrivate("valueLow");
    if (high != null && low != null) {
      heatLegend.set("startValue", high);
      heatLegend.set("endValue", low);
    }
  });

  series.columns.template.events.on("pointerover", function (event) {
    const di = event.target.dataItem;
    if (di) {
      heatLegend.showValue(di.get(valueField, 0));
    }
  });

  // ----- DATA INTO SERIES -----
  series.data.setAll(data);

  // ----- DECORATORS -----
  if (config.decorators?.cursor?.enabled) {
    withCursor(root, chart, { domainAxis: xAxis, config });
  }

  if (config.decorators?.scrollbarX?.enabled) {
    withScrollbars(root, chart, { axis: "x" });
  }

  if (config.decorators?.legend?.enabled) {
    withLegend(root, chart, { series: [series], config });
  }

  chart.appear(1000, 100);

  return {
    root,
    chart,
    series,
    cleanup: () => {
      if (!root.isDisposed()) root.dispose();
    },
  };
}
