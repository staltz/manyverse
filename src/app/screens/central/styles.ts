/* Copyright (C) 2018 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {StyleSheet} from 'react-native';
import {Palette} from '../../global-styles/palette';
import {Dimensions} from '../../global-styles/dimens';
import {Typography} from '../../global-styles/typography';

const _tabItem = {
  backgroundColor: Palette.backgroundBrand,
  paddingTop: Dimensions.verticalSpaceNormal,
  paddingBottom: Dimensions.verticalSpaceNormal,
};

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Palette.backgroundVoid,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: Palette.backgroundBrand,
    minHeight: Dimensions.toolbarAndroidHeight,
  },

  headerIcon: {
    width: Dimensions.iconSizeNormal + Dimensions.horizontalSpaceBig * 2,
    height: Dimensions.iconSizeNormal + Dimensions.verticalSpaceNormal * 2,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    marginLeft: Dimensions.horizontalSpaceNormal,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.foregroundBrand,
    fontSize: Typography.fontSizeLarge,
    fontWeight: 'bold',
  },

  indicatorViewPager: {
    flex: 1,
    flexDirection: 'column-reverse',
    backgroundColor: Palette.backgroundBrandStrong,
  },

  tabItem: _tabItem,

  tabItemSelected: {
    ..._tabItem,
    borderBottomWidth: 4,
    borderBottomColor: Palette.backgroundBrandWeaker,
  },

  pageContainer: {
    backgroundColor: Palette.backgroundVoid,
    justifyContent: 'center',
    alignItems: 'center',
  },

  pagePlaceholder: {
    fontSize: Typography.fontSizeLarge,
    fontFamily: Typography.fontFamilyReadableText,
    textAlign: 'center',
  },

  updatesDot: {
    backgroundColor: Palette.foregroundBrand,
    width: 7,
    height: 7,
    position: 'absolute',
    top: -4,
    right: 1,
    borderRadius: 4,
  },

  syncingProgressBar: {
    position: 'absolute',
    left: 2,
    right: 2,
    bottom: 4.9,
  },

  menuBackdrop: {
    backgroundColor: Palette.transparencyDarkStrong,
    opacity: 1,
  },
});

export const iconProps = {
  headerIcon: {
    size: Dimensions.iconSizeNormal,
    color: Palette.foregroundBrand,
  },

  tab: {
    size: Dimensions.iconSizeNormal,
    color: Palette.backgroundBrandStronger,
  },

  tabSelected: {
    size: Dimensions.iconSizeNormal,
    color: Palette.foregroundBrand,
  },
};

export const topBarTitle = {
  color: Palette.foregroundBrand,
  fontSize: Typography.fontSizeLarge,
};
