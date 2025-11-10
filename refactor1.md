# Root Level I can support all of this

    •	Color set (chart’s color palette)
    •	Animations (chart.appear, animated theme)
    •	Fonts / text styles (label templates)
    •	Tooltip defaults (font, background, corner radius)
    •	Accessibility stuff (aria labels, description)
    •	theme.animated
    •	theme.mode (Dark / dark)
    •	theme.background (#000000 etc.)

# Universal-ish

    •	Legend – anything with series can have one.
    •	Cursor – anything with an axis can have one.
    •	Scrollbars – anything with axes can have them.
    •	Axes – any coordinate chart (XY, Radar) will have x/y or angle/radius axes.
    •	Title(s) – some charts may have them but you haven’t modeled this yet.

# Cursor needs to be a nested option

```
  "decorators": {
    "legend": { "enabled": true },
    "cursor": {
      "enabled": true,
      "behavior": "none",
      "showLineX": true,
      "showLineY": false,
      "xAxisTooltip": {
        "enabled": true,
        "categoryFormat": "{value}"
      }
    },
    "scrollbarX": { "enabled": false }
  }
```
