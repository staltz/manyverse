// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Component} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Platform} from 'react-native';
import {h} from '@cycle/react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Palette} from '../../../../global-styles/palette';
import {Dimensions} from '../../../../global-styles/dimens';
import {Typography} from '../../../../global-styles/typography';
import {StagedPeerKV} from '../../../../ssb/types';
import {peerModeName, peerModeIcon, peerModeDescription} from './utils';

export const styles = StyleSheet.create({
  itemContainer: {
    alignSelf: 'stretch',
    backgroundColor: Palette.backgroundTextWeak,
    ...Platform.select({
      web: {
        width: Dimensions.desktopMiddleWidth.px,
      },
    }),
  },

  item: {
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
    backgroundColor: Palette.isDarkTheme
      ? Palette.voidWeak
      : Palette.backgroundText,
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
    fontFamily: Typography.fontFamilyReadableText,
    fontWeight: 'bold',
    color: Palette.text,
    minWidth: 120,
  },

  modeText: {
    fontSize: Typography.fontSizeSmall,
    lineHeight: Typography.lineHeightSmall,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.textWeak,
  },
});

export default class StagedItem extends Component<{
  peer: StagedPeerKV;
  onPressStaged?: (peer: StagedPeerKV) => void;
}> {
  public shouldComponentUpdate(nextProps: StagedItem['props']) {
    const prevProps = this.props;
    const [nextAddr, nextData] = nextProps.peer;
    const [prevAddr, prevData] = prevProps.peer;
    if (nextProps.onPressStaged !== prevProps.onPressStaged) return true;
    if (nextAddr !== prevAddr) return true;
    if (nextData.key !== prevData.key) return true;
    if (nextData.type !== prevData.type) return true;
    return false;
  }

  public render() {
    const {peer} = this.props;
    const [addr, data] = peer;

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
              color: Palette.isDarkTheme
                ? Palette.voidStronger
                : Palette.voidStrong,
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
            h(Text, {style: styles.modeText}, peerModeDescription(data)),
          ]),
        ]),
      ],
    );
  }
}
