// @flow

export type Fail<x> = {
  isOk: false,
  error: x
}

class FailObject<x> {
  isOk: false = false
  error: x
  constructor(error: x) {
    this.error = error
  }
}

export const fail = <x>(error: x): Fail<x> => new FailObject(error)

export default fail
