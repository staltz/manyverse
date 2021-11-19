// SPDX-FileCopyrightText: 2018-2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Platform, StyleSheet} from 'react-native';
import {Dimensions} from '../../../global-styles/dimens';
import {Palette} from '../../../global-styles/palette';
import {Typography} from '../../../global-styles/typography';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: 'stretch',
    backgroundColor: Palette.voidMain,
    flexDirection: 'column',
  },

  containerInner: {
    paddingBottom: Dimensions.verticalSpaceNormal,
    minHeight: 400,
  },

  desktopFabContainer: {
    position: 'absolute',
    bottom: 0,
    right: Dimensions.desktopSideWidth.vw,
  },

  modesContainer: {
    alignSelf: 'stretch',
    backgroundColor: Palette.backgroundText,
    paddingVertical: Dimensions.verticalSpaceBig,
    paddingHorizontal: Dimensions.horizontalSpaceBig,
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-around',
    ...Platform.select({
      web: {
        maxWidth: Dimensions.desktopMiddleWidth.vw,
      },
    }),
  },

  modeLoading: {
    position: 'absolute',
    left: -8.9,
    top: -8,
    zIndex: -2,
  },

  modeTouchable: {
    borderRadius: 30,
    padding: 6,
  },

  emptySectionContainer: {
    position: 'absolute',
    zIndex: -1,
    top:
      Dimensions.toolbarHeight /* approximately the modesContainer height */ +
      Dimensions.verticalSpaceLarger,
    left: 0,
    right: 0,
    bottom: 0,
  },

  emptySection: {
    marginTop: Dimensions.verticalSpaceLarger,
  },

  menuOptionContent: {
    paddingHorizontal: Dimensions.horizontalSpaceBig,
    paddingVertical: Dimensions.verticalSpaceBig,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },

  menuOptionContentText: {
    marginLeft: Dimensions.horizontalSpaceBig,
    color: Palette.colors.comet6,
    fontSize: Typography.fontSizeNormal,
    lineHeight: Typography.lineHeightNormal,
    fontFamily: Typography.fontFamilyReadableText,
    fontWeight: 'bold',
  },
});
