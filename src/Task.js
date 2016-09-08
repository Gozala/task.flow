/* @flow */

import * as PreemptiveAnimationFrame from 'preemptive-animation-frame'
import {Task, Succeed, Fail, Chain, Map, Capture, Recover, Format} from './Task/Core'
import {Process, kill, spawn, fork, isProcess} from './Process'
import type {Time, F2, F3, F4, F5, Abort, Fork} from './Task/Core'

const Task$prototype$execute = Task.prototype.execute

class Sleep <x> extends Task <x, void> {
  time: Time
  constructor (time:Time) {
    super(Task$prototype$execute)
    this.time = time
  }
  execute (succeed:(a:void) => void, fail:(x:x) => void):number {
    return setTimeout(succeed, this.time, void (0))
  }
  cancel (id:number):void {
    clearTimeout(id)
  }
}

class AnimationFrame <x> extends Task <x, Time> {
  constructor () {
    super(Task$prototype$execute)
  }
  execute (succeed:(a:Time) => void, fail:(x:x) => void):number {
    return PreemptiveAnimationFrame.requestAnimationFrame(succeed)
  }
  cancel (id:number):void {
    PreemptiveAnimationFrame.cancelAnimationFrame(id)
  }
}

export const succeed = <x, a>
  (value:a):Task<x, a> =>
  new Succeed(value)

export const fail = <x, a>
  (error:x):Task<x, a> =>
  new Fail(error)

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

export const recover = <x, a>
  (regain:(error:x) => a, task:Task<x, a>):Task<x, a> =>
  new Recover(task, regain)

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
      ? map2(Array, tasks[0], tasks[1])
      : tasks.length === 3
      ? map3(Array, tasks[0], tasks[1], tasks[2])
      : tasks.length === 4
      ? map4(Array, tasks[0], tasks[1], tasks[2], tasks[3])
      : tasks.length === 5
      ? map5(Array, tasks[0], tasks[1], tasks[2], tasks[3], tasks[4])
      : tasks.reduce((result, task) => Task.map2(push, result, task),
                      Task.succeed([]))
    return task
  }

const push = <value, _>
  (items:Array<value>, item:value):Array<value> => {
    items.push(item)
    return items
  }

export const task = <x, a, handle>
  (fork:Fork<x, a, handle>, abort:?Abort<handle>):Task<x, a> =>
  new Task(fork, abort)

export const isTask =
  (value:*):boolean =>
  value instanceof Task

Task.succeed = succeed
Task.fail = fail
Task.spawn = spawn
Task.sleep = sleep
Task.requestAnimationFrame = requestAnimationFrame
Task.chain = chain
Task.map = map
Task.capture = capture
Task.format = format
Task.recover = recover
Task.map2 = map2
Task.map3 = map3
Task.map4 = map4
Task.map5 = map5
Task.sequence = sequence
Task.fork = fork
Task.task = task
Task.isTask = isTask
Task.kill = kill
Task.isProcess = isProcess

export type {Process, Time, Abort, Fork}
export {Task, kill, spawn, fork, isProcess}
export default Task
