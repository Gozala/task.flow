// @flow

import type { Task } from "../Task"
import { chain, map } from "./Kernel"

export const map2 = <x, a, b, r>(
  f: (a, b) => r,
  t$a: Task<x, a>,
  t$b: Task<x, b>
): Task<x, r> => chain(t$a, p$a => map(p$b => f(p$a, p$b), t$b))

export const map3 = <x, a, b, c, r>(
  f: (a, b, c) => r,
  t$a: Task<x, a>,
  t$b: Task<x, b>,
  t$c: Task<x, c>
): Task<x, r> =>
  chain(t$a, p$a => chain(t$b, p$b => map(p$c => f(p$a, p$b, p$c), t$c)))

export const map4 = <x, a, b, c, d, r>(
  f: (a, b, c, d) => r,
  t$a: Task<x, a>,
  t$b: Task<x, b>,
  t$c: Task<x, c>,
  t$d: Task<x, d>
): Task<x, r> =>
  chain(t$a, p$a =>
    chain(t$b, p$b => chain(t$c, p$c => map(p$d => f(p$a, p$b, p$c, p$d), t$d)))
  )

export const map5 = <x, a, b, c, d, e, r>(
  f: (a, b, c, d, e) => r,
  t$a: Task<x, a>,
  t$b: Task<x, b>,
  t$c: Task<x, c>,
  t$d: Task<x, d>,
  t$e: Task<x, e>
): Task<x, r> =>
  chain(t$a, p$a =>
    chain(t$b, p$b =>
      chain(t$c, p$c =>
        chain(t$d, p$d => map(p$e => f(p$a, p$b, p$c, p$d, p$e), t$e))
      )
    )
  )
