// src/families/gauge.js
import { applyChartBackground } from "../core/applyChartBackground.js";

function resolveColor(value, fallback) {
  if (typeof value === "number") return am5.color(value);
  if (typeof value === "string") {
    if (value.startsWith("0x")) return am5.color(parseInt(value, 16));
    return am5.color(value); // "#cc4748", "red", etc.
  }
  return am5.color(fallback);
}

export function createGaugeChart(root, config) {
  const options = config.options || {};
  const axesCfg = config.axes || {};
  const valueAxisCfg = axesCfg.value || {};
  const fields = config.fields || {};

  const valueField = fields.value || "value";
  const min = valueAxisCfg.min ?? 0;
  const max = valueAxisCfg.max ?? 100;

  const startAngle = options.startAngle ?? 180;
  const endAngle = options.endAngle ?? 360;

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

  // ----- AXIS -----
  const axisRenderer = am5radar.AxisRendererCircular.new(root, {
    innerRadius: options.innerRadius ?? -20, // thin ring near outer edge
  });

  axisRenderer.grid.template.setAll({
    stroke: root.interfaceColors.get("background"),
    visible: true,
    strokeOpacity: 0.8,
  });

  const xAxis = chart.xAxes.push(
    am5xy.ValueAxis.new(root, {
      maxDeviation: 0,
      min,
      max,
      strictMinMax: true,
      renderer: axisRenderer,
    })
  );

  xAxis.get("renderer").labels.template.setAll({
    // numbers slightly outside the band
    radius: options.tickLabelRadius ?? 10,
    inside: false,
    fontSize: 20,
  });

  // ----- CLOCK HAND -----
  const axisDataItem = xAxis.makeDataItem({});

  const clockHand = am5radar.ClockHand.new(root, {
    pinRadius: options.pinRadius ?? am5.percent(8),
    radius: options.handRadius ?? am5.percent(90),
    bottomWidth: options.handBottomWidth ?? 15,
  });

  const bullet = axisDataItem.set(
    "bullet",
    am5xy.AxisBullet.new(root, {
      sprite: clockHand,
    })
  );

  xAxis.createAxisRange(axisDataItem);

  // ----- CENTER LABEL -----
  const labelCfg = options.label || {};
  const centerLabel = chart.radarContainer.children.push(
    am5.Label.new(root, {
      fill: root.interfaceColors.get("text"),
      centerX: am5.percent(50),
      centerY: am5.percent(50),
      textAlign: "center",
      fontSize: labelCfg.fontSize ?? "2em",
    })
  );

  const formatValueText = (v) => {
    const decimals = labelCfg.decimals ?? 0;
    const base = v.toFixed(decimals);
    const fmt = labelCfg.format || "{value}%";
    return fmt.replace("{value}", base);
  };

  // ----- BANDS (AXIS RANGES) -----
  const bands = options.bands || [];
  bands.forEach((band) => {
    const start = band.start ?? band.lowScore ?? min;
    const end = band.end ?? band.highScore ?? max;

    const axisRange = xAxis.createAxisRange(xAxis.makeDataItem({}));

    axisRange.setAll({
      value: start,
      endValue: end,
    });

    axisRange.get("axisFill").setAll({
      visible: true,
      fill: resolveColor(band.color, 0xcccccc),
      fillOpacity: band.opacity ?? 0.8,
    });

    if (band.label) {
      axisRange.get("label").setAll({
        text: band.label,
        inside: true,
        radius: 20,
        fontSize: band.fontSize ?? 20,
      });
    }
  });

  // ----- PICK HAND COLOR + LABEL FROM BAND -----
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

  // ----- RESOLVE VALUE FROM DATA -----
  let value = 0;
  const rawData = config.data;

  if (Array.isArray(rawData) && rawData.length) {
    const row = rawData[0];
    const v = Number(row[valueField] ?? row.value);
    if (!Number.isNaN(v)) value = v;
  } else if (rawData && typeof rawData === "object" && "value" in rawData) {
    const v = Number(rawData.value);
    if (!Number.isNaN(v)) value = v;
  } else if (typeof rawData === "number") {
    value = rawData;
  } else if (typeof options.value === "number") {
    value = options.value;
  }

  // clamp to [min, max]
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
