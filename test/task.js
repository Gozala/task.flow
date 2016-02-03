/* @flow */

import type {Task} from ".."
import test from "tape"
import
  { isTask
  , fork
  , perform
  , succeed
  , fail
  , task
  , map
  , format
  , chain
  , capture
  , sleep
  , spawn
  , sequence
  , map2
  , map3
  , map4
  , map5
  } from ".."


test("test isTask", test => {
  test.isEqual
  ( isTask(null)
  , false
  )

  test.isEqual
  ( isTask({})
  , false
  )

  test.isEqual
  ( isTask(6)
  , false
  )

  test.isEqual
  ( isTask(succeed(5))
  , true
  )

  test.isEqual
  ( isTask(task((onFail, onSucceed) => void(0)))
  , true
  )

  test.isEqual
  ( isTask(fail('Boom!'))
  , true
  )

  test.isEqual
  ( isTask(succeed(5))
  , true
  )

  test.isEqual
  ( isTask(succeed(4).map(String))
  , true
  )

  test.isEqual
  ( isTask(succeed(4).chain(_ => succeed(5)))
  , true
  )

  test.isEqual
  ( isTask(fail(5).map(String))
  , true
  )

  test.isEqual
  ( isTask(fail(5).chain(_ => succeed(4)))
  , true
  )

  test.isEqual
  ( isTask(fail(5).format(String))
  , true
  )

  test.isEqual
  ( isTask(fail(5).capture(_ => succeed(5)))
  , true
  )

  test.end()
})

test("test succeed", test => {
  succeed(5)
  .fork
  ( error => {
      test.fail("Should not error")
      test.end()
    }
  , value => {
      test.isEqual(value, 5)
      test.end()
    }
  )
})


test("test fail", test => {
  fail(5)
  .fork
  ( error => {
      test.isEqual(error, 5)
      test.end()
    }
  , value => {
      test.fail("Should have failed")
      test.end()
    }
  )
})

test("test fork several times", test => {
  let succeeded = 0

  const task = succeed(5)

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

  task.fork(onFail, onSucceed)
  task.fork(onFail, onSucceed)
  task.fork(onFail, onSucceed)
})


test("test suceeded chain", test => {
  const task =
    succeed(5)
    .chain(x => succeed(x + 10))

  const onFail = error => {
    test.fail("Should have succeeded")
    test.end()
  }

  const onSucceed = value => {
    test.isEqual(value, 15)
    test.end()
  }

  task.fork(onFail, onSucceed)
})

test("test fail from with in chain", test => {
  const task =
    succeed(5)
    .chain(x => fail(x + 10))

  const onSucceed = error => {
    test.fail("Should have failed")
    test.end()
  }

  const onFail = value => {
    test.isEqual(value, 15)
    test.end()
  }

  task.fork(onFail, onSucceed)
})


test("test fail from with in chain & chain again", test => {
  const task =
    succeed(5)
    .chain(x => fail(x + 10))
    .chain(x => succeed(x + 10))

  const onSucceed = error => {
    test.fail("Should have failed")
    test.end()
  }

  const onFail = value => {
    test.isEqual(value, 15)
    test.end()
  }

  task.fork(onFail, onSucceed)
})

test("test success chain", test => {
  const double = x => x * 2
  const task =
    fail('Boom')
    .chain(x => succeed(double(x)))
    .chain(x => succeed(double(x)))
    .chain(x => succeed(double(x)))

  const onFail = error => {
    test.isEqual(error, 'Boom')
    test.end()
  }

  const onSucceed = value => {
    test.fail("Should have failed")
    test.end()
  }

  task.fork(onFail, onSucceed)
})


test("test fail chain", test => {
  const double = x => x * 2
  const task =
    succeed(2)
    .chain(x => succeed(double(x)))
    .chain(x => succeed(double(x)))
    .chain(x => succeed(double(x)))

  const onSucceed = value => {
    test.isEqual(value, 16)
    test.end()
  }

  const onFail = error => {
    test.fail("Should have succeeded")
    test.end()
  }

  task.fork(onFail, onSucceed)
})


test("test chain failed task", test => {
  const task =
    fail('Boom')
    .chain(x => succeed(x + 10))

  const onSucceed = error => {
    test.fail("Should have failed")
    test.end()
  }

  const onFail = value => {
    test.isEqual(value, 'Boom')
    test.end()
  }

  task.fork(onFail, onSucceed)
})


test("test capture failed task", test => {
  const task =
    fail('Boom')
    .capture(x => succeed(`!${x}`))

  const onSucceed = value => {
    test.isEqual(value, '!Boom')
    test.end()
  }

  const onFail = error => {
    test.fail('Should have succeeed')
    test.end()
  }

  task.fork(onFail, onSucceed)
})


