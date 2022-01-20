// SPDX-FileCopyrightText: 2021-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {h} from '@cycle/react';
import {PureComponent} from 'react';
import {
  ViewStyle,
  StyleSheet,
  Text,
  View,
  Platform,
  TouchableNativeFeedback,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Dimensions} from '../../../global-styles/dimens';
import {Palette} from '../../../global-styles/palette';
import {Typography} from '../../../global-styles/typography';
import {PeerKV} from '../../../ssb/types';

const dotStyle: ViewStyle = {
  width: 11,
  height: 11,
  borderRadius: 6,
  marginTop: 3,
  marginLeft: Dimensions.horizontalSpaceTiny,
  marginRight: Dimensions.horizontalSpaceSmall,
};

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingVertical: Dimensions.verticalSpaceNormal,
    paddingHorizontal: Dimensions.horizontalSpaceBig,
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

  invisibleDot: {
    ...dotStyle,
    backgroundColor: 'transparent',
  },

  name: {
    fontSize: Typography.fontSizeNormal,
    lineHeight: Typography.lineHeightNormal,
    fontFamily: Typography.fontFamilyReadableText,
    fontWeight: 'bold',
    color: Palette.text,
    marginLeft: Dimensions.horizontalSpaceSmall,
    minWidth: 120,
    flex: 1,
  },
});

const Touchable = Platform.select<any>({
  android: TouchableNativeFeedback,
  default: TouchableOpacity,
});

export default class ServerItem extends PureComponent<{
  peer: PeerKV;
  onPress: () => void;
}> {
  public render() {
    const {peer, onPress} = this.props;
    const [addr, data] = peer;

    const touchableProps: any = {onPress, pointerEvents: 'box-only'};
    if (Platform.OS === 'android') {
      touchableProps.background =
        TouchableNativeFeedback.SelectableBackground();
    }

    return h(Touchable, touchableProps, [
      h(View, {style: styles.itemContainer, pointerEvents: 'box-only'}, [
        h(View, {
          style:
            data.state === 'connected'
              ? styles.connectedDot
              : data.state === 'disconnecting'
              ? styles.disconnectingDot
              : data.state === 'connecting'
              ? styles.connectingDot
              : styles.invisibleDot,
        }),
        h(Icon, {
          size: Dimensions.iconSizeSmall,
          color: Palette.textWeak,
          name: 'server-network',
        }),
        h(
          Text,
          {
            numberOfLines: 1,
            ellipsizeMode: 'tail',
            style: styles.name,
          },
          data.name ?? addr,
        ),
      ]),
    ]);
  }
}
