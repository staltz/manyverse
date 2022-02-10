// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  Platform,
} from 'react-native';
import {h} from '@cycle/react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Palette} from '~frontend/global-styles/palette';
import {Dimensions} from '~frontend/global-styles/dimens';
import {Typography} from '~frontend/global-styles/typography';
import Avatar from '~frontend/components/Avatar';
import {PeerKV} from '~frontend/ssb/types';
import {peerModeName, peerModeIcon, peerModeDescription} from './utils';

const dotStyle: ViewStyle = {
  width: 11,
  height: 11,
  position: 'absolute',
  bottom: 18.8,
  left: 52.65,
  borderRadius: 6,
  borderColor: Palette.backgroundText,
  borderWidth: 1,
};

export const styles = StyleSheet.create({
  itemContainer: {
    alignSelf: 'stretch',
    backgroundColor: Palette.backgroundText,
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

  connectedDot: {
    ...dotStyle,
    backgroundColor: Palette.backgroundPeerConnected,
  },

  connectingDot: {
    ...dotStyle,
    backgroundColor: Palette.backgroundPeerConnecting,
  },

  disconnectingDot: {
    ...dotStyle,
    backgroundColor: Palette.backgroundPeerDisconnecting,
  },

  avatar: {
    marginRight: Dimensions.horizontalSpaceSmall,
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

  mode: {
    flexDirection: 'row',
  },

  modeText: {
    fontSize: Typography.fontSizeSmall,
    lineHeight: Typography.lineHeightSmall,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.textWeak,
    marginLeft: Dimensions.horizontalSpaceTiny,
  },
});

export default class ConnectionsItem extends Component<{
  peer: PeerKV;
  onPressPeer?: (peer: PeerKV) => void;
}> {
  public shouldComponentUpdate(nextProps: ConnectionsItem['props']) {
    const prevProps = this.props;
    const [nextAddr, nextData] = nextProps.peer;
    const [prevAddr, prevData] = prevProps.peer;
    if (nextProps.onPressPeer !== prevProps.onPressPeer) return true;
    if (nextAddr !== prevAddr) return true;
    if (nextData.imageUrl !== prevData.imageUrl) return true;
    if (nextData.state !== prevData.state) return true;
    if (nextData.key !== prevData.key) return true;
    if (nextData.name !== prevData.name) return true;
    if (nextData.type !== prevData.type) return true;
    if (nextData.inferredType !== prevData.inferredType) return true;
    if (nextData.source !== prevData.source) return true;
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
          if (this.props.onPressPeer) {
            this.props.onPressPeer([addr, data]);
          }
        },
        style: styles.itemContainer,
        activeOpacity: 0.5,
      },
      [
        h(View, {style: styles.item, pointerEvents: 'box-only'}, [
          h(Avatar, {
            size: Dimensions.avatarSizeNormal,
            url: data['imageUrl' as any],
            style: styles.avatar,
          }),
          h(View, {
            style:
              data.state === 'connected'
                ? styles.connectedDot
                : data.state === 'disconnecting'
                ? styles.disconnectingDot
                : styles.connectingDot,
          }),
          h(View, {style: styles.details}, [
            h(
              Text,
              {numberOfLines: 1, ellipsizeMode: 'middle', style: styles.name},
              peerModeName(addr, data),
            ),
            h(View, {style: styles.mode}, [
              h(Icon, {
                size: Dimensions.iconSizeSmall,
                color: Palette.textWeak,
                name: peerModeIcon(data),
              }),
              h(Text, {style: styles.modeText}, peerModeDescription(data)),
            ]),
          ]),
        ]),
      ],
    );
  }
}
