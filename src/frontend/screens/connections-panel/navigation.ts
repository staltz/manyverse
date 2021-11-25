// SPDX-FileCopyrightText: 2018-2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import sample from 'xstream-sample';
import sampleCombine from 'xstream/extra/sampleCombine';
import {FeedId} from 'ssb-typescript';
import {Command} from 'cycle-native-navigation';
import {Screens} from '../enums';
import {navOptions as profileScreenNavOptions} from '../profile';
import {Props as ProfileProps} from '../profile/props';
import {navOptions as pasteInviteScreenNavOptions} from '../invite-paste';
import {navOptions as manageAliasScreenNavOpts} from '../alias-manage/layout';
import {Props as ManageAliasesProps} from '../alias-manage/props';
import {State} from './model';

export interface Actions {
  goBack$: Stream<any>;
  goToPeerProfile$: Stream<FeedId>;
  goToPasteInvite$: Stream<any>;
  goToManageAliases$: Stream<any>;
}

export default function navigation(
  actions: Actions,
  state$: Stream<State>,
): Stream<Command> {
  const back$ = actions.goBack$.mapTo({type: 'pop'} as Command);

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

  return xs.merge(back$, toProfile$, toPasteInvite$, toManageAliases$);
}
