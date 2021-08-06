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
  StyleProp,
  ViewStyle,
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

export default class PublicTabIcon extends Component<{
  isSelected: boolean;
  numOfUpdates: number;
  style?: StyleProp<ViewStyle>;
}> {
  public shouldComponentUpdate(nextProps: PublicTabIcon['props']) {
    const prevProps = this.props;
    if (nextProps.isSelected !== prevProps.isSelected) return true;
    const nextNum = nextProps.numOfUpdates;
    const prevNum = prevProps.numOfUpdates;
    // numOfUpdates has two thresholds: >=1 and >=10
    if (prevNum === nextNum) return false;
    if (prevNum < 1 && nextNum >= 1) return true;
    if (prevNum < 10 && nextNum >= 10) return true;
    if (prevNum >= 10 && nextNum < 10) return true;
    if (prevNum >= 1 && nextNum < 1) return true;
    return false;
  }

  public render() {
    const {isSelected, numOfUpdates, style} = this.props;

    return h(
      Touchable,
      {
        ...touchableProps,
        sel: 'public-tab-button',
        style: [styles.tabButton, style], // iOS needs this
        accessible: true,
        accessibilityRole: 'tab',
        accessibilityLabel: t('central.tabs.public.accessibility_label'),
      },
      [
        h(View, {style: [styles.tabButton, style], pointerEvents: 'box-only'}, [
          h(View, [
            h(Icon, {
              name: 'bulletin-board',
              ...(isSelected ? iconProps.tabSelected : iconProps.tab),
            }),
            h(View, {
              style:
                numOfUpdates >= 10
                  ? styles.updatesCoverNone
                  : numOfUpdates >= 1
                  ? styles.updatesCoverSome
                  : styles.updatesCoverAll,
            }),
          ]),

          h(
            Text,
            {
              style: isSelected
                ? styles.tabButtonTextSelected
                : styles.tabButtonText,
              numberOfLines: 1,
            },
            t('central.tab_footers.public'),
          ),
        ]),
      ],
    );
  }
}
