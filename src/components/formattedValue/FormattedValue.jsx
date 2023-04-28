export const FormattedAmount = (value) => {
  return Number(value) < 0
    ? `(₹ ${Math.abs(Number(value || 0)).toLocaleString('en-IN')})`
    : `₹ ${Math.abs(Number(value || 0)).toLocaleString('en-IN')}`;
};
