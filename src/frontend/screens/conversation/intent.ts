// SPDX-FileCopyrightText: 2020-2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs from 'xstream';
import {ReactSource} from '@cycle/react';
import {Platform} from 'react-native';
import {NavSource} from 'cycle-native-navigation';
import {User} from 'react-native-gifted-chat';
import {FeedId} from 'ssb-typescript';
import {DialogSource} from '../../drivers/dialogs';
import {readOnlyDisclaimer} from '../../components/read-only-disclaimer';

export default function intent(
  reactSource: ReactSource,
  navSource: NavSource,
  dialogSource: DialogSource,
) {
  return {
    publishMsg$: reactSource
      .select('chat')
      .events('send')
      .map((arr) => arr[0].text)
      .map((text) => {
        if (Platform.OS === 'web' && process.env.SSB_DB2_READ_ONLY) {
          return readOnlyDisclaimer(dialogSource);
        } else {
          return xs.of(text);
        }
      })
      .flatten(),

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
