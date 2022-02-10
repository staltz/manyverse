// SPDX-FileCopyrightText: 2021-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {h} from '@cycle/react';
import {Component} from 'react';
import {Platform, StyleSheet, View, StyleProp, ViewStyle} from 'react-native';
import {t} from '~frontend/drivers/localization';
import {Palette} from '~frontend/global-styles/palette';
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

  hoveredOnDesktop: {
    backgroundColor: Palette.backgroundText,
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
      renderIconExtras: (visualState?: any) =>
        h(View, {
          style: [
            numOfUpdates >= 10
              ? styles.updatesCoverNone
              : numOfUpdates >= 1
              ? styles.updatesCoverSome
              : styles.updatesCoverAll,

            Platform.OS === 'web' && visualState?.hovered
              ? styles.hoveredOnDesktop
              : null,
          ],
        }),
    });
  }
}
