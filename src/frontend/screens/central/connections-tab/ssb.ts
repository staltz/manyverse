/* Copyright (C) 2018 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Stream} from 'xstream';
import {Req} from '../../../drivers/ssb';

export type Actions = {
  removeDhtInvite$: Stream<string>;
};

export default function ssb(actions: Actions) {
  return actions.removeDhtInvite$.map(
    invite => ({type: 'dhtInvite.remove', invite} as Req),
  );
}
