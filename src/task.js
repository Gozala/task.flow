/* @flow */
import * as PreemptiveAnimationFrame from 'preemptive-animation-frame'

export type Time = number

export type F0 <out> =
  () => out

export type F1 <arg1, out> =
  (a:arg1) => out

export type F2 <arg1, arg2, out> =
  (a:arg1, b:arg2) => out

export type F3 <arg1, arg2, arg3, out> =
  (a:arg1, b:arg2, c:arg3) => out

export type F4 <arg1, arg2, arg3, arg4, out> =
  (a:arg1, b:arg2, c:arg3, d:arg4) => out

export type F5 <arg1, arg2, arg3, arg4, arg5, out> =
  (a:arg1, b:arg2, c:arg3, d:arg4, e:arg5) => out

export type Fork <x, a, id> =
  (succeed:(a:a) => void, fail:(x:x) => void) => id

export type Abort <id> =
  (handle:id) => void

export const succeed = <x, a>
  (value:a):Task<x, a> =>
  new Succeed(value)

export const fail = <x, a>
  (error:x):Task<x, a> =>
  new Fail(error)

export const spawn = <x, y, a>
  (task:Task<x, a>):Task<y, Process<x, a>> =>
  new Spawn(task)

export const sleep = <x, _>
  (time:Time):Task<x, void> =>
  new Sleep(time)

export const requestAnimationFrame = <x, _>
  ():Task<x, Time> =>
  new AnimationFrame()

export const chain = <x, a, b>
  (task:Task<x, a>, next:(a:a) => Task<x, b>):Task<x, b> =>
  new Chain(task, next)

export const map = <x, a, b>
  (f:(input:a) => b, task:Task<x, a>):Task<x, b> =>
  new Map(task, f)

export const capture = <x, y, a>
  (task:Task<x, a>, handle:(error:x) => Task<y, a>):Task<y, a> =>
  new Capture(task, handle)

export const format = <x, y, a>
  (f:(input:x) => y, task:Task<x, a>):Task<y, a> =>
  new Format(task, f)

export const map2 = <x, a, b, r>
  (combine:F2<a, b, r>, aT:Task<x, a>, bT:Task<x, b>):Task<x, r> =>
  new Chain(aT, a => new Map(bT, b => combine(a, b)))

export const map3 = <x, a, b, c, r>
  (f:F3<a, b, c, r>, aT:Task<x, a>, bT:Task<x, b>, cT:Task<x, c>):Task<x, r> =>
  aT.chain(a => bT.chain(b => cT.map(c => f(a, b, c))))

export const map4 = <x, a, b, c, d, r>
  (f:F4<a, b, c, d, r>, aT:Task<x, a>, bT:Task<x, b>, cT:Task<x, c>, dT:Task<x, d>):Task<x, r> =>
  aT.chain(a => bT.chain(b => cT.chain(c => dT.map(d => f(a, b, c, d)))))

export const map5 = <x, a, b, c, d, e, r>
  (f:F5<a, b, c, d, e, r>, aT:Task<x, a>, bT:Task<x, b>, cT:Task<x, c>, dT:Task<x, d>, eT:Task<x, e>):Task<x, r> =>
  aT.chain(a => bT.chain(b => cT.chain(c => dT.chain(d => eT.map(e => f(a, b, c, d, e))))))

export const sequence = <x, a>
  (tasks:Array<Task<x, a>>):Task<x, Array<a>> => {
    const task = tasks.length === 0 ? new Succeed([])
      : tasks.length === 1
      ? new Map(tasks[0], value => [value])
      : tasks.length === 2
      ? Task.map2(Array, tasks[0], tasks[1])
      : tasks.length === 3
      ? Task.map3(Array, tasks[0], tasks[1], tasks[2])
      : tasks.length === 4
      ? Task.map4(Array, tasks[0], tasks[1], tasks[2], tasks[3])
      : tasks.length === 5
      ? Task.map5(Array, tasks[0], tasks[1], tasks[2], tasks[3], tasks[4])
      : tasks.reduce((result, task) => Task.map2(push, result, task),
                      (Task.succeed([]):Task<x, Array<a>>))
    return task
  }

