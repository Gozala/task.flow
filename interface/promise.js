/* @flow */
type Never = Never

declare export class Promise<R, X> {
    constructor(callback: (
      resolve: (result: R | Promise<R, X>) => void,
      reject:  (error: X) => void
    ) => mixed): void;

    then<U, Y>(
      onFulfill?: (value: R) => U | Promise<U, Y>,
      onReject?: (error: X) => U | Promise<U, Y>
    ): Promise<U, Y>;

    catch<U, Y>(
      onReject?: (error: X) => U | Promise<U, Y>
    ): Promise<U, Y>;

    static resolve<T>(object?: Promise<T> | T): Promise<T, Never>;
    static reject<Y>(error?: X): Promise<Never, Y>;
    static all<T, Y, Elem: Promise<T, Y> | T>(promises: Array<Elem>): Promise<Array<T>, Y>;
    static race<T, Y, Elem: Promise<T, Y> | T>(promises: Array<Elem>): Promise<T, Y>;

    // Non-standard APIs common in some libraries

    done(
      onFulfill?: (value: R) => mixed,
      onReject?: (error: X) => mixed
    ): void;

    static cast<T, X>(object?: T): Promise<T, X>;
}
