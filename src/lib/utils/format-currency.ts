export function formatCurrency(
  amount: number,
  currency = "INR",
  locale = "en-IN"
): string {
  if (amount === 0) return "₹0";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatFineRange(
  min: number | null,
  max: number | null
): string {
  if (min === null && max === null) return "Amount varies";
  if (min === null) return `Up to ${formatCurrency(max!)}`;
  if (max === null) return `From ${formatCurrency(min)}`;
  if (min === max) return formatCurrency(min);
  return `${formatCurrency(min)} – ${formatCurrency(max)}`;
}
