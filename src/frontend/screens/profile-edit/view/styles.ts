// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {StyleSheet, Platform} from 'react-native';
import {Palette} from '~frontend/global-styles/palette';
import {Dimensions} from '~frontend/global-styles/dimens';
import {Typography} from '~frontend/global-styles/typography';
import {globalStyles} from '~frontend/global-styles/styles';

export const avatarSize = Dimensions.avatarSizeBig;

export const styles = StyleSheet.create({
  screen: globalStyles.screen,

  container: globalStyles.containerWithDesktopSideBar,

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
    zIndex: 10,
    paddingTop: Dimensions.verticalSpaceLarge,
    paddingBottom: Dimensions.verticalSpaceNormal,
    paddingHorizontal: Dimensions.horizontalSpaceBig,
    backgroundColor: Palette.backgroundText,
    ...Platform.select({
      web: {
        width: Dimensions.desktopMiddleWidth.px,
      },
    }),
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
    ...Platform.select({
      web: {
        fontFamily: Typography.fontFamilyReadableText,
      },
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
        fontFamily: Typography.fontFamilyReadableText,
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
