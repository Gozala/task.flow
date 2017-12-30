// @flow

import type { Wait } from "./Poll/Wait"
import type { Succeed } from "./Poll/Succeed"
import type { Fail } from "./Poll/Fail"

export type { Wait, Fail, Succeed }
export type Poll<x, a> = Succeed<a> | Fail<x> | Wait

export { wait } from "./Poll/Wait"
export { succeed, nil } from "./Poll/Succeed"
export { fail } from "./Poll/Fail"
