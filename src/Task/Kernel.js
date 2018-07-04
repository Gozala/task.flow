// @flow

import type { Lifecycle } from "pool.flow"
import type {
  Thread,
  Park,
  Future,
  Succeed,
  Fail,
  Poll,
  Task
} from "@task.flow/type"
import type { Execute, Cancel } from "../Future/IO"
import { tuple } from "tuple.flow"
import Pool from "pool.flow"
import then from "../Future/Then"
import catcher from "../Future/Catch"
import selector from "../Future/Select"
import joiner from "../Future/Join"
import futureIO from "../Future/IO"

export const fail = <x, a>(error: x): Task<x, a> & Future<x, a> & Fail<x> =>
  new Failure(error)

export const succeed = <x, a>(
  value: a
): Task<x, a> & Future<x, a> & Succeed<a> => new Success(value)

const noCancel = () => {}

export const io = <x, a, handle>(
  execute: Execute<x, a, handle>,
  cancel: Cancel<handle> = noCancel
): Task<x, a> => new IO(execute, cancel)

export const chain = <x, a, b>(
  task: Task<x, a>,
  next: (a: a) => Task<x, b>
): Task<x, b> => new Chain(task, next)

export const capture = <x, y, a>(
  task: Task<x, a>,
  handle: (error: x) => Task<y, a>
): Task<y, a> => new Capture(task, handle)

export const recover = <x, a>(
  recoverError: (error: x) => a,
  task: Task<x, a>
): Task<empty, a> => new Recover(task, recoverError)

export const format = <x, y, a>(
  formatError: (input: x) => y,
  task: Task<x, a>
): Task<y, a> => new Format(task, formatError)

export const map = <x, a, b>(
  f: (input: a) => b,
  task: Task<x, a>
): Task<x, b> => new Map(task, f)

export const select = <x, a>(
  primary: Task<x, a>,
  secondary: Task<x, a>
): Task<x, a> => new Select(primary, secondary)

export const couple = <x, a, b>(
  left: Task<x, a>,
  right: Task<x, b>
): Task<x, [a, b]> => new Join(tuple, left, right)

export const join = <x, a, b, ab>(
  combine: (a, b) => ab,
  left: Task<x, a>,
  right: Task<x, b>
): Task<x, ab> => new Join(combine, left, right)

export const Kernel = Object.freeze(
  class Kernel<x, a> implements Task<x, a> {
    +spawn: (thread: Thread) => Future<x, a>

    map<b>(f: a => b): Task<x, b> {
      return new Map(this, f)
    }
    chain<b>(chain: a => Task<x, b>): Task<x, b> {
      return new Chain(this, chain)
    }
    capture<y>(capture: x => Task<y, a>): Task<y, a> {
      return new Capture(this, capture)
    }
    recover(recover: x => a): Task<empty, a> {
      return new Recover(this, recover)
    }
    format<y>(format: x => y): Task<y, a> {
      return new Format(this, format)
    }
    select(task: Task<x, a>): Task<x, a> {
      return new Select(this, task)
    }
    couple<b>(task: Task<x, b>): Task<x, [a, b]> {
      return new Join(tuple, this, task)
    }

    static fail = fail
    static succeed = succeed
    static io = io
    static chain = chain
    static map = map
    static capture = capture
    static recover = recover
    static format = format
    static select = select
    static join = join
  }
)

class Failure<x, a> extends Kernel<x, a> implements Future<x, a> {
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

class Success<x, a> extends Kernel<x, a> implements Future<x, a>, Task<x, a> {
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

class IO<x, a, handle> extends Kernel<x, a> implements Task<x, a> {
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

class Chain<x, a, b> extends Kernel<x, b> implements Task<x, b> {
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

class Map<x, a, b> extends Kernel<x, b> implements Task<x, b> {
  task: Task<x, a>
  f: a => b
  constructor(task: Task<x, a>, f: a => b) {
    super()
    this.task = task
    this.f = f
  }

  handle(value: a): Task<x, b> {
    return succeed(this.f(value))
  }
  spawn(thread: Thread): Future<x, b> {
    return then(this.task, this, thread)
  }
}

class Capture<x, y, a> extends Kernel<y, a> implements Task<y, a> {
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

class Recover<x, a> extends Kernel<empty, a> implements Task<empty, a> {
  recoverError: x => a
  task: Task<x, a>
  handle(error: x): Task<empty, a> {
    return succeed(this.recoverError(error))
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

class Format<x, y, a> extends Kernel<y, a> implements Task<y, a> {
  formatError: x => y
  task: Task<x, a>
  handle(error: x): Task<y, a> {
    return fail(this.formatError(error))
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

class Select<x, a> extends Kernel<x, a> implements Task<x, a> {
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

class Join<x, a, b, ab> extends Kernel<x, ab> implements Task<x, ab> {
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

export default Kernel
