/* Copyright (C) 2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import sampleCombine from 'xstream/extra/sampleCombine';
import sample from 'xstream-sample';
import {MsgId} from 'ssb-typescript';
import {Command} from 'cycle-native-navigation';
import {Screens} from '../../../enums';
import {navOptions as conversationNavOpts} from '../../conversation';
import {navOptions as recipientsInputNavOpts} from '../../recipients-input';
import {State} from './model';

export type Actions = {
  goToConversation$: Stream<MsgId>;
  goToRecipientsInput$: Stream<any>;
};

export default function navigation(
  actions: Actions,
  state$: Stream<State>,
): Stream<Command> {
  const toConversation$ = actions.goToConversation$
    .compose(sampleCombine(state$))
    .map(
      ([ev, state]) =>
        ({
          type: 'push',
          layout: {
            component: {
              name: Screens.Conversation,
              passProps: {
                selfFeedId: state.selfFeedId,
                rootMsgId: ev,
              },
              options: conversationNavOpts,
            },
          },
        } as Command),
    );

  const toRecipientsInput$ = actions.goToRecipientsInput$
    .compose(sample(state$))
    .map(
      state =>
        ({
          type: 'push',
          layout: {
            component: {
              name: Screens.RecipientsInput,
              passProps: {
                selfFeedId: state.selfFeedId,
              },
              options: recipientsInputNavOpts,
            },
          },
        } as Command),
    );

  return xs.merge(toConversation$, toRecipientsInput$);
}
