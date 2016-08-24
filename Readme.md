# outtask
[![travis][travis-image]][travis-url]
[![npm][npm-image]][npm-url]
[![downloads][downloads-image]][downloads-url]
[![js-standard-style][standard-image]][standard-url]

Library allows describing asynchronous operations that may fail, like HTTP requests or writing to a database and provides tools to manage them. Library also provides a light weight process / thread abstraction so you can get bunch of different tasks running concurrently.

Primary goal of this library is to provide an alternative to programming with side-effects in JS, by programming with managed effects. Task abstraction just describes operation, performing it is a job of scheduler, which provides a handy separation. Think of tasks as an items on the todo list - they just describe things to do, who will do those tasks and when is a separate concern, concern of scheduler.


## API

### Task

In nutshell `Task <error, value>` type represents a task that may fail with a specific `error` or succeed with a specific `value`.  

For example, maybe we have a task with the type `Task<string, User>`. This implies that when task is performed, it may either fail with a `string` message describing error or succeed with a value of `User` (instance). For example this task could be asking a server for a certain user.

Note: Thinking about task types is useful as that gives very specific insight what the result of performing that task will look like. Library is written in [flow][] to take advantage of type checker and to let you catch all the possible errors associated with invalid uses of it early on.

#### `succeed(a)`

A task that succeeds immediately when run with a value provided:

```js
Task
  .succeed(42)
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
Task
  .succeed(4)
  .map(x => x * 2)
  .fork(console.log, console.error)
// => Log: 8
```


#### `map2`

```js
Task.map2((a, b) => a + b, Task.succeed(2), Task.succeed(3))
  .fork(console.log, console.error)
// => Log: 5
```


#### `map3`

```js
Task.map3((a, b, c) => a + b + c,
          Task.succeed(2),
          Task.succeed(3),
          Task.succeed(4))
  .fork(console.log, console.error)
// => Log: 9
```

#### `map4`

```js
Task.map4((a, b, c, d) => a * b - c + d],
          Task.succeed(2),
          Task.succeed(3),
          Task.succeed(4),
          Task.succeed(5))
  .fork(console.log, console.error)
// => Log: 7
```

#### `map5`

```js
Task.map5((a, b, c, d, e) => a * b + c + d / e],
          Task.succeed(2),
          Task.succeed(3),
          Task.succeed(4),
          Task.succeed(5),
          Task.succeed(2))
  .fork(console.log, console.error)
// => Log: 12.5
```


### chaining

#### `chain`

Chain together a `task` and a callback. The first task will run, and if it is successful, you give the another task from the callback which will be performed next.


```js
Task
  .succeed(2)
  .chain(n => Task.succeed(n + 2)) // Succeed(4)
  .fork(console.log, console.error)

// => Log: 4

Task
  .fail('Boom')
  .chain(n => Task.succeed(n + 2)) // Succeed(4)
  .fork(console.log, console.error)

// => Error: 'Boom'
```

#### `sequence`

Start with a list of tasks, and turn them into a single task that returns an array. The tasks will be run in order one-by-one and if any task fails the whole sequence fails.

```js
Task
  .sequence(fetch(url1), fetch(url2))
  .fork(console.log, console.error)


// => Log: [contentURL1, contentURL2]
```

### Errors

#### `capture`

Recover from a failure in a task. If the given task fails, we use the callback to turn error into another fallback task.

```js
Task
  .fail('Boom')
  .capture(error => Task.succeed(5))
  .fork(console.log, console.error)
// => Log: 5

Task
  .fail('Boom')
  .capture(error => Task.fail('Oops'))
  .fork(console.log, console.error)
// => Error: Oops

```

#### `format`

Transform the error value. This can be useful if you need a bunch of error types to match up.

```js
Task
  .fail('Boom')
  .format(Error)
  .fork(console.log, console.error)

// => Error: Error('Boom')

Task
  .fail({ code: 15 })
  .format(JSON.stringify)
  .format(Error)
  .fork(console.log, console.error)

// => Error: Error('{code:15}')
```

#### `recover`

Transform the error value into success value. Useful if you need never failing tasks:

```js
Task
  .fail('Boom')
  .map(value => { ok: value })
  .recover(error => { error: error })
  .fork(console.log, console.error)

// => Log: { error: 'Boom' }

Task
  .succeed('Data')
  .map(value => { ok: value })
  .recover(error => { error: error })
  .fork(console.log, console.error)

// => Log: { ok: 'Data' }
```

### Bulit-in tasks

#### `sleep`

Task that wait for given number of milliseconds and then succeeds with void:

```js
Task
  .sleep(50)
  .chain(_ => Task.succeed(5))
  .fork(console.log, console.error)

// => Log: 5 // prints in 50ms
```

#### `requestAnimationFrame`

Task succeeds with [DOMHighResTimeStamp](https://developer.mozilla.org/en-US/docs/Web/API/DOMHighResTimeStamp) on next animation (It's just a [requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame) wrapped in task API):


```js
Task
  .requestAnimationFrame()
  .fork(console.log, console.error)

// => Log: 124256.00000000001
```

### Custom tasks

You can wrap arbitrary code into a task. API is intentionally similar to Promise API:

```js
const store =
  (key:string, value:string):Task<Error, void> =>
  new Task((succeed, fail) => {
    try {
      window.localStorage[key] = value
      succeed()
    } catch (error) {
      fail(error)
    }
  })
```


### Custom cancellable tasks

You can write cancellable task, API is pretty similar to custom tasks only difference is you need to provide a second `abort` function which will be passed whatever you return from first function in case task is aborted (or process is killed):

```js
const fetch =
  (url:string):Task<Error, String> =>
  new Task((succeed, fail):XMLHttpRequest => {
    const request = new XMLHttpRequest()
    request.open('GET', url, true)
    request.responseType = 'text'
    request.onerror = event => {
      fail(Error(`Network request to ${url} has failed: ${request.statusText}`))
    }
    request.ontimeout = event => {
      fail(Error(`Network request to ${url} timed out`))
    }
    request.onload = event => {
      succeed(request.responseText)
    }

    request.send()
    return request
  }, (request:XMLHttpRequest):void => {
    request.abort()
  })
```


## Install

    npm install outtask

## Prior art

- [Task][elm-task] in [Elm][].

[flow]:http://flowtype.org
[Elm]:http://elm-lang.org
[Rust]:http://rust-lang.org
[elm-task]:http://package.elm-lang.org/packages/elm-lang/core/3.0.0/Task

[travis-image]: https://travis-ci.org/Gozala/outtask.svg?branch=master
[travis-url]: https://travis-ci.org/Gozala/outtask
[npm-image]: https://img.shields.io/npm/v/outtask.svg
[npm-url]: https://npmjs.org/package/outtask
[downloads-image]: https://img.shields.io/npm/dm/outtask.svg
[downloads-url]: https://npmjs.org/package/outtask
[standard-image]:https://img.shields.io/badge/code%20style-standard-brightgreen.svg
[standard-url]:http://standardjs.com/
