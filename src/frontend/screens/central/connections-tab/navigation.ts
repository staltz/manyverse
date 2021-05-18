/* Copyright (C) 2018-2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import sample from 'xstream-sample';
import sampleCombine from 'xstream/extra/sampleCombine';
import {FeedId} from 'ssb-typescript';
import {Command} from 'cycle-native-navigation';
import {Screens} from '../../enums';
import {navOptions as profileScreenNavOptions} from '../../profile';
import {Props as ProfileProps} from '../../profile/props';
import {navOptions as pasteInviteScreenNavOptions} from '../../invite-paste';
import {navOptions as createInviteScreenNavOptions} from '../../invite-create';
import {navOptions as manageAliasScreenNavOpts} from '../../alias-manage/layout';
import {Props as ManageAliasesProps} from '../../alias-manage/props';
import {State} from './model';

export type Actions = {
  goToPeerProfile$: Stream<FeedId>;
  goToPasteInvite$: Stream<any>;
  goToCreateInvite$: Stream<any>;
  goToManageAliases$: Stream<any>;
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
                selfAvatarUrl: state.selfAvatarUrl,
                feedId,
              } as ProfileProps,
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

  const toManageAliases$ = actions.goToManageAliases$
    .compose(sample(state$))
    .map(
      (state) =>
        ({
          type: 'push',
          layout: {
            component: {
              name: Screens.AliasManage,
              options: manageAliasScreenNavOpts,
              passProps: {
                feedId: state.selfFeedId,
              } as ManageAliasesProps,
            },
          },
        } as Command),
    );

  return xs.merge(
    toProfile$,
    toPasteInvite$,
    toCreateInvite$,
    toManageAliases$,
  );
}
