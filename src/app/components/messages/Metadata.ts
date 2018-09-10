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

import {Component} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {h} from '@cycle/react';
import {Palette} from '../../global-styles/palette';
import {Typography} from '../../global-styles/typography';

export const styles = StyleSheet.create({
  metadataBox: {
    flex: 1,
    backgroundColor: Palette.brand.darkVoidBackground,
    padding: 5,
    borderRadius: 2,
  },

  metadataText: {
    fontSize: Typography.fontSizeSmall,
    color: Palette.brand.darkText,
    fontFamily: Typography.fontFamilyMonospace,
  },
});

export default class Metadata extends Component<{msg: any}> {
  public render() {
    const {msg} = this.props;
    return h(View, {style: styles.metadataBox}, [
      h(Text, {style: styles.metadataText}, JSON.stringify(msg, null, 2)),
    ]);
  }
}
