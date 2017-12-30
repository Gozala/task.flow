// @flow

import type { Future } from "../Future"
import type { ThreadID, Thread } from "../Thread"

export interface Task<x, a> {
  // Only method tasks really need to implement, the rest is just convenience
  // API.
  spawn(Thread, ThreadID): Future<x, a>;
  // This is controversial and maybe removed in the future, but right now we
  // have `.then` API mostly for composability with async functions. Controversy
  // is that invoking `.then` would execute a task with a specific scheduler
  // while the whole API is designed around the fact that different scheduler
  // can be used per use case, not to mention that behavior can be quite
  // surprising.
  then<b>(
    onFulfill?: (value: a) => Promise<b> | b,
    onReject?: (error: x) => Promise<b> | b
  ): Promise<b>;

  map<b>((a) => b): Task<x, b>;
  chain<b>((a) => Task<x, b>): Task<x, b>;
  capture<y>((x) => Task<y, a>): Task<y, a>;
  recover((x) => a): Task<empty, a>;
  format<y>((x) => y): Task<y, a>;
  select(Task<x, a>): Task<x, a>;
  join<b>(Task<x, b>): Task<x, [a, b]>;
}
