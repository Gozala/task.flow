/* @noflow */

// Flow chockes because of many type unions, so we bail out until flow
// get's better at handling it:
// https://github.com/facebook/flow/issues/1228

/*::
import type {Time, ThreadID} from "./task"
import type {Then, Handle, To, Suspend} from "./task"

type Task<error, value>
  = Succeed<error, value>
  | Fail<error, value>
  | Chain<error, *, value>
  | Map<error, *, value>
  | Format<*, error, value>
  | Capture<*, error, value>
  | Async<error, value>
  | Await<error, value>
  | Future<error, value>
*/

let threadID = 0;

class TaskDSL/*::<x, a>*/ {
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
    return new Format(this, format)
  }

  spawn/*::<never>*/()/*:Task<never, ThreadID>*/ {
    return new Async(next => {
      Promise
      .resolve(this)
      .then(perform)

      next(new Succeed(++threadID))
    })
  }

  fork(failed/*:(error:x)=>void*/, succeeded/*:(value:a)=>void*/)/*:void*/ {
    fork(this, failed, succeeded)
  }
}


class Succeed /*::<x, a>*/ extends TaskDSL/*::<x, a>*/ {
  /*::
  value: a;
  */
  constructor(value/*:a*/) {
    super()
    this.value = value
  }
}
Succeed.prototype.type = "Succeed"

class Fail /*::<x, a>*/ extends TaskDSL/*::<x, a>*/ {
  /*::
  error: x;
  */
  constructor(error/*:x*/) {
    super()
    this.error = error
  }
}
Fail.prototype.type = "Fail"

class Await /*::<x, a>*/ extends TaskDSL/*::<x, a>*/ {
  /*::
  value: ?Task<x, a>;
  */
  constructor() {
    super()
    this.value = null
  }
}
Await.prototype.type = "Await"

class Async /*::<x, a>*/ extends TaskDSL/*::<x, a>*/ {
  /*::
  await: Suspend<x, a>;
  */
  constructor(run/*:Suspend<x, a>*/) {
    super()
    this.await = run
  }
}
Async.prototype.type = "Async"

class Future /*::<x, a>*/ extends TaskDSL/*::<x, a>*/ {
  /*::
  promise: () => Promise<a, x>;
  */
  constructor(promise/*:() => Promise<a, x>*/) {
    super()
    this.promise = promise
  }
  await(resume/*:(task:Task<x, a>) => void*/)/*:void*/ {
    this
      .promise()
      .then(succeed, fail)
      .then(resume)
  }
}
Future.prototype.type = "Future"


class Capture /*::<x, y, a>*/ extends TaskDSL/*::<y, a>*/ {
  /*::
  task: Task<x, a>;
  handle: Handle<x, y, a>;
  */
  constructor(task/*:Task<x, a>*/, handle/*:Handle<x, y, a>*/) {
    super()
    this.task = task
    this.handle = handle
  }
}
Capture.prototype.type = "Capture"

class Format /*::<x, y, a>*/ extends TaskDSL/*::<y, a>*/ {
  /*::
  task: Task<x, a>;
  f: To<x, y>;
  */
  constructor(task/*:Task<x, a>*/, f/*:To<x, y>*/) {
    super()
    this.task = task
    this.f = f
  }
  handle(error/*:x*/)/*:Task<y, a>*/ {
    return new Fail(this.format(error))
  }
}
Format.prototype.type = "Capture"


class Chain /*::<x, a, b>*/ extends TaskDSL/*::<x, b>*/ {
  /*::
  task: Task<x, a>;
  then: Then<x, a, b>;
  */
  constructor(task/*:Task<x, a>*/, then/*:Then<x, a, b>*/) {
    super()
    this.task = task
    this.then = then
  }
}
Chain.prototype.type = "Chain"

class Map /*::<x, a, b>*/ extends TaskDSL/*::<x, b>*/ {
  /*::
  task: Task<x, a>;
  f: To<a, b>;
  */
  constructor(task/*:Task<x, a>*/, f/*:To<a, b>*/) {
    super()
    this.task = task
    this.f = f
  }
  then(value/*:a*/)/*:Task<x, b>*/ {
    return new Succeed(this.f(value))
  }
}
Map.prototype.type = "Chain"

export const succeed = /*::<x, a>*/
  (value/*:a*/)/*:Task<x, a>*/ =>
  new Succeed(value)

