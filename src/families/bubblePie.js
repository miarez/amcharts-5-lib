// src/families/bubblePie.js
import { withLegend } from "../decorators/withLegend.js";
import { withCursor } from "../decorators/withCursor.js";
import { withScrollbars } from "../decorators/withScrollbars.js";
import { applyChartBackground } from "../core/applyChartBackground.js";

// root is injected from createChart(config)
export function createBubblePieChart(root, config) {
  const chart = root.container.children.push(
    am5xy.XYChart.new(root, {
      panX: true,
      panY: true,
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

  const fields = config.fields || {};
  const xField = fields.x || "x";
  const yField = fields.y || "y";
  const radiusField = fields.radius || "radius";
  const pieFields = Array.isArray(fields.pieFields) ? fields.pieFields : [];
  const pieLabels = Array.isArray(fields.pieLabels)
    ? fields.pieLabels
    : pieFields;

  const options = config.options || {};

  const series = chart.series.push(
    am5xy.LineSeries.new(root, {
      xAxis,
      yAxis,
      valueXField: xField,
      valueYField: yField,
      calculateAggregates: false,
    })
  );

  // Hide the connecting line via template
  series.strokes.template.setAll({
    strokeOpacity: 0,
  });

  // BULLETS FIRST
  series.bullets.push((root, series, dataItem) => {
    const row = dataItem?.dataContext || {};
    const radiusValue = row[radiusField];
    const size = mapRadiusToSize(radiusValue, options);

    const container = am5.Container.new(root, {
      width: size,
      height: size,
      centerX: am5.p50,
      centerY: am5.p50,
    });

    // Big background circle so we KNOW bullets exist
    container.children.push(
      am5.Circle.new(root, {
        radius: size / 2,
        fillOpacity: 0.1,
        strokeOpacity: 0.2,
      })
    );

    const pieChart = container.children.push(
      am5percent.PieChart.new(root, {
        width: size,
        height: size,
        innerRadius: am5.percent(50),
      })
    );

    const pieSeries = pieChart.series.push(
      am5percent.PieSeries.new(root, {
        categoryField: "category",
        valueField: "value",
      })
    );

    const pieData = pieFields.map((field, index) => {
      return {
        category: pieLabels[index] || field,
        value: Number(row[field]) || 0,
      };
    });

    pieSeries.data.setAll(pieData);

    pieSeries.labels.template.set("forceHidden", true);
    pieSeries.ticks.template.set("forceHidden", true);

    return am5.Bullet.new(root, {
      sprite: container,
    });
  });

  // THEN DATA
  series.data.setAll(config.data || []);

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

function mapRadiusToSize(value, options) {
  const minSize = options.minBulletSize ?? 40;
  const maxSize = options.maxBulletSize ?? 100;
  const minValue = options.minRadiusValue ?? 0;
  const maxValue = options.maxRadiusValue ?? 100;

  const v = Number(value) || 0;
  const t = Math.max(0, Math.min(1, (v - minValue) / (maxValue - minValue)));
  return minSize + (maxSize - minSize) * t;
}
