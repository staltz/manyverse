// SPDX-FileCopyrightText: 2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {linkingDriver as linkingDriverNative} from './impl.native';
import {linkingDriver as linkingDriverWeb} from './impl.web';
declare var _test: typeof linkingDriverNative;
declare var _test: typeof linkingDriverWeb;
export const linkingDriver = linkingDriverNative;
