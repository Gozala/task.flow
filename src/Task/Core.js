/* @flow */

import type {Process} from '../Process'

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

export type Fork <x, a> =
  (succeed:(a:a) => void, fail:(x:x) => void) => ?number

export type Abort =
  (id:number) => void

export class Task <x, a> {
  _execute: Fork<x, a>
  _abort: Abort

  static succeed: <x, a> (value:a) => Task<x, a>
  static fail: <x, a> (error:x) => Task<x, a>
  static spawn: <x, y, a> (task:Task<x, a>) => Task<y, Process<x, a>>
  static sleep: <x> (time:Time) => Task<x, void>
  static requestAnimationFrame: <x> () => Task<x, Time>
  static chain: <x, a, b> (task:Task<x, a>, next:(a:a) => Task<x, b>) => Task<x, b>
  static map: <x, a, b> (f:(input:a) => b, task:Task<x, a>) => Task<x, b>
  static capture: <x, y, a> (task:Task<x, a>, handler:(error:x) => Task<y, a>) => Task<y, a>
  static format: <x, y, a> (f:(input:x) => y, task:Task<x, a>) => Task<y, a>
  static recover: <x, a> (regain:(error:x) => a, task:Task<x, a>) => Task<x, a>
  static map2: <x, a, b, r> (f:F2<a, b, r>, aT:Task<x, a>, bT:Task<x, b>) => Task<x, r>
  static map3: <x, a, b, c, r> (f:F3<a, b, c, r>, aT:Task<x, a>, bT:Task<x, b>, cT:Task<x, c>) => Task<x, r>
  static map4: <x, a, b, c, d, r> (f:F4<a, b, c, d, r>, aT:Task<x, a>, bT:Task<x, b>, cT:Task<x, c>, dT:Task<x, d>) => Task<x, r>
  static map5: <x, a, b, c, d, e, r> (f:F5<a, b, c, d, e, r>, aT:Task<x, a>, bT:Task<x, b>, cT:Task<x, c>, dT:Task<x, d>, eT:Task<x, e>) => Task<x, r>
  static sequence: <x, a> (tasks:Array<Task<x, a>>) => Task<x, Array<a>>
  static fork: <x, a> (task:Task<x, a>, onSucceed:F1<a, void>, onFail:F1<x, void>) => Process<x, a>
  static kill: <error, exit, message> (process:Process<exit, message>) => Task<error, void>
  static send: <error, exit, message> (payload:message, process:Process<exit, message>) => Task<error, void>
  static receive: <error, message, value> (onMessage:(incoming:message) => Task<error, value>) => Task<error, value>
  static task: <x, a> (fork:Fork<x, a>, abort:?Abort) => Task<x, a>
  static isTask: (value:*) => boolean
  static isProcess: (value:*) => boolean
  constructor (execute:?Fork<x, a>, abort:?Abort) {
    if (this.constructor === Task) {
      if (execute == null) {
        throw Error('To instantiate a task you must provide execution function')
      } else {
        this._execute = execute
      }

      if (abort != null) {
        this._abort = abort
      }
    }
  }
  chain <b> (next:(a:a) => Task<x, b>):Task<x, b> {
    return new Chain(this, next)
  }
  map <b> (f:(input:a) => b):Task<x, b> {
    return new Map(this, f)
  }
  capture <y> (handler:(error:x) => Task<y, a>):Task<y, a> {
    return new Capture(this, handler)
  }
  format <y> (f:(input:x) => y):Task<y, a> {
    return new Format(this, f)
  }
  recover (regain:(error:x) => a):Task<x, a> {
    return new Recover(this, regain)
  }
  execute (succeed:(a:a) => void, fail:(x:x) => void):?number {
    return this._execute(succeed, fail)
  }
  abort (id:number):void {
    return this._abort(id)
  }

  // Following two functions depend on `Process`. These methods are basically
  // shortucts for `Process.spawn(task)` &
  // `Process.fork(task, onSucceed, onFail)`. But since `Process` itself
  // imports `Task` we don't want to import `Process` to avoid circular
  // dependcy. There for this module provides core `Task` implementation and
  // rest of the DSL shortucts are added by high level implementation.
  spawn <y> ():Task<y, Process<x, a>> {
    return Task.spawn(this)
  }
  fork (onSucceed:(a:a) => void, onFail:(x:x) => void):Process<x, a> {
    return Task.fork(this, onSucceed, onFail)
  }
  then (onSucceed:(a:a) => void, onFail:(x:x) => void):Process<x, a> {
    return this.fork(onSucceed, onFail)
  }
}

export class Succeed <x, a> extends Task <x, a> {
  value: a
  constructor (value:a) {
    super()
    this.value = value
  }
  execute (succeed:(a:a) => void, fail:(x:x) => void):void {
    succeed(this.value)
  }
}

export class Fail <x, a> extends Task <x, a> {
  error: x
  constructor (error:x) {
    super()
    this.error = error
  }
  execute (succeed:(a:a) => void, fail:(x:x) => void):void {
    fail(this.error)
  }
}

export class Then <x, a, b> extends Task<x, b> {
  task: Task<x, a>
  +next: (input:a) => Task<x, b>
  constructor (task:Task<x, a>) {
    super()
    this.task = task
  }
}

export class Chain <x, a, b> extends Then<x, a, b> {
  _next: (input:a) => Task<x, b>
  constructor (task:Task<x, a>, next:(input:a) => Task<x, b>) {
    super(task)
    this._next = next
  }
  next (input:a):Task<x, b> {
    return this._next(input)
  }
}

export class Map <x, a, b> extends Then<x, a, b> {
  mapper: (input:a) => b
  constructor (task:Task<x, a>, mapper:(input:a) => b) {
    super(task)
    this.mapper = mapper
  }
  next (input:a):Task<x, b> {
    return new Succeed(this.mapper(input))
  }
}

export class Catch <x, y, a> extends Task<y, a> {
  task: Task<x, a>
  +handle: (error:x) => Task<y, a>
  constructor (task:Task<x, a>) {
    super()
    this.task = task
  }
}

export class Capture<x, y, a> extends Catch<x, y, a> {
  _handle: (error:x) => Task<y, a>
  constructor (task:Task<x, a>, handle:(error:x) => Task<y, a>) {
    super(task)
    this._handle = handle
  }
  handle (error:x):Task<y, a> {
    return this._handle(error)
  }
}

export class Recover<x, a> extends Catch<x, x, a> {
  regain: (error:x) => a
  constructor (task:Task<x, a>, regain:(error:x) => a) {
    super(task)
    this.regain = regain
  }
  handle (error:x):Task<x, a> {
    return new Succeed(this.regain(error))
  }
}

export class Format<x, y, a> extends Catch<x, y, a> {
  formatter: (error:x) => y
  constructor (task:Task<x, a>, formatter:(error:x) => y) {
    super(task)
    this.formatter = formatter
  }
  handle (error:x):Task<y, a> {
    return new Fail(this.formatter(error))
  }
}
