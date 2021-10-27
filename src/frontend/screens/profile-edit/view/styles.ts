// SPDX-FileCopyrightText: 2018-2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {StyleSheet, Platform} from 'react-native';
import {Palette} from '../../../global-styles/palette';
import {Dimensions} from '../../../global-styles/dimens';
import {Typography} from '../../../global-styles/typography';

export const avatarSize = Dimensions.avatarSizeBig;

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignSelf: 'stretch',
    flexDirection: 'column',
    backgroundColor: Palette.voidMain,
  },

  container: {
    flex: 1,
    alignSelf: 'stretch',
    flexDirection: 'column',
    backgroundColor: Palette.backgroundText,
    ...Platform.select({
      web: {
        maxWidth: Dimensions.desktopMiddleWidth.vw,
      },
    }),
  },

  avatarTouchable: {
    marginBottom: Dimensions.verticalSpaceBig,
    width: avatarSize,
    height: avatarSize,
    zIndex: 19,
  },

  avatarDesktopArea: {
    width: avatarSize,
    height: avatarSize,
  },

  fields: {
    marginTop: Dimensions.verticalSpaceLarge,
    zIndex: 10,
    paddingBottom: Dimensions.verticalSpaceNormal,
    paddingLeft: Dimensions.horizontalSpaceBig,
    paddingRight: Dimensions.horizontalSpaceBig,
    backgroundColor: Palette.backgroundText,
  },

  avatar: {
    zIndex: 20,
  },

  label: {
    fontSize: Typography.fontSizeSmall,
    color: Palette.textWeak,
    marginLeft: Platform.select({
      android: 3,
      default: Dimensions.horizontalSpaceSmall,
    }),
  },

  textInput: {
    fontSize: Typography.fontSizeNormal,
    lineHeight: Typography.lineHeightNormal,
    marginBottom: Dimensions.verticalSpaceBig,
    color: Palette.text,
    ...Platform.select({
      android: {},
      default: {
        borderColor: Palette.textVeryWeak,
        borderWidth: 1,
        borderRadius: Dimensions.borderRadiusNormal,
        paddingHorizontal: Dimensions.horizontalSpaceSmall,
        paddingVertical: Dimensions.verticalSpaceSmall,
      },
      web: {
        outlineStyle: 'none',
        borderColor: Palette.textVeryWeak,
        borderWidth: 1,
        borderRadius: Dimensions.borderRadiusNormal,
        paddingHorizontal: Dimensions.horizontalSpaceSmall,
        paddingVertical: Dimensions.verticalSpaceSmall,
      },
    }),
  },

  save: {
    position: 'absolute',
    top: 0,
    right: Dimensions.horizontalSpaceBig,
    zIndex: 30,
  },

  saveText: {
    textTransform: 'uppercase',
  },
});
