## New Hierarchy

Engines:

    1.	XY
    2.	Radial (radar, gauges)
    3.	Pie/Sliced (pie, donut, funnel)
    4.	Hierarchy (tree, treemap, sunburst, force)
    5.	Map
    6.	Flow (Sankey, Chord)

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
 │   ├─ CircularSeries  (multi-point plots)
 │   │    • Radar / Spider
 │   │    • Polar line / area
 │   │    • Polar column
 │   │    • Polar scatter
 │   │    • Radar Heatmap (polar CatCat)
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
