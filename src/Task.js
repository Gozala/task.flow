// @flow

import type { Thread, ThreadID } from "./Thread"
import type { Future } from "./Future"
import type { Poll, Succeed, Fail, Wait } from "./Poll"
import type { Task } from "./Task/Task"
import Executor from "./Thread/Executor"

import { nil } from "./Poll"
import {
  succeed,
  fail,
  io,
  map,
  chain,
  capture,
  recover,
  format,
  select,
  join
} from "./Task/Kernel"

import { map2, map3, map4, map5 } from "./Task/Map"
import { sequence } from "./Task/Sequence"
import { join3, join4, join5 } from "./Task/Join"

export type { Task, Thread, ThreadID, Future, Poll, Succeed, Fail, Wait }

export default {
  spawn: Executor.spawn,
  toPromise: Executor.toPromise,
  nil,
  succeed,
  fail,
  io,
  map,
  map2,
  map3,
  map4,
  map5,
  sequence,
  chain,
  capture,
  recover,
  format,
  select,
  join,
  join3,
  join4,
  join5
}
