// SPDX-FileCopyrightText: 2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {h} from '@cycle/react';
import {Component} from 'react';
import {StyleProp, ViewStyle} from 'react-native';
import {t} from '../../drivers/localization';
import TabIcon from './TabIcon';

export default class PrivateTabIcon extends Component<{
  isSelected: boolean;
  numOfUpdates: number;
  style?: StyleProp<ViewStyle>;
}> {
  public shouldComponentUpdate(nextProps: PrivateTabIcon['props']) {
    const prevProps = this.props;
    if (nextProps.isSelected !== prevProps.isSelected) return true;
    // numOfPrivateUpdates has one threshold: >=1
    const nextNum = nextProps.numOfUpdates;
    const prevNum = prevProps.numOfUpdates;
    if (prevNum === nextNum) return false;
    if (prevNum < 1 && nextNum >= 1) return true;
    if (prevNum >= 1 && nextNum < 1) return true;
    return false;
  }

  public render() {
    const {isSelected, numOfUpdates, style} = this.props;

    return h(TabIcon, {
      style,
      isSelected,
      sel: 'private-tab-button',
      iconName: numOfUpdates >= 1 ? 'message-text-outline' : 'message-outline',
      label: t('central.tab_footers.private'),
      accessibilityLabel: t('central.tabs.private.accessibility_label'),
    });
  }
}
