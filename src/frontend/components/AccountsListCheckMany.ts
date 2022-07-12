// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {PureComponent, Fragment} from 'react';
import {h} from '@cycle/react';
import {
  Text,
  View,
  TouchableNativeFeedback,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {FeedId} from 'ssb-typescript';
import {t} from '~frontend/drivers/localization';
import {Dimensions} from '~frontend/global-styles/dimens';
import {Palette} from '~frontend/global-styles/palette';
import {Typography} from '~frontend/global-styles/typography';
import Avatar from './Avatar';

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
    ...Platform.select({
      web: {
        width: Dimensions.desktopMiddleWidth.px,
        maxWidth: Dimensions.desktopMiddleWidth.px,
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

  authorId: {
    fontSize: Typography.fontSizeSmall,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.textWeak,
    minWidth: 120,
  },
});

interface AccountProps {
  name: string;
  imageUrl?: string;
  id: string;
  isChecked: boolean;
  onPress?: () => void;
}

class Account extends PureComponent<AccountProps> {
  public render() {
    const {name, imageUrl, onPress, isChecked, id} = this.props;

    const touchableProps: any = {
      onPress,
      pointerEvents: 'box-only',
    };
    if (Platform.OS === 'android') {
      touchableProps.background =
        TouchableNativeFeedback.SelectableBackground();
    }

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
          h(View, {style: styles.row}, [
            h(Avatar, {
              url: imageUrl,
              size: Dimensions.avatarSizeNormal,
              style: styles.avatar,
            }),
            h(View, {style: styles.authorColumn}, [
              h(
                Text,
                {
                  numberOfLines: 1,
                  ellipsizeMode: 'middle',
                  style: styles.authorName,
                },
                name || id,
              ),
              !!name
                ? h(
                    Text,
                    {
                      numberOfLines: 1,
                      ellipsizeMode: 'middle',
                      style: styles.authorId,
                    },
                    id,
                  )
                : null,
            ]),
            isChecked
              ? h(Icon, {
                  size: Dimensions.iconSizeNormal,
                  color: Palette.backgroundCTA,
                  name: 'check-circle',
                })
              : null,
          ]),
        ]),
      ],
    );
  }
}

export interface Props {
  accounts: Array<{name: string; imageUrl: string; id: string}>;
  onUpdated?: (ev: Props['accounts']) => void;
  onMaxReached?: () => void;
  maximumCheckable?: number;
}

interface State {
  checked: Props['accounts'];
}

export default class AccountsListCheckMany extends PureComponent<Props, State> {
  public state = {checked: []} as State;

  private getDisplayAccounts() {
    const {accounts} = this.props;
    const {checked} = this.state;
    const displayAccounts: typeof accounts = [];
    let checkSet: Set<FeedId> | undefined = new Set<FeedId>();
    for (const a of checked) {
      checkSet.add(a.id);
      if (accounts.findIndex((x) => x.id === a.id) === -1) {
        (a as any)._retained = true;
        displayAccounts.push(a);
      }
    }
    for (const a of accounts) {
      (a as any)._retained = checkSet.has(a.id);
      displayAccounts.push(a);
    }
    checkSet.clear();
    checkSet = void 0;
    return displayAccounts;
  }

  public render() {
    const {onUpdated, maximumCheckable} = this.props;
    const {checked} = this.state;
    const max = maximumCheckable ?? Infinity;
    const displayAccounts = this.getDisplayAccounts();

    return h(
      Fragment,
      displayAccounts.map((account) => {
        const {id, name, imageUrl} = account;
        const isChecked = (account as any)._retained;
        return h<AccountProps>(Account, {
          key: id,
          name,
          imageUrl,
          id,
          isChecked,
          onPress: () => {
            if (isChecked) {
              const newChecked = checked.filter((x) => x.id !== id);
              this.setState({checked: newChecked});
              onUpdated?.(newChecked);
            } else if (checked.length < max) {
              const newChecked = checked.concat([account]);
              this.setState({checked: newChecked});
              onUpdated?.(newChecked);
            } else {
              this.props.onMaxReached?.();
            }
          },
        });
      }),
    );
  }
}
