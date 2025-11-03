// src/utils/series.js
export function createSeriesForXY(
  root,
  chart,
  { config, domainAxis, valueAxes, data }
) {
  const defs = config.fields?.series || [];
  const result = [];

  const domainMode = domainAxis?._domainMode || "date"; // "date" | "category"
  const domainField = domainAxis?._domainField || config.fields?.domain;

  defs.forEach((def) => {
    const valueAxisId = def.valueAxisId || "default";
    const yAxis = valueAxes[valueAxisId] || valueAxes.default;

    const stackingMode = yAxis?._stacking || "none"; // "none" | "stacked" | "percent"
    const isStacked = stackingMode !== "none";

    const type = (def.type || "line").toLowerCase();
    const isColumn = type === "column" || type === "bar";
    const isArea = type === "area";

    let labelText;
    if (isStacked && stackingMode === "percent") {
      labelText = `{name}: {valueYTotalPercent.formatNumber('0.0')}%`;
    } else {
      labelText = `{name}: {${def.id}}`;
    }

    let series;

    // ---------- COLUMN SERIES (vertical columns) ----------
    if (isColumn) {
      if (domainMode === "category") {
        series = chart.series.push(
          am5xy.ColumnSeries.new(root, {
            name: def.name || def.id,
            xAxis: domainAxis,
            yAxis,
            categoryXField: domainField,
            valueYField: def.id,
            tooltip: am5.Tooltip.new(root, { labelText }),
          })
        );
      } else {
        // date / numeric domain
        series = chart.series.push(
          am5xy.ColumnSeries.new(root, {
            name: def.name || def.id,
            xAxis: domainAxis,
            yAxis,
            valueXField: domainField,
            valueYField: def.id,
            tooltip: am5.Tooltip.new(root, { labelText }),
          })
        );
      }

      series.columns.template.setAll({
        strokeOpacity: 0,
      });
    } else {
      // ---------- LINE / AREA SERIES ----------
      if (domainMode === "category") {
        series = chart.series.push(
          am5xy.LineSeries.new(root, {
            name: def.name || def.id,
            xAxis: domainAxis,
            yAxis,
            categoryXField: domainField,
            valueYField: def.id,
            tooltip: am5.Tooltip.new(root, { labelText }),
          })
        );
      } else {
        series = chart.series.push(
          am5xy.LineSeries.new(root, {
            name: def.name || def.id,
            xAxis: domainAxis,
            yAxis,
            valueXField: domainField,
            valueYField: def.id,
            tooltip: am5.Tooltip.new(root, { labelText }),
          })
        );
      }

      // Basic stroke styling
      series.strokes.template.setAll({
        strokeWidth: 2,
      });

      if (isArea) {
        series.fills.template.setAll({
          visible: true,
          fillOpacity: 0.4,
        });
      }
    }

    // ---------- STACKING ----------
    if (isStacked) {
      series.set("stacked", true);

      if (stackingMode === "percent") {
        // Use percent-of-total for Y value
        series.set("valueYShow", "valueYTotalPercent");
      }
    }

    // ---------- COLOR ----------
    if (def.color) {
      const c = am5.color(def.color);

      series.set("stroke", c);
      series.set("fill", c);

      if (series.strokes && series.strokes.template) {
        series.strokes.template.set("stroke", c);
      }
      if (series.fills && series.fills.template) {
        series.fills.template.setAll({
          fill: c,
          fillOpacity: isArea || isColumn ? 0.6 : 0.1,
        });
      }
    }

    // Data for this series
    series.data.setAll(data);

    result.push(series);
  });

  return result;
}
