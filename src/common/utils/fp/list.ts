export function updateBy<T>(
  predicate: (data: T) => boolean,
  fn: (data: T) => T,
  arr: T[]
): T[] {
  return arr.map((elem) => {
    if (predicate(elem)) {
      return {
        ...elem,
        ...fn(elem),
      };
    }
    return elem;
  });
}

export function updateOrAdd<T>(
  predicate: (data: T) => boolean,
  fn: (data: T) => T,
  valueToBeAdded: T,
  arr: T[]
): T[] {
  const hasMatch: boolean = arr.some(predicate);

  if (hasMatch) {
    return updateBy<T>(predicate, fn, arr);
  }

  return [...arr, valueToBeAdded];
}
