/* Copyright (C) 2018-2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {PureComponent} from 'react';
import React = require('react');
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
import PullFlatList, {PullFlatListProps} from 'pull-flat-list';
import {displayName} from '../ssb/utils/from-ssb';
import {t} from '../drivers/localization';
import {GetReadable} from '../drivers/ssb';
import {Dimensions} from '../global-styles/dimens';
import {Palette} from '../global-styles/palette';
import {Typography} from '../global-styles/typography';
import Avatar from './Avatar';
import AnimatedLoading from './AnimatedLoading';

const Touchable = Platform.select<any>({
  android: TouchableNativeFeedback,
  default: TouchableOpacity,
});

export const styles = StyleSheet.create({
  flatList: {
    alignSelf: 'stretch',
    flex: 1,
  },

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
    fontFamily: Typography.fontFamilyReadableText,
    fontWeight: 'bold',
    color: Palette.text,
    minWidth: 120,
  },

  reaction: {
    fontSize: Typography.fontSizeLarge,
    lineHeight: Typography.lineHeightLarge,
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
        accessible: true,
        accessibilityRole: 'button',
        accessibilityLabel: t(
          'accounts.call_to_action.open_account.accessibility_label',
        ),
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

interface AboutWithReaction {
  name?: string;
  imageUrl?: string;
  id: string;
  reaction?: string;
}

export interface Props {
  accounts: Array<AboutWithReaction> | GetReadable<AboutWithReaction>;
  onPressAccount?: (ev: {id: FeedId; name: string}) => void;
}

interface State {
  loading: boolean;
}

export default class AccountsList extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {loading: true};
  }

  private _onPullingComplete = () => {
    this.setState({loading: false});
  };

  public render() {
    const {onPressAccount, accounts} = this.props;
    const {loading} = this.state;

    if (Array.isArray(accounts)) {
      return h(
        React.Fragment,
        accounts.map(({id, name, imageUrl, reaction}) =>
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
    } else {
      return h<PullFlatListProps<AboutWithReaction>>(PullFlatList, {
        getScrollStream: accounts,
        keyExtractor: (about: AboutWithReaction, idx: number) =>
          about.id ?? String(idx),
        style: styles.flatList,
        initialNumToRender: 14,
        pullAmount: 1,
        numColumns: 1,
        refreshable: true,
        onEndReachedThreshold: 5,
        refreshColors: [Palette.brandWeak],
        onPullingComplete: this._onPullingComplete,
        ListFooterComponent: loading
          ? h(AnimatedLoading, {text: t('central.loading')})
          : null,
        renderItem: ({item}) => {
          const {id, name, imageUrl, reaction} = item;
          return h<AccountProps>(Account, {
            key: item.id,
            id,
            name,
            imageUrl,
            reaction,
            onPress: () => onPressAccount?.({id, name: displayName(name, id)}),
          });
        },
      });
    }
  }
}
