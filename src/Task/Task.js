// @flow

import type { Lifecycle } from "pool.flow"
import type {
  Thread,
  Park,
  Future,
  Succeed,
  Fail,
  Poll,
  Task,
  TaskAPI
} from "@task.flow/type"
import type { Execute, Cancel } from "../Future/IO"
import { tuple } from "tuple.flow"
import Pool from "pool.flow"
import then from "../Future/Then"
import catcher from "../Future/Catch"
import selector from "../Future/Select"
import joiner from "../Future/Join"
import futureIO from "../Future/IO"
import {
  array1,
  array2,
  array3,
  array4,
  array5,
  push
} from "mutable-array.flow"

const noCancel = () => {}

export const fail = <x, a>(error: x): TaskAPI<x, a> & Future<x, a> & Fail<x> =>
  new Failure(error)

export const succeed = <x, a>(
  value: a
): TaskAPI<x, a> & Future<x, a> & Succeed<a> => new Success(value)

export const io = <x, a, handle>(
  execute: Execute<x, a, handle>,
  cancel: Cancel<handle> = noCancel
): TaskAPI<x, a> => new IO(execute, cancel)

export const chain = <x, a, b>(
  task: Task<x, a>,
  next: (a: a) => Task<x, b>
): TaskAPI<x, b> => new Chain(task, next)

export const capture = <x, y, a>(
  task: Task<x, a>,
  handle: x => Task<y, a>
): TaskAPI<y, a> => new Capture(task, handle)

export const recover = <x, a>(
  recoverError: (error: x) => a,
  task: Task<x, a>
): TaskAPI<empty, a> => new Recover(task, recoverError)

export const format = <x, y, a>(
  formatError: (input: x) => y,
  task: Task<x, a>
): TaskAPI<y, a> => new Format(task, formatError)

export const select = <x, a>(
  primary: Task<x, a>,
  secondary: Task<x, a>
): TaskAPI<x, a> => new Select(primary, secondary)

export const join = <x, a, b, ab>(
  combine: (a, b) => ab,
  left: Task<x, a>,
  right: Task<x, b>
): TaskAPI<x, ab> => new Join(combine, left, right)

export const join3 = <x, a, b, c, r>(
  combine: (a, b, c) => r,
  t$a: Task<x, a>,
  t$b: Task<x, b>,
  t$c: Task<x, c>
): TaskAPI<x, r> =>
  join(([p$a, p$b], p$c) => combine(p$a, p$b, p$c), couple(t$a, t$b), t$c)

export const join4 = <x, a, b, c, d, r>(
  combine: (a, b, c, d) => r,
  t$a: Task<x, a>,
  t$b: Task<x, b>,
  t$c: Task<x, c>,
  t$d: Task<x, d>
): TaskAPI<x, r> =>
  join(
    ([[p$a, p$b], p$c], p$d) => combine(p$a, p$b, p$c, p$d),
    couple(couple(t$a, t$b), t$c),
    t$d
  )

export const join5 = <x, a, b, c, d, e, r>(
  combine: (a, b, c, d, e) => r,
  t$a: Task<x, a>,
  t$b: Task<x, b>,
  t$c: Task<x, c>,
  t$d: Task<x, d>,
  t$e: Task<x, e>
): TaskAPI<x, r> =>
  join(
    ([[[p$a, p$b], p$c], p$d], p$e) => combine(p$a, p$b, p$c, p$d, p$e),
    couple(couple(couple(t$a, t$b), t$c), t$d),
    t$e
  )

export const couple = <x, a, b>(
  left: Task<x, a>,
  right: Task<x, b>
): TaskAPI<x, [a, b]> => new Join(tuple, left, right)

export const map = <x, a, b>(
  f: (input: a) => b,
  task: Task<x, a>
): TaskAPI<x, b> => new Map(task, f)

export const map2 = <x, a, b, r>(
  f: (a, b) => r,
  t$a: Task<x, a>,
  t$b: Task<x, b>
): TaskAPI<x, r> => chain(t$a, p$a => map(p$b => f(p$a, p$b), t$b))

export const map3 = <x, a, b, c, r>(
  f: (a, b, c) => r,
  t$a: Task<x, a>,
  t$b: Task<x, b>,
  t$c: Task<x, c>
): TaskAPI<x, r> =>
  chain(t$a, p$a => chain(t$b, p$b => map(p$c => f(p$a, p$b, p$c), t$c)))

export const map4 = <x, a, b, c, d, r>(
  f: (a, b, c, d) => r,
  t$a: Task<x, a>,
  t$b: Task<x, b>,
  t$c: Task<x, c>,
  t$d: Task<x, d>
): TaskAPI<x, r> =>
  chain(t$a, p$a =>
    chain(t$b, p$b => chain(t$c, p$c => map(p$d => f(p$a, p$b, p$c, p$d), t$d)))
  )

export const map5 = <x, a, b, c, d, e, r>(
  f: (a, b, c, d, e) => r,
  t$a: Task<x, a>,
  t$b: Task<x, b>,
  t$c: Task<x, c>,
  t$d: Task<x, d>,
  t$e: Task<x, e>
): TaskAPI<x, r> =>
  chain(t$a, p$a =>
    chain(t$b, p$b =>
      chain(t$c, p$c =>
        chain(t$d, p$d => map(p$e => f(p$a, p$b, p$c, p$d, p$e), t$e))
      )
    )
  )

export const sequence = <x, a>(tasks: Task<x, a>[]): TaskAPI<x, a[]> => {
  switch (tasks.length) {
    case 0:
      return emptyArrayTask
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
      return tasks.reduce(taskSequencer, succeed([]))
  }
}

const taskSequencer = <x, a>(
  result: Task<x, a[]>,
  task: Task<x, a>
): TaskAPI<x, a[]> => map2(push, result, task)

