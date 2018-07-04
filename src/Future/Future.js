// @flow

import type { Poll } from "../Poll"

export interface Future<+x, +a> {
  poll(): Poll<x, a>;
  abort(): void;
}
