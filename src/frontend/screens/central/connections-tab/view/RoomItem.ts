/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {PureComponent} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import {h} from '@cycle/react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Palette} from '../../../../global-styles/palette';
import {Dimensions} from '../../../../global-styles/dimens';
import {Typography} from '../../../../global-styles/typography';
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
    flex: 1,
    alignSelf: 'stretch',
    backgroundColor: Palette.backgroundText,
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
    fontWeight: 'bold',
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.text,
    marginLeft: Dimensions.horizontalSpaceTiny,
    minWidth: 120,
    flex: 1,
  },

  modeText: {
    fontSize: Typography.fontSizeSmall,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.textWeak,
    marginHorizontal: Dimensions.horizontalSpaceTiny,
  },

  onlineCount: {
    fontSize: Typography.fontSizeNormal,
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

export type Props = {
  room: RoomKV;
  onPressRoom?: (peer: RoomKV) => void;
};

export default class RoomItem extends PureComponent<Props> {
  public render() {
    const [addr, data] = this.props.room;

    return h(
      TouchableOpacity,
      {
        ['key' as any]: addr,
        onPress: () => {
          if (this.props.onPressRoom) {
            this.props.onPressRoom([addr, data]);
          }
        },
        style: styles.itemContainer,
        activeOpacity: 0.5,
      },
      [
        h(View, {style: styles.item}, [
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
                      ? '(only you online)'
                      : `(${data.onlineCount - 1} online)`,
                  )
                : (null as any),
            ]),
          ]),
        ]),
      ],
    );
  }
}
