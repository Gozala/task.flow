# value-result [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url]

Library allows describing asynchronous operations that may fail, like HTTP requests or writing to a database. Tasks also provide abstraction similar to light-weight threads, so you can have a bunch of tasks running at the same time and the runtime will hop between them if they are blocked.

Library allows one to model side-effects explicitly, in form of plain data structures. Task themselves just describe operations, performing them is a whole another story, typically on would use scheduler to do that which provides a handy separation. Think of tasks as a items on the todo list - they just describe things to do, who will do those tasks and when is a separate concern, concern of scheduler.


## API

### Basics

In nutshell `Task <error, value>` type represents asynchronous effect that may fail with a specific `error` type or succeed with a specific `value` type.  

For example, maybe we have a task with the type `Task<string, User>`. This means that when we perform this task, it will either fail with a `string` message or succeed with a value of `User` (instance). So this could represent a task that is asking a server for a certain user.

Note: Thinking about task types is useful as that gives very specific insight what the result of performing that task will look like. Library is also makes use of [flow][] type checker and provides all the necessary annotations so that you could catch all the possible errors associated with invalid uses of the task results early on.

#### `succeed(a)`

A task that succeeds immediately when run with a value provided:

```js
Task.succeed(42)
    .fork(value => console.log(value), error => console.error(error))

// => 42
```

#### `fail`

A task that fails immediately when run with a value provided:


```js
Task.fail("file not found")
```


### Mapping


#### `map`

```js

```


#### `map2`

```js
```

### chaining

#### `chain`

Chain together a `task` and a callback. The first task will run, and if it is successful, you give the result to the callback resulting in another task. This task then gets run.


```js
Task
  .succeed(2)
  .chain(n => succeed(n + 2)) // Succeed(4)
  .fork(console.error, console.log)

// 4
```

#### `sequence`

Start with a list of tasks, and turn them into a single task that returns a list. The tasks will be run in order one-by-one and if any task fails the whole sequence fails.

```js
```

### Errors

#### `capture`

Recover from a failure in a task. If the given task fails, we use the callback to recover.

#### `format`

Transform the error value. This can be useful if you need a bunch of error types to match up.

### Threads

#### `spawn`


#### `sleep`

### Types

#### `Task<error, value>`
#### `ThreadID`
#### `Time`





## Install

    npm install value-task

## Prior art

- [Task][elm-task] in [Elm][].

[flow]:http://flowtype.org
[Elm]:http://elm-lang.org
[Rust]:http://rust-lang.org
[result-rust]:https://doc.rust-lang.org/std/result/index.html
[elm-task]:http://package.elm-lang.org/packages/elm-lang/core/3.0.0/Task

[npm-url]: https://npmjs.org/package/value-result
[npm-image]: https://img.shields.io/npm/v/value-result.svg?style=flat

[travis-url]: https://travis-ci.org/Gozala/value-result
[travis-image]: https://img.shields.io/travis/Gozala/value-result.svg?style=flat