export const task = <x, a, handle>
  (fork:Fork<x, a, handle>, abort:?Abort<handle>):Task<x, a> =>
  new Task(fork, abort)

export const fork = <x, a>
  (task:Task<x, a>, onSucceed:F1<a, void>, onFail:F1<x, void>):Process<x, a> => {
    const process = new Process(task)
    process.succeed = onSucceed
    process.fail = onFail
    return process.resume()
  }

export const kill = <error, exit, message>
  (process:Process<exit, message>):Task<error, void> =>
  new Kill(process)

export const send = <error, exit, message>
  (payload:message, process:Process<exit, message>):Task<error, void> =>
  new Send(process, payload)

export const receive = <error, message, value>
  (onMessage:(incoming:message) => value):Task<error, value> =>
  new Receive(onMessage)

export const isTask =
  (value:*):boolean =>
  value instanceof Task

export const isProcess =
  (value:*):boolean =>
  value instanceof Process

export class Task <x, a> {
  execute: (succeed:(a:a) => void, fail:(x:x) => void) => *
  cancel: (handle:*) => void

  static succeed: <x, a> (value:a) => Task<x, a>
  static fail: <x, a> (error:x) => Task<x, a>
  static spawn: <x, y, a> (task:Task<x, a>) => Task<y, Process<x, a>>
  static sleep: <x> (time:Time) => Task<x, void>
  static requestAnimationFrame: <x> () => Task<x, Time>
  static chain: <x, a, b> (task:Task<x, a>, next:(a:a) => Task<x, b>) => Task<x, b>
  static map: <x, a, b> (f:(input:a) => b, task:Task<x, a>) => Task<x, b>
  static capture: <x, y, a> (task:Task<x, a>, handle:(error:x) => Task<y, a>) => Task<y, a>
  static format: <x, y, a> (f:(input:x) => y, task:Task<x, a>) => Task<y, a>
  static map2: <x, a, b, r> (f:F2<a, b, r>, aT:Task<x, a>, bT:Task<x, b>) => Task<x, r>
  static map3: <x, a, b, c, r> (f:F3<a, b, c, r>, aT:Task<x, a>, bT:Task<x, b>, cT:Task<x, c>) => Task<x, r>
  static map4: <x, a, b, c, d, r> (f:F4<a, b, c, d, r>, aT:Task<x, a>, bT:Task<x, b>, cT:Task<x, c>, dT:Task<x, d>) => Task<x, r>
  static map5: <x, a, b, c, d, e, r> (f:F5<a, b, c, d, e, r>, aT:Task<x, a>, bT:Task<x, b>, cT:Task<x, c>, dT:Task<x, d>, eT:Task<x, e>) => Task<x, r>
  static sequence: <x, a> (tasks:Array<Task<x, a>>) => Task<x, Array<a>>
  static fork: <x, a> (task:Task<x, a>, onSucceed:F1<a, void>, onFail:F1<x, void>) => Process<x, a>
  static kill: <error, exit, message> (process:Process<exit, message>) => Task<error, void>
  static send: <error, exit, message> (payload:message, process:Process<exit, message>) => Task<error, void>
  static receive: <error, message, value> (onMessage:(incoming:message) => value) => Task<error, value>
  static task: <x, a, handle> (fork:Fork<x, a, handle>, abort:?Abort<handle>) => Task<x, a>
  static isTask: (value:*) => boolean
  static isProcess: (value:*) => boolean

