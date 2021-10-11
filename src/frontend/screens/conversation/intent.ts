// SPDX-FileCopyrightText: 2020 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs from 'xstream';
import {ReactSource} from '@cycle/react';
import {User} from 'react-native-gifted-chat';
import {FeedId} from 'ssb-typescript';
import {NavSource} from 'cycle-native-navigation';

export default function intent(reactSource: ReactSource, navSource: NavSource) {
  return {
    publishMsg$: reactSource
      .select('chat')
      .events('send')
      .map((arr) => arr[0].text),

    goBack$: xs.merge(
      navSource.backPress(),
      reactSource.select('topbar').events('pressBack'),
    ),

    goToProfile$: reactSource
      .select('chat')
      .events('pressAvatar')
      .map((user: User) => user._id as FeedId),

    goToRecipients$: reactSource.select('showRecipients').events('press'),
  };
}
