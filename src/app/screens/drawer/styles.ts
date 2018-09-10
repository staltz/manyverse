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

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: 'stretch',
    backgroundColor: Palette.white,
  },

  header: {
    backgroundColor: Palette.brand.background,
    minHeight: 109,
    paddingTop: Dimensions.verticalSpaceBig,
    paddingLeft: Dimensions.horizontalSpaceBig,
    paddingBottom: Dimensions.verticalSpaceNormal,
    paddingRight: Dimensions.horizontalSpaceNormal,
  },

  authorImage: {
    marginBottom: Dimensions.verticalSpaceNormal,
  },

  noAuthorName: {
    fontSize: Typography.fontSizeNormal,
    color: Palette.white,
    fontFamily: Typography.fontFamilyReadableText,
    fontWeight: 'bold',
    fontStyle: 'italic',
  },

  authorName: {
    fontFamily: Typography.fontFamilyReadableText,
    fontSize: Typography.fontSizeNormal,
    color: Palette.white,
    fontWeight: 'bold',
  },

  authorId: {
    fontSize: Typography.fontSizeSmall,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.indigo2,
    fontWeight: 'normal',
  },

  menuItemContainer: {
    backgroundColor: Palette.white,
    paddingHorizontal: Dimensions.horizontalSpaceBig,
    paddingVertical: Dimensions.verticalSpaceBig,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },

  menuItemText: {
    fontFamily: Typography.fontFamilyReadableText,
    marginLeft: Dimensions.horizontalSpaceBig,
    color: Palette.brand.textWeak,
    fontSize: Typography.fontSizeNormal,
    fontWeight: 'bold',
  },
});