export class TaskObject<x, a> implements TaskAPI<x, a> {
  +spawn: (thread: Thread) => Future<x, a>

  map<b>(f: a => b): TaskAPI<x, b> {
    return new Map(this, f)
  }
  chain<b>(chain: a => Task<x, b>): TaskAPI<x, b> {
    return new Chain(this, chain)
  }
  capture<y>(capture: x => Task<y, a>): TaskAPI<y, a> {
    return new Capture(this, capture)
  }
  recover(recover: x => a): TaskAPI<empty, a> {
    return new Recover(this, recover)
  }
  format<y>(format: x => y): TaskAPI<y, a> {
    return new Format(this, format)
  }
  select(task: Task<x, a>): TaskAPI<x, a> {
    return new Select(this, task)
  }
  couple<b>(task: Task<x, b>): TaskAPI<x, [a, b]> {
    return new Join(tuple, this, task)
  }

  // Note: Without all these typeof-s flow inference does not seem to work.
  static fail: typeof fail = fail
  static succeed: typeof succeed = succeed
  static io: typeof io = io
  static chain: typeof chain = chain
  static map: typeof map = map
  static map2: typeof map2 = map2
  static map3: typeof map3 = map3
  static map4: typeof map4 = map4
  static map5: typeof map5 = map5
  static capture: typeof capture = capture
  static recover: typeof recover = recover
  static format: typeof format = format
  static select: typeof select = select
  static join: typeof join = join
  static join3: typeof join3 = join3
  static join4: typeof join4 = join4
  static join5: typeof join5 = join5
  static couple: typeof couple = couple
  static sequence: typeof sequence = sequence
}

class Failure<x, a> extends TaskObject<x, a> implements Future<x, a> {
  isOk = false
  error: x
  constructor(error: x) {
    super()
    this.error = error
  }
  poll(): Poll<x, a> {
    return this
  }
  spawn(): Future<x, a> {
    return this
  }
  abort() {}
}

class Success<x, a> extends TaskObject<x, a> implements Future<x, a> {
  isOk = true
  value: a
  constructor(value: a) {
    super()
    this.value = value
  }
  spawn(): Future<x, a> {
    return this
  }
  poll(): Poll<x, a> {
    return this
  }
  abort() {}
}

class IO<x, a, handle> extends TaskObject<x, a> {
  execute: Execute<x, a, handle>
  cancel: Cancel<handle>
  constructor(execute: Execute<x, a, handle>, cancel: Cancel<handle>) {
    super()
    this.execute = execute
    this.cancel = cancel
  }
  spawn(thread: Thread): Future<x, a> {
    return futureIO(this.execute, this.cancel, thread)
  }
}

class Chain<x, a, b> extends TaskObject<x, b> {
  task: Task<x, a>
  handle: a => Task<x, b>
  constructor(task: Task<x, a>, handle: a => Task<x, b>) {
    super()
    this.task = task
    this.handle = handle
  }
  spawn(thread: Thread): Future<x, b> {
    return then(this.task, this, thread)
  }
}

class Map<x, a, b> extends TaskObject<x, b> {
  task: Task<x, a>
  f: a => b
  constructor(task: Task<x, a>, f: a => b) {
    super()
    this.task = task
    this.f = f
  }

  handle(value: a): Task<x, b> {
    return TaskObject.succeed(this.f(value))
  }
  spawn(thread: Thread): Future<x, b> {
    return then(this.task, this, thread)
  }
}

class Capture<x, y, a> extends TaskObject<y, a> {
  handle: x => Task<y, a>
  task: Task<x, a>
  constructor(task: Task<x, a>, handle: x => Task<y, a>) {
    super()
    this.task = task
    this.handle = handle
  }
  spawn(thread: Thread): Future<y, a> {
    return catcher(this.task, this, thread)
  }
}

class Recover<x, a> extends TaskObject<empty, a> {
  recoverError: x => a
  task: Task<x, a>
  handle(error: x): Task<empty, a> {
    return TaskObject.succeed(this.recoverError(error))
  }
  constructor(task: Task<x, a>, recoverError: x => a) {
    super()
    this.task = task
    this.recoverError = recoverError
  }
  spawn(thread: Thread): Future<empty, a> {
    return catcher(this.task, this, thread)
  }
}

class Format<x, y, a> extends TaskObject<y, a> {
  formatError: x => y
  task: Task<x, a>
  handle(error: x): Task<y, a> {
    return TaskObject.fail(this.formatError(error))
  }
  constructor(task: Task<x, a>, formatError: x => y) {
    super()
    this.task = task
    this.formatError = formatError
  }
  spawn(thread: Thread): Future<y, a> {
    return catcher(this.task, this, thread)
  }
}

class Select<x, a> extends TaskObject<x, a> {
  left: Task<x, a>
  right: Task<x, a>
  constructor(left: Task<x, a>, right: Task<x, a>) {
    super()
    this.left = left
    this.right = right
  }
  spawn(thread: Thread): Future<x, a> {
    const { left, right } = this
    return selector(left.spawn(thread), right.spawn(thread))
  }
}

class Join<x, a, b, ab> extends TaskObject<x, ab> {
  combine: (a, b) => ab
  left: Task<x, a>
  right: Task<x, b>
  constructor(combine: (a, b) => ab, left: Task<x, a>, right: Task<x, b>) {
    super()
    this.combine = combine
    this.left = left
    this.right = right
  }
  spawn(thread: Thread): Future<x, ab> {
    return joiner(
      this.combine,
      this.left.spawn(thread),
      this.right.spawn(thread)
    )
  }
}

const emptyArrayTask: TaskAPI<any, any[]> = succeed(Object.freeze([]))
