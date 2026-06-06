/**
 * Formats a numeric dimension (height or width) back to a fractional representation
 * if it has a decimal part and the unit is inches.
 */
export function formatDimension(val: number | undefined | null, unit: string | undefined | null): string {
  if (val === undefined || val === null || isNaN(val)) return "";

  const currentUnit = (unit || "inch").toLowerCase();
  if (currentUnit !== "inch") {
    // Non-inch units (like mm) show standard numbers rounded to at most 2 decimal places
    return String(Number(val.toFixed(2)));
  }

  const integerPart = Math.floor(val);
  const decimalPart = val - integerPart;

  // Find nearest eighth (since fractions are selected in 1/8 increments)
  const eighths = Math.round(decimalPart * 8);

  if (eighths === 0) {
    return String(integerPart);
  }
  if (eighths === 8) {
    return String(integerPart + 1);
  }

  return integerPart > 0 ? `${integerPart} ${eighths}/8` : `${eighths}/8`;
}
