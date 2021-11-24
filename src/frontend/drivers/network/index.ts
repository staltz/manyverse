// SPDX-FileCopyrightText: 2018-2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import Impl from './impl';
import ImplType from './impl.android';

export type NetworkSource = ImplType;

export function makeNetworkDriver() {
  return function networkDriver(): Impl {
    return new Impl();
  };
}