  constructor <handle> (execute:?Fork<x, a, handle>, cancel:?Abort<handle>) {
    if (execute != null) {
      this.execute = execute
    }
    if (cancel != null) {
      this.cancel = cancel
    }
  }
  chain <b> (next:(a:a) => Task<x, b>):Task<x, b> {
    return new Chain(this, next)
  }
  map <b> (f:(input:a) => b):Task<x, b> {
    return new Map(this, f)
  }
  capture <y> (handle:(error:x) => Task<y, a>):Task<y, a> {
    return new Capture(this, handle)
  }
  format <y> (f:(input:x) => y):Task<y, a> {
    return new Format(this, f)
  }
  recover (regain:(error:x) => a):Task<x, a> {
    return new Recover(this, regain)
  }
  spawn <y> ():Task<y, Process<x, a>> {
    return new Spawn(this)
  }
  execute (succeed:(a:a) => void, fail:(x:x) => void):* {

  }
  cancel (handle:*):void {

  }
  fork <handle> (onSucceed:(a:a) => void, onFail:(x:x) => void):handle {
    return fork(this, onSucceed, onFail).handle
  }
  abort <handle> (ref:handle):void {
    return this.cancel(ref)
  }
}

class Succeed <x, a> extends Task <x, a> {
  value: a
  constructor (value:a) {
    super()
    this.value = value
  }
  execute (succeed:(a:a) => void, fail:(x:x) => void):void {
    succeed(this.value)
  }
}

class Fail <x, a> extends Task <x, a> {
  error: x
  constructor (error:x) {
    super()
    this.error = error
  }
  execute (succeed:(a:a) => void, fail:(x:x) => void):void {
    fail(this.error)
  }
}

class Sleep <x, a:void> extends Task <x, void> {
  time: Time
  constructor (time:Time) {
    super()
    this.time = time
  }
  execute (succeed:(a:a) => void, fail:(x:x) => void):number {
    return setTimeout(succeed, this.time, void (0))
  }
  cancel (id:number):void {
    clearTimeout(id)
  }
}

class AnimationFrame <x> extends Task <x, Time> {
  execute (succeed:(a:Time) => void, fail:(x:x) => void):number {
    return PreemptiveAnimationFrame.requestAnimationFrame(succeed)
  }
  cancel (id:number):void {
    PreemptiveAnimationFrame.cancelAnimationFrame(id)
  }
}

class Spawn <x, y, a> extends Task <y, Process<x, a>> {
  task: Task<x, a>
  constructor (task:Task<x, a>) {
    super()
    this.task = task
  }
  execute (succeed:(a:Process<x, a>) => void, fail:(x:y) => void):void {
    const process = new Process(this.task)
    Promise.resolve().then(_ => succeed(process.resume()))
  }
}

export class Send <error, exit, message> extends Task<error, void> {
  payload: message
  process: Process<exit, message>
  constructor (process:Process<exit, message>, payload:message) {
    super()
    this.process = process
    this.payload = payload
  }
  execute (succeed:(a:void) => void, fail:(x:error) => void) {
    this.process.send(this.payload)
    succeed()
  }
}

export class Receive <error, message, value> extends Task<error, value> {
  onMessage: (input:message) => value
  constructor (onMessage:(input:message) => value) {
    super()
    this.onMessage = onMessage
  }
  execute (succeed:(a:value) => void, fail:(x:error) => void) {
  }
}

export class Kill <error, exit, message> extends Task<error, void> {
  process: Process<exit, message>
  constructor (process:Process<exit, message>) {
    super()
    this.process = process
  }
  execute (succeed:(a:void) => void, fail:(x:error) => void) {
    this.process.kill()
    succeed()
  }
  abort (ref:*):void {
  }
}

class Then <x, a, b> extends Task<x, b> {
  task: Task<x, a>
  next: (input:a) => Task<x, b>
  constructor (task:Task<x, a>) {
    super()
    this.task = task
  }
  execute (succeed:(value:b) => void, fail:(error:x) => void):void {
    this.task.fork(value => void (this.next(value).fork(succeed, fail))
    , fail
    )
  }
}

class Chain <x, a, b> extends Then<x, a, b> {
  constructor (task:Task<x, a>, next:(input:a) => Task<x, b>) {
    super(task)
    this.next = next
  }
}

class Map <x, a, b> extends Then<x, a, b> {
  mapper: (input:a) => b
  constructor (task:Task<x, a>, mapper:(input:a) => b) {
    super(task)
    this.mapper = mapper
  }
  next (input:a):Task<x, b> {
    return new Succeed(this.mapper(input))
  }
}

