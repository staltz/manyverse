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
import {Dimensions as Dimens} from './global-styles/dimens';
import {Typography} from './global-styles/typography';
import {Palette} from './global-styles/palette';

const _tabItem = {
  backgroundColor: Palette.brand.background,
  paddingTop: Dimens.verticalSpaceNormal,
  paddingBottom: Dimens.verticalSpaceNormal
};

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Palette.brand.background
  },

  header: {
    flexDirection: 'row',
    minHeight: 55
  },

  headerIcon: {
    marginLeft: Dimens.horizontalSpaceBig,
    marginRight: Dimens.horizontalSpaceBig,
    marginTop: Dimens.verticalSpaceNormal,
    width: Dimens.iconSize,
    height: Dimens.iconSize
  },

  indicatorViewPager: {
    flex: 1,
    flexDirection: 'column-reverse',
    backgroundColor: Palette.brand.backgroundDarker
  },

  searchInput: {
    flex: 1,
    color: 'white',
    fontSize: Typography.fontSizeNormal,
    fontFamily: Typography.fontFamilyReadableText
  },

  tabItem: _tabItem,

  tabItemSelected: {
    ..._tabItem,
    borderBottomWidth: 4,
    borderBottomColor: Palette.brand.backgroundLighterContrast
  },

  pageContainer: {
    backgroundColor: Palette.brand.voidBackground,
    justifyContent: 'center',
    alignItems: 'center'
  },

  pagePlaceholder: {
    fontSize: Typography.fontSizeBig,
    fontFamily: Typography.fontFamilyReadableText,
    textAlign: 'center'
  }
});

export const iconProps = {
  headerIcon: {
    size: Dimens.iconSize,
    color: Palette.white
  },

  tab: {
    size: Dimens.iconSize,
    color: Palette.brand.backgroundDarkerContrast
  },

  tabSelected: {
    size: Dimens.iconSize,
    color: Palette.white
  }
};
