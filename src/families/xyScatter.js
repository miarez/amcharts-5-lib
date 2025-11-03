// src/families/xyScatter.js
import { createScatterSeries } from "../utils/scatterSeries.js";
import { withLegend } from "../decorators/withLegend.js";
import { withCursor } from "../decorators/withCursor.js";
import { withScrollbars } from "../decorators/withScrollbars.js";

export function createXYScatterChart(config) {
  const root = am5.Root.new(config.container || "chartdiv");

  const themes = [];

  if (config.theme?.animated && window.am5themes_Animated) {
    themes.push(am5themes_Animated.new(root));
  }

  const mode = (
    config.theme?.mode ||
    config.theme?.name ||
    "light"
  ).toLowerCase();
  if (mode === "dark" && window.am5themes_Dark) {
    themes.push(am5themes_Dark.new(root));
  }

  if (themes.length) {
    root.setThemes(themes);
  }
  const chart = root.container.children.push(
    am5xy.XYChart.new(root, {
      panX: true,
      panY: true,
      wheelX: "panX",
      wheelY: "zoomX",
      layout: root.verticalLayout,
    })
  );

  if (config.theme?.background) {
    chart.set(
      "background",
      am5.Rectangle.new(root, {
        fill: am5.color(config.theme.background),
        fillOpacity: 1,
      })
    );
  }

  // ---------- AXES: both value axes ----------
  const axesCfg = config.axes || {};
  const xCfg = axesCfg.x || {};
  const yCfg = axesCfg.y || {};

  const xRenderer = am5xy.AxisRendererX.new(root, { minGridDistance: 40 });
  const yRenderer = am5xy.AxisRendererY.new(root, { minGridDistance: 30 });

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
      min: yCfg.min ?? undefined,
      max: yCfg.max ?? undefined,
      strictMinMax: yCfg.strictMinMax ?? false,
    })
  );

  // For cursor/decorators: treat xAxis as "domain" for tooltips
  xAxis._domainMode = "value";
  xAxis._domainField = config.fields?.x || "x";

  const series = createScatterSeries(root, chart, {
    config,
    xAxis,
    yAxis,
    data: config.data,
  });

  // ---------- Decorators ----------
  if (config.decorators?.legend?.enabled) {
    withLegend(root, chart, { series });
  }

  if (config.decorators?.cursor?.enabled) {
    // For scatter, domainAxis = xAxis (value axis)
    withCursor(root, chart, { domainAxis: xAxis, config });
  }

  if (config.decorators?.scrollbarX?.enabled) {
    withScrollbars(root, chart, { axis: "x" });
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
