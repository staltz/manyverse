/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Stream} from 'xstream';
import {h} from '@cycle/react';
import {
  ScrollView,
  View,
  Text,
  TouchableHighlight,
  Animated,
  Easing,
  ActivityIndicator,
} from 'react-native';
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
import {State} from '../model';
import {Palette} from '../../../../global-styles/palette';
import {Dimensions} from '../../../../global-styles/dimens';
import ConnectionsList from './ConnectionsList';
import StagedConnectionsList from './StagedConnectionsList';
import EmptySection from '../../../../components/EmptySection';

type ModeProps = {
  onPress?: () => void;
  active: boolean;
  icon: string;
  label: string;
  lastScanned: number;
};

const CONNECTION_INTERVAL = 10e3;

function recentlyScanned(timestamp: number) {
  return timestamp > 0 && Date.now() - timestamp < 1.5 * CONNECTION_INTERVAL;
}

type FLProps = {timestamp: number};
class FadingLoader extends React.Component<FLProps> {
  private opacity = new Animated.Value(0);

  private triggerFade() {
    this.opacity.setValue(1);
    Animated.timing(this.opacity, {
      toValue: 0,
      duration: 10e3,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();
  }

  public componentDidMount() {
    if (this.props.timestamp > 0) {
      this.triggerFade();
    }
  }

  public componentDidUpdate(prevProps: {timestamp: number}) {
    if (this.props.timestamp > prevProps.timestamp) {
      this.triggerFade();
    }
  }

  public render() {
    const {opacity} = this;
    return h(Animated.View, {style: [styles.modeLoading, {opacity}]}, [
      h(ActivityIndicator, {
        animating: true,
        size: 60,
        color: Palette.backgroundBrand,
      }),
    ]);
  }
}

function ConnectivityMode(props: ModeProps) {
  return h(View, [
    h(
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
    ),
    props.lastScanned === 0
      ? (null as any)
      : h(FadingLoader, {timestamp: props.lastScanned}),
  ]);
}

function ConnectivityModes(state: State) {
  return h(View, {style: styles.modesContainer}, [
    h(ConnectivityMode, {
      sel: 'bluetooth-mode',
      active: state.bluetoothEnabled,
      icon: 'bluetooth',
      label: 'Bluetooth Mode',
      lastScanned: state.bluetoothLastScanned,
    }),

    h(ConnectivityMode, {
      sel: 'lan-mode',
      active: state.lanEnabled,
      icon: 'wifi',
      label: 'Local Network Mode',
      lastScanned: 0,
    }),

    h(ConnectivityMode, {
      sel: 'dht-mode',
      active: state.internetEnabled,
      icon: 'account-network',
      label: 'Internet P2P Mode',
      lastScanned: 0,
    }),

    h(ConnectivityMode, {
      sel: 'pub-mode',
      active: state.internetEnabled,
      icon: 'server-network',
      label: 'Internet Servers Mode',
      lastScanned: 0,
    }),
  ]);
}

function Body(state: State) {
  const {
    bluetoothEnabled,
    lanEnabled,
    internetEnabled,
    peers,
    stagedPeers,
  } = state;
  if (!bluetoothEnabled && !lanEnabled && !internetEnabled) {
    return h(EmptySection, {
      style: styles.emptySection,
      image: require('../../../../../images/noun-lantern.png'),
      title: 'Offline',
      description:
        'Turn on some connection mode\nor just enjoy some existing content',
    });
  }

  if (peers.length === 0 && stagedPeers.length === 0) {
    if (recentlyScanned(state.bluetoothLastScanned)) {
      return h(EmptySection, {
        style: styles.emptySection,
        image: require('../../../../../images/noun-crops.png'),
        title: 'Connecting',
        description:
          'Standby while the app is\nattempting to connect to your peers',
      });
    } else {
      return h(EmptySection, {
        style: styles.emptySection,
        image: require('../../../../../images/noun-crops.png'),
        title: 'No connections',
        description:
          'Invite a friend to connect with\nor sync with people nearby',
      });
    }
  }

  return h(React.Fragment, [
    peers.length > 0
      ? h(ConnectionsList, {
          sel: 'connections-list',
          peers,
          style: styles.connectionsList,
        })
      : (null as any),

    stagedPeers.length > 0
      ? h(StagedConnectionsList, {sel: 'staged-list', peers: state.stagedPeers})
      : (null as any),
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