test("test task that succeeds", test => {
  let calls = 0
  let asserts = 0
  const hi = task((fail, succeed) => {
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

  hi.fork(onFail, onSucceed)
  hi.fork(onFail, onSucceed)
  hi.fork(onFail, onSucceed)
})


test("test task that fails", test => {
  let calls = 0
  let asserts = 0
  const hi = task((fail, succeed) => {
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

  hi.fork(onFail, onSucceed)
  hi.fork(onFail, onSucceed)
  hi.fork(onFail, onSucceed)
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

  task((fail, succeed) => {
    succeed(4)
  })
  .map(x => x + 10)
  .map(x => x + 1)
  .fork(onFail, onSucceed)
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

  task((fail, succeed) => {
    fail('Boom!')
  })
  .map(x => x + 10)
  .map(x => x + 1)
  .fork(onFail, onSucceed)
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

  const t1 = task((fail, succeed) => {
    fail(Error("Boom"))

    test.throws
    ( () => {
        fail(Error("Boom"))
      }
    , /Task may not be completed more than once/
    )
  })

  t1.fork(onFail, onSucceed)
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

  const t1 = task((fail, succeed) => {
    succeed({ beep: "bop", bar: "baz" })

    test.throws
    ( () => {
        succeed(5)
      }
    , /Task may not be completed more than once/
    )
  })

  t1.fork(onFail, onSucceed)
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

  const t1 = task((fail, succeed) => {
    succeed({ beep: "bop", bar: "baz" })

    test.throws
    ( () => {
        fail(5)
      }
    , /Task may not be completed more than once/
    )
  })

  t1.fork(onFail, onSucceed)
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

  const t1 = task((fail, succeed) => {
    fail(Error("Boom"))

    test.throws
    ( () => {
        succeed({data: "text"})
      }
    , /Task may not be completed more than once/
    )
  })

  t1.fork(onFail, onSucceed)
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

  map2
  ((a, b) => a + b
  , succeed(3)
  , succeed(4)
  )
  .fork(onFail, onSucceed)
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

  map2
  ((a, b) => a + b
  , fail("first fail")
  , succeed(4)
  )
  .fork(onFail, onSucceed)
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

  map2
  ((a, b) => a + b
  , succeed(4)
  , fail("second fail")
  )
  .fork(onFail, onSucceed)
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

  map2
  ((a, b) => a + b
  , fail("first fail")
  , fail("second fail")
  )
  .fork(onFail, onSucceed)
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

  succeed('data')
  .format(text => text.toUpperCase())
  .fork(onFail, onSucceed)
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

  fail('Oops')
  .format(text => text.toUpperCase())
  .fork(onFail, onSucceed)
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

  const onSucceed = ids => {
    test.isEqual
    ( ids.length
    , 2
    )

    test.isEqual
    ( typeof(ids[0])
    , 'number'
    )

    test.isEqual
    ( typeof(ids[1])
    , 'number'
    )

    test.isNotEqual
    ( ids[0]
    , ids[1]
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
    sleep(20)
    .chain(_ => succeed('A'))
    .map(onMessage)

  const b =
    sleep(10)
    .chain(_ => succeed('B'))
    .map(onMessage)

  const ab =
    map2
    ( (a, b) => [a, b]
    , a.spawn()
    , b.spawn()
    )

  ab.fork(onFail, onSucceed)
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

  sequence
  ( [ succeed(1)
    , succeed(2)
    , succeed(3)
    ]
  ).fork(onFail, onSucceed)
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

  sequence
  ( [ fail("first")
    , succeed(2)
    , succeed(3)
    ]
  ).fork(onFail, onSucceed)
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

  sequence
  ( [ succeed(1)
    , fail('second')
    , succeed(3)
    ]
  ).fork(onFail, onSucceed)
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

  sequence
  ( [ succeed(1)
    , fail('third')
    , succeed(3)
    ]
  ).fork(onFail, onSucceed)
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

  sequence
  ( [ succeed(1)
    , fail('second')
    , fail('third')
    ]
  ).fork(onFail, onSucceed)
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

  sequence
  ( [ succeed(1)
    , succeed(2)
    , succeed(3)
    , succeed(4)
    , succeed(5)
    , succeed(6)
    , succeed(7)
    , succeed(8)
    , succeed(9)
    , succeed(10)
    , succeed(11)
    , succeed(12)
    ]
  ).fork(onFail, onSucceed)
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
  sequence
  ( [ succeed(1)
    , succeed(2)
    , succeed(3)
    , succeed(4)
    , succeed(5)
    , fail('sixth')
    , succeed(7)
    , succeed(8)
    , fail('nineth')
    , succeed(10)
    , succeed(11)
    , succeed(12)
    ]
  ).fork(onFail, onSucceed)
})
