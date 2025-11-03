// src/utils/scatterSeries.js

export function createScatterSeries(
  root,
  chart,
  { config, xAxis, yAxis, data }
) {
  const defs = config.fields?.series || [];
  const result = [];

  const globalXField = config.fields?.x || "x";
  const globalYField = config.fields?.y || "y";

  defs.forEach((def) => {
    const type = (def.type || "scatter").toLowerCase();
    if (type !== "scatter") return;

    const xField = def.xField || globalXField;
    const yField = def.yField || globalYField;
    const radiusField = def.radiusField || null;

    const shape = (def.shape || "circle").toLowerCase();

    // Tooltip: show x, y and optional size
    let labelText = `{name}: x={${xField}}, y={${yField}}`;
    if (radiusField) {
      labelText += `, size={${radiusField}}`;
    }

    // Base color
    const color = def.color
      ? am5.color(def.color)
      : chart.get("colors").getIndex(result.length);

    // ---------- SCATTER SERIES (points with hidden line) ----------
    const scatterSeries = chart.series.push(
      am5xy.LineSeries.new(root, {
        name: def.name || def.id,
        xAxis,
        yAxis,
        valueXField: xField,
        valueYField: yField,
        tooltip: am5.Tooltip.new(root, { labelText }),
      })
    );

    // Hide the line – we only want bullets
    scatterSeries.strokes.template.set("visible", false);

    // Bullets (point markers)
    scatterSeries.bullets.push(() =>
      am5.Bullet.new(root, {
        sprite: createBulletSprite(root, { shape, color }),
      })
    );

    // Optional radius based on radiusField
    if (radiusField) {
      scatterSeries.events.on("datavalidated", () => {
        scatterSeries.bullets.each((bullet) => {
          const dataItem = bullet.dataItem;
          if (!dataItem) return;
          const ctx = dataItem.dataContext || {};
          const rVal = Number(ctx[radiusField]);
          const sprite = bullet.get("sprite");
          if (!sprite || isNaN(rVal)) return;

          // Apply radius/size differently depending on shape
          const s = Math.max(1, rVal);
          if (sprite.className === "Circle") {
            sprite.set("radius", s);
          } else {
            sprite.setAll({ width: s * 2, height: s * 2 });
          }
        });
      });
    }

    scatterSeries.data.setAll(data);
    result.push(scatterSeries);

    // ---------- TRENDLINE (optional) ----------
    const trendCfg = def.trendline || {};
    if (trendCfg.enabled) {
      const trendData = computeLinearTrendData(data, xField, yField);
      if (trendData && trendData.length >= 2) {
        const trendColor = trendCfg.color ? am5.color(trendCfg.color) : color;

        const trendSeries = chart.series.push(
          am5xy.LineSeries.new(root, {
            name: trendCfg.name || `${def.name || def.id} trend`,
            xAxis,
            yAxis,
            valueXField: xField,
            valueYField: yField,
            tooltip: am5.Tooltip.new(root, {
              labelText: "{name}",
            }),
          })
        );

        trendSeries.strokes.template.setAll({
          stroke: trendColor,
          strokeWidth: trendCfg.strokeWidth ?? 2,
          strokeDasharray: trendCfg.strokeDasharray ?? [],
        });

        trendSeries.data.setAll(trendData);
        result.push(trendSeries);
      }
    }
  });

  return result;
}

// ---------- helpers ----------

// Create a bullet sprite based on shape
function createBulletSprite(root, { shape, color }) {
  switch (shape) {
    case "triangle-up":
      return am5.Triangle.new(root, {
        width: 12,
        height: 12,
        fill: color,
        strokeOpacity: 0,
        rotation: 0,
      });

    case "triangle-down":
      return am5.Triangle.new(root, {
        width: 12,
        height: 12,
        fill: color,
        strokeOpacity: 0,
        rotation: 180,
      });

    case "square":
      return am5.Rectangle.new(root, {
        width: 10,
        height: 10,
        fill: color,
        strokeOpacity: 0,
      });

    case "circle":
    default:
      return am5.Circle.new(root, {
        radius: 5,
        fill: color,
        strokeOpacity: 0,
      });
  }
}

// Compute a simple linear regression and return two data points
// [{ [xField]: xMin, [yField]: yMinPred }, { [xField]: xMax, [yField]: yMaxPred }]
function computeLinearTrendData(data, xField, yField) {
  let n = 0;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  let xMin = Infinity;
  let xMax = -Infinity;

  data.forEach((row) => {
    const x = Number(row[xField]);
    const y = Number(row[yField]);
    if (!isFinite(x) || !isFinite(y)) return;

    n += 1;
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumXX += x * x;

    if (x < xMin) xMin = x;
    if (x > xMax) xMax = x;
  });

  if (n < 2) return null;

  const denom = n * sumXX - sumX * sumX;
  if (denom === 0) return null;

  const m = (n * sumXY - sumX * sumY) / denom;
  const b = (sumY - m * sumX) / n;

  const y1 = m * xMin + b;
  const y2 = m * xMax + b;

  const p1 = {};
  const p2 = {};
  p1[xField] = xMin;
  p1[yField] = y1;
  p2[xField] = xMax;
  p2[yField] = y2;

  return [p1, p2];
}
