/* @flow */

/*::
import type {Time, ThreadID} from "./task"
import type {Then, Handle, To, Execute} from "./task"

export type {Time, ThreadID, Then, Handle, To, Execute}
*/

import {map3, map4, map5} from "./task.flowless"

let threadID = 0;

class Task/*::<x, a>*/ {
  /*::
  type: "Task";
  */
  chain/*::<b>*/(then/*:Then<x, a, b>*/)/*:Task<x, b>*/ {
    return new Chain(this, then)
  }

  map/*::<b>*/(f/*:To<a, b>*/)/*:Task<x, b>*/ {
    return new Map(this, f)
  }

  capture/*::<y>*/(handle/*:Handle<x, y, a>*/)/*:Task<y, a>*/ {
    return new Capture(this, handle)
  }

  format/*::<y>*/(f/*:To<x, y>*/)/*:Task<y, a>*/ {
    return new Format(this, f)
  }

  spawn/*::<never>*/()/*:Task<never, ThreadID>*/ {
    return new Async((fail, succeed) => {
      Promise
        .resolve(this)
        .then(perform)

      succeed(++threadID)
    })
  }

  fork(onFail/*:(error:x)=>void*/, onSucceed/*:(value:a)=>void*/)/*:void*/ {
    throw Error('Task must implemente .fork')
  }
}
Task.prototype.type = "Task"


class Succeed /*::<x, a>*/ extends Task/*::<x, a>*/ {
  /*::
  value: a;
  */
  constructor(value/*:a*/) {
    super()
    this.value = value
  }
  fork(onFail/*:(error:x)=>void*/, onSucceed/*:(value:a)=>void*/)/*:void*/ {
    onSucceed(this.value)
  }
}

class Fail /*::<x, a>*/ extends Task/*::<x, a>*/ {
  /*::
  error: x;
  */
  constructor(error/*:x*/) {
    super()
    this.error = error
  }
  fork(onFail/*:(error:x)=>void*/, onSucceed/*:(value:a)=>void*/)/*:void*/ {
    onFail(this.error)
  }
}

class Async /*::<x, a>*/ extends Task/*::<x, a>*/ {
  /*::
  execute: Execute<x, a>;
  */
  constructor(execute/*:Execute<x, a>*/) {
    super()
    this.execute = execute
  }
  fork(onFail/*:(error:x)=>void*/, onSucceed/*:(value:a)=>void*/)/*:void*/ {
    let isActive = true
    const fail = error => {
      if (isActive) {
        isActive = false
        onFail(error)
      }
      else {
        throw Error('Task may not be completed more than once')
      }
    }

    const succeed = value => {
      if (isActive) {
        isActive = false
        onSucceed(value)
      }
      else {
        throw Error('Task may not be completed more than once')
      }
    }

    this.execute(fail, succeed)
  }
}

class Capture /*::<x, y, a>*/ extends Task/*::<y, a>*/ {
  /*::
  task: Task<x, a>;
  handle: Handle<x, y, a>;
  */
  constructor(task/*:Task<x, a>*/, handle/*:Handle<x, y, a>*/) {
    super()
    this.task = task
    this.handle = handle
  }
  fork(onFail/*:(e:y) => void*/, onSucceed/*:(v:a) => void*/)/*:void*/ {
    this.task.fork
    ( error => this.handle(error).fork(onFail, onSucceed)
    , onSucceed
    )
  }
}

class Format /*::<x, y, a>*/ extends Task/*::<y, a>*/ {
  /*::
  task: Task<x, a>;
  f: To<x, y>;
  */
  constructor(task/*:Task<x, a>*/, f/*:To<x, y>*/) {
    super()
    this.task = task
    this.f = f
  }
  fork(onFail/*:(e:y) => void*/, onSucceed/*:(v:a) => void*/)/*:void*/ {
    this.task.fork
    ( error => onFail(this.f(error))
    , onSucceed
    )
  }
}


class Chain /*::<x, a, b>*/ extends Task/*::<x, b>*/ {
  /*::
  task: Task<x, a>;
  then: Then<x, a, b>;
  */
  constructor(task/*:Task<x, a>*/, then/*:Then<x, a, b>*/) {
    super()
    this.task = task
    this.then = then
  }
  fork(onFail/*:(e:x) => void*/, onSucceed/*:(v:b) => void*/)/*:void*/ {
    this.task.fork
    ( onFail
    , value => this.then(value).fork(onFail, onSucceed)
    )
  }
}

