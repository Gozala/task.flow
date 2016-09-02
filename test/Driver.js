/* @flow */

type State <error, value> =
  | {status: 'pending'}
  | {status: 'cancelled'}
  | {status: 'succeeded', value:value}
  | {status: 'failed', error:error}

export class Driver <error, value> {
  state: State<error, value>
  onSucceed: ?(message:value) => void
  onFail: ?(reason:error) => void
  execute: (succeed:(message:value) => void, fail:(reason:error) => void) => Driver<error, value>
  abort: (driver:Driver<error, value>) => void
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
    this.setState({status: 'succeeded', value: message})
  }
  fail (reason:error) {
    this.setState({status: 'failed', error: reason})
  }
  abort (driver:Driver<error, value>) {
    driver.setState({status: 'cancelled'})
  }
  execute (succeed:(message:value) => void, fail:(reason:error) => void) {
    this.onSucceed = succeed
    this.onFail = fail
    this.updateState()
    return this
  }
}

export default Driver
