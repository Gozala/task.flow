// @flow

import type { Task } from "../Task"
import { map, succeed } from "./Kernel"
import { map2, map3, map4, map5 } from "./Map"
import { array1, array2, array3, array4, array5 } from "../Array"
import { push } from "../Array"

const empty: Task<any, any[]> = succeed(Object.freeze([]))

export const sequence = <x, a>(tasks: Array<Task<x, a>>): Task<x, Array<a>> => {
  switch (tasks.length) {
    case 0:
      return empty
    case 1:
      return map(array1, tasks[0])
    case 2:
      return map2(array2, tasks[0], tasks[1])
    case 3:
      return map3(array3, tasks[0], tasks[1], tasks[2])
    case 4:
      return map4(array4, tasks[0], tasks[1], tasks[2], tasks[3])
    case 5:
      return map5(array5, tasks[0], tasks[1], tasks[2], tasks[3], tasks[4])
    default:
      return tasks.reduce(reducer, succeed([]))
  }
}

const reducer = <x, a>(result: Task<x, a[]>, task: Task<x, a>): Task<x, a[]> =>
  map2(push, result, task)
