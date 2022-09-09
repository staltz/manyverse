// SPDX-FileCopyrightText: 2020-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import {Req, SSBSource} from '~frontend/drivers/ssb';

interface Actions {
  toggleFollowEvents$: Stream<boolean>;
  updateHops$: Stream<number>;
  toggleDetailedLogs$: Stream<boolean>;
  toggleEnableFirewall$: Stream<boolean>;
  forceReindex$: Stream<any>;
  deleteAccount$: Stream<any>;
}

export default function ssb(actions: Actions, ssbSource: SSBSource) {
  const req$ = xs.merge(
    actions.toggleFollowEvents$.map(
      (showFollows) => ({type: 'settings.showFollows', showFollows} as Req),
    ),

    actions.updateHops$.map((hops) => ({type: 'settings.hops', hops} as Req)),

    actions.toggleDetailedLogs$.map(
      (detailedLogs) => ({type: 'settings.detailedLogs', detailedLogs} as Req),
    ),
    actions.toggleEnableFirewall$.map(
      (enableFirewall) =>
        ({type: 'settings.enableFirewall', enableFirewall} as Req),
    ),

    actions.forceReindex$
      .mapTo(ssbSource.forceReindex$())
      .flatten()
      .mapTo(null as any as Req)
      .filter((x) => x !== null),

    actions.deleteAccount$
      .mapTo({type: 'nuke'} as Req)
      .filter((x) => x !== null),
  );

  return req$;
}