class Catch <x, y, a> extends Task<y, a> {
  task: Task<x, a>
  handle: (error:x) => Task<y, a>
  constructor (task:Task<x, a>) {
    super()
    this.task = task
  }
  execute (succeed:(value:a) => void, fail:(error:y) => void):void {
    this
      .task
      .fork(succeed, error => void (this.handle(error).fork(succeed, fail)))
  }
}

class Capture<x, y, a> extends Catch<x, y, a> {
  handle: (error:x) => Task<y, a>
  constructor (task:Task<x, a>, handle:(error:x) => Task<y, a>) {
    super(task)
    this.handle = handle
  }
}

class Recover<x, a> extends Catch<x, x, a> {
  regain: (error:x) => a
  constructor (task:Task<x, a>, regain:(error:x) => a) {
    super(task)
    this.regain = regain
  }
  handle (error:x):Task<x, a> {
    return new Succeed(this.regain(error))
  }
}

class Format<x, y, a> extends Catch<x, y, a> {

  formatter: (error:x) => y

  constructor (task:Task<x, a>, formatter:(error:x) => y) {
    super(task)
    this.formatter = formatter
  }
  handle (error:x):Task<y, a> {
    return new Fail(this.formatter(error))
  }
}

class Process <exit, message> {
  root: Task<exit, message>
  stack: Array<Catch<*, exit, message> | Then<exit, *, message>>
  position: number
  mailbox: Array<message>
  handle: *
  isActive: boolean
  succeed: ?(input:message) => void
  fail: ?(error:exit) => void
  isPending: boolean
  success: ?Succeed<exit, message>
  failure: ?Fail<exit, message>
  onSucceed: (input:message) => void
  onFail: (error:exit) => void
  constructor (task:Task<exit, message>) {
    this.position = 0
    this.root = task
    this.stack = []
    this.mailbox = []
    this.handle = null
    this.isActive = true
    this.isPending = true
    this.success = null
    this.failure = null
    this.succeed = null
    this.fail = null
    this.onSucceed = this.onSucceed.bind(this)
    this.onFail = this.onFail.bind(this)
  }
  onSucceed (value:message) {
    if (this.isPending) {
      if (this.success != null) {
        this.success.value = value
      } else {
        this.success = new Succeed(value)
      }

      this.root = this.success
      this.handle = null
      this.resume()
    }
  }
  onFail (error:exit) {
    if (this.isPending) {
      if (this.failure != null) {
        this.failure.error = error
      } else {
        this.failure = new Fail(error)
      }

      this.root = this.failure
      this.handle = null
      this.resume()
    }
  }
  send (value:message) {
    this.mailbox.push(value)
    this.resume()
  }
  kill () {
    if (this.isActive) {
      this.isActive = false
      this.isPending = false
      this.root.abort(this.handle)
    }
  }
  resume () {
    if (this.isPending) {
      this.isPending = false
      this.step()
    }
    return this
  }
  step () {
    const process = this
    while (process.isActive) {
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
        if (this.position >= process.stack.length) {
          if (process.fail != null) {
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

      if (task instanceof Receive) {
        if (process.mailbox.length > 0) {
          process.root = task.onMessage(process.mailbox.shift())

          continue
        } else {
          process.isPending = true
          break
        }
      }

      if (task instanceof Task) {
        process.isPending = true
        process.handle = task.execute(process.onSucceed, process.onFail)
        break
      }
    }
  }
}

const push = <a>
  (array:Array<a>, item:a):Array<a> => {
    array.push(item)
    return array
  }

Task.succeed = succeed
Task.fail = fail
Task.spawn = spawn
Task.sleep = sleep
Task.requestAnimationFrame = requestAnimationFrame
Task.chain = chain
Task.map = map
Task.capture = capture
Task.format = format
Task.map2 = map2
Task.map3 = map3
Task.map4 = map4
Task.map5 = map5
Task.sequence = sequence
Task.fork = fork
Task.kill = kill
Task.send = send
Task.task = task
Task.isTask = isTask
Task.isProcess = isProcess

export type { Process }
export default Task
