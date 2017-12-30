// @flow

import type { Lifecycle } from "../Pool"
import type { Thread, ThreadID } from "../Thread"
import type { Future } from "../Future"
import type { Succeed, Fail, Poll } from "../Poll"
import type { Task } from "./Task"
import type { Execute, Cancel } from "../Future/IO"
import Pool from "../Pool"
import then from "../Future/Then"
import catcher from "../Future/Catch"
import selector from "../Future/Select"
import joiner from "../Future/Join"
import futureIO from "../Future/IO"
import Executor from "../Thread/Executor"

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

export const join = <x, a, b>(
  left: Task<x, a>,
  right: Task<x, b>
): Task<x, [a, b]> => new Join(left, right)

export const Kernel = Object.freeze(
  class Kernel<x, a> implements Task<x, a> {
    +spawn: (thread: Thread, id: ThreadID) => Future<x, a>
    then<b>(
      onFulfill?: (value: a) => Promise<b> | b,
      onReject?: (error: x) => Promise<b> | b
    ): Promise<b> {
      return Executor.toPromise(this).then(onFulfill, onReject)
    }

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
    join<b>(task: Task<x, b>): Task<x, [a, b]> {
      return new Join(this, task)
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
  spawn(thread: Thread, id: ThreadID): Future<x, a> {
    return futureIO(this.execute, this.cancel, thread, id)
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
  spawn(thread: Thread, id: ThreadID): Future<x, b> {
    return then(this.task, this, thread, id)
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
  spawn(thread: Thread, id: ThreadID): Future<x, b> {
    return then(this.task, this, thread, id)
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
  spawn(thread: Thread, id: ThreadID): Future<y, a> {
    return catcher(this.task, this, thread, id)
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
  spawn(thread: Thread, id: ThreadID): Future<empty, a> {
    return catcher(this.task, this, thread, id)
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
  spawn(thread: Thread, id: ThreadID): Future<y, a> {
    return catcher(this.task, this, thread, id)
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
  spawn(thread: Thread, id: ThreadID): Future<x, a> {
    const { left, right } = this
    return selector(left.spawn(thread, id), right.spawn(thread, id))
  }
}

class Join<x, a, b> extends Kernel<x, [a, b]> implements Task<x, [a, b]> {
  left: Task<x, a>
  right: Task<x, b>
  constructor(left: Task<x, a>, right: Task<x, b>) {
    super()
    this.left = left
    this.right = right
  }
  spawn(thread: Thread, id: ThreadID): Future<x, [a, b]> {
    return joiner(this.left.spawn(thread, id), this.right.spawn(thread, id))
  }
}

export default Kernel
