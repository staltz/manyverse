/* Copyright (C) 2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {h} from '@cycle/react';
import {Component} from 'react';
import {Platform, StyleSheet, View, StyleProp, ViewStyle} from 'react-native';
import {t} from '../../drivers/localization';
import {Palette} from '../../global-styles/palette';
import TabIcon from './TabIcon';

const styles = StyleSheet.create({
  updatesCoverAll: {
    height: 11,
    position: 'absolute',
    top: 8.5,
    left: 5,
    right: 5,
    backgroundColor: Platform.select({
      default: Palette.backgroundText,
      web: Palette.voidMain,
    }),
  },

  updatesCoverSome: {
    height: 11,
    position: 'absolute',
    top: 8.5,
    left: 5,
    right: 11,
    backgroundColor: Platform.select({
      default: Palette.backgroundText,
      web: Palette.voidMain,
    }),
  },

  updatesCoverNone: {
    display: 'none',
  },
});

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

    return h(TabIcon, {
      style,
      isSelected,
      sel: 'public-tab-button',
      iconName: 'bulletin-board',
      label: t('central.tab_footers.public'),
      accessibilityLabel: t('central.tabs.public.accessibility_label'),
      renderIconExtras: () =>
        h(View, {
          style:
            numOfUpdates >= 10
              ? styles.updatesCoverNone
              : numOfUpdates >= 1
              ? styles.updatesCoverSome
              : styles.updatesCoverAll,
        }),
    });
  }
}
