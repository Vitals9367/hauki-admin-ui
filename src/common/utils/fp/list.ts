export function updateBy<T>(
  predicate: (data: T) => boolean,
  fn: (data: T) => Partial<T>,
  arr: T[]
): T[] {
  let found = false;
  const result = arr.map((elem) => {
    if (predicate(elem)) {
      found = true;
      return {
        ...elem,
        ...fn(elem),
      };
    }

    return elem;
  });

  if (!found) {
    return arr;
  }

  return result;
}

export function updateByOr<T>(
  predicate: (data: T) => boolean,
  fn: (data: T) => Partial<T>,
  defaultValues: T,
  arr: T[]
): T[] {
  const result = updateBy(predicate, fn, arr);

  if (result === arr) {
    return [...arr, defaultValues];
  }

  return result;
}
