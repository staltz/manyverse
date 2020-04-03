/* Copyright (C) 2018-2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {PureComponent} from 'react';
import {h} from '@cycle/react';
import {
  Text,
  View,
  TouchableNativeFeedback,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from 'react-native';
import {FeedId} from 'ssb-typescript';
import {Dimensions} from '../global-styles/dimens';
import {Palette} from '../global-styles/palette';
import {Typography} from '../global-styles/typography';
import Avatar from './Avatar';
import React = require('react');
import {displayName} from '../ssb/utils/from-ssb';

const Touchable = Platform.select<any>({
  android: TouchableNativeFeedback,
  default: TouchableOpacity,
});

export const styles = StyleSheet.create({
  row: {
    flex: 1,
    backgroundColor: Palette.backgroundText,
    paddingHorizontal: Dimensions.horizontalSpaceBig,
    paddingVertical: Dimensions.verticalSpaceBig,
    marginBottom: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    marginRight: Dimensions.horizontalSpaceSmall,
  },

  authorColumn: {
    flexDirection: 'column',
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'space-around',
  },

  authorName: {
    fontSize: Typography.fontSizeNormal,
    fontWeight: 'bold',
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.text,
    minWidth: 120,
  },

  reaction: {
    fontSize: Typography.fontSizeLarge,
    lineHeight: Typography.fontSizeLarge * 1.15,
  },
});

type AccountProps = {
  id: string;
  name?: string;
  imageUrl?: string;
  reaction?: string;
  onPress?: () => void;
};

class Account extends PureComponent<AccountProps> {
  public render() {
    const {id, name, imageUrl, reaction, onPress} = this.props;

    const touchableProps: any = {
      onPress,
    };
    if (Platform.OS === 'android') {
      touchableProps.background = TouchableNativeFeedback.SelectableBackground();
    }

    const authorNameText = h(
      Text,
      {
        numberOfLines: 1,
        ellipsizeMode: 'middle',
        style: styles.authorName,
      },
      displayName(name, id),
    );

    return h(
      View,
      {
        accessibilityLabel: 'Link To Account',
      },
      [
        h(Touchable, touchableProps, [
          h(View, {style: styles.row, pointerEvents: 'box-only'}, [
            h(Avatar, {
              url: imageUrl,
              size: Dimensions.avatarSizeNormal,
              style: styles.avatar,
            }),
            h(View, {style: styles.authorColumn}, [authorNameText]),

            h(Text, {style: styles.reaction}, reaction),
          ]),
        ]),
      ],
    );
  }
}

export type Props = {
  accounts: Array<{
    name?: string;
    imageUrl?: string;
    id: string;
    reaction?: string;
  }>;
  onPressAccount?: (ev: {id: FeedId; name: string}) => void;
};

export default class AccountsList extends PureComponent<Props> {
  public render() {
    const {onPressAccount} = this.props;
    return h(
      React.Fragment,
      this.props.accounts.map(({id, name, imageUrl, reaction}) =>
        h<AccountProps>(Account, {
          key: id,
          id,
          name,
          imageUrl,
          reaction,
          onPress: () => onPressAccount?.({id, name: displayName(name, id)}),
        }),
      ),
    );
  }
}
