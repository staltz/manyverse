/* Copyright (C) 2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import sample from 'xstream-sample';
import {Command} from 'cycle-native-navigation';
import {Screens} from '../enums';
import {navOptions as conversationNavOpts} from '../conversation';
import {State} from './model';

type Actions = {
  goBack$: Stream<any>;
  goToNewConversation$: Stream<any>;
};

export default function navigation(actions: Actions, state$: Stream<State>) {
  const back$ = actions.goBack$.mapTo({type: 'pop'} as Command);

  const toNewConversation$ = actions.goToNewConversation$
    .compose(sample(state$))
    .map(
      state =>
        ({
          type: 'push',
          layout: {
            component: {
              name: Screens.Conversation,
              passProps: {
                selfFeedId: state.selfFeedId,
                recps: state.recipients,
              },
              options: conversationNavOpts,
            },
          },
        } as Command),
    );

  return xs.merge(back$, toNewConversation$);
}
