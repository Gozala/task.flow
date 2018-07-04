// @flow

import type { Future } from "../Future"
import type { ThreadID, Thread } from "../Thread"

export interface Task<+x, +a> {
  // Only method tasks really need to implement, the rest is just convenience
  // API.
  spawn(Thread, ThreadID): Future<x, a>;

  map<b>((a) => b): Task<x, b>;
  chain<b>((a) => Task<x, b>): Task<x, b>;
  capture<y>((x) => Task<y, a>): Task<y, a>;
  recover((x) => a): Task<empty, a>;
  format<y>((x) => y): Task<y, a>;
  select(Task<x, a>): Task<x, a>;
  couple<b>(Task<x, b>): Task<x, [a, b]>;
}
