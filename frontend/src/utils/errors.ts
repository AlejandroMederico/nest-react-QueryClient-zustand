export const toErrorMessage = (
  e: unknown,
  fallback = 'Unexpected error',
): string => {
  if (typeof e === 'string') return e;
  if (e && typeof e === 'object') {
    const anyE = e as any;
    return anyE?.response?.data?.message ?? anyE?.message ?? fallback;
  }
  return fallback;
};
