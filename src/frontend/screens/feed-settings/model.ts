// SPDX-FileCopyrightText: 2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import {AsyncStorageSource} from 'cycle-native-asyncstorage';
import dropRepeats from 'xstream/extra/dropRepeats';
import {SSBSource} from '~frontend/drivers/ssb';
import {FeedFilter} from '../central/model';
import {Props} from './props';

interface Actions {
  updatePublicFeedType$: Stream<FeedFilter>;
}

export interface State {
  selfFeedId: string;
  lastSessionTimestamp: number | null;
  publicFeedType: FeedFilter | null;
  hashtags: Map<string, boolean> | null; // hashtag -> subscribed
}

export default function model(
  props$: Stream<Props>,
  actions: Actions,
  asyncStorageSource: AsyncStorageSource,
  ssbSource: SSBSource,
) {
  const propsReducer$ = props$.take(1).map(
    (props) =>
      function propsReducer(): State {
        return {
          selfFeedId: props.selfFeedId,
          lastSessionTimestamp: null,
          hashtags: null,
          publicFeedType: null,
        };
      },
  );

  const loadLastSessionTimestampReducer$ = asyncStorageSource
    .getItem('lastSessionTimestamp')
    .map(
      (resultStr) =>
        function lastSessionTimestampReducer(prev: State): State {
          const lastSessionTimestamp = parseInt(resultStr ?? '', 10);
          if (isNaN(lastSessionTimestamp)) {
            return prev;
          } else {
            return {...prev, lastSessionTimestamp};
          }
        },
    );

  const initialPublicFeedTypeReducer$ = asyncStorageSource
    .getItem('publicFeedType')
    .map(
      (resultStr) =>
        function initialFeedTypeReducer(prev: State): State {
          const publicFeedType = resultStr && JSON.parse(resultStr);
          return {
            ...prev,
            publicFeedType: publicFeedType ?? 'all',
          };
        },
    );

  const updatePublicFeedTypeReducer$ = actions.updatePublicFeedType$
    .compose(dropRepeats())
    .map(
      (feedType) =>
        function updatePublicFeedTypeReducer(prev: State): State {
          return {...prev, publicFeedType: feedType};
        },
    );

  const updateHashtagsReducer$ = ssbSource.hashtagsSubscribed$.map(
    (subscribedHashtags) =>
      function updateSubscribedHashtagsReducer(prev: State): State {
        // We need to create a new map object so that it properly triggers a re-render in React
        const newHashtags = new Map(subscribedHashtags.map((h) => [h, true]));

        if (!prev.hashtags) {
          return {
            ...prev,
            hashtags: newHashtags,
          };
        }

        const previousHashtagsSet = new Set(prev.hashtags.keys());
        const subscribedHashtagsSet = new Set(subscribedHashtags);

        // Get hashtags that are no longer subscribed to
        const previousMinusSubscribed = setDifference(
          previousHashtagsSet,
          subscribedHashtagsSet,
        );

        // We still want references to the unsubscribed hashtags on this screen during the screen's lifecycle
        // so we add entries to that map to false i.e. unsubscribed.
        for (const unsubscribedHashtag of previousMinusSubscribed.values()) {
          newHashtags.set(unsubscribedHashtag, false);
        }

        return {...prev, hashtags: newHashtags};
      },
  );

  return xs.merge(
    propsReducer$,
    loadLastSessionTimestampReducer$,
    initialPublicFeedTypeReducer$,
    updatePublicFeedTypeReducer$,
    updateHashtagsReducer$,
  );
}

function setDifference(a: Set<string>, b: Set<string>) {
  const result = new Set(a);
  for (const elem of b) {
    result.delete(elem);
  }
  return result;
}
