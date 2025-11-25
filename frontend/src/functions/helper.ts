export function formatNumber(num: number, locale = "en-US", options = {}) {
  if (num == null || isNaN(num)) return "";
  return num.toLocaleString(locale, options);
}
