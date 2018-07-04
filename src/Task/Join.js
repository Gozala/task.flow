// @flow

import type { Task } from "../Task"
import { tuple } from "tuple.flow"
import { map, join, couple } from "./Kernel"

export const join3 = <x, a, b, c, r>(
  combine: (a, b, c) => r,
  t$a: Task<x, a>,
  t$b: Task<x, b>,
  t$c: Task<x, c>
): Task<x, r> =>
  join(([p$a, p$b], p$c) => combine(p$a, p$b, p$c), couple(t$a, t$b), t$c)

export const join4 = <x, a, b, c, d, r>(
  combine: (a, b, c, d) => r,
  t$a: Task<x, a>,
  t$b: Task<x, b>,
  t$c: Task<x, c>,
  t$d: Task<x, d>
): Task<x, r> =>
  join(
    ([[p$a, p$b], p$c], p$d) => combine(p$a, p$b, p$c, p$d),
    couple(couple(t$a, t$b), t$c),
    t$d
  )

export const join5 = <x, a, b, c, d, e, r>(
  combine: (a, b, c, d, e) => r,
  t$a: Task<x, a>,
  t$b: Task<x, b>,
  t$c: Task<x, c>,
  t$d: Task<x, d>,
  t$e: Task<x, e>
): Task<x, r> =>
  join(
    ([[[p$a, p$b], p$c], p$d], p$e) => combine(p$a, p$b, p$c, p$d, p$e),
    couple(couple(couple(t$a, t$b), t$c), t$d),
    t$e
  )
