// SPDX-FileCopyrightText: 2020-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Platform, StyleSheet} from 'react-native';
import {Dimensions as Dimens} from '~frontend/global-styles/dimens';
import {Typography} from '~frontend/global-styles/typography';
import {Palette} from '~frontend/global-styles/palette';

export const styles = StyleSheet.create({
  emptySection: {
    marginTop: Dimens.verticalSpaceLarger,
  },

  conversationList: {
    marginTop: Dimens.toolbarHeight, // for the topBar
    alignSelf: 'stretch',
    flex: 1,
    ...Platform.select({
      web: {
        maxWidth: `calc(100vw - ${Dimens.desktopSideWidth.px})`,
      },
    }),
  },

  conversationListInner: {
    paddingBottom: Dimens.verticalSpaceNormal,
  },

  conversationRow: {
    flex: 1,
    backgroundColor: Palette.backgroundText,
    paddingHorizontal: Dimens.horizontalSpaceBig,
    paddingVertical: Dimens.verticalSpaceBig,
    marginBottom: 1,
    flexDirection: 'row',
    alignItems: 'center',
    ...Platform.select({
      web: {
        width: Dimens.desktopMiddleWidth.px,
      },
    }),
  },

  singleAvatar: {
    marginRight: Dimens.horizontalSpaceSmall,
  },

  avatarGroup: {
    width: Dimens.avatarSizeNormal,
    height: Dimens.avatarSizeNormal,
    borderRadius: Dimens.avatarSizeNormal,
    marginRight: Dimens.horizontalSpaceSmall,
  },

  avatar: {
    position: 'absolute',
  },

  unreadDot: {
    width: Dimens.dotSize,
    height: Dimens.dotSize,
    borderRadius: Dimens.dotSize * 0.5,
    backgroundColor: Palette.brandMain,
    marginRight: Dimens.horizontalSpaceSmall,
  },

  conversationAuthorsCol: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    alignSelf: 'stretch',
  },

  conversationAuthors: {
    fontSize: Typography.fontSizeNormal,
    color: Palette.text,
    textAlign: 'left',
    textAlignVertical: 'center',
    minWidth: 120,
    ...Platform.select({
      web: {
        fontFamily: Typography.fontFamilyReadableText,
      },
    }),
  },

  conversationAuthorsUnread: {
    fontSize: Typography.fontSizeNormal,
    fontFamily: Typography.fontFamilyReadableText,
    fontWeight: 'bold',
    color: Palette.text,
    textAlign: 'left',
    textAlignVertical: 'center',
    minWidth: 120,
  },

  recentText: {
    fontSize: Typography.fontSizeNormal,
    color: Palette.textWeak,
    textAlign: 'left',
    textAlignVertical: 'center',
    alignSelf: 'stretch',
    ...Platform.select({
      web: {
        fontFamily: Typography.fontFamilyReadableText,
      },
    }),
  },

  recentTextUnread: {
    fontSize: Typography.fontSizeNormal,
    color: Palette.textWeak,
    fontWeight: 'bold',
    textAlign: 'left',
    textAlignVertical: 'center',
    alignSelf: 'stretch',
    ...Platform.select({
      web: {
        fontFamily: Typography.fontFamilyReadableText,
      },
    }),
  },
});
