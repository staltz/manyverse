// SPDX-FileCopyrightText: 2020-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import delay from 'xstream/extra/delay';
import {Req} from '~frontend/drivers/ssb';

interface Actions {
  toggleFollowEvents$: Stream<boolean>;
  updateHops$: Stream<number>;
  toggleDetailedLogs$: Stream<boolean>;
  toggleEnableFirewall$: Stream<boolean>;
  forceReindex$: Stream<any>;
}

export default function ssb(actions: Actions) {
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

    actions.forceReindex$.mapTo({type: 'db.reset'} as Req),
    actions.forceReindex$
      .compose(delay(2000))
      .mapTo({type: 'dbUtils.warmUpJITDB'} as Req),
  );

  return req$;
}
