export function resolveColor(value, fallback) {
  if (typeof value === "number") {
    return am5.color(value);
  }
  if (typeof value === "string") {
    if (value.startsWith("0x")) {
      return am5.color(parseInt(value, 16));
    }
    return am5.color(value); // "#fffb77", "red", etc.
  }
  return am5.color(fallback);
}
