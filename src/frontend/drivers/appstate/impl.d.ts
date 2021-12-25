// SPDX-FileCopyrightText: 2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {makeAppStateDriver as nativeMake, NativeState} from './impl.native';
import {makeAppStateDriver as nativeWeb} from './impl.web';
declare var _test: typeof nativeMake;
declare var _test: typeof nativeWeb;
export const makeAppStateDriver = nativeMake;
export type State = NativeState;
