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
  TouchableHighlight,
  Animated,
  Easing,
  ActivityIndicator,
  Platform,
} from 'react-native';
import * as React from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {styles} from './styles';
import {State} from '../model';
import {Palette} from '../../../../global-styles/palette';
import {Dimensions} from '../../../../global-styles/dimens';
import ListOfPeers from './ListOfPeers';
import EmptySection from '../../../../components/EmptySection';
import SlideInMenu from './SlideInMenu';

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
      ? null
      : h(FadingLoader, {timestamp: props.lastScanned}),
  ]);
}

function ConnectivityModes(state: State) {
  return h(View, {style: styles.modesContainer}, [
    Platform.OS === 'ios'
      ? null
      : h(ConnectivityMode, {
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
    rooms,
    stagedPeers,
  } = state;

  // Render empty cases
  let emptySection: React.ReactElement<any> | null = null;
  if (!bluetoothEnabled && !lanEnabled && !internetEnabled) {
    emptySection = h(EmptySection, {
      style: styles.emptySection,
      image: require('../../../../../../images/noun-lantern.png'),
      title: 'Offline',
      description:
        'Turn on some connection mode\nor enjoy reading some existing content',
    });
  } else if (!peers.length && !rooms.length && !stagedPeers.length) {
    if (recentlyScanned(state.bluetoothLastScanned)) {
      emptySection = h(EmptySection, {
        style: styles.emptySection,
        image: require('../../../../../../images/noun-crops.png'),
        title: 'Connecting',
        description:
          'Wait while the app is\nattempting to connect to your peers',
      });
    } else {
      emptySection = h(EmptySection, {
        style: styles.emptySection,
        image: require('../../../../../../images/noun-crops.png'),
        title: 'No connections',
        description:
          'Try syncing with people nearby\nor use a server invite code',
      });
    }
  }

  // Don't render empty section if there are peers:
  if (peers.length || rooms.length || stagedPeers.length) {
    emptySection = null;
  }

  return h(React.Fragment, [
    h(ListOfPeers, {
      key: 'b',
      sel: 'list-of-peers',
      peers,
      rooms,
      stagedPeers,
    }),

    emptySection,
  ]);
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
