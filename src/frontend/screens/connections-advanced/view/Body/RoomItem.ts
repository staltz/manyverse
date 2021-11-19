// SPDX-FileCopyrightText: 2018-2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {h} from '@cycle/react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Palette} from '../../../../global-styles/palette';
import {Dimensions} from '../../../../global-styles/dimens';
import {Typography} from '../../../../global-styles/typography';
import {t} from '../../../../drivers/localization';
import {PeerKV} from '../../../../ssb/types';
import {peerModeIcon, peerModeName} from './utils';

const dotStyle: ViewStyle = {
  width: 11,
  height: 11,
  borderRadius: 6,
  borderColor: Palette.backgroundText,
  borderWidth: 1,
  marginTop: 5,
  marginLeft: 3.5,
  marginRight: Dimensions.horizontalSpaceTiny,
};

export const styles = StyleSheet.create({
  itemContainer: {
    alignSelf: 'stretch',
    backgroundColor: Palette.backgroundText,
    ...Platform.select({
      web: {
        maxWidth: Dimensions.desktopMiddleWidth.vw,
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

  details: {
    flexDirection: 'column',
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'space-around',
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  name: {
    fontSize: Typography.fontSizeNormal,
    lineHeight: Typography.lineHeightNormal,
    fontFamily: Typography.fontFamilyReadableText,
    fontWeight: 'bold',
    color: Palette.text,
    marginLeft: Dimensions.horizontalSpaceTiny,
    minWidth: 120,
    flex: 1,
  },

  modeText: {
    fontSize: Typography.fontSizeSmall,
    lineHeight: Typography.lineHeightSmall,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.textWeak,
    marginHorizontal: Dimensions.horizontalSpaceTiny,
  },

  onlineCount: {
    fontSize: Typography.fontSizeNormal,
    lineHeight: Typography.lineHeightNormal,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.textWeak,
  },
});

type RoomData = {
  key: PeerKV[1]['key'];
  state: PeerKV[1]['state'];
  type: 'room';
  pool: 'hub';
  name?: string;
  onlineCount?: number;
};

type RoomKV = [string, RoomData];

export default class RoomItem extends Component<{
  room: RoomKV;
  onPressRoom?: (peer: RoomKV) => void;
}> {
  public shouldComponentUpdate(nextProps: RoomItem['props']) {
    const prevProps = this.props;
    const [nextAddr, nextData] = nextProps.room;
    const [prevAddr, prevData] = prevProps.room;
    if (nextProps.onPressRoom !== prevProps.onPressRoom) return true;
    if (nextAddr !== prevAddr) return true;
    if (nextData.state !== prevData.state) return true;
    if (nextData.onlineCount !== prevData.onlineCount) return true;
    if (nextData.key !== prevData.key) return true;
    if (nextData.type !== prevData.type) return true;
    if (nextData.state !== prevData.state) return true;
    if (nextData.name !== prevData.name) return true;
    if (nextData.type !== prevData.type) return true;
    return false;
  }

  public render() {
    const {room} = this.props;
    const [addr, data] = room;

    return h(
      TouchableOpacity,
      {
        key: addr,
        onPress: () => {
          if (this.props.onPressRoom) {
            this.props.onPressRoom([addr, data]);
          }
        },
        style: styles.itemContainer,
        activeOpacity: 0.5,
      },
      [
        h(View, {style: styles.item, pointerEvents: 'box-only'}, [
          h(View, {style: styles.details}, [
            h(View, {style: styles.row}, [
              h(View, {
                style:
                  data.state === 'connected'
                    ? styles.connectedDot
                    : data.state === 'disconnecting'
                    ? styles.disconnectingDot
                    : styles.connectingDot,
              }),
              h(Icon, {
                size: Dimensions.iconSizeSmall,
                color: Palette.textWeak,
                name: peerModeIcon(data as any),
              }),
              h(
                Text,
                {
                  numberOfLines: 1,
                  ellipsizeMode: 'tail',
                  style: styles.name,
                },
                peerModeName(addr, data),
              ),
              typeof data.onlineCount === 'number'
                ? h(
                    Text,
                    {style: styles.onlineCount},
                    data.onlineCount <= 1
                      ? t('connections.peers.types.room.alone_online')
                      : t('connections.peers.types.room.others_online', {
                          count: data.onlineCount - 1,
                        }),
                  )
                : null,
            ]),
          ]),
        ]),
      ],
    );
  }
}
