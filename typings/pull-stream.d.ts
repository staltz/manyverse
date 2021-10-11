// SPDX-FileCopyrightText: 2021 The Manyverse Authors
//
// SPDX-License-Identifier: Unlicense

declare module 'pull-stream' {
  export type Callback<T> = (endOrErr: boolean | any, data?: T) => void;
  export type Readable<T> = (endOrErr: boolean | any, cb?: Callback<T>) => void;
}
