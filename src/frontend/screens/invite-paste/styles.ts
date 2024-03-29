// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Platform, StyleSheet} from 'react-native';
import {Palette} from '~frontend/global-styles/palette';
import {Dimensions} from '~frontend/global-styles/dimens';
import {Typography} from '~frontend/global-styles/typography';
import {globalStyles} from '~frontend/global-styles/styles';

export const styles = StyleSheet.create({
  screen: globalStyles.screen,

  bodyContainer: {
    flex: 1,
    alignSelf: 'stretch',
    flexDirection: 'column',
    backgroundColor: Palette.backgroundText,
    paddingHorizontal: Dimensions.horizontalSpaceBig,
    ...Platform.select({
      web: {
        width: Dimensions.desktopMiddleWidth.px,
      },
    }),
  },

  contentInput: {
    flex: 1,
    alignSelf: 'stretch',
    marginVertical: Dimensions.verticalSpaceBig,
    fontSize: Typography.fontSizeBig,
    lineHeight: Typography.lineHeightBig,
    fontFamily: Typography.fontFamilyMonospace,
    textAlign: 'left',
    textAlignVertical: 'top',
    color: Palette.textWeak,
    backgroundColor: Palette.backgroundTextWeak,
    paddingHorizontal: 4,
    paddingVertical: 3,
    borderRadius: Dimensions.borderRadiusSmall,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
        maxHeight: '12em',
      },
    }),
  },

  acceptButtonEnabled: {
    marginLeft: Dimensions.horizontalSpaceNormal,
    backgroundColor: 'transparent',
    borderColor: Palette.textBrand,
    borderWidth: 1,
    width: 80,
  },

  acceptButtonDisabled: {
    backgroundColor: 'transparent',
    borderColor: Palette.textVeryWeak,
    borderWidth: 1,
    marginLeft: Dimensions.horizontalSpaceNormal,
    width: 80,
  },

  acceptButtonTextEnabled: {
    color: Palette.textBrand,
  },

  acceptButtonTextDisabled: {
    color: Palette.textVeryWeak,
  },
});
