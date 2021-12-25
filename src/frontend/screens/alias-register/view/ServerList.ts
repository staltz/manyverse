// SPDX-FileCopyrightText: 2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {h} from '@cycle/react';
import {PureComponent} from 'react';
import {FlatList, Text, StyleSheet, Platform} from 'react-native';
import {t} from '../../../drivers/localization';
import {Dimensions} from '../../../global-styles/dimens';
import {Palette} from '../../../global-styles/palette';
import {Typography} from '../../../global-styles/typography';
import {PeerKV} from '../../../ssb/types';
import ServerItem from './ServerItem';

const styles = StyleSheet.create({
  header: {
    paddingVertical: Dimensions.verticalSpaceBig,
    paddingHorizontal: Dimensions.horizontalSpaceBig,
    fontSize: Typography.fontSizeNormal,
    lineHeight: Typography.lineHeightNormal,
    color: Palette.textWeak,
    ...Platform.select({
      web: {
        fontFamily: Typography.fontFamilyReadableText,
      },
    }),
  },
});

export default class ServerList extends PureComponent<{
  servers: Array<PeerKV>;
  onPressServer?: (event: {roomId: string; host: string}) => void;
}> {
  public render() {
    const {onPressServer, servers} = this.props;
    return h(FlatList, {
      ListHeaderComponent: h(
        Text,
        {style: styles.header},
        t('register_alias.header.description'),
      ),
      data: servers,
      keyExtractor: ([addr, _data]: PeerKV) => addr,
      renderItem: ({item}: any) => {
        const [, data] = item as PeerKV;
        return h(ServerItem, {
          peer: item,
          onPress: () => {
            onPressServer?.({roomId: data.key!, host: data.name!});
          },
        });
      },
    });
  }
}
