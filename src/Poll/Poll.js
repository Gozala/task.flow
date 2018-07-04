export class Fail<x> {
  isOk: false = false
  error: x
  constructor(error: x) {
    this.error = error
  }
}

export class Succeed<a> {
  isReady: true = true
  isOk: true = true
  value: a
  constructor(value: a) {
    this.value = value
  }
}
