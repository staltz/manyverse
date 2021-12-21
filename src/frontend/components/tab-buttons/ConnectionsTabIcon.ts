// SPDX-FileCopyrightText: 2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {h} from '@cycle/react';
import {Component} from 'react';
import {StyleProp, ViewStyle} from 'react-native';
import {t} from '../../drivers/localization';
import {Palette} from '../../global-styles/palette';
import TabIcon from './TabIcon';

type Status = 'good' | 'fair' | 'bad' | 'offline';

function getColorForStatus(status: Status) {
  switch (status) {
    case 'good':
    case 'offline':
      return undefined;
    case 'fair':
      return Palette.textWarning;
    case 'bad':
      return Palette.textNegative;
  }
}

function isNegativeStatus(status: Status) {
  return status === 'bad' || status === 'fair';
}

export default class ConnectionsTabIcon extends Component<
  {
    isSelected: boolean;
    status: Status;
    allowWarningColors: boolean;
    style?: StyleProp<ViewStyle>;
  },
  {colorOverride?: string}
> {
  state = {colorOverride: undefined};

  static TIMER_PERIOD = 10e3;

  private colorTimer: number | null = null;

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
    const {allowWarningColors, status} = this.props;

    if (allowWarningColors && isNegativeStatus(status)) {
      this.colorTimer = setTimeout(() => {
        const colorOverride = getColorForStatus(status);
        this.setState({colorOverride});
      }, ConnectionsTabIcon.TIMER_PERIOD);
    }
  }

  public componentDidUpdate() {
    const {allowWarningColors, status} = this.props;

    if (allowWarningColors) {
      if (isNegativeStatus(status)) {
        if (!this.colorTimer) {
          this.setState({colorOverride: undefined});
          this.colorTimer = setTimeout(() => {
            const colorOverride = getColorForStatus(this.props.status);
            this.setState({colorOverride});
          }, ConnectionsTabIcon.TIMER_PERIOD);
        } else if (this.state.colorOverride) {
          const colorOverride = getColorForStatus(this.props.status);
          this.setState({colorOverride});
        }
      } else {
        if (this.colorTimer) clearTimeout(this.colorTimer);
        this.colorTimer = null;
        this.setState({colorOverride: undefined});
      }
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
