/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Snoopy from 'rn-snoopy';
import bars from 'rn-snoopy/stream/bars';
import filter from 'rn-snoopy/stream/filter';
import buffer from 'rn-snoopy/stream/buffer';
import EventEmitter from 'react-native/Libraries/vendor/emitter/EventEmitter';
const emitter = new EventEmitter();
const events = Snoopy.stream(emitter);
filter({}, true)(events).subscribe();
