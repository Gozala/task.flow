// @flow

export opaque type Lifecycle = number

export type Instance = {
  recycle(Lifecycle): mixed
}

export default class Pool<a: Instance> {
  lifecycle: Lifecycle = 1
  pool: a[] = []
  new(constructor: Class<a>): a {
    const instance =
      this.pool.length > 0 ? this.pool.shift() : new constructor()
    instance.recycle(this.lifecycle++)
    return instance
  }
  delete(instance: a): void {
    this.pool.push(instance)
  }
}
