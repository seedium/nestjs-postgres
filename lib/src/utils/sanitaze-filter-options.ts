export const sanitizeFilterOptions = (
  filter: Record<string, unknown>,
): Record<string, unknown> => {
  return Object.fromEntries(
    Object.entries(filter).filter(([, filterValue]) => {
      const valueType = typeof filterValue;
      return (
        valueType === 'number' ||
        valueType === 'string' ||
        valueType === 'boolean'
      );
    }),
  );
};
