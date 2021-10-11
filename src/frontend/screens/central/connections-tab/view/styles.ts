// SPDX-FileCopyrightText: 2018-2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Platform, StyleSheet} from 'react-native';
import {Dimensions as Dimens} from '../../../../global-styles/dimens';
import {Palette} from '../../../../global-styles/palette';
import {Typography} from '../../../../global-styles/typography';

export const styles = StyleSheet.create({
  container: {
    backgroundColor: Palette.voidMain,
    marginTop: Dimens.toolbarHeight, // for the topBar
    alignSelf: 'stretch',
    flex: 1,
  },

  containerInner: {
    paddingBottom: Dimens.verticalSpaceNormal,
    minHeight: 400,
  },

  modesContainer: {
    alignSelf: 'stretch',
    backgroundColor: Palette.backgroundText,
    paddingVertical: Dimens.verticalSpaceBig,
    paddingHorizontal: Dimens.horizontalSpaceBig,
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-around',
    ...Platform.select({
      web: {
        maxWidth: Dimens.desktopMiddleWidth.vw,
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
      Dimens.toolbarHeight /* approximately the modesContainer height */ +
      Dimens.verticalSpaceLarger,
    left: 0,
    right: 0,
    bottom: 0,
  },

  emptySection: {
    marginTop: Dimens.verticalSpaceLarger,
  },

  menuOptionContent: {
    paddingHorizontal: Dimens.horizontalSpaceBig,
    paddingVertical: Dimens.verticalSpaceBig,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },

  menuOptionContentText: {
    marginLeft: Dimens.horizontalSpaceBig,
    color: Palette.colors.comet6,
    fontSize: Typography.fontSizeNormal,
    lineHeight: Typography.lineHeightNormal,
    fontFamily: Typography.fontFamilyReadableText,
    fontWeight: 'bold',
  },
});
