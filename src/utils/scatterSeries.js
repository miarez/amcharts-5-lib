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
    // Only handle scatter-type series here (others belong to xy-series family)
    const type = (def.type || "scatter").toLowerCase();
    if (type !== "scatter") return;

    const xField = def.xField || globalXField;
    const yField = def.yField || globalYField;
    const radiusField = def.radiusField || null;

    // Tooltip: show x, y (and optionally size)
    let labelText = `{name}: x={${xField}}, y={${yField}}`;
    if (radiusField) {
      labelText += `, size={${radiusField}}`;
    }

    const series = chart.series.push(
      am5xy.LineSeries.new(root, {
        name: def.name || def.id,
        xAxis,
        yAxis,
        valueXField: xField,
        valueYField: yField,
        tooltip: am5.Tooltip.new(root, { labelText }),
      })
    );

    // Hide the line – we only want points
    series.strokes.template.set("visible", false);

    // Color
    let color = def.color
      ? am5.color(def.color)
      : chart.get("colors").getIndex(0);

    // Bullets (the actual points)
    series.bullets.push(() =>
      am5.Bullet.new(root, {
        sprite: am5.Circle.new(root, {
          radius: 5,
          fill: color,
          strokeOpacity: 0,
        }),
      })
    );

    // If radiusField is defined, adjust bullet radius per data item
    if (radiusField) {
      series.events.on("datavalidated", () => {
        series.bullets.each((bullet) => {
          const dataItem = bullet.dataItem;
          if (!dataItem) return;
          const ctx = dataItem.dataContext || {};
          const rVal = Number(ctx[radiusField]);
          if (!isNaN(rVal) && bullet.get("sprite")) {
            bullet.get("sprite").set("radius", rVal);
          }
        });
      });
    }

    series.data.setAll(data);
    result.push(series);
  });

  return result;
}