export const fail = /*::<x, a>*/
  (error/*:x*/)/*:Task<x,a>*/ =>
  new Fail(error)

export const act = /*::<x, a>*/
  (run/*:Suspend<x, a>*/)/*:Task<x,a>*/ =>
  new Async(run)

export const task = /*::<x, a>*/
  (fork/*:(fail:(error:x) => void, succeed:(value:a) => void) => void*/)/*:Task<x,a>*/ =>
  new Async
    ( resume =>
      fork
      ( error => resume(new Fail(error))
      , value => resume(new Succeed(value))
      )
    )

export const future = /*::<x, a>*/
  (promise/*:() => Promise<a, x>*/)/*:Task<x, a>*/ =>
  new Future(promise)

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
  , a/*:Task<x, a>*/
  , b/*:Task<x, b>*/
  )/*:Task<x, c>*/ =>
  new Chain(a, a => new Chain(b, b => new Succeed(combine(a, b))))



class Done /*::<error, value>*/ {
  /*::
  task: Task<error, value>;
  */
  constructor(task/*:Task<error, value>*/) {
    this.task = task
  }
}

class Running /*::<error, value>*/ {
  /*::
  task: Task<error, value>;
  */
  constructor(task/*:Task<error, value>*/) {
    this.task = task
  }
}

class Blocked /*::<error, value>*/ {
  /*::
  task: Task<error, value>;
  */
  constructor(task/*:Task<error, value>*/) {
    this.task = task
  }
}

/*::
type Routine <error, value>
  = Done <error, value>
  | Running <error, value>
  | Task <error, value>
*/


const resume = /*::<error, value>*/
  (root/*:Routine<error, value>*/, end/*:End<error, value>*/) => {
    var routine = new Running(root.task)
    while (routine instanceof Running) {
      routine = step(routine, routine.task, end)
    }

    root.task = routine.task

    if (routine instanceof Done) {
      end(routine.task)
    } else if (routine instanceof Blocked) {
      return void(0)
    } else {
      throw TypeError("Routine end up in an invalid state")
    }
  }

const step = /*::<x, a>*/
  (root/*:Routine<x, a>*/, task/*:Task<*, *>*/, end/*:End<x,a>*/) => {
    if (task.type === "Succeed" || task.type === "Fail") {
      return new Done(task)
    }
    else if (task.type === "Await") {
      if (task.value == null) {
        throw TypeError("Task was resumed even though task still awaits result");
      } else {
        return new Running(task.value)
      }
    }
    else if (task.type === "Async") {
      let next = null

      task.await(task => {
        if (next != null && next.type === "Await") {
          next.value = task
          resume(root, end)
        }
        else {
          next = task
        }
      })

      if (next == null) {
        next = new Await()
      }

      const routine =
        ( next.type === "Await"
        ? new Blocked(next)
        : new Running(next)
        )

      return routine
    }
    else if (task.type === "Chain" || task.type === "Capture") {
      let routine = new Running(task.task)

      while (routine instanceof Running) {
        routine = step(root, routine.task, end)
      }

      if (routine instanceof Done) {
        let active = routine.task
        let type = active.type

        const next =
          ( (active.type === "Succeed" && task.type === "Chain")
          ? new Running(task.then(active.value))
          : (active.type === "Fail" && task.type === "Capture")
          ? new Running(task.handle(active.error))
          : new Running(active)
          )

        return next
      }

      else if  (routine instanceof Blocked) {
        const next =
          ( task.type === "Chain"
          ? new Blocked(new Chain(routine.task, task.then))
          : task.type === "Capture"
          ? new Blocked(new Capture(routine.task, task.handle))
          : routine
          )

        return next
      }

      else {
        throw TypeError('Invalid routine state')
      }
    }
    else {
      throw TypeError(`Unsupported task is passed ${task}`)
    }
  }

const noop = _ => void(0)

const raise = error => { throw error }

export const perform = /*::<error, value>*/
  (task/*:Task<error, value>*/) =>
  resume(new Running(task), noop)

export const fork = /*::<error, value>*/
  ( task/*:Task<error, value>*/
  , fail/*:(error:error) => void*/
  , succeed/*:(value:value) => void*/
  ) => {
    resume
    ( new Running(task)
    , result =>
      ( result.type == "Succeed"
      ? succeed(result.value)
      : result.type === "Fail"
      ? fail(result.error)
      : raise(TypeError(`Invalid completion value ${result}`))
      )
    )
  }
