/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {PureComponent} from 'react';
import {h} from '@cycle/react';
import {Text, View, TouchableNativeFeedback, StyleSheet} from 'react-native';
import {FeedId} from 'ssb-typescript';
import {Dimensions} from '../global-styles/dimens';
import {Palette} from '../global-styles/palette';
import {Typography} from '../global-styles/typography';
import Avatar from './Avatar';
import React = require('react');

export const styles = StyleSheet.create({
  row: {
    flex: 1,
    backgroundColor: Palette.backgroundText,
    paddingHorizontal: Dimensions.horizontalSpaceBig,
    paddingVertical: Dimensions.verticalSpaceBig,
    marginBottom: 1,
    flexDirection: 'row',
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

  msgType: {
    fontSize: Typography.fontSizeSmall,
    fontFamily: Typography.fontFamilyMonospace,
    backgroundColor: Palette.backgroundTextHacker,
    color: Palette.textHacker,
  },

  timestamp: {
    fontSize: Typography.fontSizeSmall,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.textWeak,
  },
});

type AccountProps = {
  name: string;
  imageUrl?: string;
  id: string;
  onPress?: () => void;
};

class Account extends PureComponent<AccountProps> {
  public render() {
    const {name, imageUrl, onPress} = this.props;
    const touchableProps = {
      background: TouchableNativeFeedback.SelectableBackground(),
      onPress,
    };

    const authorNameText = h(
      Text,
      {
        numberOfLines: 1,
        ellipsizeMode: 'middle',
        style: styles.authorName,
      },
      name,
    );

    return h(
      View,
      {
        accessibilityLabel: 'Link To Account',
      },
      [
        h(TouchableNativeFeedback, touchableProps, [
          h(View, {style: styles.row}, [
            h(Avatar, {
              url: imageUrl,
              size: Dimensions.avatarSizeNormal,
              style: styles.avatar,
            }),
            h(View, {style: styles.authorColumn}, [authorNameText]),
          ]),
        ]),
      ]
    );
  }
}

export type Props = {
  accounts: Array<{name: string; imageUrl: string; id: string}>;
  onPressAccount?: (ev: {id: FeedId}) => void;
};

export default class AccountsList extends PureComponent<Props> {
  public render() {
    const {onPressAccount} = this.props;
    return h(
      React.Fragment,
      this.props.accounts.map(({id, name, imageUrl}) =>
        h<AccountProps>(Account, {
          name,
          imageUrl,
          id,
          onPress: () => onPressAccount && onPressAccount({id}),
        }),
      ),
    );
  }
}
