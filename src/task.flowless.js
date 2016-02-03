/* @noflow */

/*::
import type {Task} from "./task"
*/

export const map3 = /*::<error, a, b, c, value>*/
  ( combine/*:(a:a, b:b, c:c) => value*/
  , aTask/*:Task<error, a>*/
  , bTask/*:Task<error, b>*/
  , cTask/*:Task<error, c>*/
  )/*:Task<error, value>*/ =>
  aTask.chain
  ( a =>
    bTask.chain
    ( b =>
      cTask.map
      ( c =>
        combine(a, b, c)
      )
    )
  )

export const map4 = /*::<error, a, b, c, d, value>*/
  ( combine/*:(a:a, b:b, c:c, d:d) => value*/
  , aTask/*:Task<error, a>*/
  , bTask/*:Task<error, b>*/
  , cTask/*:Task<error, c>*/
  , dTask/*:Task<error, d>*/
  )/*:Task<error, value>*/ =>
  aTask.chain
  ( a =>
    bTask.chain
    ( b =>
      cTask.chain
      ( c =>
        dTask.map
        ( d =>
          combine(a, b, c, d)
        )
      )
    )
  )

export const map5 = /*::<error, a, b, c, d, e, value>*/
  ( combine/*:(a:a, b:b, c:c, d:d, e:e) => value*/
  , aTask/*:Task<error, a>*/
  , bTask/*:Task<error, b>*/
  , cTask/*:Task<error, c>*/
  , dTask/*:Task<error, d>*/
  , eTask/*:Task<error, e>*/
  )/*:Task<error, value>*/ =>
  aTask.chain
  ( a =>
    bTask.chain
    ( b =>
      cTask.chain
      ( c =>
        dTask.chain
        ( d =>
          eTask.chain
          ( e =>
            combine(a, b, c, d, e)
          )
        )
      )
    )
  )
