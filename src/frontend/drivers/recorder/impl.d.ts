// SPDX-FileCopyrightText: 2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {makeRecorderDriver as makeNative} from './impl.native';
import {makeRecorderDriver as makeWeb} from './impl.web';
declare var _test: typeof makeNative;
declare var _test: typeof makeWeb;
export const makeRecorderDriver = makeNative;
