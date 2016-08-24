/* @flow */

import Task from "../"
import test from "tape"


test("test isTask", test => {
  test.isEqual
  ( Task.isTask(null)
  , false
  )

  test.isEqual
  ( Task.isTask({})
  , false
  )

  test.isEqual
  ( Task.isTask(6)
  , false
  )

  test.isEqual
  ( Task.isTask(Task.succeed(5))
  , true
  )

  test.isEqual
  ( Task.isTask(new Task((onFail, onSucceed) => void(0)))
  , true
  )

  test.isEqual
  ( Task.isTask(Task.fail('Boom!'))
  , true
  )

  test.isEqual
  ( Task.isTask(Task.succeed(5))
  , true
  )

  test.isEqual
  ( Task.isTask(Task.succeed(4).map(String))
  , true
  )

  test.isEqual
  ( Task.isTask(Task.succeed(4).chain(_ => Task.succeed(5)))
  , true
  )

  test.isEqual
  ( Task.isTask(Task.fail(5).map(String))
  , true
  )

  test.isEqual
  ( Task.isTask(Task.fail(5).chain(_ => Task.succeed(4)))
  , true
  )

  test.isEqual
  ( Task.isTask(Task.fail(5).format(String))
  , true
  )

  test.isEqual
  ( Task.isTask(Task.fail(5).capture(_ => Task.succeed(5)))
  , true
  )

  test.end()
})

test("test succeed", test => {
  Task.succeed(5)
  .fork
  ( value => {
      test.isEqual(value, 5)
      test.end()
    }
  , error => {
      test.fail("Should not error")
      test.end()
    }
  )
})


test("test fail", test => {
  Task.fail(5)
  .fork
  ( value => {
      test.fail("Should have failed")
      test.end()
    }
  , error => {
      test.isEqual(error, 5)
      test.end()
    }
  )
})

test("test fork several times", test => {
  let succeeded = 0

  const task = Task.succeed(5)

  const onFail = error => {
    test.fail("Should have succeeded")
    test.end()
  }

  const onSucceed = value => {
    test.isEqual(value, 5)
    succeeded = succeeded + 1
    if (succeeded == 3) {
      test.end()
    }
  }

  task.fork(onSucceed, onFail)
  task.fork(onSucceed, onFail)
  task.fork(onSucceed, onFail)
})


test("test suceeded chain", test => {
  const task =
    Task.succeed(5)
    .chain(x => Task.succeed(x + 10))

  const onFail = error => {
    test.fail("Should have succeeded")
    test.end()
  }

  const onSucceed = value => {
    test.isEqual(value, 15)
    test.end()
  }

  task.fork(onSucceed, onFail)
})

test("test fail from with in chain", test => {
  const task =
    Task.succeed(5)
    .chain(x => Task.fail(x + 10))

  const onSucceed = error => {
    test.fail("Should have failed")
    test.end()
  }

  const onFail = value => {
    test.isEqual(value, 15)
    test.end()
  }

  task.fork(onSucceed, onFail)
})


test("test fail from with in chain & chain again", test => {
  const task =
    Task.succeed(5)
    .chain(x => Task.fail(x + 10))
    .chain(x => Task.succeed(x + 10))

  const onSucceed = error => {
    test.fail("Should have failed")
    test.end()
  }

  const onFail = value => {
    test.isEqual(value, 15)
    test.end()
  }

  task.fork(onSucceed, onFail)
})

test("test success chain", test => {
  const double = x => x * 2
  const task =
    Task.fail('Boom')
    .chain(x => Task.succeed(double(x)))
    .chain(x => Task.succeed(double(x)))
    .chain(x => Task.succeed(double(x)))

  const onFail = error => {
    test.isEqual(error, 'Boom')
    test.end()
  }

  const onSucceed = value => {
    test.fail("Should have failed")
    test.end()
  }

  task.fork(onSucceed, onFail)
})


