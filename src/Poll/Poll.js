export class Fail<x> {
  isOk: false = false
  error: x
  constructor(error: x) {
    this.error = error
  }
}

export class Succeed<a> {
  isOk: true = true
  value: a
  constructor(value: a) {
    this.value = value
  }
}
