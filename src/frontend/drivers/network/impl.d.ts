// SPDX-FileCopyrightText: 2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import android from './ssb-backend.android';
import ios from './ssb-backend.ios';
import web from './ssb-backend.web';
declare var _test: typeof android;
declare var _test: typeof ios;
declare var _test: typeof web;
export default android;
