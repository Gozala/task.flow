// @flow

import type { Succeed, Fail } from "@task.flow/type"
import * as Poll from "./Poll/Poll"

export const fail = <x>(error: x): Fail<x> => new Poll.Fail(error)
export const succeed = <a>(value: a): Succeed<a> => new Poll.Succeed(value)
export const nil: Succeed<void> = succeed()
