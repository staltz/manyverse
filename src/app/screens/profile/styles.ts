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

import {StyleSheet} from 'react-native';
import {Palette} from '../../global-styles/palette';
import {Dimensions} from '../../global-styles/dimens';
import {Typography} from '../../global-styles/typography';

const avatarSize = Dimensions.avatarSizeBig;
const avatarSizeHalf = avatarSize * 0.5;

export const navigatorStyle = {
  statusBarColor: Palette.brand.backgroundDarker,
  navBarBackgroundColor: Palette.brand.background,
  navBarTextColor: Palette.white,
  navBarTextFontSize: Typography.fontSizeNormal,
  navBarTextFontFamily: Typography.fontFamilyReadableText,
  navBarButtonColor: Palette.white,
  topBarElevationShadowEnabled: false,
  navBarTextFontBold: true,
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: 'stretch',
    backgroundColor: Palette.brand.voidBackground,
  },

  cover: {
    backgroundColor: Palette.brand.background,
    height: avatarSizeHalf,
    zIndex: 10,
  },

  name: {
    color: 'white',
    fontSize: Typography.fontSizeLarge,
    fontFamily: Typography.fontFamilyReadableText,
    fontWeight: 'bold',
    maxWidth: 220,
    top: Dimensions.verticalSpaceSmall,
    left: Dimensions.horizontalSpaceBig + 80 + Dimensions.horizontalSpaceBig,
  },

  descriptionArea: {
    top: -avatarSize,
    marginBottom: -avatarSize,
    zIndex: 10,
    paddingTop: avatarSizeHalf + Dimensions.verticalSpaceNormal,
    paddingBottom: Dimensions.verticalSpaceNormal,
    paddingLeft: Dimensions.horizontalSpaceBig,
    paddingRight: Dimensions.horizontalSpaceBig,
    backgroundColor: Palette.brand.textBackground,
  },

  feed: {
    top: Dimensions.verticalSpaceNormal * 0.5,
    bottom: 0,
    backgroundColor: Palette.brand.voidBackground,
    alignSelf: 'stretch',
  },

  feedWithHeader: {
    top: Dimensions.verticalSpaceNormal,
    bottom: 0,
    backgroundColor: Palette.brand.voidBackground,
    alignSelf: 'stretch',
  },

  follow: {
    position: 'absolute',
    top: avatarSizeHalf + Dimensions.verticalSpaceSmall,
    right: Dimensions.horizontalSpaceBig,
    zIndex: 30,
  },

  avatarBackground: {
    height: avatarSize,
    width: avatarSize,
    borderRadius: Dimensions.avatarBorderRadius,
    top: -avatarSizeHalf,
    left: Dimensions.horizontalSpaceBig,
    zIndex: 20,
    backgroundColor: Palette.indigo1,
  },

  avatar: {
    position: 'absolute',
    borderRadius: Dimensions.avatarBorderRadius,
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
});
