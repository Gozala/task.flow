// @flow

import type { Succeed } from "./Poll/Succeed"
import type { Fail } from "./Poll/Fail"
import succeed from "./Poll/Succeed"
import fail from "./Poll/Fail"

export type Wait = void | null
export type Poll<x, a> = Wait | Fail<x> | Succeed<a>
export type { Succeed, Fail }

export const nil: Succeed<void> = succeed()
export { succeed, fail }
