// @flow

const $empty = Object.freeze([])
export const empty = (): [] => $empty
export const singleton = <a>(a$: a): [a] => [a$]
export const tuple = <a, b>(a$: a, b$: b): [a, b] => [a$, b$]
export const triple = <a, b, c>(a$: a, b$: b, c$: c): [a, b, c] => [a$, b$, c$]
export const quadruple = <a, b, c, d>(
  a$: a,
  b$: b,
  c$: c,
  d$: d
): [a, b, c, d] => [a$, b$, c$, d$]
export const quintuple = <a, b, c, d, e>(
  a$: a,
  b$: b,
  c$: c,
  d$: d,
  e$: e
): [a, b, c, d, e] => [a$, b$, c$, d$, e$]
export const tuple3 = triple
export const tuple4 = quadruple
export const tuple5 = quintuple
