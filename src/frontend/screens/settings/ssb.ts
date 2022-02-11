// SPDX-FileCopyrightText: 2020-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import {Req} from '~frontend/drivers/ssb';

interface Actions {
  toggleFollowEvents$: Stream<boolean>;
  updateHops$: Stream<number>;
  updateBlobsStorage$: Stream<number>;
  toggleDetailedLogs$: Stream<boolean>;
}

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
