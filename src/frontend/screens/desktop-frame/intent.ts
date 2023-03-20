// SPDX-FileCopyrightText: 2018-2023 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import sample from 'xstream-sample';
import sampleCombine from 'xstream/extra/sampleCombine';
import dropRepeatsByKeys from 'xstream-drop-repeats-by-keys';
import {ReactSource} from '@cycle/react';
import {HTTPSource} from '@cycle/http';
import {t} from '~frontend/drivers/localization';
import {DialogSource} from '~frontend/drivers/dialogs';
import {Palette} from '~frontend/global-styles/palette';
import {Props as IndexingProps} from '~frontend/screens/indexing/props';
import {State} from './model';

type TabID = State['currentTab'];

export default function intent(
  reactSource: ReactSource,
  dialogSource: DialogSource,
  httpSource: HTTPSource,
  state$: Stream<State>,
) {
  const changeTab$ = xs.merge(
    reactSource
      .select('public-tab-button')
      .events('press')
      .mapTo('public' as TabID),

    reactSource
      .select('private-tab-button')
      .events('press')
      .mapTo('private' as TabID),

    reactSource
      .select('activity-tab-button')
      .events('press')
      .mapTo('activity' as TabID),

    reactSource
      .select('connections-tab-button')
      .events('press')
      .mapTo('connections' as TabID),
  );

  const changeTabWithState$ = changeTab$.compose(sampleCombine(state$));

  const scrollToTop$ = changeTabWithState$
    .filter(([nextTab, state]) => nextTab === state.currentTab)
    .map(([nextTab]) => nextTab);

  const goToSelfProfile$ = reactSource
    .select('self-profile')
    .events('press')
    .mapTo(null);

  const goToSettings$ = reactSource
    .select('settings')
    .events('press')
    .mapTo(null);

  const goToStorage$ = reactSource
    .select('storage')
    .events('press')
    .mapTo(null);

  const goToIndexing$ = reactSource
    .select('progressPill')
    .events('press')
    .compose(sample(state$)) as Stream<IndexingProps>;

  const openMoreMenuOptions$ = reactSource
    .select('more')
    .events('press')
    .map(() =>
      dialogSource.showPicker(undefined, undefined, {
        items: [
          {
            id: 'raw-db',
            label: t('drawer.menu.raw_database.label'),
          },
          {
            id: 'bug-report',
            label: t('drawer.menu.email_bug_report.label'),
          },
          {
            id: 'translate',
            label: t('drawer.menu.translate.label'),
          },
        ],
        type: 'listPlain',
        ...Palette.listDialogColors,
        cancelable: true,
        positiveText: '',
        negativeText: '',
        neutralText: '',
      }),
    )
    .flatten()
    .filter((res) => res.action === 'actionSelect')
    .map(
      (res: any) =>
        res.selectedItem.id as 'raw-db' | 'bug-report' | 'translate',
    );

  const showRawDatabase$ = openMoreMenuOptions$.filter((id) => id === 'raw-db');

  const emailBugReport$ = openMoreMenuOptions$.filter(
    (id) => id === 'bug-report',
  );

  const openTranslate$ = openMoreMenuOptions$.filter(
    (id) => id === 'translate',
  );

  const checkNewVersion$ = state$
    .compose(dropRepeatsByKeys(['allowCheckingNewVersion']))
    .map((state) =>
      state.allowCheckingNewVersion
        ? xs.periodic(1000 * 60 * 60 * 24).startWith(0)
        : xs.never(),
    )
    .flatten();

  const response$ = httpSource
    .select('latestversion')
    .flatten()
    .map((res) => res.body);

  const latestVersionResponse$ = response$.replaceError(() => response$);

  const downloadNewVersion$ = reactSource
    .select('new-version')
    .events('press')
    .mapTo(null);

  return {
    changeTab$,
    scrollToTop$,
    goToSelfProfile$,
    goToSettings$,
    goToStorage$,
    goToIndexing$,
    showRawDatabase$,
    emailBugReport$,
    openTranslate$,
    checkNewVersion$,
    latestVersionResponse$,
    downloadNewVersion$,
  };
}
