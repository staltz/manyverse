/**
 * Manyverse is a mobile app for Secure Scuttlebutt networks
 *
 * Copyright (C) 2017 Andre 'Staltz' Medeiros
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import {Stream} from 'xstream';
import {PureComponent, ReactElement} from 'react';
import {View, Text, ScrollView, TouchableNativeFeedback} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {h} from '@cycle/react';
import {styles} from './styles';
import {State} from './model';
import {Dimensions} from '../../global-styles/dimens';
import {Palette} from '../../global-styles/palette';
import Avatar from '../../components/Avatar';

function renderName(name?: string) {
  const namelessStyle = !name ? styles.noAuthorName : null;
  return h(
    Text,
    {
      style: [styles.authorName, namelessStyle],
      numberOfLines: 1,
      ellipsizeMode: 'middle',
    },
    name || 'No name',
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
    const {icon, text, onPress, accessibilityLabel, accessible} = this.props;
    const touchableProps = {
      background: TouchableNativeFeedback.Ripple(Palette.gray2),
      onPress: () => {
        if (onPress) onPress();
      },
      accessible,
      accessibilityLabel,
    };

    return h(TouchableNativeFeedback, touchableProps, [
      h(View, {style: styles.menuItemContainer}, [
        h(Icon, {
          size: Dimensions.iconSizeNormal,
          color: Palette.brand.textWeak,
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
          backgroundColor: Palette.indigo9,
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
          sel: 'bug-report',
          icon: 'email',
          text: 'Email bug report',
          accessible: true,
          accessibilityLabel: 'Email Bug Report',
        }),
        h(MenuItem, {
          sel: 'raw-db',
          icon: 'database',
          text: 'Raw database',
          accessible: true,
          accessibilityLabel: 'Show Raw Database',
        }),
        h(MenuItem, {
          sel: 'about',
          icon: 'information',
          text: 'About Manyverse',
          accessible: true,
          accessibilityLabel: 'About This App',
        }),
      ]),
    ]),
  );
}
