// SPDX-FileCopyrightText: 2020-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Component} from 'react';
import {
  View,
  TouchableHighlight,
  Animated,
  Easing,
  ActivityIndicator,
} from 'react-native';
import {h} from '@cycle/react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {t} from '~frontend/drivers/localization';
import {Palette} from '~frontend/global-styles/palette';
import {Dimensions} from '~frontend/global-styles/dimens';
import {IconNames} from '~frontend/global-styles/icons';
import {State} from '../model';
import {styles} from './styles';

class FadingLoader extends Component<{timestamp: number}> {
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
        color: Palette.brandMain,
      }),
    ]);
  }
}

function ConnectivityMode(props: {
  onPress?: () => void;
  active: boolean;
  icon: string;
  accessibilityLabel: string;
  lastScanned: number;
}) {
  return h(View, [
    h(
      TouchableHighlight,
      {
        onPress: props.onPress,
        style: styles.modeTouchable,
        hitSlop: {top: 8, bottom: 8, left: 8, right: 8},
        underlayColor: Palette.voidWeak,
      },
      [
        h(Icon, {
          size: Dimensions.iconSizeBig,
          color: props.active ? Palette.brandMain : Palette.textVeryWeak,
          name: props.icon,
          accessible: true,
          accessibilityLabel: props.accessibilityLabel,
        }),
      ],
    ),
    props.lastScanned === 0
      ? null
      : h(FadingLoader, {timestamp: props.lastScanned}),
  ]);
}

export default class ConnectivityModes extends Component<
  Pick<State, 'lanEnabled' | 'internetEnabled'>
> {
  public shouldComponentUpdate(nextProps: ConnectivityModes['props']) {
    const prevProps = this.props;
    if (nextProps.lanEnabled !== prevProps.lanEnabled) return true;
    if (nextProps.internetEnabled !== prevProps.internetEnabled) return true;
    return false;
  }

  public render() {
    const {lanEnabled, internetEnabled} = this.props;

    return h(View, {style: styles.modesContainer}, [
      h(ConnectivityMode, {
        sel: 'lan-mode',
        active: lanEnabled,
        icon: IconNames.peerWifi,
        accessibilityLabel: t('connections.modes.wifi.accessibility_label'),
        lastScanned: 0,
      }),

      h(ConnectivityMode, {
        sel: 'pub-mode',
        active: internetEnabled,
        icon: IconNames.peerInternetServer,
        accessibilityLabel: t('connections.modes.servers.accessibility_label'),
        lastScanned: 0,
      }),
    ]);
  }
}
