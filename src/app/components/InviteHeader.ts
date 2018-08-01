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

import {h} from '@cycle/react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {PureComponent} from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Dimensions as Dimens} from '../global-styles/dimens';
import {Palette} from '../global-styles/palette';
import {Typography} from '../global-styles/typography';

export const styles = StyleSheet.create({
  container: {
    backgroundColor: Palette.brand.voidBackground,
    alignSelf: 'stretch',
    flex: 1,
  },

  inviteHeader: {
    marginBottom: Dimens.verticalSpaceNormal,
    flexDirection: 'row',
    alignSelf: 'stretch',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    height: 73,
    backgroundColor: Palette.brand.textBackground,
    flex: 1,
  },

  inviteHeaderHairline: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: Palette.gray2,
    marginVertical: Dimens.verticalSpaceNormal,
  },

  inviteHeaderTouchable: {
    paddingHorizontal: Dimens.horizontalSpaceBig,
    paddingVertical: Dimens.verticalSpaceBig,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    flex: 1,
  },

  inviteHeaderButton: {
    flexDirection: 'row',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },

  inviteHeaderText: {
    marginLeft: Dimens.horizontalSpaceNormal,
    fontSize: Typography.fontSizeLarge,
    color: Palette.brand.textWeak,
  },
});

export type Props = {
  onPressPaste?: () => void;
  onPressSend?: () => void;
};

export default class InviteHeader extends PureComponent<Props> {
  public render() {
    return h(View, {style: styles.inviteHeader}, [
      h(
        TouchableOpacity,
        {
          style: styles.inviteHeaderTouchable,
          activeOpacity: 0.3,
          onPress: this.props.onPressPaste,
        },
        [
          h(View, {style: styles.inviteHeaderButton}, [
            h(Icon, {
              size: Dimens.iconSizeNormal,
              color: Palette.brand.textWeak,
              name: 'package-down',
            }),
            h(
              Text,
              {
                accessible: true,
                accessibilityLabel: 'Paste Invite',
                style: styles.inviteHeaderText,
              },
              'Paste invite',
            ),
          ]),
        ],
      ),

      h(View, {style: styles.inviteHeaderHairline}),

      h(
        TouchableOpacity,
        {
          style: styles.inviteHeaderTouchable,
          activeOpacity: 0.3,
          onPress: this.props.onPressSend,
        },
        [
          h(View, {style: styles.inviteHeaderButton}, [
            h(Icon, {
              size: Dimens.iconSizeNormal,
              color: Palette.brand.textWeak,
              name: 'share',
            }),
            h(
              Text,
              {
                accessible: true,
                accessibilityLabel: 'Send Invite',
                style: styles.inviteHeaderText,
              },
              'Send invite',
            ),
          ]),
        ],
      ),
    ]);
  }
}