class Map /*::<x, a, b>*/ extends Task/*::<x, b>*/ {
  /*::
  task: Task<x, a>;
  f: To<a, b>;
  */
  constructor(task/*:Task<x, a>*/, f/*:To<a, b>*/) {
    super()
    this.task = task
    this.f = f
  }
  fork(onFail/*:(e:x) => void*/, onSucceed/*:(v:b) => void*/)/*:void*/ {
    this.task.fork
    ( onFail
    , value => onSucceed(this.f(value))
    )
  }
}

export const succeed = /*::<x, a>*/
  (value/*:a*/)/*:Task<x, a>*/ =>
  new Succeed(value)

export const fail = /*::<x, a>*/
  (error/*:x*/)/*:Task<x, a>*/ =>
  new Fail(error)

export const task = /*::<x, a>*/
  (execute/*:Execute<x, a>*/)/*:Task<x,a>*/ =>
  new Async(execute)

export const chain = /*::<x, a, b>*/
  ( task/*:Task<x, a>*/
  , then/*:Then<x, a, b>*/
  )/*:Task<x, b>*/ =>
  new Chain(task, then)

export const map = /*::<x, a, b>*/
  ( f/*:To<a,b>*/
  , task/*:Task<x, a>*/
  )/*:Task<x, b>*/ =>
  new Map(task, f)

export const capture = /*::<x, y, a>*/
  ( task/*:Task<x, a>*/
  , handle/*:Handle<x, y, a>*/
  )/*:Task<y, a>*/ =>
  new Capture(task, handle)


export const format = /*::<x, y, a>*/
  ( f/*:To<x, y>*/
  , task/*:Task<x, a>*/
  )/*:Task<y, a>*/ =>
  new Format(task, f)


export const map2 = /*::<x, a, b, c>*/
  ( combine/*:(a:a, b:b) => c*/
  , aTask/*:Task<x, a>*/
  , bTask/*:Task<x, b>*/
  )/*:Task<x, c>*/ =>
  new Chain
  ( aTask
  // @FlowIssue: Flow seems to fail here.
  , (a/*:a*/)/*:Task<x, c>*/ =>
    new Map
    ( bTask
    , b => combine(a, b)
    )
  )

export {map3, map4, map5}

export const isTask =
  (value/*:any*/)/*:boolean*/ =>
  ( value == null
  ? false
  : value instanceof Task
  ? true
  : ( value.type === "Task" &&
    /*:: typeof(value) === "object" && */
      typeof(value.fork) === "function"
    )
  )

export const sleep = /*::<x>*/
  (time/*:number*/)/*:Task<x, void>*/ =>
  new Async((fail, succeed) => void setTimeout(succeed, time, void(0)))


export const fork = /*::<x, a>*/
  ( task/*:Task<x, a>*/
  , onFail/*:(error:x) => void*/
  , onSucceed/*:(value:a) => void*/
  )/*:void*/ =>
  task.fork(onFail, onSucceed)

const noop = _ => void(0)

export const perform = /*::<x, a>*/
  (task/*:Task<x, a>*/)/*:void*/ =>
  task.fork(noop, noop)

const push = /*::<a>*/
  (array/*:Array<a>*/, item/*:a*/)/*:Array<a>*/ => {
    array.push(item)
    return array
  }

export const sequence = /*::<x, a>*/
  (tasks/*:Array<Task<x, a>>*/)/*:Task<x, Array<a>>*/ =>
  ( tasks.length === 0
  ? new Succeed([])
  : tasks.length === 1
  ? new Map(tasks[0], value => [value])
  : tasks.length === 2
  ? map2(Array, task[0], task[1])
  : tasks.length === 3
  ? map3(Array, task[0], task[1], task[2])
  : tasks.length === 4
  ? map4(Array, task[0], task[1], task[2], task[3])
  : tasks.length === 5
  ? map5(Array, task[0], task[1], task[2], task[3], task[4])
  : tasks.reduce
    ( (result, task) => map2(push, result, task)
    , (succeed([])/*:Task<x, Array<a>>*/)
    )
  )
