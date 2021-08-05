/* Copyright (C) 2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {h} from '@cycle/react';
import {Component} from 'react';
import {
  Platform,
  TouchableNativeFeedback,
  TouchableOpacity,
  View,
  Text,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {t} from '../../drivers/localization';
import {styles, iconProps} from './styles';

const Touchable = Platform.select<any>({
  android: TouchableNativeFeedback,
  default: TouchableOpacity,
});

const touchableProps: any = {};
if (Platform.OS === 'android') {
  touchableProps.background = TouchableNativeFeedback.SelectableBackground();
}

export default class ConnectionsTabIcon extends Component<{
  isSelected: boolean;
  offline: boolean;
  numStaged: number;
  numConnected: number;
}> {
  public shouldComponentUpdate(nextProps: ConnectionsTabIcon['props']) {
    const prevProps = this.props;
    if (nextProps.isSelected !== prevProps.isSelected) return true;
    if (nextProps.offline !== prevProps.offline) return true;
    if (nextProps.numStaged !== prevProps.numStaged) return true;
    if (prevProps.numConnected < 1 && nextProps.numConnected >= 1) return true;
    if (prevProps.numConnected >= 1 && nextProps.numConnected < 1) return true;
    if (prevProps.numStaged < 1 && nextProps.numStaged >= 1) return true;
    if (prevProps.numStaged >= 1 && nextProps.numStaged < 1) return true;
    return false;
  }

  private getIconName() {
    const {numConnected, numStaged, offline} = this.props;
    if (numConnected > 0) return 'check-network-outline';
    if (numStaged > 0) return 'help-network-outline';
    if (offline) return 'network-off-outline';
    return 'network-outline';
  }

  public render() {
    const {isSelected} = this.props;
    return h(
      Touchable,
      {
        ...touchableProps,
        sel: 'connections-tab-button',
        style: styles.tabButton, // iOS needs this
        accessible: true,
        accessibilityRole: 'tab',
        accessibilityLabel: t('central.tabs.connections.accessibility_label'),
      },
      [
        h(View, {style: styles.tabButton, pointerEvents: 'box-only'}, [
          h(Icon, {
            name: this.getIconName(),
            ...(isSelected ? iconProps.tabSelected : iconProps.tab),
          }),

          h(
            Text,
            {
              style: isSelected
                ? styles.tabButtonTextSelected
                : styles.tabButtonText,
              numberOfLines: 1,
            },
            t('central.tab_footers.connections'),
          ),
        ]),
      ],
    );
  }
}
