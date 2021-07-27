/* Copyright (C) 2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import android from './dialogs-impl.android';
import ios from './dialogs-impl.ios';
import web from './dialogs-impl.web';
declare var _test: typeof android;
declare var _test: typeof ios;
declare var _test: typeof web;
export default android;
