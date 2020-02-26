/* Copyright (C) 2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import {PrivateThreadAndExtras} from '../../ssb/types';
import {MentionSuggestion, SSBSource} from '../../drivers/ssb';
import {FeedId} from 'ssb-typescript';
import {Lens} from '@cycle/state';
import {State as TopBarState} from './top-bar';
import {Props} from '.';
import {MAX_PRIVATE_MESSAGE_RECIPIENTS} from '../../ssb/utils/constants';

export type State = {
  selfFeedId: FeedId;
  mentionQuery: string;
  mentionSuggestions: Array<MentionSuggestion>;
  recipients: PrivateThreadAndExtras['recps'];
};

type Actions = {
  updateQuery$: Stream<string>;
  updateRecipients$: Stream<PrivateThreadAndExtras['recps']>;
};

export const topBarLens: Lens<State, TopBarState> = {
  get: (parent: State): TopBarState => {
    return {
      enabled:
        0 < parent.recipients.length &&
        parent.recipients.length <= MAX_PRIVATE_MESSAGE_RECIPIENTS,
    };
  },

  // Ignore writes from the child
  set: (parent: State, child: TopBarState): State => {
    return parent;
  },
};

export default function model(
  props$: Stream<Props>,
  ssbSource: SSBSource,
  actions: Actions,
) {
  const propsReducer$ = props$.take(1).map(
    props =>
      function propsReducer(_prev?: State): State {
        return {
          selfFeedId: props.selfFeedId,
          mentionQuery: '',
          mentionSuggestions: [],
          recipients: [],
        };
      },
  );

  const updateMentionQueryReducer$ = actions.updateQuery$.map(
    mentionQuery =>
      function updateMentionSuggestionsReducer(prev: State): State {
        return {...prev, mentionQuery};
      },
  );

  const updateMentionSuggestionsReducer$ = actions.updateQuery$
    .startWith('')
    .map(query => ssbSource.getMentionSuggestions(query, []))
    .flatten()
    .map(
      mentionSuggestions =>
        function updateMentionSuggestionsReducer(prev: State): State {
          return {...prev, mentionSuggestions};
        },
    );

  const updateRecipientsReducer$ = actions.updateRecipients$.map(
    recipients =>
      function updateRecipientsReducer(prev: State): State {
        return {...prev, recipients};
      },
  );

  return xs.merge(
    propsReducer$,
    updateMentionQueryReducer$,
    updateMentionSuggestionsReducer$,
    updateRecipientsReducer$,
  );
}
