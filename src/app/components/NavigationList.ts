/**
 * MMMMM is a mobile app for Secure Scuttlebutt networks
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

import {Component, ReactElement} from 'react';
import {
  View,
  TextStyle,
  Text,
  FlatList,
  TouchableNativeFeedback,
  TouchableHighlight,
  StyleProp,
  ViewStyle,
  StyleSheet,
} from 'react-native';
import {Dimensions} from '../global-styles/dimens';
import {Typography} from '../global-styles/typography';
import {Palette} from '../global-styles/palette';
import {h} from '@cycle/native-screen';

export type Props = {
  items: Array<NavigationListItem>;
};

export const styles = StyleSheet.create({
  container: {
    backgroundColor: Palette.brand.listBackground,
    width: '100%',
  },
  row: {
    width: '100%',
    flexDirection: 'row',
    flex: 1,
    alignItems: 'flex-start',
    backgroundColor: Palette.brand.textBackground,
    paddingLeft: Dimensions.horizontalSpaceBig,
    paddingRight: Dimensions.horizontalSpaceBig,
    paddingTop: Dimensions.verticalSpaceNormal,
    paddingBottom: Dimensions.verticalSpaceNormal,
    borderBottomColor: Palette.brand.voidBackground,
    borderBottomWidth: 1,
  },
  icon: {
    borderWidth: 0,
    width: 30,
  },
  item: {
    width: '70%',
    color: Palette.brand.text,
    paddingLeft: Dimensions.horizontalSpaceNormal,
    fontSize: Typography.fontSizeBig,
    fontFamily: Typography.fontFamilyReadableText,
  },
});
export type NavigationListItem = {
  icon: ReactElement<any>,
  text: string,
  targetSelector: string,
}

class NavigationListItemView extends Component<NavigationListItem, {}> {
  constructor(props: NavigationListItem) {
    super(props);
  }

  public render() {
    const {text, icon, targetSelector} = this.props;
    return h(
      TouchableHighlight,
      {
        selector: targetSelector,
        accessible: true,
        accessibilityLabel: text + " Button",
        underlayColor: Palette.brand.backgroundDarker,
      },
      [
        h(View, {style: styles.row}, [
          h(View, {style: styles.icon}, [icon]),
          h(Text, {style: styles.item}, text),
        ])
      ]
    );
  }
}

export default class NavigationList extends Component<Props, {}> {
  constructor(props: Props) {
    super(props);
  }

  public render() {
    const {items} = this.props;

    return h(FlatList, {
      data: items,
      style: styles.container as any,
      keyExtractor: (item: NavigationListItem, index: number) =>
        item.text || String(index),
      renderItem: ({item}: {item: NavigationListItem}) =>
        h(NavigationListItemView, {...item}),
    });
  }
}
