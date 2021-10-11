// SPDX-FileCopyrightText: 2018-2019 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import Snoopy from 'rn-snoopy';
import bars from 'rn-snoopy/stream/bars';
import filter from 'rn-snoopy/stream/filter';
import buffer from 'rn-snoopy/stream/buffer';
import EventEmitter from 'react-native/Libraries/vendor/emitter/EventEmitter';
const emitter = new EventEmitter();
const events = Snoopy.stream(emitter);
filter({}, true)(events).subscribe();
