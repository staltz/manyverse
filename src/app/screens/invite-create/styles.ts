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

import {StyleSheet} from 'react-native';
import {Palette} from '../../global-styles/palette';
import {Dimensions} from '../../global-styles/dimens';
import {Typography} from '../../global-styles/typography';

export const navigatorStyle = {
  statusBarColor: Palette.brand.backgroundDarker,
  navBarBackgroundColor: Palette.brand.background,
  navBarTextColor: Palette.white,
  navBarTextFontSize: Typography.fontSizeLarge,
  navBarTextFontFamily: Typography.fontFamilyReadableText,
  navBarButtonColor: Palette.white,
  topBarElevationShadowEnabled: false,
  navBarTextFontBold: true,
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: 'stretch',
    flexDirection: 'column',
  },

  bodyContainer: {
    flex: 1,
    alignSelf: 'stretch',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    backgroundColor: Palette.brand.textBackground,
    paddingHorizontal: Dimensions.horizontalSpaceBig,
  },

  about: {
    paddingHorizontal: Dimensions.horizontalSpaceSmall,
    paddingTop: Dimensions.verticalSpaceNormal,
    fontSize: Typography.fontSizeSmall,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.brand.textWeak,
    textAlign: 'center',
  },

  bold: {
    fontWeight: 'bold',
  },

  inviteCode: {
    marginTop: Dimensions.verticalSpaceBig,
    alignSelf: 'stretch',
    fontSize: Typography.fontSizeLarge,
    fontFamily: Typography.fontFamilyMonospace,
    textAlign: 'left',
    textAlignVertical: 'top',
    color: Palette.brand.textWeak,
    backgroundColor: Palette.brand.textWeakBackground,
    paddingHorizontal: 4,
    paddingVertical: 3,
    borderRadius: 2,
  },
});
