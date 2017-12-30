// @flow

import type { Task } from "../Task"
import { map, join } from "./Kernel"

export const join3 = <x, a, b, c, r>(
  f: (a, b, c) => r,
  t$a: Task<x, a>,
  t$b: Task<x, b>,
  t$c: Task<x, c>
): Task<x, r> =>
  map(
    ([[p$a, p$b], p$c]: [[a, b], c]) => f(p$a, p$b, p$c),
    join(join(t$a, t$b), t$c)
  )

export const join4 = <x, a, b, c, d, r>(
  f: (a, b, c, d) => r,
  t$a: Task<x, a>,
  t$b: Task<x, b>,
  t$c: Task<x, c>,
  t$d: Task<x, d>
): Task<x, r> =>
  map(
    ([[[p$a, p$b], p$c], p$d]: [[[a, b], c], d]) => f(p$a, p$b, p$c, p$d),
    join(join(join(t$a, t$b), t$c), t$d)
  )

export const join5 = <x, a, b, c, d, e, r>(
  f: (a, b, c, d, e) => r,
  t$a: Task<x, a>,
  t$b: Task<x, b>,
  t$c: Task<x, c>,
  t$d: Task<x, d>,
  t$e: Task<x, e>
): Task<x, r> =>
  map(
    ([[[[p$a, p$b], p$c], p$d], p$e]: [[[[a, b], c], d], e]) =>
      f(p$a, p$b, p$c, p$d, p$e),
    join(join(join(join(t$a, t$b), t$c), t$d), t$e)
  )
