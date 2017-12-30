// @flow

export type Succeed<a> = {
  isOk: true,
  value: a
}

class SucceedObject<a> {
  isReady: true = true
  isOk: true = true
  value: a
  constructor(value: a) {
    this.value = value
  }
}

export const succeed = <a>(value: a): Succeed<a> => new SucceedObject(value)
export const nil: Succeed<void> = succeed()
export default succeed
