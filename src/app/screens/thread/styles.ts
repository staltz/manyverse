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
    backgroundColor: Palette.brand.voidBackground,
  },

  loading: {
    alignSelf: 'center',
    marginTop: Dimensions.verticalSpaceBig,
  },

  scrollView: {
    flex: 1,
  },

  writeMessageRow: {
    backgroundColor: Palette.brand.textBackground,
    paddingLeft: Dimensions.horizontalSpaceBig,
    borderTopWidth: 1,
    borderTopColor: Palette.gray1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  spacer: {
    width: Dimensions.horizontalSpaceBig,
    height: 10,
  },

  writeMessageAuthorImage: {
    height: Dimensions.avatarSizeSmall,
    width: Dimensions.avatarSizeSmall,
    borderRadius: Dimensions.avatarBorderRadius,
    backgroundColor: Palette.indigo1,
    marginTop: Dimensions.verticalSpaceNormal,
    marginBottom: Dimensions.verticalSpaceNormal,
    alignSelf: 'flex-start',
  },

  writeInputContainer: {
    flex: 1,
    paddingLeft: Dimensions.horizontalSpaceSmall,
    alignSelf: 'stretch',
    flexDirection: 'column',
    justifyContent: 'center',
  },

  writeInput: {
    fontSize: Typography.fontSizeNormal,
    color: Palette.brand.text,
    maxHeight: 136, // approx. 6.5 lines of text
  },

  send: {
    alignSelf: 'flex-end',
    borderRadius: 3,
    paddingLeft: Dimensions.horizontalSpaceSmall,
    paddingRight: Dimensions.horizontalSpaceBig,
    paddingVertical: Dimensions.verticalSpaceTiny,
    marginBottom: Dimensions.verticalSpaceNormal,
  },
});
