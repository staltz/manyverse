// SPDX-FileCopyrightText: 2020-2023 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import dropRepeats from 'xstream/extra/dropRepeats';
import {FeedId} from 'ssb-typescript';
import {PrivateThreadAndExtras} from '~frontend/ssb/types';
import {MAX_PRIVATE_MESSAGE_RECIPIENTS} from '~frontend/ssb/utils/constants';
import {MentionSuggestion, SSBSource} from '~frontend/drivers/ssb';
import {Props} from '.';

export interface State {
  selfFeedId: FeedId;
  selfAvatarUrl?: string;
  mentionQuery: string;
  mentionSuggestions: Array<MentionSuggestion>;
  recipients: PrivateThreadAndExtras['recps'];
}

interface Actions {
  updateQuery$: Stream<string>;
  addRecipient$: Stream<FeedId>;
  updateRecipients$: Stream<PrivateThreadAndExtras['recps']>;
}

export default function model(
  props$: Stream<Props>,
  ssbSource: SSBSource,
  actions: Actions,
) {
  const propsReducer$ = props$.take(1).map(
    (props) =>
      function propsReducer(_prev?: State): State {
        return {
          selfFeedId: props.selfFeedId,
          selfAvatarUrl: props.selfAvatarUrl,
          mentionQuery: '',
          mentionSuggestions: [],
          recipients: [],
        };
      },
  );

  const updateMentionQueryReducer$ = actions.updateQuery$.map(
    (mentionQuery) =>
      function updateMentionSuggestionsReducer(prev: State): State {
        return {...prev, mentionQuery};
      },
  );

  const updateMentionSuggestionsReducer$ = actions.updateQuery$
    .compose(dropRepeats())
    .map((query) => ssbSource.getMentionSuggestions(query, []))
    .flatten()
    .map(
      (mentionSuggestions) =>
        function updateMentionSuggestionsReducer(prev: State): State {
          return {...prev, mentionSuggestions};
        },
    );

  const addRecipientReducer$ = actions.addRecipient$.map(
    (id) =>
      function addRecipientReducer(prev: State): State {
        if (prev.recipients.findIndex((recp) => recp.id === id) >= 0) {
          return prev;
        }
        if (prev.recipients.length >= MAX_PRIVATE_MESSAGE_RECIPIENTS) {
          return prev;
        }
        return {
          ...prev,
          mentionSuggestions: [
            {type: 'mention', id, name: '', image: null, following: false},
          ],
          mentionQuery: id,
        };
      },
  );

  const updateRecipientsReducer$ = actions.updateRecipients$.map(
    (recipients) =>
      function updateRecipientsReducer(prev: State): State {
        if (prev.recipients.length < recipients.length) {
          // Added a new recipient, so clear the text input field
          return {
            ...prev,
            recipients,
            mentionQuery: '',
            mentionSuggestions: [],
          };
        } else {
          return {...prev, recipients};
        }
      },
  );

  return xs.merge(
    propsReducer$,
    updateMentionQueryReducer$,
    updateMentionSuggestionsReducer$,
    addRecipientReducer$,
    updateRecipientsReducer$,
  );
}
