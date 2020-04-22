/* Copyright (C) 2018-2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {PureComponent} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {h} from '@cycle/react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Palette} from '../../../../../global-styles/palette';
import {Dimensions} from '../../../../../global-styles/dimens';
import {Typography} from '../../../../../global-styles/typography';
import {StagedPeerKV} from '../../../../../ssb/types';
import {peerModeName, peerModeIcon, peerModeStagedDescription} from './utils';

export const styles = StyleSheet.create({
  itemContainer: {
    flex: 1,
    alignSelf: 'stretch',
    backgroundColor: Palette.backgroundTextBrand,
  },

  item: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    paddingHorizontal: Dimensions.horizontalSpaceBig,
    paddingVertical: Dimensions.verticalSpaceBig,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 1,
  },

  avatar: {
    marginRight: Dimensions.horizontalSpaceSmall,
    height: Dimensions.avatarSizeNormal,
    width: Dimensions.avatarSizeNormal,
    borderRadius: Dimensions.avatarSizeNormal * 0.5,
    backgroundColor: Palette.backgroundBrandWeakest,
    alignItems: 'center',
    justifyContent: 'center',
  },

  details: {
    flexDirection: 'column',
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'space-around',
  },

  name: {
    fontSize: Typography.fontSizeNormal,
    fontWeight: 'bold',
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.text,
    minWidth: 120,
  },

  modeText: {
    fontSize: Typography.fontSizeSmall,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.textWeak,
  },
});

export type Props = {
  peer: StagedPeerKV;
  onPressStaged?: (peer: StagedPeerKV) => void;
};

export default class StagedItem extends PureComponent<Props> {
  public render() {
    const [addr, data] = this.props.peer;

    return h(
      TouchableOpacity,
      {
        key: addr,
        onPress: () => {
          if (this.props.onPressStaged) {
            this.props.onPressStaged(this.props.peer);
          }
        },
        style: styles.itemContainer,
        activeOpacity: 0.5,
      },
      [
        h(View, {style: styles.item, pointerEvents: 'box-only'}, [
          h(View, {style: styles.avatar}, [
            h(Icon, {
              size: Dimensions.iconSizeNormal,
              color: Palette.backgroundBrandWeaker,
              name: peerModeIcon(data),
            }),
          ]),

          h(View, {style: styles.details}, [
            h(
              Text,
              {
                numberOfLines: 1,
                ellipsizeMode: 'middle',
                style: styles.name,
              },
              peerModeName(addr, data),
            ),
            h(Text, {style: styles.modeText}, peerModeStagedDescription(data)),
          ]),
        ]),
      ],
    );
  }
}
