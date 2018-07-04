// @flow

import type {
  Thread,
  Park,
  Future,
  Poll,
  Succeed,
  Fail,
  Wait,
  Task
} from "@task.flow/type"

import { nil } from "./Poll"
import {
  Kernel,
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

export type { Task, Thread, Park, Future, Poll, Succeed, Fail, Wait }

export {
  nil,
  Kernel,
  succeed,
  fail,
  io,
  map,
  chain,
  capture,
  recover,
  format,
  select,
  join,
  map2,
  map3,
  map4,
  map5,
  sequence,
  join3,
  join4,
  join5
}

export default class<x, a> extends Kernel<x, a> {
  static nil = nil
  static map2 = map2
  static map3 = map3
  static map4 = map4
  static map5 = map5
  static sequence = sequence
  static join3 = join3
  static join4 = join4
  static join5 = join5
}
