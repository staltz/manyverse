// SPDX-FileCopyrightText: 2020-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs from 'xstream';
import {ReactSource} from '@cycle/react';
import {NavSource} from 'cycle-native-navigation';
import {DialogSource} from '~frontend/drivers/dialogs';
import {hopsOptions} from './model';
import {t} from '~frontend/drivers/localization';
import {Palette} from '~frontend/global-styles/palette';

export default function intent(
  screenSource: ReactSource,
  navSource: NavSource,
  dialogSource: DialogSource,
) {
  return {
    toggleFollowEvents$: screenSource
      .select('show-follows')
      .events('valueChange'),

    toggleDetailedLogs$: screenSource
      .select('detailed-logs')
      .events('valueChange'),

    toggleEnableFirewall$: screenSource
      .select('enable-firewall')
      .events('valueChange'),

    updateHops$: screenSource
      .select('hops')
      .events('change')
      .map((i) => {
        const opt = hopsOptions[i];
        if (opt === '1') return 1;
        if (opt === '2') return 2;
        if (opt === '3') return 3;
        if (opt === '4') return 4;
        if (opt === 'unlimited') return 999;
        return 999 as number;
      }),

    emailBugReport$: screenSource.select('bug-report').events('press'),

    forceReindex$: screenSource
      .select('force-reindex')
      .events('press')
      .map(() =>
        dialogSource
          .alert(
            t('settings.troubleshooting.force_reindex.confirm.title'),
            t('settings.troubleshooting.force_reindex.confirm.description'),
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

    goBack$: xs.merge(
      navSource.backPress(),
      screenSource.select('topbar').events('pressBack'),
    ),

    goToBackup$: screenSource.select('backup').events('press'),

    goToStorage$: screenSource.select('storage').events('press'),

    goToLibraries$: screenSource.select('libraries').events('press'),

    goToThanks$: screenSource.select('thanks').events('press'),

    goToAbout$: screenSource.select('about').events('press'),
  };
}
