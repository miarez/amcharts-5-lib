// src/utils/series.js
export function createSeriesForXY(
  root,
  chart,
  { config, domainAxis, valueAxes, data }
) {
  const defs = config.fields?.series || [];
  const result = [];

  const orientation = (config.orientation || "vertical").toLowerCase();
  const isVertical = orientation === "vertical";

  const domainMode = domainAxis?._domainMode || "date"; // "date" | "category"
  const domainField =
    domainAxis?._domainField || config.fields?.domain || "date";

  // Category axis must receive data explicitly
  if (domainMode === "category" && domainAxis && data) {
    domainAxis.data.setAll(data);
  }

  defs.forEach((def) => {
    const valueAxisId = def.valueAxisId || "default";
    const valueAxis = valueAxes[valueAxisId] || valueAxes.default;

    const stackingMode = valueAxis?._stacking || "none"; // "none" | "stacked" | "percent"
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

    // ---------- COLUMN / BAR SERIES ----------
    if (isColumn) {
      if (isVertical) {
        // Domain on X, value on Y
        if (domainMode === "category") {
          series = chart.series.push(
            am5xy.ColumnSeries.new(root, {
              name: def.name || def.id,
              xAxis: domainAxis,
              yAxis: valueAxis,
              categoryXField: domainField,
              valueYField: def.id,
              tooltip: am5.Tooltip.new(root, { labelText }),
            })
          );
        } else {
          series = chart.series.push(
            am5xy.ColumnSeries.new(root, {
              name: def.name || def.id,
              xAxis: domainAxis,
              yAxis: valueAxis,
              valueXField: domainField,
              valueYField: def.id,
              tooltip: am5.Tooltip.new(root, { labelText }),
            })
          );
        }
      } else {
        // HORIZONTAL → Domain on Y, value on X (bars)
        if (domainMode === "category") {
          series = chart.series.push(
            am5xy.ColumnSeries.new(root, {
              name: def.name || def.id,
              xAxis: valueAxis,
              yAxis: domainAxis,
              valueXField: def.id,
              categoryYField: domainField,
              tooltip: am5.Tooltip.new(root, { labelText }),
            })
          );
        } else {
          // Date or numeric domain on Y
          series = chart.series.push(
            am5xy.ColumnSeries.new(root, {
              name: def.name || def.id,
              xAxis: valueAxis,
              yAxis: domainAxis,
              valueXField: def.id,
              valueYField: domainField,
              tooltip: am5.Tooltip.new(root, { labelText }),
            })
          );
        }
      }

      series.columns.template.setAll({ strokeOpacity: 0 });
    } else {
      // ---------- LINE / AREA SERIES ----------
      if (isVertical) {
        if (domainMode === "category") {
          series = chart.series.push(
            am5xy.LineSeries.new(root, {
              name: def.name || def.id,
              xAxis: domainAxis,
              yAxis: valueAxis,
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
              yAxis: valueAxis,
              valueXField: domainField,
              valueYField: def.id,
              tooltip: am5.Tooltip.new(root, { labelText }),
            })
          );
        }
      } else {
        // HORIZONTAL → Domain on Y, value on X
        if (domainMode === "category") {
          series = chart.series.push(
            am5xy.LineSeries.new(root, {
              name: def.name || def.id,
              xAxis: valueAxis,
              yAxis: domainAxis,
              valueXField: def.id,
              categoryYField: domainField,
              tooltip: am5.Tooltip.new(root, { labelText }),
            })
          );
        } else {
          series = chart.series.push(
            am5xy.LineSeries.new(root, {
              name: def.name || def.id,
              xAxis: valueAxis,
              yAxis: domainAxis,
              valueXField: def.id,
              valueYField: domainField,
              tooltip: am5.Tooltip.new(root, { labelText }),
            })
          );
        }
      }

      series.strokes.template.setAll({ strokeWidth: 2 });

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
        series.set("valueYShow", "valueYTotalPercent");
      }
    }

    // ---------- COLOR ----------
    if (def.color) {
      const c = am5.color(def.color);
      series.set("stroke", c);
      series.set("fill", c);
      series.strokes?.template?.set("stroke", c);
      series.fills?.template?.setAll({
        fill: c,
        fillOpacity: isArea || isColumn ? 0.6 : 0.1,
      });
    }

    // Data
    series.data.setAll(data);
    result.push(series);
  });

  return result;
}
