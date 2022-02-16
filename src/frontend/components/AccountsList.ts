// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

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
import {displayName} from '~frontend/ssb/utils/from-ssb';
import {t} from '~frontend/drivers/localization';
import {GetReadable} from '~frontend/drivers/ssb';
import {Dimensions} from '~frontend/global-styles/dimens';
import {Palette} from '~frontend/global-styles/palette';
import {Typography} from '~frontend/global-styles/typography';
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
    ...Platform.select({
      web: {
        maxWidth: `calc(100vw - ${Dimensions.desktopSideWidth.px})`,
      },
    }),
  },

  touchableRow: {
    ...Platform.select({
      web: {
        width: Dimensions.desktopMiddleWidth.px,
      },
    }),
  },

  row: {
    flex: 1,
    backgroundColor: Palette.backgroundText,
    paddingHorizontal: Dimensions.horizontalSpaceBig,
    paddingVertical: Dimensions.verticalSpaceBig,
    marginBottom: 1,
    flexDirection: 'row',
    alignItems: 'center',
    ...Platform.select({
      web: {
        width: Dimensions.desktopMiddleWidth.px,
      },
    }),
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
    fontFamily: Platform.select({web: Typography.fontFamilyReadableText}),
    lineHeight: Typography.lineHeightLarge,
  },
});

interface AccountProps {
  id: string;
  name?: string;
  imageUrl?: string;
  reaction?: string;
  onPress?: () => void;
}

class Account extends PureComponent<AccountProps> {
  public render() {
    const {id, name, imageUrl, reaction, onPress} = this.props;

    const touchableProps: any = {
      onPress,
    };
    if (Platform.OS === 'android') {
      touchableProps.background =
        TouchableNativeFeedback.SelectableBackground();
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
        style: styles.touchableRow,
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