test("test fail chain", test => {
  const double = x => x * 2
  const task =
    Task.succeed(2)
    .chain(x => Task.succeed(double(x)))
    .chain(x => Task.succeed(double(x)))
    .chain(x => Task.succeed(double(x)))

  const onSucceed = value => {
    test.isEqual(value, 16)
    test.end()
  }

  const onFail = error => {
    test.fail("Should have succeeded")
    test.end()
  }

  task.fork(onSucceed, onFail)
})


test("test chain failed task", test => {
  const task =
    Task.fail('Boom')
    .chain(x => Task.succeed(x + 10))

  const onSucceed = error => {
    test.fail("Should have failed")
    test.end()
  }

  const onFail = value => {
    test.isEqual(value, 'Boom')
    test.end()
  }

  task.fork(onSucceed, onFail)
})


test("test capture failed task", test => {
  const task =
    Task.fail('Boom')
    .capture(x => Task.succeed(`!${x}`))

  const onSucceed = value => {
    test.isEqual(value, '!Boom')
    test.end()
  }

  const onFail = error => {
    test.fail('Should have succeeed')
    test.end()
  }

  task.fork(onSucceed, onFail)
})


test("test task that succeeds", test => {
  let calls = 0
  let asserts = 0
  const hi = new Task((succeed, fail) => {
    calls = calls + 1
    succeed({message: "hello"})
  })

  const onSucceed = value => {
    test.isEquivalent(value, {message: "hello"})
    asserts = asserts + 1
    test.isEqual(calls, asserts)

    if (calls === 3) {
      test.end()
    }
  }

  const onFail = error => {
    test.fail('Should have succeeed')
    test.end()
  }

  hi.fork(onSucceed, onFail)
  hi.fork(onSucceed, onFail)
  hi.fork(onSucceed, onFail)
})


test("test task that fails", test => {
  let calls = 0
  let asserts = 0
  const hi = new Task((succeed, fail) => {
    calls = calls + 1
    fail({message: "Oops"})
  })

  const onFail = error => {
    test.isEquivalent(error, {message: "Oops"})
    asserts = asserts + 1
    test.isEqual(calls, asserts)

    if (calls === 3) {
      test.end()
    }
  }

  const onSucceed = error => {
    test.fail('Should have failed')
    test.end()
  }

  hi.fork(onSucceed, onFail)
  hi.fork(onSucceed, onFail)
  hi.fork(onSucceed, onFail)
})


test("test task success mapped twice", test => {
  const onSucceed = value => {
    test.isEqual(value, 15)
    test.end()
  }

  const onFail = error => {
    test.fail('Should not fail')
    test.end()
  }

  new Task((succeed, fail) => {
    succeed(4)
  })
  .map(x => x + 10)
  .map(x => x + 1)
  .fork(onSucceed, onFail)
})

test("test task failure mapped twice", test => {
  const onSucceed = value => {
    test.fail('Should not succeed')
    test.end()
  }

  const onFail = error => {
    test.isEqual(error, 'Boom!')
    test.end()
  }

  new Task((succeed, fail) => {
    fail('Boom!')
  })
  .map(x => x + 10)
  .map(x => x + 1)
  .fork(onSucceed, onFail)
})

test("test task map via function", test => {
  test.end()
})

test("test task  fail twice", test => {
  const onFail = error => {
    test.isEqual
    ( error instanceof Error
    , true
    )

    test.isEqual
    ( error.message
    , 'Boom'
    )

    test.end()
  }

  const onSucceed = value => {
    test.fail("Must have failed")
    test.end()
  }

  const t1 = new Task((succeed, fail) => {
    fail(Error("Boom"))
    fail(Error("BagaBoom"))
  })

  t1.fork(onSucceed, onFail)
})


