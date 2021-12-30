// SPDX-FileCopyrightText: 2020-2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

export type Callback<T> = (endOrErr?: boolean | any, data?: T) => void;

export type Readable<T> = (endOrErr: boolean | any, cb: Callback<T>) => void;
