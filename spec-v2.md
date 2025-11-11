# AmCharts Builder Library — Spec v2

_Last updated: 2025-11-11_

## Overview

The library provides a modular, declarative, config-driven abstraction layer over AmCharts 5.  
It lets users define complex chart configurations using composable **Builder Classes** instead of raw amCharts 5 boilerplate.

Every chart type ultimately resolves through:

1. **A registry lookup** (`src/core/registry.js`)
2. **An engine** (`src/engines/XY`, `src/engines/Radial`, etc.)
3. **A chart constructor file** (e.g. `src/charts/xy/catSeries/line.js`)

The result is a composable system where new chart types can be added by dropping in a single file and registering it — without touching the builder or render logic.

---

## Directory Structure

```bash
src/
  core/
    createChart.js
    registry.js
  engines/
    xyEngine.js
    radialEngine.js
    pieEngine.js
    hierarchyEngine.js
    mapEngine.js
    flowEngine.js
  charts/
    xy/
      catSeries/
        _baseCatSeries.js
        column.js
        line.js
        area.js
        stackedColumn.js
        stackedArea.js
        combo.js
        dot.js
        stream.js
        waterfall.js
    radial/
      circularSeries/
        radar.js
        polarLine.js
        polarArea.js
      gauge/
        gaugeSolid.js
    pie/
      pie.js
      donut.js
    hierarchy/
      treemap.js
      sunburst.js
  decorators/
    withCursor.js
    withLegend.js
    withScrollbars.js
  utils/
    loadData.js
    applyChartBackground.js
    pp.js
builder/
  Chart.js
  XY.js
  Axis.js
  Series.js
  Theme.js
  Legend.js
  Cursor.js
  Scrollbars.js
demo/
  config/
  data/
  index.html
  main.js
```

(Full spec content from previous message continues...)

AmCharts Builder Library — Spec v2

Last updated: 2025-11-11

⸻

Overview

The library provides a modular, declarative, config-driven abstraction layer over AmCharts 5.
It lets users define complex chart configurations using composable Builder Classes instead of raw amCharts 5 boilerplate.

Every chart type ultimately resolves through: 1. A registry lookup (src/core/registry.js) 2. An engine (src/engines/XY, src/engines/Radial, etc.) 3. A chart constructor file (e.g. src/charts/xy/catSeries/line.js)

The result is a composable system where new chart types can be added by dropping in a single file and registering it — without touching the builder or render logic.

⸻

Directory Structure

src/
core/
createChart.js # Entry point: routes chartType → chart constructor
registry.js # Maps engineType + chartType → chart file
engines/
xyEngine.js # Shared XY engine logic (category/value axes)
radialEngine.js # Polar/radar/angle charts
pieEngine.js # Pie/donut/funnel series
hierarchyEngine.js # Tree / treemap / force / sunburst
mapEngine.js # Geo chart engine
flowEngine.js # Sankey / chord / dependency flows
charts/
xy/
catSeries/
\_baseCatSeries.js # Shared Category×Value renderer (multi-axis aware)
column.js
line.js
area.js
stackedColumn.js
stackedArea.js
combo.js
dot.js
stream.js
waterfall.js
catCat/
heatmap.js
mosaic.js
confusionMatrix.js
seriesSeries/
scatter.js
bubble.js
beeswarm.js
hexbin.js
radial/
circularSeries/
radar.js
polarLine.js
polarArea.js
polarColumn.js
polarScatter.js
radarHeatmap.js
gauge/
gaugeSolid.js
gaugeBands.js
gaugeMultipart.js
gaugeProgress.js
pie/
pie.js
donut.js
nestedDonut.js
funnel.js
pyramid.js
hierarchy/
treemap.js
sunburst.js
forceTree.js
decorators/
withCursor.js
withLegend.js
withScrollbars.js
utils/
loadData.js
applyChartBackground.js
pp.js # Debug print helper (pp.log / pp.deep / pp.hr)
builder/
Chart.js # Root chart builder (theme, legend, cursor…)
XY.js # XY builder (multi-axis, auto-stacking inference)
Axis.js # Axis builders (CategoryAxis, ValueAxis, DateAxis)
Series.js # Series builder (geom, axis, names)
Theme.js # Theme builder
Legend.js # Legend builder
Cursor.js # Cursor builder
Scrollbars.js # Scrollbars builder
demo/
config/
column.js
line.js
area.js
stackedColumn.js
stackedArea.js
combo.js
stream.js
waterfall.js
data/
\*.csv
index.html
main.js

