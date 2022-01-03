// SPDX-FileCopyrightText: 2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {makeMigratingDriver as nativeMake} from './impl.native';
import {makeMigratingDriver as nativeWeb} from './impl.web';
declare var _test: typeof nativeMake;
declare var _test: typeof nativeWeb;
export const makeMigratingDriver = nativeMake;
