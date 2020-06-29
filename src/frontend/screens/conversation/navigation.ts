/* Copyright (C) 2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import sample from 'xstream-sample';
import sampleCombine from 'xstream/extra/sampleCombine';
import {FeedId} from 'ssb-typescript';
import {Command} from 'cycle-native-navigation';
import {t} from '../../drivers/localization';
import {navOptions as profileScreenNavOpts} from '../profile';
import {Props as ProfileProps} from '../profile/props';
import {navOptions as accountsScreenNavOpts} from '../accounts/layout';
import {Props as AccountsProps} from '../accounts';
import {Screens} from '../enums';
import {State} from './model';

type Actions = {
  goBack$: Stream<any>;
  goToProfile$: Stream<FeedId>;
  goToRecipients$: Stream<any>;
};

export default function navigation(actions: Actions, state$: Stream<State>) {
  const pop$ = actions.goBack$.mapTo({
    type: 'popToRoot',
  } as Command);

  const toProfile$ = actions.goToProfile$.compose(sampleCombine(state$)).map(
    ([id, state]) =>
      ({
        type: 'push',
        layout: {
          component: {
            name: Screens.Profile,
            passProps: {
              selfFeedId: state.selfFeedId,
              selfAvatarUrl: state.selfAvatarUrl,
              feedId: id,
            } as ProfileProps,
            options: profileScreenNavOpts,
          },
        },
      } as Command),
  );

  const toAccounts$ = actions.goToRecipients$.compose(sample(state$)).map(
    state =>
      ({
        type: 'push',
        layout: {
          component: {
            name: Screens.Accounts,
            passProps: {
              title: t('accounts.recipients.title'),
              msgKey: state.rootMsgId,
              accounts: state.thread.recps.map(r => r.id),
              selfFeedId: state.selfFeedId,
              selfAvatarUrl: state.selfAvatarUrl,
            } as AccountsProps,
            options: accountsScreenNavOpts,
          },
        },
      } as Command),
  );

  return xs.merge(pop$, toProfile$, toAccounts$);
}
