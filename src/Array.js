// @flow

export const push = <value>(items: Array<value>, item: value): Array<value> => (
  items.push(item), items
)

export const array0 = <a>() => []
export const array1 = <a>(a1: a): a[] => [a1]
export const array2 = <a>(a1: a, a2: a): a[] => [a1, a2]
export const array3 = <a>(a1: a, a2: a, a3: a): a[] => [a1, a2, a3]
export const array4 = <a>(a1: a, a2: a, a3: a, a4: a): a[] => [a1, a2, a3, a4]
export const array5 = <a>(a1: a, a2: a, a3: a, a4: a, a5: a): a[] => [
  a1,
  a2,
  a3,
  a4,
  a5
]
export const array = <a>(...args: a[]): a[] => args
