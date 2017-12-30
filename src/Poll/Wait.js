// @flow

export interface Wait {
  isReady: false;
}

export const wait: Wait = Object.freeze({ isReady: false })
export default wait