⸻

Key Concepts

1. Engines

Each engine represents a family of chart types that share base geometry and coordinate systems.

Engine Examples Core axis/geometry
XY Line, Area, Column, Combo, Dot, Stream, Waterfall Category / Value
Radial Radar, PolarArea, Gauges Angle / Radius
Pie Pie, Donut, Funnel Slice angles
Hierarchy Tree, Treemap, Sunburst, ForceTree Node-link layouts
Map Choropleth, BubbleMap Geo coordinates
Flow Sankey, Chord Directed weighted edges

Engines handle axis creation, dataset injection, and root chart initialization.
They’re engine-agnostic wrappers used by createChart.js once a chartType is resolved.

⸻

2. Chart Registry

src/core/registry.js is the single source of truth for chart resolution.

const registry = {
xy: {
column: columnChart,
line: lineChart,
area: areaChart,
stackedcolumn: stackedColumnChart,
stackedarea: stackedAreaChart,
combo: comboChart,
dot: dotChart,
stream: streamChart,
waterfall: waterfallChart,
},
// other engines later
};

resolveChartBuilder(engineType, chartType) normalizes keys and returns the chart function.
Adding a new chart = importing it and adding a single line here.

⸻

3. Chart Builders

Chart.js
• Root orchestrator.
• Handles non-visual config: container, dataLoader, engine, theme, legend, cursor, scrollbars.
• Automatically injects defaults for theme/legend/cursor/scrollbars.

Example:

const chartConfig = new Chart()
.htmlContainer("chartdiv")
.dataLoader({ type: "csv", url: "./data.csv", delimiter: "," })
.engine(
new XY()
.category("month")
.addSeries(new Series("revenue").geom("column"))
.addSeries(new Series("profit").geom("line").axis("y2"))
.build()
)
.build();

⸻

XY.js (v2)
Handles all XY engine configuration.

Features:
• Default axes (x: category, y: value).
• Smart xAxis() merge / yAxis() upsert.
• Auto-creation of missing Y axes when a series references axis: "y2".
• Series normalization (xField, xAxisId, axis defaults).
• Chart-type inference:
• column, line, area, stackedColumn, stackedArea, dot, stream, combo
• Axis stacking validation (only same geom allowed per stacked axis).

Build Output:

{
engineType: "XY",
chartType: "combo",
categoryField: "month",
axes: {
x: { id: "x", type: "category", position: "bottom" },
y: [
{ id: "y", type: "value", position: "left" },
{ id: "y2", type: "value", position: "right" }
]
},
series: [
{ field: "revenue", geom: "line", axis: "y" },
{ field: "profit", geom: "column", axis: "y2" }
]
}

⸻

Axis.js
Defines the three base axis builders.

new CategoryAxis("x")
.title("Months")
.grid(true)
.position("bottom");

Supported:
• CategoryAxis, ValueAxis, DateAxis
• .id(), .title(), .grid(), .position(), .min(), .max(), .stacked()

⸻

Series.js
Defines a single data series within an XY chart.

new Series("revenue")
.geom("column")
.name("Revenue")
.axis("y2");

Fields:
• field – data column key
• geom – “line” | “area” | “column” | “dot” | “stream”
• axis – target Y axis id
• name – legend label
• color, strokeWidth, etc.

⸻

4. Decorators

Optional but reusable visual utilities:

Decorator Purpose
withCursor Adds amCharts XYCursor w/ optional X/Y tooltips
withLegend Adds chart legend + auto data binding
withScrollbars Adds horizontal/vertical scrollbars

Each decorator reads from config (config.cursor.enabled, etc.) and applies itself to the chart root.

⸻

5. Utilities

Utility Description
applyChartBackground.js Sets chart background colors or gradients
loadData.js Asynchronously loads CSV/JSON and converts to array
pp.js Pretty-print debug helper — pp.log, pp.deep, pp.hr controlled by global debug flag

⸻

Core Chart Implementations

✅ \_baseCatSeries.js

The backbone of the XY family (category × numeric).
Responsible for:
• Creating X axis (CategoryAxis).
• Creating multiple Y axes from engine.axes.y.
• Attaching each series to its correct Y axis.
• Applying stacking and fill/stroke logic.
• Handling geom types: line, area, dot, stream, column.

