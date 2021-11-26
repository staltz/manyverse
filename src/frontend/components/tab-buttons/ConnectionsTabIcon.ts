// SPDX-FileCopyrightText: 2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {h} from '@cycle/react';
import {Component} from 'react';
import {StyleProp, ViewStyle} from 'react-native';
import {t} from '../../drivers/localization';
import {Palette} from '../../global-styles/palette';
import TabIcon from './TabIcon';

export default class ConnectionsTabIcon extends Component<
  {
    isSelected: boolean;
    status: 'good' | 'fair' | 'bad' | 'offline';
    allowWarningColors: boolean;
    style?: StyleProp<ViewStyle>;
  },
  {colorOverride?: string}
> {
  state = {colorOverride: undefined};

  static TIMER_PERIOD = 10e3;

  private badTimer: NodeJS.Timeout | null = null;
  private fairTimer: NodeJS.Timeout | null = null;

  public shouldComponentUpdate(
    nextProps: ConnectionsTabIcon['props'],
    nextState: ConnectionsTabIcon['state'],
  ) {
    const prevProps = this.props;
    const prevState = this.state;
    if (nextProps.isSelected !== prevProps.isSelected) return true;
    if (nextProps.status !== prevProps.status) return true;
    if (nextProps.allowWarningColors !== prevProps.allowWarningColors)
      return true;
    if (nextState.colorOverride !== prevState.colorOverride) return true;
    return false;
  }

  public componentDidMount() {
    if (this.props.allowWarningColors) {
      this.badTimer = setTimeout(() => {
        if (this.props.status === 'bad') {
          this.setState({colorOverride: Palette.textNegative});
        } else {
          this.badTimer = null;
        }
      }, ConnectionsTabIcon.TIMER_PERIOD);
    }

    if (this.props.allowWarningColors) {
      this.fairTimer = setTimeout(() => {
        if (this.props.status === 'fair') {
          this.setState({colorOverride: Palette.textWarning});
        } else {
          this.fairTimer = null;
        }
      }, ConnectionsTabIcon.TIMER_PERIOD);
    }
  }

  public componentDidUpdate() {
    const {status, allowWarningColors} = this.props;
    if (status === 'bad' && allowWarningColors) {
      if (this.fairTimer) clearTimeout(this.fairTimer);
      this.fairTimer = null;
      if (!this.badTimer) {
        this.setState({colorOverride: undefined});
        this.badTimer = setTimeout(() => {
          this.setState({colorOverride: Palette.textNegative});
        }, ConnectionsTabIcon.TIMER_PERIOD);
      }
    } else if (status === 'fair' && allowWarningColors) {
      if (this.badTimer) clearTimeout(this.badTimer);
      this.badTimer = null;
      if (!this.fairTimer) {
        this.setState({colorOverride: undefined});
        this.fairTimer = setTimeout(() => {
          this.setState({colorOverride: Palette.textWarning});
        }, ConnectionsTabIcon.TIMER_PERIOD);
      }
    } else {
      if (this.fairTimer) clearTimeout(this.fairTimer);
      this.fairTimer = null;
      if (this.badTimer) clearTimeout(this.badTimer);
      this.badTimer = null;
      this.setState({colorOverride: undefined});
    }
  }

  private getIconName() {
    const {status} = this.props;
    switch (status) {
      case 'offline':
        return 'circle-medium';
      case 'bad':
        return 'speedometer-slow';
      case 'fair':
        return 'speedometer-medium';
      case 'good':
        return 'speedometer';
    }
  }

  public render() {
    const {isSelected, style} = this.props;

    return h(TabIcon, {
      style,
      isSelected,
      sel: 'connections-tab-button',
      iconName: this.getIconName(),
      iconColorOverride: !isSelected ? this.state.colorOverride : undefined,
      label: t('central.tab_footers.connections'),
      accessibilityLabel: t('central.tabs.connections.accessibility_label'),
    });
  }
}
