export const reflect = <T = unknown>(
  reflectObject: unknown,
  constant: Symbol,
): T | null => {
  if (typeof reflectObject === 'function') {
    return Reflect.getMetadata(constant, reflectObject) ?? null;
  }
  if (reflectObject && typeof reflectObject === 'object') {
    return Reflect.getMetadata(constant, reflectObject.constructor) ?? null;
  }
  return null;
};
