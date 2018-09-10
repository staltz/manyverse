/**
 * Manyverse is a mobile app for Secure Scuttlebutt networks
 *
 * Copyright (C) 2017 Andre 'Staltz' Medeiros
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import {PureComponent} from 'react';
import {TouchableHighlight, StyleSheet} from 'react-native';
import {h} from '@cycle/react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const styles = StyleSheet.create({
  leftSide: {
    borderRadius: 18,
    padding: 6,
    marginLeft: -6,
  },

  rightSide: {
    borderRadius: 18,
    padding: 6,
    marginRight: -6,
  },
});

export type Props = {
  onPress?: () => void;
  color?: string;
  icon: string;
  accessibilityLabel: string;
  rightSide?: boolean;
};

export default class HeaderButton extends PureComponent<Props> {
  public render() {
    const {onPress, color, icon, accessibilityLabel, rightSide} = this.props;
    return h(
      TouchableHighlight,
      {
        style: rightSide ? styles.leftSide : styles.rightSide,
        onPress,
        hitSlop: {top: 8, bottom: 8, left: 8, right: 8},
        underlayColor: '#00000022',
      },
      [
        h(Icon, {
          size: 24,
          color: color || 'white',
          name: icon,
          accessible: true,
          accessibilityLabel,
        }),
      ],
    );
  }
}
