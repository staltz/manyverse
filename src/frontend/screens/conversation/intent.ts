/* Copyright (C) 2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import {ReactSource} from '@cycle/react';
import {User} from 'react-native-gifted-chat';
import {FeedId} from 'ssb-typescript';
import {NavSource} from 'cycle-native-navigation';

export default function intent(
  reactSource: ReactSource,
  navSource: NavSource,
  topBarBack$: Stream<any>,
) {
  return {
    publishMsg$: reactSource
      .select('chat')
      .events('send')
      .map(arr => arr[0].text),

    goBack$: xs.merge(navSource.backPress(), topBarBack$),

    goToProfile$: reactSource
      .select('chat')
      .events('pressAvatar')
      .map((user: User) => user._id as FeedId),
  };
}
