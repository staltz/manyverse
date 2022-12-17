// SPDX-FileCopyrightText: 2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {ReactSource} from '@cycle/react';
import {NavSource} from 'cycle-native-navigation';
import xs from 'xstream';
import {FeedFilter} from '../central/model';

// Tuple of hashtag name and whether it should be subscribed to or not
export type HashtagSubscribeEvent = {
  hashtag: string;
  shouldSubscribe: boolean;
};

export default function intent(reactSource: ReactSource, navSource: NavSource) {
  const goBack$ = xs.merge(
    navSource.backPress(),
    reactSource.select('topbar').events('pressBack'),
  );

  const toggleHashtagSubscribe$ = reactSource
    .select('hashtagRow')
    .events<HashtagSubscribeEvent>('pressSubscribe');

  const goToHashtagSearch$ = reactSource
    .select('hashtagRow')
    .events<string>('press');

  const updatePublicFeedType$ = reactSource
    .select('feedSettingsHeader')
    .events<FeedFilter>('changePublicFeedType');

  return {
    goBack$,
    goToHashtagSearch$,
    toggleHashtagSubscribe$,
    updatePublicFeedType$,
  };
}
