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

import {PureComponent} from 'react';
import {View, StyleSheet} from 'react-native';
import {h} from '@cycle/native-screen';
import MessageContainer from './MessageContainer';
import {Palette} from '../../global-styles/palette';
import {Dimensions} from '../../global-styles/dimens';

export const styles = StyleSheet.create({
  messageHeaderRow: {
    flexDirection: 'row',
    flex: 1,
  },

  messageAuthorImageContainer: {
    height: 45,
    width: 45,
    borderRadius: 3,
    backgroundColor: Palette.gray1,
    marginRight: Dimensions.horizontalSpaceSmall,
    marginBottom: Dimensions.verticalSpaceSmall,
  },

  messageHeaderAuthorColumn: {
    flexDirection: 'column',
    flex: 1,
  },

  messageHeaderAuthorName: {
    width: 150,
    height: 16,
    marginTop: 3,
    marginBottom: 10,
    backgroundColor: Palette.gray1,
  },

  messageHeaderTimestamp: {
    width: 30,
    height: 16,
    backgroundColor: Palette.gray1,
  },

  content: {
    width: 250,
    height: 16,
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: Palette.gray1,
  },

  row: {
    flexDirection: 'row',
    flex: 1,
  },

  col: {
    flexDirection: 'column',
  },

  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Dimensions.verticalSpaceSmall + 6,
    paddingBottom: Dimensions.verticalSpaceBig,
    paddingLeft: 1,
    paddingRight: Dimensions.horizontalSpaceBig,
    marginBottom: -Dimensions.verticalSpaceBig,
  },

  likeIcon: {
    height: 20,
    width: 20,
    borderRadius: 5,
    backgroundColor: Palette.gray1,
  },

  likeLabel: {
    marginLeft: Dimensions.horizontalSpaceSmall,
    width: 50,
    height: Dimensions.verticalSpaceBig,
    backgroundColor: Palette.gray1,
  },
});

class PlaceholderHeader extends PureComponent<{}> {
  public render() {
    return h(View, {style: styles.messageHeaderRow}, [
      h(View, {style: styles.messageAuthorImageContainer}),
      h(View, {style: styles.messageHeaderAuthorColumn}, [
        h(View, {
          style: styles.messageHeaderAuthorName,
        }),
        h(View, {
          style: styles.messageHeaderTimestamp,
        }),
      ]),
    ]);
  }
}

class PlaceholderFooter extends PureComponent<{}> {
  public render() {
    return h(View, {style: styles.col}, [
      h(View, {style: styles.row}, [
        h(View, {style: styles.likeButton}, [
          h(View, {style: styles.likeIcon}),
          h(View, {style: styles.likeLabel}),
        ]),
      ]),
    ]);
  }
}

export default class PlaceholderMessage extends PureComponent<{}> {
  public render() {
    return h(MessageContainer, [
      h(PlaceholderHeader),
      h(View, {style: styles.content}),
      h(PlaceholderFooter),
    ]);
  }
}
