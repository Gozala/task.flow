// @flow

import type { Lifecycle } from "pool.flow"

export type ThreadID = Lifecycle

export interface Thread {
  notify(ThreadID): void;
}