test("test task succeed twice", test => {
  const onSucceed = value => {
    test.isEquivalent
    ( value
    , { beep: "bop", bar: "baz" }
    )


    test.end()
  }

  const onFail = error => {
    test.fail("Must have succeeded")
    test.end()
  }

  const t1 = new Task((succeed, fail) => {
    succeed({ beep: "bop", bar: "baz" })
    succeed(5)
  })

  t1.fork(onSucceed, onFail)
})


test("test task succeed then fail", test => {
  const onSucceed = value => {
    test.isEquivalent
    ( value
    , { beep: "bop", bar: "baz" }
    )


    test.end()
  }

  const onFail = error => {
    test.fail("Must have succeeded")
    test.end()
  }

  const t1 = new Task((succeed, fail) => {
    succeed({ beep: "bop", bar: "baz" })
    fail(5)
  })

  t1.fork(onSucceed, onFail)
})

test("test task fail then succeed", test => {
  const onFail = error => {
    test.isEqual
    ( error instanceof Error
    , true
    )

    test.isEqual
    ( error.message
    , 'Boom'
    )

    test.end()
  }

  const onSucceed = value => {
    test.fail("Must have failed")
    test.end()
  }

  const t1 = new Task((succeed, fail) => {
    fail(Error("Boom"))
    succeed({data: "text"})
  })

  t1.fork(onSucceed, onFail)
})


test("test map2 succeed", test => {
  const onSucceed = value => {
    test.isEqual
    ( value
    , 7
    )

    test.end()
  }

  const onFail = _ => {
    test.fail('Should have succeeded')
    test.end()
  }

  Task.map2
  ((a, b) => a + b
  , Task.succeed(3)
  , Task.succeed(4)
  )
  .fork(onSucceed, onFail)
})

test("test map2 fail 1st", test => {
  const onFail = error => {
    test.isEqual
    ( error
    , "first fail"
    )

    test.end()
  }

  const onSucceed = _ => {
    test.fail('Should have failed')
    test.end()
  }

  Task.map2
  ((a, b) => a + b
  , Task.fail("first fail")
  , Task.succeed(4)
  )
  .fork(onSucceed, onFail)
})

test("test map2 fail 2nd", test => {
  const onFail = error => {
    test.isEqual
    ( error
    , "second fail"
    )

    test.end()
  }

  const onSucceed = _ => {
    test.fail('Should have failed')
    test.end()
  }

  Task.map2
  ((a, b) => a + b
  , Task.succeed(4)
  , Task.fail("second fail")
  )
  .fork(onSucceed, onFail)
})


test("test map2 fail both", test => {
  const onFail = error => {
    test.isEqual
    ( error
    , "first fail"
    )

    test.end()
  }

  const onSucceed = _ => {
    test.fail('Should have failed')
    test.end()
  }

  Task.map2
  ((a, b) => a + b
  , Task.fail("first fail")
  , Task.fail("second fail")
  )
  .fork(onSucceed, onFail)
})

test("test succeed format", test => {
  const onFail = _ => {
    test.fail('Should have succeeded')
  }

  const onSucceed = value => {
    test.isEqual
    ( value
    , 'data'
    )

    test.end()
  }

  Task.succeed('data')
  .format(text => text.toUpperCase())
  .fork(onSucceed, onFail)
})

test("test fail format", test => {
  const onSucceed = _ => {
    test.fail('Should have failed')
  }

  const onFail = error => {
    test.isEqual
    ( error
    , 'OOPS'
    )

    test.end()
  }

  Task.fail('Oops')
  .format(text => text.toUpperCase())
  .fork(onSucceed, onFail)
})


