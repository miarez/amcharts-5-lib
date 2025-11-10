// src/families/gauge.js
import { applyChartBackground } from "../core/applyChartBackground.js";
import { resolveColor } from "../utils/utils.js";

export function createGaugeChart(root, config) {
  const variant = config.variant || "bands"; // future: "solid", "multi-part", "progress"

  if (variant !== "bands") {
    console.warn(
      `[gauge] Variant '${variant}' not implemented yet – falling back to 'bands'.`
    );
  }

  const axesCfg = config.axes || {};
  const valueAxisCfg = axesCfg.value || {};
  const options = config.options || {};
  const fields = config.fields || {};
  const scale = config.scale || {};

  const valueField = fields.value || "value";

  const min = valueAxisCfg.min ?? 0;
  const max = valueAxisCfg.max ?? 100;

  const startAngle = valueAxisCfg.startAngle ?? options.startAngle ?? 180;
  const endAngle = valueAxisCfg.endAngle ?? options.endAngle ?? 360;

  const innerRadius = options.innerRadius ?? -20;

  const tickLabelRadius = options.tickLabelRadius ?? 10;
  const bandLabelRadius = options.bandLabelRadius ?? -25;

  // ----- CHART -----
  const chart = root.container.children.push(
    am5radar.RadarChart.new(root, {
      panX: false,
      panY: false,
      startAngle,
      endAngle,
    })
  );

  applyChartBackground(root, chart, config);

  // ----- AXIS RENDERER -----
  const axisRenderer = am5radar.AxisRendererCircular.new(root, {
    innerRadius,
  });

  // hide grid arcs if you don't want them
  axisRenderer.grid.template.setAll({
    visible: false,
    strokeOpacity: 0.1,
  });

  // kill tick marks (those little black lines)
  axisRenderer.ticks.template.setAll({
    visible: false,
    strokeOpacity: 0,
  });

  // ----- VALUE AXIS -----
  const xAxis = chart.xAxes.push(
    am5xy.ValueAxis.new(root, {
      maxDeviation: 0,
      min,
      max,
      strictMinMax: true,
      renderer: axisRenderer,
    })
  );

  // numeric labels OUTSIDE the band
  xAxis.get("renderer").labels.template.setAll({
    radius: tickLabelRadius,
    inside: false,
    fontSize: 12,
  });

  // ----- CLOCK HAND -----
  const axisDataItem = xAxis.makeDataItem({});

  const clockHand = am5radar.ClockHand.new(root, {
    pinRadius: am5.percent(8),
    radius: am5.percent(90),
    bottomWidth: 15,
  });

  axisDataItem.set(
    "bullet",
    am5xy.AxisBullet.new(root, {
      sprite: clockHand,
    })
  );

  xAxis.createAxisRange(axisDataItem);

  // ----- CENTER LABEL -----
  const centerCfg = options.centerLabel || {};

  const centerLabel = chart.radarContainer.children.push(
    am5.Label.new(root, {
      fill: root.interfaceColors.get("text"),
      centerX: am5.percent(50),
      centerY: am5.percent(50),
      textAlign: "center",
      fontSize: centerCfg.fontSize ?? "2em",
    })
  );

  const formatValueText = (v) => {
    const decimals = centerCfg.decimals ?? 0;
    const base = v.toFixed(decimals);
    const fmt = centerCfg.format || "{value}";
    return fmt.replace("{value}", base);
  };

  // ----- BANDS (scale.bands) -----
  let bands = [];
  if (Array.isArray(scale.bands)) {
    bands = scale.bands;
  } else if (scale.bands && Array.isArray(scale.bands.items)) {
    bands = scale.bands.items;
  }

  bands.forEach((band) => {
    const start = band.start ?? band.lowScore ?? min;
    const end = band.end ?? band.highScore ?? max;

    const rangeDataItem = xAxis.makeDataItem({
      value: start,
      endValue: end,
    });

    const axisRange = xAxis.createAxisRange(rangeDataItem);

    axisRange.get("axisFill").setAll({
      visible: true,
      fill: resolveColor(band.color, 0xcccccc),
      fillOpacity: band.opacity ?? 0.8,
    });

    if (band.label) {
      axisRange.get("label").setAll({
        text: band.label,
        inside: true,
        radius: bandLabelRadius,
        fontSize: band.fontSize ?? 12,
        fill: root.interfaceColors.get("text"),
      });
    }
  });

  // ----- COLOR HAND & LABEL BY BAND -----
  const bullet = axisDataItem.get("bullet");

  bullet.get("sprite").on("rotation", function () {
    const value = axisDataItem.get("value");
    let fill = root.interfaceColors.get("text");

    xAxis.axisRanges.each(function (axisRange) {
      if (
        value >= axisRange.get("value") &&
        value <= axisRange.get("endValue")
      ) {
        fill = axisRange.get("axisFill").get("fill");
      }
    });

    centerLabel.set("text", formatValueText(value));

    clockHand.pin.animate({
      key: "fill",
      to: fill,
      duration: 500,
      easing: am5.ease.out(am5.ease.cubic),
    });
    clockHand.hand.animate({
      key: "fill",
      to: fill,
      duration: 500,
      easing: am5.ease.out(am5.ease.cubic),
    });
  });

  // ----- VALUE FROM DATA (NOT CONFIG) -----
  let value = min;

  const dataRows = Array.isArray(config.data) ? config.data : [];
  if (dataRows.length) {
    const row = dataRows[0];
    const v = Number(row[valueField] ?? row.value);
    if (!Number.isNaN(v)) value = v;
  } else {
    console.warn("[gauge] No data rows found; defaulting value to min.");
  }

  // clamp into [min, max]
  if (value < min) value = min;
  if (value > max) value = max;

  // animate into place
  axisDataItem.set("value", min);
  axisDataItem.animate({
    key: "value",
    to: value,
    duration: 800,
    easing: am5.ease.out(am5.ease.cubic),
  });

  chart.bulletsContainer.set("mask", undefined);
  chart.appear(1000, 100);

  return {
    root,
    chart,
    axis: xAxis,
    clockHand,
    cleanup: () => {
      if (!root.isDisposed()) root.dispose();
    },
  };
}
