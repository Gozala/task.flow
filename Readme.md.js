// @flow

import Task from "task.flow"
import Executor from "./src/Thread/Executor"

// let fork = Fork.pool(
//   Task.succeed(5)
//     .map(value => {
//       value //?
//     })
//     .recover(err => {
//       err //?
//     })
// ) //?$

// fork.poll()

Executor.pool //?

Task.toPromise(Task.succeed(5)) //?
Executor.pool //?
Task.toPromise(Task.fail("Boom")).catch(Error) //?

Executor.pool //?

Task.toPromise(Task.succeed(5).chain(x => Task.succeed(x + 10))) //?

const u3 = Task.map3(
  (a, b) => [a, b],
  Task.succeed(1),
  Task.succeed(2),
  Task.succeed(3)
)

Task.toPromise(u3)
