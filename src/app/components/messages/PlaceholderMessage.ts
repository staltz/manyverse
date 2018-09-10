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

import {PureComponent} from 'react';
import {View, StyleSheet} from 'react-native';
import {h} from '@cycle/react';
import MessageContainer from './MessageContainer';
import {Palette} from '../../global-styles/palette';
import {Dimensions} from '../../global-styles/dimens';

export const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    flex: 1,
  },

  headerAvatar: {
    height: Dimensions.avatarSizeNormal,
    width: Dimensions.avatarSizeNormal,
    borderRadius: Math.ceil(Dimensions.avatarSizeNormal * 0.5),
    backgroundColor: Palette.gray1,
    marginRight: Dimensions.horizontalSpaceSmall,
    marginBottom: Dimensions.verticalSpaceSmall,
  },

  headerAuthorColumn: {
    flexDirection: 'column',
    flex: 1,
  },

  headerAuthorName: {
    width: 150,
    height: 16,
    marginTop: 3,
    marginBottom: 10,
    backgroundColor: Palette.gray1,
  },

  headerTimestamp: {
    width: 60,
    height: 16,
    backgroundColor: Palette.gray1,
  },

  body: {
    width: 250,
    height: 16,
    marginTop: 10,
    marginBottom: 6,
    backgroundColor: Palette.gray1,
  },

  footer: {
    flexDirection: 'row',
    flex: 1,
  },

  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Dimensions.verticalSpaceSmall + 6,
    paddingBottom: Dimensions.verticalSpaceBig,
    paddingLeft: 1,
    paddingRight: Dimensions.horizontalSpaceBig,
    marginRight: 3,
    marginBottom: -Dimensions.verticalSpaceBig,
  },

  footerButtonIcon: {
    height: 20,
    width: 20,
    borderRadius: 5,
    backgroundColor: Palette.gray1,
  },

  footerButtonLabel: {
    marginLeft: Dimensions.horizontalSpaceSmall,
    width: 34,
    height: Dimensions.verticalSpaceBig,
    backgroundColor: Palette.gray1,
  },
});

class PlaceholderHeader extends PureComponent<{}> {
  public render() {
    return h(View, {style: styles.headerRow}, [
      h(View, {style: styles.headerAvatar}),
      h(View, {style: styles.headerAuthorColumn}, [
        h(View, {
          style: styles.headerAuthorName,
        }),
        h(View, {
          style: styles.headerTimestamp,
        }),
      ]),
    ]);
  }
}

class PlaceholderFooter extends PureComponent<{}> {
  public render() {
    return h(View, {style: styles.footer}, [
      h(View, {style: styles.footerButton}, [
        h(View, {style: styles.footerButtonIcon}),
        h(View, {style: styles.footerButtonLabel}),
      ]),
      h(View, {style: styles.footerButton}, [
        h(View, {style: styles.footerButtonIcon}),
        h(View, {style: styles.footerButtonLabel}),
      ]),
    ]);
  }
}

export default class PlaceholderMessage extends PureComponent<{}> {
  public render() {
    return h(MessageContainer, [
      h(PlaceholderHeader),
      h(View, {style: styles.body}),
      h(PlaceholderFooter),
    ]);
  }
}
