// @flow

import type { Lifecycle } from "./Pool"

export type ThreadID = Lifecycle

export interface Thread {
  notify(ThreadID): void;
}
