/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import sampleCombine from 'xstream/extra/sampleCombine';
import {FeedId} from 'ssb-typescript';
import {Command} from 'cycle-native-navigation';
import {Screens} from '../../..';
import {navOptions as profileScreenNavOptions} from '../../profile';
import {navOptions as pasteInviteScreenNavOptions} from '../../invite-paste';
import {navOptions as createInviteScreenNavOptions} from '../../invite-create';
import {State} from './model';

export type Actions = {
  goToPeerProfile$: Stream<FeedId>;
  goToPasteInvite$: Stream<any>;
  goToCreateInvite$: Stream<any>;
};

export default function navigation(
  actions: Actions,
  state$: Stream<State>,
): Stream<Command> {
  const toProfile$ = actions.goToPeerProfile$
    .compose(sampleCombine(state$))
    .map(
      ([feedId, state]) =>
        ({
          type: 'push',
          layout: {
            component: {
              name: Screens.Profile,
              passProps: {
                selfFeedId: state.selfFeedId,
                feedId,
              },
              options: profileScreenNavOptions,
            },
          },
        } as Command),
    );

  const toPasteInvite$ = actions.goToPasteInvite$.map(
    () =>
      ({
        type: 'push',
        layout: {
          component: {
            name: Screens.InvitePaste,
            options: pasteInviteScreenNavOptions,
          },
        },
      } as Command),
  );

  const toCreateInvite$ = actions.goToCreateInvite$.map(
    () =>
      ({
        type: 'push',
        layout: {
          component: {
            name: Screens.InviteCreate,
            options: createInviteScreenNavOptions,
          },
        },
      } as Command),
  );

  return xs.merge(toProfile$, toPasteInvite$, toCreateInvite$);
}
