/* Copyright (C) 2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import {Req} from '../../drivers/ssb';

type Actions = {
  toggleFollowEvents$: Stream<boolean>;
  updateHops$: Stream<number>;
  updateBlobsStorage$: Stream<number>;
  toggleDetailedLogs$: Stream<boolean>;
};

export default function ssb(actions: Actions) {
  const req$ = xs.merge(
    actions.toggleFollowEvents$.map(
      (showFollows) => ({type: 'settings.showFollows', showFollows} as Req),
    ),

    actions.updateHops$.map((hops) => ({type: 'settings.hops', hops} as Req)),

    actions.updateBlobsStorage$.map(
      (storageLimit) => ({type: 'settings.blobsPurge', storageLimit} as Req),
    ),

    actions.toggleDetailedLogs$.map(
      (detailedLogs) => ({type: 'settings.detailedLogs', detailedLogs} as Req),
    ),
  );

  return req$;
}
