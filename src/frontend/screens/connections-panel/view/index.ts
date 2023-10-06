// SPDX-FileCopyrightText: 2018-2023 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Stream} from 'xstream';
import debounce from 'xstream/extra/debounce';
import dropRepeatsByKeys from 'xstream-drop-repeats-by-keys';
import {h} from '@cycle/react';
import {Platform, ScrollView, View} from 'react-native';
import {t} from '~frontend/drivers/localization';
import {Dimensions} from '~frontend/global-styles/dimens';
import {Palette} from '~frontend/global-styles/palette';
import {Images} from '~frontend/global-styles/images';
import TopBar from '~frontend/components/TopBar';
import StatusBarBlank from '~frontend/components/StatusBarBlank';
import {
  Props as FabProps,
  FloatingActionButton,
} from '~frontend/components/FloatingActionButton';
import {State} from '../model';
import {styles} from './styles';
import ConnectivityModes from './ConnectivityModes';
import Body from './Body';

const ACTION_MARGIN_DESKTOP = 45; // px

function getFABProps(state: State): FabProps {
  return {
    sel: 'fab',
    color: Palette.backgroundCTA,
    visible: state.internetEnabled,
    actions: [
      {
        color: Palette.backgroundCTA,
        name: 'invite-paste',
        margin: Platform.OS === 'web' ? ACTION_MARGIN_DESKTOP : undefined,
        icon: Images.packageDown,
        text: t('connections.floating_action_button.paste_invite'),
      },
    ],
    overrideWithAction: true,
    distanceToEdge: {
      vertical: Dimensions.verticalSpaceLarge,
      horizontal: Dimensions.horizontalSpaceBig,
    },
    title: t('connections.floating_action_button.add_connection'),
    floatingIcon: Images.plusNetwork,
  };
}

export default function view(state$: Stream<State>) {
  return state$
    .compose(debounce(16)) // avoid quick re-renders
    .compose(
      dropRepeatsByKeys([
        'lanEnabled',
        'internetEnabled',
        'timestampPeersAndRooms',
        'timestampStagedPeers',
        'timestampPeerStates',
      ]),
    )
    .map((state) => {
      const fabProps = getFABProps(state);
      return h(View, {style: styles.screen}, [
        h(StatusBarBlank),
        h(TopBar, {sel: 'topbar', title: t('connections.title')}),
        h(
          ScrollView,
          {
            style: styles.scrollContainer,
            contentContainerStyle: styles.scrollContainerInner,
          },
          [h(ConnectivityModes, state), h(Body, state)],
        ),
        FloatingActionButton(fabProps),
      ]);
    });
}
