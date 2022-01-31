// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {StyleSheet, Platform} from 'react-native';
import {Palette} from '../../global-styles/palette';
import {Dimensions} from '../../global-styles/dimens';
import {Typography} from '../../global-styles/typography';
import {globalStyles} from '../../global-styles/styles';

export const avatarSize = Dimensions.avatarSizeSmall;

export const styles = StyleSheet.create({
  screen: globalStyles.screen,

  container: {
    ...globalStyles.containerWithDesktopSideBar,
    ...Platform.select({
      web: {
        position: 'relative',
      },
    }),
  },

  loading: {
    alignSelf: 'center',
    marginTop: Dimensions.verticalSpaceBig,
  },

  fullThread: {
    ...Platform.select({
      web: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        paddingBottom: 52,
      },
    }),
  },

  replyRow: {
    backgroundColor: Palette.backgroundText,
    paddingLeft: Dimensions.horizontalSpaceBig,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Palette.textLine,
    flexDirection: 'row',
    alignItems: 'center',
    ...Platform.select({
      web: {
        width: Dimensions.desktopMiddleWidth.px,
        position: 'absolute',
        left: 0,
        bottom: 0,
        zIndex: 100,
      },
    }),
  },

  replyAvatar: {
    marginTop: Dimensions.verticalSpaceNormal,
    marginBottom: Dimensions.verticalSpaceNormal,
    alignSelf: 'flex-start',
  },

  replyInputContainer: {
    flex: 1,
    paddingLeft: Dimensions.horizontalSpaceSmall,
    alignSelf: 'stretch',
    flexDirection: 'column',
    justifyContent: 'center',
  },

  replyInput: {
    fontSize: Typography.fontSizeNormal,
    lineHeight: Typography.lineHeightNormal,
    color: Palette.text,
    ...Platform.select({
      ios: {
        paddingTop: 0,
      },
      web: {
        outlineStyle: 'none',
        fontFamily: Typography.fontFamilyReadableText,
      },
    }),
    maxHeight: Platform.select({android: 84, default: 75}), // approx. 3.5 lines of text
  },

  buttonInReply: {
    alignSelf: 'flex-end',
    borderRadius: Dimensions.borderRadiusNormal,
    paddingHorizontal: Dimensions.horizontalSpaceSmall,
    paddingVertical: Dimensions.verticalSpaceTiny,
    marginBottom: Dimensions.verticalSpaceNormal,
  },

  lastButtonInReply: {
    alignSelf: 'flex-end',
    borderRadius: Dimensions.borderRadiusNormal,
    paddingLeft: Dimensions.horizontalSpaceSmall,
    paddingRight: Dimensions.horizontalSpaceBig,
    paddingVertical: Dimensions.verticalSpaceTiny,
    marginBottom: Dimensions.verticalSpaceNormal,
  },

  missingMsgId: {
    fontSize: Typography.fontSizeNormal,
    fontFamily: Typography.fontFamilyMonospace,
    textAlignVertical: 'top',
    color: Palette.textVeryWeak,
  },

  emptySection: {
    marginTop: Dimensions.verticalSpaceLarger,
  },
});
