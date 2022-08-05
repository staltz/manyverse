// SPDX-FileCopyrightText: 2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import sampleCombine from 'xstream/extra/sampleCombine';
import {ReactSource} from '@cycle/react';
import {NavSource} from 'cycle-native-navigation';
import {FeedId} from 'ssb-typescript';
import {Palette} from '~frontend/global-styles/palette';
import {t} from '~frontend/drivers/localization';
import {DialogSource} from '~frontend/drivers/dialogs';
import {blobsOptToStorage, blobsStorageOptions, State} from './model';
import {PressBlockAccount} from '~frontend/ssb/types';

export default function intent(
  screenSource: ReactSource,
  navSource: NavSource,
  dialogSource: DialogSource,
  state$: Stream<State>,
) {
  return {
    goBack$: xs.merge(
      navSource.backPress(),
      screenSource.select('topbar').events('pressBack'),
    ),

    updateBlobsStorage$: screenSource
      .select('blobs-storage')
      .events('change')
      .map((i) => blobsOptToStorage(blobsStorageOptions[i])),

    goToProfile$: screenSource.select('list').events<FeedId>('pressAccount'),

    goToCompact$: screenSource
      .select('compact')
      .events('press')
      .map(() =>
        dialogSource
          .alert(
            t('storage.dialogs.confirm_compact.title'),
            t('storage.dialogs.confirm_compact.description'),
            {
              ...Palette.dialogColors,
              negativeText: t('call_to_action.cancel'),
              positiveText: t('call_to_action.yes'),
              markdownOnDesktop: true,
            },
          )
          .filter((res) => res.action === 'actionPositive'),
      )
      .flatten(),

    manageAccount$: screenSource
      .select('list')
      .events<PressBlockAccount>('pressAccountMore')
      .compose(sampleCombine(state$))
      .map(([pressEvent, {selfFeedId}]) => ({...pressEvent, selfFeedId})),
  };
}
