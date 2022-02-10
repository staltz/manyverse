// SPDX-FileCopyrightText: 2020-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import sample from 'xstream-sample';
import {Command} from 'cycle-native-navigation';
import {Screens} from '~frontend/screens/enums';
import {navOptions as conversationNavOpts} from '~frontend/screens/conversation';
import {Props as ConversationProps} from '~frontend/screens/conversation/props';
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
      (state) =>
        ({
          type: 'push',
          layout: {
            component: {
              name: Screens.Conversation,
              passProps: {
                selfFeedId: state.selfFeedId,
                selfAvatarUrl: state.selfAvatarUrl,
                recps: state.recipients,
              } as ConversationProps,
              options: conversationNavOpts,
            },
          },
        } as Command),
    );

  return xs.merge(back$, toNewConversation$);
}
