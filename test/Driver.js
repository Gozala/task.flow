/* @flow */

type State <error, value> =
  | {status: 'pending'}
  | {status: 'cancelled'}
  | {status: 'succeeded', value:value}
  | {status: 'failed', error:error}

const state = {
  pending: new Map(),
  id: 0
}

export class Driver <error, value> {
  id:number
  state: State<error, value>
  onSucceed: ?(message:value) => void
  onFail: ?(reason:error) => void
  execute: (succeed:(message:value) => void, fail:(reason:error) => void) => number
  abort: (id:number) => void
  constructor () {
    this.state = {status: 'pending'}
    this.execute = this.execute.bind(this)
    this.abort = this.abort.bind(this)
  }
  setState (state:State<error, value>) {
    if (this.state.status === 'pending') {
      this.state = state
      this.updateState()
    }
  }
  updateState () {
    const {state} = this
    if (state.status === 'succeeded' && this.onSucceed) {
      this.onSucceed(state.value)
    }
    if (state.status === 'failed' && this.onFail) {
      this.onFail(state.error)
    }
  }
  succeed (message:value) {
    state.pending.delete(this.id)
    this.setState({status: 'succeeded', value: message})
  }
  fail (reason:error) {
    state.pending.delete(this.id)
    this.setState({status: 'failed', error: reason})
  }
  abort (id:number):void {
    const driver = state.pending.get(id)
    if (driver != null) {
      state.pending.delete(this.id)
      driver.setState({status: 'cancelled'})
    }
  }
  execute (succeed:(message:value) => void, fail:(reason:error) => void):number {
    this.onSucceed = succeed
    this.onFail = fail
    this.updateState()
    this.id = ++state.id
    state.pending.set(this.id, this)
    return this.id
  }
}

export default Driver
