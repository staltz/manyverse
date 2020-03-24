/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Stream} from 'xstream';
import {PureComponent, ReactElement} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableNativeFeedback,
  Platform,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {h} from '@cycle/react';
import {styles} from './styles';
import {State} from './model';
import {Dimensions} from '../../global-styles/dimens';
import {Palette} from '../../global-styles/palette';
import Avatar from '../../components/Avatar';

const Touchable = Platform.select<any>({
  android: TouchableNativeFeedback,
  default: TouchableOpacity,
});

function renderName(name?: string) {
  const namelessStyle = !name ? styles.noAuthorName : null;
  return h(
    Text,
    {
      style: [styles.authorName, namelessStyle],
      numberOfLines: 1,
      ellipsizeMode: 'middle',
    },
    name ?? 'No name',
  );
}

type MenuItemProps = {
  icon: string;
  text: string;
  onPress?: () => void;
  accessible?: boolean;
  accessibilityLabel?: string;
};

class MenuItem extends PureComponent<MenuItemProps> {
  public render() {
    const {icon, text, accessibilityLabel, accessible} = this.props;
    const touchableProps: any = {
      onPress: () => {
        this.props.onPress?.();
      },
      accessible,
      accessibilityLabel,
    };
    if (Platform.OS === 'android') {
      touchableProps.background = TouchableNativeFeedback.Ripple(
        Palette.backgroundVoid,
      );
    }

    return h(Touchable, touchableProps, [
      h(View, {style: styles.menuItemContainer, pointerEvents: 'box-only'}, [
        h(Icon, {
          size: Dimensions.iconSizeNormal,
          color: Palette.textWeak,
          name: icon,
        }),
        h(Text, {style: styles.menuItemText}, text),
      ]),
    ]);
  }
}

export default function view(state$: Stream<State>): Stream<ReactElement<any>> {
  return state$.map(state =>
    h(View, {style: styles.container}, [
      h(View, {style: styles.header}, [
        h(Avatar, {
          style: styles.authorImage,
          size: Dimensions.avatarSizeNormal,
          backgroundColor: Palette.backgroundBrandStrong,
          url: state.avatarUrl,
        }),
        renderName(state.name),
        h(
          Text,
          {style: styles.authorId, numberOfLines: 1, ellipsizeMode: 'middle'},
          state.selfFeedId,
        ),
      ]),
      h(ScrollView, {style: null}, [
        h(MenuItem, {
          sel: 'self-profile',
          icon: 'account-circle',
          text: 'My profile',
          accessible: true,
          accessibilityLabel: 'My Profile Menu Item',
        }),
        h(MenuItem, {
          sel: 'raw-db',
          icon: 'database',
          text: 'Raw database',
          accessible: true,
          accessibilityLabel: 'Show Raw Database',
        }),
        h(MenuItem, {
          sel: 'bug-report',
          icon: 'email-alert',
          text: 'Email bug report',
          accessible: true,
          accessibilityLabel: 'Email Bug Report',
        }),
        h(MenuItem, {
          sel: 'settings',
          icon: 'settings',
          text: 'Settings',
          accessible: true,
          accessibilityLabel: 'Settings',
        }),
      ]),
    ]),
  );
}
