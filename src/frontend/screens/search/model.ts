// SPDX-FileCopyrightText: 2021-2023 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import dropRepeats from 'xstream/extra/dropRepeats';
import {FeedId, PostContent} from 'ssb-typescript';
import {isFeedSSBURI, isMessageSSBURI} from 'ssb-uri2';
const Ref = require('ssb-ref');
import {GetReadable, MentionSuggestion, SSBSource} from '~frontend/drivers/ssb';
import {MsgAndExtras, ThreadSummaryWithExtras} from '~frontend/ssb/types';
import {Props} from './props';

type SearchResults =
  | {
      type: 'HashtagResults';
      getReadable: GetReadable<ThreadSummaryWithExtras> | null;
      hashtagCount: number | null;
    }
  | {
      type: 'TextResults';
      getReadable: GetReadable<MsgAndExtras<PostContent>> | null;
    }
  | {
      type: 'AccountResults';
      users: MentionSuggestion[];
    };

export interface State {
  selfFeedId: FeedId;
  selfAvatarUrl?: string;
  lastSessionTimestamp: number;
  preferredReactions: Array<string>;
  query: string;
  queryOverride: string;
  queryOverrideFlag: number;
  queryInProgress: boolean;
  searchResults: SearchResults | null;
  subscribedHashtags: Array<string> | null;
  suggestions: Array<string> | null;
}

export interface Actions {
  updateQueryNow$: Stream<string>;
  updateQueryDebounced$: Stream<string>;
  clearQuery$: Stream<any>;
  toggleHashtagSubscribe$: Stream<boolean>;
  selectSuggestion$: Stream<string>;
}

function searchContent(
  query: string,
  ssbSource: SSBSource,
): Stream<SearchResults> {
  if (query.startsWith('@') && query.length > 2) {
    return ssbSource
      .getMentionSuggestions(query.slice(1), [])
      .map((users) => ({type: 'AccountResults', users}));
  } else if (query.startsWith('#') && query.length > 2) {
    const publicHashtagSummaries$ =
      ssbSource.searchPublishHashtagSummaries$(query);

    const hashtagCount$ = (
      ssbSource.hashtagCount$(query) as Stream<number | null>
    ).startWith(null);

    return xs
      .combine(publicHashtagSummaries$, hashtagCount$)
      .map(([getReadable, hashtagCount]) => ({
        type: 'HashtagResults',
        getReadable,
        hashtagCount,
      }));
  }
  return ssbSource
    .searchPublicPosts$(query)
    .map((getReadable) => ({type: 'TextResults', getReadable}));
}

export default function model(
  props$: Stream<Props>,
  state$: Stream<State>,
  ssbSource: SSBSource,
  actions: Actions,
) {
  const propsReducer$ = props$.take(1).map(
    (props) =>
      function propsReducer(_prev?: State): State {
        return {
          selfFeedId: props.selfFeedId,
          selfAvatarUrl: props.selfAvatarUrl,
          lastSessionTimestamp: props.lastSessionTimestamp,
          preferredReactions: [],
          query: props.query ?? '',
          queryOverride: props.query ?? '',
          queryOverrideFlag: 0,
          queryInProgress: !!props.query,
          searchResults: null,
          subscribedHashtags: null,
          suggestions: null,
        };
      },
  );

  const initSuggestionsReducer = ssbSource
    .getRecentHashtags(10)
    .take(1)
    .map(
      (recentHashtags) =>
        function initSuggestionsReducer(prev: State) {
          return {
            ...prev,
            suggestions: recentHashtags.map((h) => `#${h}`),
          };
        },
    );

  const updatePreferredReactionsReducer$ = ssbSource.preferredReactions$.map(
    (preferredReactions) =>
      function updatePreferredReactionsReducer(prev: State): State {
        return {...prev, preferredReactions};
      },
  );

  const updateQueryInProgressReducer$ = actions.updateQueryNow$.map(
    (query) =>
      function updateQueryInProgressReducer(prev: State): State {
        if (query.length > 0 && !query.startsWith('#')) {
          return {...prev, queryInProgress: true};
        } else if (query.length > 1 && query.startsWith('#')) {
          return {...prev, queryInProgress: true};
        } else {
          return {...prev, queryInProgress: false, searchResults: null};
        }
      },
  );

  const updateQueryReducer$ = actions.updateQueryDebounced$.map(
    (query) =>
      function updateQueryReducer(prev: State): State {
        if (
          Ref.isMsgId(query) ||
          Ref.isFeedId(query) ||
          isMessageSSBURI(query) ||
          isFeedSSBURI(query)
        ) {
          // In case of a shortcut to Thread or Account, clear the input field
          return {
            ...prev,
            query: '',
            queryOverride: '',
            queryOverrideFlag: 1 - prev.queryOverrideFlag,
            queryInProgress: false,
            searchResults: null,
          };
        } else {
          return {...prev, query};
        }
      },
  );

  const clearQueryReducer$ = actions.clearQuery$.mapTo(
    function clearQueryReducer(prev: State): State {
      return {
        ...prev,
        query: '',
        queryOverride: '',
        queryOverrideFlag: 1 - prev.queryOverrideFlag,
        queryInProgress: false,
        searchResults: null,
      };
    },
  );

  const query$ = state$.map((state) => state.query).compose(dropRepeats());

  const updateSearchResultsReducer$ = query$
    .filter((query) => query.length > 1)
    .map((query) => searchContent(query, ssbSource))
    .flatten()
    .map(
      (searchResults) =>
        function updateUsersReducer(prev: State): State {
          return {...prev, searchResults};
        },
    );

  const updateSubscribedHashtagsReducer$ = ssbSource.hashtagsSubscribed$.map(
    (subscribedHashtags) =>
      function updateSubscribedHashtagsReducer(prev: State): State {
        return {...prev, subscribedHashtags};
      },
  );

  const updateQueryWithSuggestionReducer$ = actions.selectSuggestion$.map(
    (value) =>
      function updateQueryWithSuggestionReducer(prev: State): State {
        return {
          ...prev,
          query: value,
          queryInProgress: true,
          queryOverride: value,
          queryOverrideFlag: 1 - prev.queryOverrideFlag,
        };
      },
  );

  return xs.merge(
    propsReducer$,
    initSuggestionsReducer,
    updatePreferredReactionsReducer$,
    updateQueryInProgressReducer$,
    updateQueryReducer$,
    clearQueryReducer$,
    updateSearchResultsReducer$,
    updateSubscribedHashtagsReducer$,
    updateQueryWithSuggestionReducer$,
  );
}
