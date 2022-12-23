// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Platform, StyleSheet} from 'react-native';
import {getStatusBarHeight} from 'react-native-status-bar-height';
import {Palette} from '~frontend/global-styles/palette';
import {Dimensions} from '~frontend/global-styles/dimens';
import {Typography} from '~frontend/global-styles/typography';
import {globalStyles} from '~frontend/global-styles/styles';

export const AVATAR_SIZE = Dimensions.avatarSizeBig;
const AVATAR_SIZE_HALF = AVATAR_SIZE * 0.5;

export const AVATAR_SIZE_TOOLBAR = Dimensions.avatarSizeNormal;

export const COVER_HEIGHT = AVATAR_SIZE_HALF + Dimensions.verticalSpaceLarge;

const SCROLL_BOUNCE_REGION = 250;

export const NAME_MARGIN_TOOLBAR = Platform.select({
  default: Typography.fontSizeLarge * 0.3 - 2,
  web: Typography.fontSizeLarge * 0.3 - 5,
});

export const styles = StyleSheet.create({
  screen: globalStyles.screen,

  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 11,
    overflow: 'hidden',
  },

  topBarSpacer: {
    width: Dimensions.horizontalSpaceBig,
    height: Dimensions.toolbarHeight - getStatusBarHeight(true),
  },

  cover: {
    position: 'absolute',
    top: -SCROLL_BOUNCE_REGION,
    left: 0,
    right: 0,
    backgroundColor: Palette.backgroundText,
    height: SCROLL_BOUNCE_REGION + COVER_HEIGHT,
    zIndex: 10,
  },

  avatarTouchable: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    marginRight: Dimensions.horizontalSpaceBig,
    zIndex: 19,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },

  avatarTouchableInTopBar: {
    width: AVATAR_SIZE_TOOLBAR,
    height: AVATAR_SIZE_TOOLBAR,
    marginRight: Dimensions.horizontalSpaceBig,
    zIndex: 19,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },

  avatar: {
    zIndex: 20,
  },

  name: {
    color: Palette.text,
    fontSize: Typography.fontSizeLarge,
    lineHeight: Typography.lineHeightLarge,
    fontFamily: Typography.fontFamilyReadableText,
    fontWeight: 'bold',
    zIndex: 10,
    ...Platform.select({
      web: {
        width: `calc(${Dimensions.desktopMiddleWidth.px} - 3 * ${Dimensions.horizontalSpaceBig}px - ${AVATAR_SIZE}px)`,
      },
    }),
  },

  feedId: {
    color: Palette.textWeak,
    fontSize: Typography.fontSizeTiny,
    lineHeight: Typography.lineHeightTiny,
    fontFamily: Typography.fontFamilyReadableText,
    fontWeight: 'bold',
    zIndex: 10,
    ...Platform.select({
      web: {
        width: `calc(${Dimensions.desktopMiddleWidth.px} - 3 * ${Dimensions.horizontalSpaceBig}px - ${AVATAR_SIZE}px)`,
      },
    }),
  },

  header: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    marginTop: Dimensions.toolbarHeight - getStatusBarHeight(true),
    backgroundColor: Palette.backgroundText,
    ...Platform.select({
      web: {
        marginTop: 0,
        width: Dimensions.desktopMiddleWidth.px,
      },
    }),
  },

  sub: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    zIndex: 30,
    marginHorizontal: Dimensions.horizontalSpaceBig,
    marginTop: Dimensions.verticalSpaceBig,
  },

  nameContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },

  cta: {
    marginTop: Dimensions.verticalSpaceNormal,
    alignSelf: 'flex-end',
    marginRight: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },

  follow: {
    marginLeft: Dimensions.horizontalSpaceNormal,
  },

  detailsArea: {
    justifyContent: 'flex-start',
    flexDirection: 'column',
    marginTop: Dimensions.verticalSpaceNormal,
    paddingLeft: Dimensions.horizontalSpaceBig,
    paddingRight: Dimensions.horizontalSpaceBig,
    backgroundColor: Palette.backgroundText,
  },

  detailsRow: {
    display: 'flex',
    flexDirection: 'row',
    alignSelf: 'stretch',
    alignItems: 'center',
    minHeight: 20,
    flexShrink: 0,
    marginTop: Dimensions.verticalSpaceNormal,
  },

  counterIcon: {
    marginRight: Dimensions.horizontalSpaceSmall,
  },

  counterContent: {
    flex: 1,
    color: Palette.text,
    fontSize: Typography.fontSizeSmall,
    lineHeight: Typography.lineHeightSmall,
    fontFamily: Typography.fontFamilyReadableText,
    fontWeight: 'bold',
  },

  counterContentParen: {
    color: Palette.textWeak,
    fontWeight: 'normal',
  },

  counterContentTitle: {
    marginRight: Dimensions.horizontalSpaceLarge,
    color: Palette.textWeak,
    fontWeight: 'normal',
  },

  counterContentTitleSmallMargin: {
    marginRight: Dimensions.horizontalSpaceSmall,
  },

  biographyContainer: {
    marginVertical: Dimensions.verticalSpaceNormal,
  },

  biographyContent: {
    flex: 1,
    color: Palette.text,
    fontSize: Typography.fontSizeNormal,
    lineHeight: Typography.lineHeightNormal,
    ...Platform.select({
      web: {
        fontFamily: Typography.fontFamilyReadableText,
      },
    }),
  },

  aliasLink: {
    flex: 1,
    fontSize: Typography.fontSizeNormal,
    lineHeight: Typography.lineHeightNormal,
    textDecorationLine: 'underline',
    color: Palette.text,
    ...Platform.select({
      web: {
        fontFamily: Typography.fontFamilyReadableText,
      },
    }),
  },

  secondaryLabel: {
    color: Palette.textWeak,
    fontSize: Typography.fontSizeSmall,
    lineHeight: Typography.lineHeightSmall,
    fontFamily: Typography.fontFamilyReadableText,
    fontWeight: 'normal',
  },

  headerMarginBottom: {
    backgroundColor: Palette.backgroundText,
    paddingBottom: Dimensions.verticalSpaceLarge,
  },

  feed: {
    bottom: 0,
    backgroundColor: Palette.voidMain,
    alignSelf: 'stretch',
    ...Platform.select({
      web: {
        // for the topBar
        paddingTop: Dimensions.toolbarHeight,
        maxWidth: `calc(100vw - ${Dimensions.desktopSideWidth.px})`,
      },
    }),
  },

  feedInner: {
    paddingBottom:
      Dimensions.toolbarHeight -
      getStatusBarHeight(true) +
      Dimensions.verticalSpaceNormal,
    ...Platform.select({
      web: {
        // Dirty hack to fix positioning of the scrollbar
        marginTop: -Dimensions.toolbarHeight,
      },
    }),
  },

  desktopFabContainer: {
    position: 'absolute',
    bottom: 0,
    right: `calc(50vw - ${Dimensions.desktopMiddleWidth.px} * 0.5)`,
  },

  emptySection: {
    marginTop: Dimensions.verticalSpaceLarger,
  },

  emptySectionSpacer: {
    flex: 1,
  },
});
