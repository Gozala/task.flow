/* @flow */

import {requestAnimationFrame, cancelAnimationFrame} from "preemptive-animation-frame"

export type ThreadID = number
export type Time = number
export type ProcessID = number

export class Task <x, a> {
  fork: (succeed:(a:a) => void, fail:(x:x) => void) => any;
  abort: (handle:any) => void;


  static succeed <x, a>(value:a):Task<x, a> {
    return new Succeed(value)
  }

  static fail <x, a> (error:x):Task<x, a> {
    return new Fail(error)
  }

  static spawn <x, y, a> (task:Task<x, a>):Task<y, ThreadID> {
    return new Spawn(task)
  }

  static sleep <x> (time:Time):Task<x, void> {
    return new Sleep(time)
  }

  static requestAnimationFrame <x> ():Task<x, Time> {
    return new AnimationFrame()
  }

  static chain <x, a, b> (
    task:Task<x, a>
  , next:(a:a) => Task<x,b>
  ):Task<x, b> {
    return new Chain(task, next)
  }

  static map <x, a, b> (
    f:(input:a) => b
  , task:Task<x, a>
  ):Task<x, b> {
    return new Map(task, f)
  }

  static capture <x, y, a> (
    task:Task<x, a>
  , handle:(error:x) => Task<y, a>
  ):Task<y, a> {
    return new Capture(task, handle)
  }


  static format <x, y, a> (
    f:(input:x) => y
  , task:Task<x, a>
  ):Task<y, a> {
    return new Format(task, f)
  }


  static map2 <x, a, b, c> (
    combine:(a:a, b:b) => c
  , aTask:Task<x, a>
  , bTask:Task<x, b>
  ):Task<x, c> {
    const task = new Chain
      ( aTask
      , (a:a):Task<x, c> =>
        new Map
        ( bTask
        , b => combine(a, b)
        )
      )
    return task
  }

  static map3 <error, a, b, c, value> (
    combine:(a:a, b:b, c:c) => value
  , aTask:Task<error, a>
  , bTask:Task<error, b>
  , cTask:Task<error, c>
  ):Task<error, value> {
    const task = aTask.chain
    ( a =>
      bTask.chain
      ( b =>
        cTask.map
        ( c =>
          combine(a, b, c)
        )
      )
    )
    return task
  }

  static map4 <error, a, b, c, d, value> (
    combine:(a:a, b:b, c:c, d:d) => value
  , aTask:Task<error, a>
  , bTask:Task<error, b>
  , cTask:Task<error, c>
  , dTask:Task<error, d>
  ):Task<error, value> {
    const task = aTask.chain
    ( a =>
      bTask.chain
      ( b =>
        cTask.chain
        ( c =>
          dTask.map
          ( d =>
            combine(a, b, c, d)
          )
        )
      )
    )
    return task
  }

  static map5 <error, a, b, c, d, e, value> (
    combine:(a:a, b:b, c:c, d:d, e:e) => value
  , aTask:Task<error, a>
  , bTask:Task<error, b>
  , cTask:Task<error, c>
  , dTask:Task<error, d>
  , eTask:Task<error, e>
  ):Task<error, value> {
    const task = aTask.chain
    ( a =>
      bTask.chain
      ( b =>
        cTask.chain
        ( c =>
          dTask.chain
          ( d =>
            eTask.map
            ( e =>
              combine(a, b, c, d, e)
            )
          )
        )
      )
    )
    return task
  }

  static sequence <x, a> (tasks:Array<Task<x, a>>):Task<x, Array<a>> {
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
      : tasks.reduce
        ( (result, task) => Task.map2(push, result, task)
        , (Task.succeed([]):Task<x, Array<a>>)
        )
    return task
  }

  static isTask (value:any):boolean {
    return value instanceof Task
  }

  static fork <x, a, message, reason>(task:Task<x, a>, onSucceed:(a:a) => void, onFail:(x:x) => void):Process<x, a, message, reason> {
    return Process.fork(task, onSucceed, onFail)
  }

