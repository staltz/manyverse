// SPDX-FileCopyrightText: 2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import sample from 'xstream-sample';
import {ReactSource} from '@cycle/react';
import {NavSource} from 'cycle-native-navigation';
import {DialogSource, PickerAction} from '../../../drivers/dialogs';
import {Palette} from '../../../global-styles/palette';
import {State, Recommendation} from './model';
import {t} from '../../../drivers/localization';

function recommendationSelected$(
  bestPressed$: Stream<Recommendation>,
  dialogAction$: Stream<PickerAction>,
  recommendation: Recommendation,
) {
  return xs.merge(
    bestPressed$.filter((rec: Recommendation) => rec === recommendation),

    dialogAction$.filter(
      (a) =>
        a.action === 'actionSelect' && a.selectedItem.id === recommendation,
    ),
  );
}

export default function intent(
  reactSource: ReactSource,
  dialogSource: DialogSource,
  navSource: NavSource,
  state$: Stream<State>,
) {
  const goBack$ = navSource.backPress();

  const bestPressed$ = reactSource
    .select('recommendations')
    .events('pressBest') as Stream<Recommendation>;

  const goToConnectionsPanel$ = reactSource
    .select('connections-panel')
    .events('press');

  const pickRecommendation$ = reactSource
    .select('recommendations')
    .events('pressOthers')
    .compose(sample(state$))
    .map((state) =>
      dialogSource.showPicker(undefined, undefined, {
        items: state.otherRecommendations
          .split('#')
          .map((recommendation: Recommendation) => ({
            id: recommendation,
            label:
              recommendation === 'follow-staged-manually'
                ? t('connections.recommendations.follow_staged_manually')
                : recommendation === 'host-ssb-room'
                ? t('connections.recommendations.host_ssb_room')
                : t('connections.recommendations.consume_invite'),
          })),
        type: 'listPlain',
        ...Palette.listDialogColors,
        cancelable: true,
        positiveText: '',
        negativeText: '',
        neutralText: '',
      }),
    )
    .flatten();

  const goToFollowStagedManuallyDialog$ = recommendationSelected$(
    bestPressed$,
    pickRecommendation$,
    'follow-staged-manually',
  );

  const goToConsumeInviteDialog$ = recommendationSelected$(
    bestPressed$,
    pickRecommendation$,
    'consume-invite',
  );

  const goToHostSsbRoomDialog$ = recommendationSelected$(
    bestPressed$,
    pickRecommendation$,
    'host-ssb-room',
  );

  return {
    goToConnectionsPanel$,
    goBack$,
    goToConsumeInviteDialog$,
    goToFollowStagedManuallyDialog$,
    goToHostSsbRoomDialog$,
  };
}
