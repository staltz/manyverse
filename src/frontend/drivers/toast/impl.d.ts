// SPDX-FileCopyrightText: 2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import android from './impl.android';
import ios from './impl.ios';
import web from './impl.web';
declare var _test: typeof android;
declare var _test: typeof ios;
declare var _test: typeof web;
export default android;