  constructor <handle> (
    execute:?(succeed:(a:a) => void, fail:(x:x) => void) => handle
  , cancel:?(handle:handle) => void
  ) {
    if (execute != null) {
      this.fork = execute
    }
    if (cancel != null) {
      this.abort = cancel
    }
  }
  chain <b> (next:(a:a) => Task<x,b>):Task<x, b> {
    return new Chain(this, next)
  }
  map <b> (f:(input:a) => b):Task<x, b> {
    return new Map(this, f)
  }
  capture <y>(handle:(error:x) => Task<y, a>):Task<y, a> {
    return new Capture(this, handle)
  }
  format <y> (f:(input:x) => y):Task<y, a> {
    return new Format(this, f)
  }
  recover (regain:(error:x) => a):Task<x, a> {
    return new Recover(this, regain)
  }
  spawn <x, y, a> (task:Task<x, a>):Task<y, ThreadID> {
    return new Spawn(task)
  }
  fork(succeed:(a:a) => void, fail:(x:x) => void):any {
  }
  abort <handle>(ref:handle):void {
  }
}

class Succeed <x,a> extends Task <x, a> {

  value: a;

  constructor(value:a) {
    super()
    this.value = value
  }
  fork(succeed:(a:a) => void, fail:(x:x) => void):void {
    succeed(this.value)
  }
}

class Fail <x, a> extends Task <x, a> {

  error: x;

  constructor(error:x) {
    super()
    this.error = error
  }
  fork(succeed:(a:a) => void, fail:(x:x) => void):void {
    fail(this.error)
  }
}


class Sleep <x, a:void> extends Task <x, void> {

  time: Time;

  constructor(time:Time) {
    super()
    this.time = time
  }
  fork(succeed:(a:a) => void, fail:(x:x) => void):number {
    return setTimeout(succeed, this.time, void(0))
  }
  abort(id:number):void {
    clearTimeout(id)
  }
}

class AnimationFrame <x> extends Task <x, Time> {
  constructor() {
    super()
  }
  fork(succeed:(a:Time) => void, fail:(x:x) => void):number {
    return requestAnimationFrame(succeed)
  }
  abort(id:number):void {
    cancelAnimationFrame(id)
  }
}

let threadID = 0
class Spawn <x, y, a> extends Task <y, ThreadID> {

  task: Task<x, a>;

  constructor(task:Task<x, a>) {
    super()
    this.task = task
  }
  fork(succeed:(a:ThreadID) => void, fail:(x:y) => void):void {
    Promise
    .resolve(null)
    .then(_ => Task.fork(this.task, noop, noop))

    succeed(++threadID)
  }
}

class Future <x, a> extends Task<x, a> {

  request: () => Promise<a>;

  constructor(request:() => Promise<a>) {
    super()
    this.request = request
  }
  fork(succeed:(a:a) => void, fail:(x:x) => void):void {
    this.request().then(succeed, fail)
  }
}

class Then <x, a, b> extends Task<x, b> {

  task: Task<x, a>;
  next: (input:a) => Task<x, b>;

  constructor(task:Task<x, a>) {
    super()
    this.task = task
  }
  fork(succeed:(value:b) => void, fail:(error:x) => void):void {
    this.task.fork
    ( value => void(this.next(value).fork(succeed, fail))
    , fail
    )
  }
}

class Chain <x, a, b> extends Then<x, a, b> {
  constructor(task:Task<x, a>, next:(input:a) => Task<x, b>) {
    super(task)
    this.next = next
  }
}

class Map <x, a, b> extends Then<x, a, b> {

  mapper: (input:a) => b;

  constructor(task:Task<x, a>, mapper:(input:a) => b) {
    // Note: Had to trick flow into thinking that `Format.prototype.handle` was
    // passed, otherwise it fails to infer polymorphic nature.
    super(task)
    this.mapper = mapper
  }
  next(input:a):Task<x, b> {
    return new Succeed(this.mapper(input))
  }
}

class Catch <x, y, a> extends Task<y, a> {

  task: Task<x, a>;
  handle: (error:x) => Task<y, a>;

  constructor(task:Task<x, a>) {
    super()
    this.task = task
  }
  fork(succeed:(value:a) => void, fail:(error:y) => void):void {
    this.task.fork
    ( succeed
    , error => void(this.handle(error).fork(succeed, fail))
    )
  }
}

