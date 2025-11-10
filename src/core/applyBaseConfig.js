// src/core/applyBaseConfig.js

// Default cursor behavior when it is enabled
const cursorDefaults = {
  enabled: true,
  behavior: "none",
  showLineX: true,
  showLineY: true,
  xAxisTooltip: {
    enabled: true,
    categoryFormat: "{value}",
  },
};

// Global base config shared by all charts
export const baseConfig = {
  theme: {
    animated: true,
    mode: "Dark",
    background: "#000000",
  },
  decorators: {
    legend: { enabled: true },
    cursor: { ...cursorDefaults },
    scrollbarX: { enabled: true },
  },
};

function normalizeCursor(rawCursor) {
  // rawCursor can be: false | object | undefined

  // cursor: false  → disabled, but still carries defaults
  if (rawCursor === false) {
    return {
      ...cursorDefaults,
      enabled: false,
    };
  }

  // cursor: { ... } → defaults merged with overrides
  if (rawCursor && typeof rawCursor === "object") {
    const enabled =
      typeof rawCursor.enabled === "boolean" ? rawCursor.enabled : true;

    return {
      ...cursorDefaults,
      ...rawCursor,
      enabled,
    };
  }

  // undefined → caller will decide (base vs final fallback)
  return null;
}

// Apply base config + normalize decorators/theme
export function applyBaseConfig(rawConfig) {
  // shallow clone to avoid mutating the original
  const config = { ...rawConfig };

  // --- THEME ---
  config.theme = {
    ...baseConfig.theme,
    ...(rawConfig.theme || {}),
  };

  // --- DECORATORS ---
  config.decorators = rawConfig.decorators ? { ...rawConfig.decorators } : {};

  // Legend: base defaults + per-chart overrides
  if (baseConfig.decorators.legend) {
    config.decorators.legend = {
      ...baseConfig.decorators.legend,
      ...(config.decorators.legend || {}),
    };
  }

  // ScrollbarX: base defaults + per-chart overrides
  if (baseConfig.decorators.scrollbarX) {
    config.decorators.scrollbarX = {
      ...baseConfig.decorators.scrollbarX,
      ...(config.decorators.scrollbarX || {}),
    };
  }

  // 1) Try per-chart setting
  const fromConfig = normalizeCursor(config.decorators.cursor);

  if (fromConfig) {
    config.decorators.cursor = fromConfig;
  } else {
    // 2) Fall back to base setting
    const baseCursorSetting = baseConfig.decorators.cursor;
    const fromBase = normalizeCursor(baseCursorSetting);

    // 3) Final fallback: enabled with defaults
    config.decorators.cursor = fromBase || { ...cursorDefaults };
  }

  return config;
}
