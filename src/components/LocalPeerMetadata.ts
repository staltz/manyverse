/**
 * MMMMM is a mobile app for Secure Scuttlebutt networks
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
import {View, Text, StyleSheet} from 'react-native';
import {h} from '@cycle/native-screen';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Palette} from '../global-styles/palette';
import {Dimensions} from '../global-styles/dimens';
import {Typography} from '../global-styles/typography';
import Beacon from './Beacon';
import {PeerMetadata} from '../types';

export const styles = StyleSheet.create({
  row: {
    backgroundColor: Palette.brand.darkContentBackground,
    paddingLeft: Dimensions.horizontalSpaceBig,
    paddingRight: Dimensions.horizontalSpaceBig,
    paddingTop: Dimensions.verticalSpaceBig,
    paddingBottom: Dimensions.verticalSpaceBig,
    flexDirection: 'row'
  },

  beacon: {
    marginTop: 8
  },

  summaryColumn: {
    marginLeft: Dimensions.horizontalSpaceNormal,
    marginRight: Dimensions.horizontalSpaceNormal,
    flexDirection: 'column',
    flex: 1,
    alignItems: 'stretch'
  },

  title: {
    color: Palette.brand.darkHighlight,
    fontSize: Typography.fontSizeBig,
    marginBottom: Dimensions.verticalSpaceSmall
  },

  subtitle: {
    color: Palette.brand.darkTextWeak,
    fontSize: Typography.fontSizeNormal
  }
});

export default class LocalPeerMetadata extends PureComponent<{
  peer: PeerMetadata;
}> {
  render() {
    const {peer} = this.props;
    return h(View, {style: styles.row}, [
      h(Beacon, {color: Palette.brand.darkHighlight, style: styles.beacon}),
      h(View, {style: styles.summaryColumn}, [
        h(
          Text,
          {style: styles.title, numberOfLines: 1, ellipsizeMode: 'middle'},
          peer.key
        ),
        h(Text, {style: styles.subtitle}, `${peer.host}:${peer.port}`)
      ]),
      h(Icon, {
        size: Dimensions.iconSizeNormal,
        color: Palette.brand.darkTextWeak,
        name: 'chevron-down'
      })
    ]);
  }
}