class Capture<x, y, a>extends Catch<x, y, a>{

  handle: (error:x) => Task<y, a>;

  constructor(task:Task<x, a>, handle:(error:x) => Task<y, a>) {
    super(task)
    this.handle = handle
  }
}

class Recover<x, a>extends Catch<x, x, a> {

  regain: (error:x) => a;

  constructor(task:Task<x, a>, regain:(error:x) => a) {
    super(task)
    this.regain = regain
  }
  handle(error:x):Task<x, a> {
    return new Succeed(this.regain(error))
  }
}

class Format<x, y, a>extends Catch<x, y, a>{

  formatter: (error:x) => y;

  constructor(task:Task<x, a>, formatter:(error:x) => y) {
    super(task)
    this.formatter = formatter
  }
  handle(error:x):Task<y, a> {
    return new Fail(this.formatter(error))
  }
}


const noop = () => void(0)

let nextID = 0

class Process <error, value, message, reason> {

  id: ProcessID;
  root: Task<*, *>;
  stack: Array<Catch<*, *, *> | Then<*, *, *>>;
  position: number;
  mailbox: Array<message>;
  abortHandle: any;
  isActive: boolean;
  succeed: ?(input:value) => void;
  fail: ?(error:error) => void;
  isPending: boolean;
  success: ?Succeed<*, *>;
  failure: ?Fail<*, *>;
  onSucceed: <value> (input:value) => void;
  onFail: <error> (error:error) => void;

  static fork <error, value, message, reason>(task:Task<error, value>, onSucceed:(input:value) => void, onFail:(error:error) => void):Process<error, value, message, reason> {
    const process = new Process(task)
    process.succeed = onSucceed
    process.fail = onFail
    process.schedule()
    return process
  }
  constructor(task:Task<any, any>) {
    this.id = ++nextID
    this.position = 0
    this.root = task
    this.stack = []
    this.mailbox = []
    this.abortHandle = null
    this.isActive = true
    this.isPending = false
    this.success = null
    this.failure = null
    this.succeed = null
    this.fail = null
    this.onSucceed = this.onSucceed.bind(this)
    this.onFail = this.onFail.bind(this)
  }
  onSucceed(data:value) {
    if (this.isPending) {
      this.isPending = false
      this.abortHandle = null

      if (this.success != null) {
        this.success.value = data
      }
      else {
        this.success = new Succeed(data)
      }

      this.root = this.success
      this.schedule()
    }
  }
  onFail(data:error) {
    if (this.isPending) {
      this.isPending = false
      this.abortHandle = null

      if (this.failure != null) {
        this.failure.error = data
      }
      else {
        this.failure = new Fail(data)
      }

      this.root = this.failure
      this.schedule()
    }
  }
  kill(code:reason) {
    if (this.isActive) {
      this.isActive = false
      if (this.root.abort) {
        this.root.abort(this.abortHandle)
      }
    }
  }
  schedule() {
    this.step()
  }
  step() {
    const process = this
    while (process.isActive) {
      const task = process.root
      if (task instanceof Succeed) {
        // If task succeeded skip all the error handling.
        while
        ( process.position < process.stack.length &&
          process.stack[process.position] instanceof Catch
        )
        {
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
         if (then instanceof Then)
        process.root = then.next(task.value)
        continue
      }

      if (task instanceof Fail) {
        // If task fails skip all the chaining.
        while
        ( process.position < process.stack.length &&
          process.stack[process.position] instanceof Then
        )
        {
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
         if (_catch instanceof Catch)
        process.root = _catch.handle(task.error)
        continue
      }

      if (task instanceof Then) {
        if (process.position === 0) {
          process.stack.unshift(task)
        }
        else {
          process.stack[--process.position] = task
        }

        process.root = task.task

        continue
      }

      if (task instanceof Catch) {
        if (process.position === 0) {
          process.stack.unshift(task)
        }
        else {
          process.stack[--process.position] = task
        }

        process.root = task.task

        continue
      }

      if (task instanceof Task) {
        process.isPending = true
        process.abortHandle = task.fork
        ( process.onSucceed
        , process.onFail
        )
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