test("test spawn", test => {
  const onMessage = message => {
    messages.push(message)
    if (messages.length == 2) {
      test.isEquivalent
      ( messages
      , ['B', 'A']
      )

      test.end()
    }
    return message
  }

  const onSucceed = processes => {
    test.isEqual
    ( processes.length
    , 2
    )

    test.isEqual
    ( Task.isProcess(processes[0])
    , true
    )

    test.isEqual
    ( Task.isProcess(processes[1])
    , true
    )

    test.isNotEqual
    ( processes[0]
    , processes[1]
    )

    test.isEqual
    ( messages.length
    , 0
    )
  }

  const onFail = _ => {
    test.fail('Not supposed to fail')
    test.end()
  }

  const messages = []

  const a =
    Task.sleep(20)
    .chain(_ => Task.succeed('A'))
    .map(onMessage)

  const b =
    Task.sleep(10)
    .chain(_ => Task.succeed('B'))
    .map(onMessage)

  const ab =
    Task.map2
    ( (a, b) => [a, b]
    , a.spawn()
    , b.spawn()
    )

  ab.fork(onSucceed, onFail)
})


test("test sequence", test => {
  const onFail = _ => {
    test.fail('Should succeeded')
    test.end()
  }

  const onSucceed = value => {
    test.isEquivalent
    ( value
    , [1, 2, 3]
    )

    test.end()
  }

  Task.sequence
  ( [ Task.succeed(1)
    , Task.succeed(2)
    , Task.succeed(3)
    ]
  ).fork(onSucceed, onFail)
})

test("test sequence fail first", test => {
  const onFail = error => {
    test.equal(error, 'first')
    test.end()
  }

  const onSucceed = _ => {
    test.fail('Should fail')
    test.end()
  }

  Task.sequence
  ( [ Task.fail("first")
    , Task.succeed(2)
    , Task.succeed(3)
    ]
  ).fork(onSucceed, onFail)
})

test("test sequence fail second", test => {
  const onFail = error => {
    test.equal(error, 'second')
    test.end()
  }

  const onSucceed = _ => {
    test.fail('Should fail')
    test.end()
  }

  Task.sequence
  ( [ Task.succeed(1)
    , Task.fail('second')
    , Task.succeed(3)
    ]
  ).fork(onSucceed, onFail)
})

test("test sequence fail third", test => {
  const onFail = error => {
    test.equal(error, 'third')
    test.end()
  }

  const onSucceed = _ => {
    test.fail('Should fail')
    test.end()
  }

  Task.sequence
  ( [ Task.succeed(1)
    , Task.fail('third')
    , Task.succeed(3)
    ]
  ).fork(onSucceed, onFail)
})


test("test sequence fail second & third", test => {
  const onFail = error => {
    test.equal(error, 'second')
    test.end()
  }

  const onSucceed = _ => {
    test.fail('Should fail')
    test.end()
  }

  Task.sequence
  ( [ Task.succeed(1)
    , Task.fail('second')
    , Task.fail('third')
    ]
  ).fork(onSucceed, onFail)
})

test("test sequence of 12", test => {
  const onFail = _ => {
    test.fail('Should succeeded')
    test.end()
  }

  const onSucceed = value => {
    test.isEquivalent
    ( value
    , [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    )

    test.end()
  }

  Task.sequence
  ( [ Task.succeed(1)
    , Task.succeed(2)
    , Task.succeed(3)
    , Task.succeed(4)
    , Task.succeed(5)
    , Task.succeed(6)
    , Task.succeed(7)
    , Task.succeed(8)
    , Task.succeed(9)
    , Task.succeed(10)
    , Task.succeed(11)
    , Task.succeed(12)
    ]
  ).fork(onSucceed, onFail)
})

test("test sequence of 12 with failed", test => {
  const onFail = error => {
    test.equal(error, 'sixth')
    test.end()
  }

  const onSucceed = _ => {
    test.fail('Should fail')
    test.end()
  }

  Task.sequence
  ( [ Task.succeed(1)
    , Task.succeed(2)
    , Task.succeed(3)
    , Task.succeed(4)
    , Task.succeed(5)
    , Task.fail('sixth')
    , Task.succeed(7)
    , Task.succeed(8)
    , Task.fail('nineth')
    , Task.succeed(10)
    , Task.succeed(11)
    , Task.succeed(12)
    ]
  ).fork(onSucceed, onFail)
})
