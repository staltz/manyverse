/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Stream} from 'xstream';
import {h} from '@cycle/react';
import {ScrollView, View, Text, TouchableHighlight} from 'react-native';
import * as React from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
  renderers,
} from 'react-native-popup-menu';
import {styles} from './styles';
import {State} from './model';
import {Palette} from '../../../global-styles/palette';
import {Dimensions} from '../../../global-styles/dimens';
import ConnectionsList from '../../../components/ConnectionsList';
import StagedConnectionsList from './StagedConnectionsList';
import EmptySection from '../../../components/EmptySection';

type ModeProps = {
  onPress?: () => void;
  active: boolean;
  icon: string;
  label: string;
};

function ConnectivityMode(props: ModeProps) {
  return h(
    TouchableHighlight,
    {
      onPress: props.onPress,
      style: styles.modeTouchable,
      hitSlop: {top: 8, bottom: 8, left: 8, right: 8},
      underlayColor: Palette.backgroundVoidWeak,
    },
    [
      h(Icon, {
        size: Dimensions.iconSizeBig,
        color: props.active
          ? Palette.backgroundBrand
          : Palette.backgroundVoidStrong,
        name: props.icon,
        accessible: true,
        accessibilityLabel: props.label,
      }),
    ],
  );
}

function ConnectivityModes(state: State) {
  return h(View, {style: styles.modesContainer}, [
    // h(ConnectivityMode, {
    //   sel: 'bluetooth-mode',
    //   active: false,
    //   icon: 'bluetooth',
    //   label: 'Bluetooth Mode',
    // }),

    h(ConnectivityMode, {
      sel: 'lan-mode',
      active: state.lanEnabled,
      icon: 'wifi',
      label: 'Local Network Mode',
    }),

    h(ConnectivityMode, {
      sel: 'dht-mode',
      active: state.internetEnabled,
      icon: 'account-network',
      label: 'Internet P2P Mode',
    }),

    h(ConnectivityMode, {
      sel: 'pub-mode',
      active: state.internetEnabled,
      icon: 'server-network',
      label: 'Internet Servers Mode',
    }),
  ]);
}

function Body(state: State) {
  const {lanEnabled, internetEnabled, peers, stagedPeers} = state;
  if (!lanEnabled && !internetEnabled) {
    return h(EmptySection, {
      style: styles.emptySection,
      image: require('../../../../../images/noun-lantern.png'),
      title: 'Offline',
      description:
        'Turn on some connection mode\nor just enjoy some existing content',
    });
  }

  if (peers.length === 0 && stagedPeers.length === 0) {
    return h(EmptySection, {
      style: styles.emptySection,
      image: require('../../../../../images/noun-crops.png'),
      title: 'No connections',
      description:
        'Invite a friend to connect with\nor sync with people nearby',
    });
  }

  return h(React.Fragment, [
    peers.length > 0
      ? h(ConnectionsList, {
          sel: 'connections-list',
          peers,
          style: styles.connectionsList,
        })
      : null as any,

    stagedPeers.length > 0
      ? h(StagedConnectionsList, {sel: 'staged-list', peers: state.stagedPeers})
      : null as any,
  ]);
}

type MenuOptionContentProps = {
  icon: string;
  text: string;
  accessibilityLabel?: string;
};

class MenuOptionContent extends React.PureComponent<MenuOptionContentProps> {
  public render() {
    const {icon, text, accessibilityLabel} = this.props;

    return h(
      View,
      {
        accessible: true,
        accessibilityLabel,
        style: styles.menuOptionContent,
      },
      [
        h(Icon, {
          size: Dimensions.iconSizeNormal,
          color: Palette.textWeak,
          name: icon,
        }),
        h(Text, {style: styles.menuOptionContentText}, text),
      ],
    );
  }
}

function SlideInMenu(state: State) {
  const opened = !!state.inviteMenuTarget;
  return h(
    Menu,
    {sel: 'slide-in-menu', renderer: renderers.SlideInMenu, opened},
    [
      h(MenuTrigger, {disabled: true}),
      h(MenuOptions, [
        h(MenuOption, {
          value: 'info',
          ['children' as any]: h(MenuOptionContent, {
            icon: 'information',
            text: 'About',
            accessibilityLabel: 'About this Invite Code',
          }),
        }),
        h(MenuOption, {
          value: 'note',
          ['children' as any]: h(MenuOptionContent, {
            icon: 'pencil',
            text: 'Add note',
            accessibilityLabel: 'Add Note',
          }),
        }),
        h(MenuOption, {
          value: 'share',
          ['children' as any]: h(MenuOptionContent, {
            icon: 'share',
            text: 'Share',
            accessibilityLabel: 'Share Invite Code',
          }),
        }),
        h(MenuOption, {
          value: 'delete',
          ['children' as any]: h(MenuOptionContent, {
            icon: 'delete',
            text: 'Delete',
            accessibilityLabel: 'Delete Invite Code',
          }),
        }),
      ]),
    ],
  );
}

export default function view(state$: Stream<State>) {
  return state$.map(state => {
    return h(ScrollView, {style: styles.container}, [
      ConnectivityModes(state),
      Body(state),
      SlideInMenu(state),
    ]);
  });
}
