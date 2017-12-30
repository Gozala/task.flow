// @flow

export interface Fail<x> {
  isReady: true;
  isOk: false;
  error: x;
}

class FailObject<x> implements Fail<x> {
  isReady: true = true
  isOk: false = false
  error: x
  constructor(error: x) {
    this.error = error
  }
}

export const fail = <x>(error: x): Fail<x> => new FailObject(error)

export default fail
