# New Hierarchy

Engines: 1. XY 2. Radial (radar, gauges) 3. Pie/Sliced (pie, donut, funnel) 4. Hierarchy (tree, treemap, sunburst, force) 5. Map 6. Flow (Sankey, Chord)

```
Engine
 ├─ XY
 │   ├─ CatCat  (Category × Category)
 │   │    • Heatmap
 │   │    • Mosaic / Confusion Matrix
 │   ├─ CatSeries  (Category × Numeric Series)
 │   │    • Bar / Column
 │   │    • Grouped / Stacked Bar
 │   │    • Line / Area / Time Series
 │   │    • Stream / ThemeRiver (centered stacked area)
 │   │    • Waterfall / Lollipop / Dot Plot
 │   └─ SeriesSeries  (Numeric × Numeric)
 │        • Scatter
 │        • Bubble
 │        • Beeswarm / Jitter
 │        • Density / Hexbin
 ├─ Radial
 │   ├─ CircularSeries  (multi-point plots; angle + radius axes)
 │   │    • CatSeries → Radar / Spider, Polar line / area, Polar column
 │   │    • SeriesSeries → Polar scatter
 │   │    • CatCat → Radar Heatmap (polar cross-tab)
 │   └─ Gauge  (single-value readouts)
 │        • Circular gauge
 │        • Semi / Donut gauge
 │        • Multi-part gauge
 │        • Solid / Progress gauge
 ├─ Pie
 │    • Pie
 │    • Donut
 │    • Nested / Multi-level Donut
 │    • Funnel / Pyramid
 ├─ Hierarchy
 │    • Treemap
 │    • Sunburst
 │    • Force / Node-Link Tree
 ├─ Map
 │    • Choropleth
 │    • Bubble / Marker Map
 │    • Flow / Connection Map
 │    • Heat Map (geo)
 └─ Flow
      • Sankey
      • Chord
      • Dependency Flow
```

## Directory Structure

```
src/
  core/
    createChart.js       // routing from chartType -> builder
    registry.js          // mapping "line" -> charts/xy/catSeries/line.js
    // other non-visual infra if needed

  engines/
    xyEngine.js
    radialEngine.js
    pieEngine.js
    hierarchyEngine.js
    mapEngine.js
    flowEngine.js

  charts/
    xy/
      catCat/
        heatmap.js
        mosaic.js
        confusionMatrix.js
      catSeries/
        _baseCatSeries.js
        line.js
        area.js
        column.js
        combo.js (mixed line/column)
        stackedColumn.js
        stackedArea.js
        stream.js
        waterfall.js
        dot.js
      seriesSeries/
        _baseSeriesSeries.js
        scatter.js
        bubble.js
        beeswarm.js
        hexbin.js

    radial/
      circularSeries/
        _baseCircularSeries.js
        radar.js
        polarLine.js
        polarArea.js
        polarColumn.js
        polarScatter.js
        radarHeatmap.js
      gauge/
        _baseGauge.js
        gaugeBands.js
        gaugeSolid.js
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
```

## Settings

### Root Level I can support all of this

    •	Color set (chart’s color palette)
    •	Animations (chart.appear, animated theme)
    •	Fonts / text styles (label templates)
    •	Tooltip defaults (font, background, corner radius)
    •	Accessibility stuff (aria labels, description)

### Universal-ish

    •	Legend – anything with series can have one.
    •	Cursor – anything with an axis can have one.
    •	Scrollbars – anything with axes can have them.
    •	Axes – any coordinate chart (XY, Radar) will have x/y or angle/radius axes.
    •	Title(s) – some charts may have them but you haven’t modeled this yet.
