/* Copyright (C) 2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export type Callback<T> = (endOrErr: boolean | any, data?: T) => void;

export type Readable<T> = (endOrErr: boolean | any, cb: Callback<T>) => void;
