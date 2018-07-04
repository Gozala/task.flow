// @flow

import type { Thread, ThreadID } from "../Thread"
import type { Task } from "../Task"
import type { Future } from "../Future"
import type { Lifecycle } from "pool.flow"
import type { Poll } from "../Poll"
import Executor from "../Thread/Executor"
import Kernel from "../Task"
import Pool from "pool.flow"
import type { Channel, Reader, Writer } from "../Channel"
import { open } from "../Channel"

export type ID = Lifecycle

export interface SpawnError {
  message: string;
}
export interface Process<inn, out> {
  reader: Reader<inn>;
  writer: Writer<out>;
  id: ID;
}

export interface CurrentProcess<inn, out> extends Process<inn, out> {
  exit<x>(): Task<x, void>;
}

interface SpawnProcess<inn, out> extends Process<inn, out> {
  kill<x>(): Task<x, void>;
}

type Work<inn, out> = (CurrentProcess<out, inn>) => Task<empty, void>

export const spawn = <inn, out, x>(
  work: Work<inn, out>
): Task<x | SpawnError, SpawnProcess<inn, out>> =>
  Kernel.map2(
    (inbox, outbox) => {
      const newThread = Executor.new()
      const process = Current.new(newThread, outbox.reader, inbox.writer)
      const spawn = Spawn.new(
        process.id,
        newThread,
        inbox.reader,
        outbox.writer
      )
      newThread.perform(work(process))
      return spawn
    },
    open(),
    open()
  )

export const loop = <model, inn, out, x>(
  reducer: (out, model) => model,
  init: model
): Task<x | SpawnError, SpawnProcess<inn, out>> =>
  spawn(process => {
    const receive = state =>
      process.reader
        .read()
        .map(message => reducer(message, state))
        .chain(receive)
        .capture(error => process.exit())

    return receive(init)
  })

interface Program<model, inn> {
  init(): model;
  update(inn, model): model;
  fx(model): Task<empty, inn>;
}

export const program = <model, inn, out, x>(
  config: Program<model, inn>
): Task<x | SpawnError, SpawnProcess<out, inn>> =>
  spawn(process => {
    let state: model = config.init()
    const onMessage = message => {
      state = config.update(message, state)
      return wait()
    }

    let receive = (): Task<empty, void> =>
      process.reader
        .read()
        .chain(onMessage)
        .capture(error => process.exit())

    let fx = (): Task<empty, void> => config.fx(state).chain(onMessage)

    let wait = (): Task<empty, void> =>
      fx()
        .couple(receive())
        .map(_ => void _)

    return wait()
  })

class Exit<x> extends Kernel<x, void> {
  process: { executor: Executor, delete(): void }
  constructor(process: { executor: Executor, delete(): void }) {
    super()
    this.process = process
  }
  spawn(): Future<x, void> {
    this.process.executor.kill()
    this.process.delete()
    return Kernel.succeed()
  }
}

class Current<inn, out> implements CurrentProcess<inn, out> {
  static pool: Pool<Current<inn, out>> = new Pool()
  executor: Executor
  id: ID
  reader: Reader<inn>
  writer: Writer<out>
  static new<inn, out>(
    executor: Executor,
    reader: Reader<inn>,
    writer: Writer<out>
  ): CurrentProcess<inn, out> {
    const self = Current.pool.new(Current)
    self.executor = executor
    self.reader = reader
    self.writer = writer
    return self
  }
  recycle(id: Lifecycle) {
    this.id = id
  }
  delete() {
    delete this.executor
    delete this.id
    Current.pool.delete(this)
  }
  exit<x>(): Task<x, void> {
    return new Exit(this)
  }
}

export default class Spawn<inn, out> implements SpawnProcess<inn, out> {
  executor: Executor
  id: ID
  reader: Reader<inn>
  writer: Writer<out>
  static spawn = spawn
  static loop = loop
  static new<inn, out>(
    id: ID,
    executor: Executor,
    reader: Reader<inn>,
    writer: Writer<out>
  ): SpawnProcess<inn, out> {
    const self = new Spawn()
    self.id = id
    self.executor = executor
    self.reader = reader
    self.writer = writer
    return self
  }
  kill<x>(): Task<x, void> {
    return new Exit(this)
  }
  delete() {}
}