Supports both:
• Normal & stacked columns/areas
• Multi-axis charts (y, y2, y3, …)

⸻

✅ dot.js

Delegates to \_baseCatSeries, but:
• Sets geom = "dot".
• Disables strokes and fills.
• Adds circular bullets only.

⸻

✅ stream.js

Standalone ThemeRiver / StreamGraph implementation.
• Uses am5xy.SmoothedXLineSeries
• Computes centered open/value pairs for each series via buildStreamData()
• Renders with fillOpacity = 1
• Produces the “river flow” visual, centered around baseline 0.

⸻

✅ waterfall.js

Standalone Waterfall / Bridge chart.
• Computes open / close cumulative values from delta column.
• Uses ColumnSeries with valueYField: "close" + openValueYField: "open".
• Displays incremental steps up/down relative to previous total.

CSV example:

step,change
Starting balance,12000
New customers,4000
Upsell,2500
Churn,-3000
Discounts,-1500
Support,-800
Marketing,-1200
Final adjustment,1000

⸻

✅ combo.js

Delegates to \_baseCatSeries and mixes multiple geoms (line + column + area).
No special behavior beyond series-level geom control.

⸻

✅ stackedColumn.js / stackedArea.js

Delegates to \_baseCatSeries but ensures:
• yAxis.stacked = true
• Default geom = "column" / "area"

⸻

Builder → Engine → Chart Flow 1. Builder Stage
• Developer builds config using builders.
• Output: normalized JSON object (chartConfig). 2. Engine Resolution
• createChart(config) reads config.engine.engineType & chartType.
• Uses registry.js to find appropriate chart builder function. 3. Chart Construction
• Chart file (e.g., line.js) calls \_baseCatSeries or custom logic.
• \_baseCatSeries creates axes, series, decorators, and applies data.
• Returns { chart, axes, series, cleanup }. 4. Runtime Decorators
• withCursor, withLegend, and withScrollbars execute as add-ons.
• Theme/background applied last.

⸻

Debug & Logging

pp.js exposes a minimal developer console utility.

pp.debug() // enables global debug flag
pp.log("Hello")
pp.deep(config) // console.dir(obj, { depth: null })
pp.hr() // visual divider

These only emit output when debug mode is active.

⸻

Example Configs

Line Chart

new XY()
.category("month")
.addSeries(new Series("revenue"))
.addSeries(new Series("profit"))
.build();

→ Produces standard line chart with single axis.

⸻

Combo (Line + Column)

new XY()
.category("month")
.addSeries(new Series("revenue"))
.addSeries(new Series("profit").geom("column"))
.build();

→ Inferred chartType: "combo" → mixed XY chart.

⸻

Dual Axis

new XY()
.category("month")
.addSeries(new Series("revenue"))
.addSeries(new Series("profit").geom("line").axis("y2"))
.yAxis({ id: "y2", position: "right" })
.build();

→ Two Y axes (left + right), each series bound correctly.

⸻

Stream (ThemeRiver)

new XY()
.category("year")
.addSeries(new Series("seriesA").geom("stream"))
.addSeries(new Series("seriesB").geom("stream"))
.build();

→ Smoothed, centered flow graph around baseline 0.

⸻

Waterfall

new XY()
.category("step")
.chartType("waterfall")
.addSeries(new Series("change").geom("column"))
.build();

→ Auto-computed cumulative open/close values per step.

⸻

Future Extensions
• RadialEngine: port XY logic to circularSeries (Radar / Spider / Polar)
• HierarchyEngine: unified node-link base (forceTree, sunburst)
• FlowEngine: Sankey, chord, dependency flows
• DateAxis inference: auto-switch X axis type if Date values detected
• Theme registry: per-theme overrides (Dark, Light, Corporate, etc.)
• JSON import/export: serialize Builder state to/from plain config files

⸻

Philosophy
• Declarative, not imperative.
Builders describe intent, engines handle construction.
• No hard-coded chart internals.
Every chart type lives in its own file and is loaded dynamically.
• Composition over inheritance.
Decorators handle optional behaviors (legend, cursor, scrollbars).
• Predictable inference.
Builder always infers chartType and axes correctly when not specified.
• Clean debugging path.
The pp helper + debug() mode expose structured internal state.

Changes:
only heatmap left
hexbin is cool maybe lets add it later?
