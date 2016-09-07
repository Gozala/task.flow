/* @flow */

import {Task, Succeed, Fail, Then, Catch} from './Task/Core'
import type {F1} from './Task/Core'

type TaskStack <exit, message> =
  Array<Catch<*, exit, message> | Then<exit, *, message>>

export class Process <exit, message> {
  root: Task<exit, message>
  stack: TaskStack<exit, message>
  position: number
  handle: *
  isAlive: boolean
  isBlocked: boolean
  succeed: ?(input:message) => void
  fail: ?(error:exit) => void
  success: ?Succeed<exit, message>
  failure: ?Fail<exit, message>
  onSucceed: (input:message) => void
  onFail: (error:exit) => void
  static spawn: <x, y, a> (task:Task<x, a>) => Task<y, Process<x, a>>
  static fork: <x, y, a> (task:Task<x, a>, onSucceed:F1<a, void>, onFail:F1<x, void>) => Process<x, a>
  static kill: <error, exit, message> (process:Process<exit, message>) => Task<error, void>
  static isProcess: (value:*) => boolean
  constructor (
    task:Task<exit, message>,
    position:number,
    stack:TaskStack<exit, message>,
    handle:*,
    isAlive: boolean,
    isBlocked: boolean,
    succeed: ?(input:message) => void,
    fail: ?(error:exit) => void
  ) {
    this.root = task
    this.position = position
    this.stack = stack
    this.handle = handle
    this.isAlive = isAlive
    this.isBlocked = isBlocked
    this.succeed = succeed
    this.fail = fail

    this.success = null
    this.failure = null

    this.onSucceed = this.onSucceed.bind(this)
    this.onFail = this.onFail.bind(this)
  }
  onSucceed (value:message) {
    if (this.isBlocked) {
      if (this.success != null) {
        this.success.value = value
      } else {
        this.success = new Succeed(value)
      }

      this.root = this.success
      this.handle = null
      resume(this)
    }
  }
  onFail (error:exit) {
    if (this.isBlocked) {
      if (this.failure != null) {
        this.failure.error = error
      } else {
        this.failure = new Fail(error)
      }

      this.root = this.failure
      this.handle = null
      resume(this)
    }
  }
  kill <error> ():Task<error, void> {
    return kill(this)
  }
}

const Task$prototype$execute = Task.prototype.execute

class Kill <error, exit, message> extends Task<error, void> {
  process: Process<exit, message>
  constructor (process:Process<exit, message>) {
    super(Task$prototype$execute)
    this.process = process
  }
  execute (succeed:(a:void) => void, fail:(x:error) => void) {
    const {process} = this
    if (process.isAlive) {
      process.isAlive = false
      process.isBlocked = false
      process.root.abort(process.handle)
    }
    succeed()
  }
}

class Spawn <x, y, a> extends Task <y, Process<x, a>> {
  task: Task<x, a>
  constructor (task:Task<x, a>) {
    super(Task$prototype$execute)
    this.task = task
  }
  execute (succeed:(a:Process<x, a>) => void, fail:(x:y) => void):void {
    const process =
      new Process(this.task, 0, [], null, true, true, null, null)
    enqueue(process)
    succeed(process)
  }
}

const enqueue = <exit, message>
  (process:Process<exit, message>):void =>
  void Promise.resolve(process).then(resume)

const resume = <exit, message>
  (process:Process<exit, message>) => {
    if (process.isBlocked) {
      process.isBlocked = false
      step(process)
    }
  }

const step = <exit, message>
  (process:Process<exit, message>):Process<exit, message> => {
    while (process.isAlive) {
      const task = process.root
      if (task instanceof Succeed) {
        // If task succeeded skip all the error handling.
        while (
          process.position < process.stack.length &&
          process.stack[process.position] instanceof Catch
        ) {
          process.position ++
        }

        // If end of the stack is reached then break
        if (process.position >= process.stack.length) {
          if (process.succeed != null) {
            process.isAlive = false
            process.succeed(task.value)
          }
          break
        }

        // Otherwise step into next task.
        const then = process.stack[process.position++]
        if (then instanceof Then) {
          process.root = then.next(task.value)
        }

        continue
      }

      if (task instanceof Fail) {
        // If task fails skip all the chaining.
        while (
          process.position < process.stack.length &&
          process.stack[process.position] instanceof Then
        ) {
          process.position ++
        }

        // If end of the stack is reached then break.
        if (process.position >= process.stack.length) {
          if (process.fail != null) {
            process.isAlive = false
            process.fail(task.error)
          }
          break
        }

        // Otherwise step into next task.
        const _catch = process.stack[process.position++]
        if (_catch instanceof Catch) {
          process.root = _catch.handle(task.error)
        }

        continue
      }

      if (task instanceof Then) {
        if (process.position === 0) {
          process.stack.unshift(task)
        } else {
          process.stack[--process.position] = task
        }

        process.root = task.task

        continue
      }

      if (task instanceof Catch) {
        if (process.position === 0) {
          process.stack.unshift(task)
        } else {
          process.stack[--process.position] = task
        }

        process.root = task.task

        continue
      }

      if (task instanceof Task) {
        process.isBlocked = true
        process.handle = task.execute(process.onSucceed, process.onFail)
        break
      }
    }

    return process
  }

export const spawn = <x, y, a>
  (task:Task<x, a>):Task<y, Process<x, a>> =>
  new Spawn(task)

export const fork = <x, a>
  (task:Task<x, a>, onSucceed:F1<a, void>, onFail:F1<x, void>):Process<x, a> => {
    const process =
      new Process(task, 0, [], null, true, true, onSucceed, onFail)
    enqueue(process)
    return process
  }

export const kill = <error, exit, message>
  (process:Process<exit, message>):Task<error, void> =>
  new Kill(process)

export const isProcess =
  (value:*):boolean =>
  value instanceof Process

Process.isProcess = isProcess
Process.fork = fork
Process.spawn = spawn
Process.kill = kill

export default Process
