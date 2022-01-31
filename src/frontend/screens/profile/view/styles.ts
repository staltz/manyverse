// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Platform, StyleSheet} from 'react-native';
import {Palette} from '../../../global-styles/palette';
import {Dimensions} from '../../../global-styles/dimens';
import {Typography} from '../../../global-styles/typography';
import {globalStyles} from '../../../global-styles/styles';

export const AVATAR_SIZE = Dimensions.avatarSizeBig;
const AVATAR_SIZE_HALF = AVATAR_SIZE * 0.5;

export const AVATAR_SIZE_TOOLBAR = Dimensions.avatarSizeNormal;

export const COVER_HEIGHT = AVATAR_SIZE_HALF + Dimensions.verticalSpaceLarge;

const CTA_BUTTON_WIDTH = 150;

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
    width: 2,
    height: Dimensions.toolbarHeight,
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
    position: 'absolute',
    top: Dimensions.toolbarHeight + COVER_HEIGHT - AVATAR_SIZE_HALF,
    left: Dimensions.horizontalSpaceBig,
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    zIndex: 19,
  },

  avatar: {
    zIndex: 20,
  },

  name: {
    position: 'absolute',
    color: Palette.text,
    top:
      Dimensions.toolbarHeight + COVER_HEIGHT - Typography.fontSizeLarge * 2.55,
    left:
      Dimensions.horizontalSpaceBig +
      AVATAR_SIZE +
      Dimensions.horizontalSpaceBig,
    fontSize: Typography.fontSizeLarge,
    lineHeight: Typography.lineHeightLarge,
    fontFamily: Typography.fontFamilyReadableText,
    fontWeight: 'bold',
    zIndex: 10,
    ...Platform.select({
      web: {
        right: `calc(50vw - ${Dimensions.desktopMiddleWidth.px} * 0.5 + ${CTA_BUTTON_WIDTH}px)`,
      },
      default: {
        right: 0 + Dimensions.horizontalSpaceBig,
      },
    }),
  },

  nameInTopBar: {
    zIndex: 20,
    color: Palette.textForBackgroundBrand,
    left:
      Dimensions.horizontalSpaceBig +
      AVATAR_SIZE_TOOLBAR +
      Dimensions.horizontalSpaceBig +
      1,
    right: Dimensions.horizontalSpaceBig + Dimensions.iconSizeNormal,
    ...Platform.select({
      web: {
        top:
          Dimensions.toolbarHeight +
          COVER_HEIGHT -
          Typography.fontSizeLarge * 2.55,
      },
      default: {
        top:
          Dimensions.toolbarHeight +
          COVER_HEIGHT -
          Typography.fontSizeLarge * 2.55,
      },
      ios: {
        top:
          Dimensions.toolbarHeight +
          COVER_HEIGHT -
          Typography.fontSizeLarge * 3.05,
      },
    }),
  },

  feedId: {
    position: 'absolute',
    color: Palette.textWeak,
    top:
      Dimensions.toolbarHeight + COVER_HEIGHT - Typography.fontSizeLarge * 1.1,
    left:
      Dimensions.horizontalSpaceBig +
      AVATAR_SIZE +
      Dimensions.horizontalSpaceBig,
    fontSize: Typography.fontSizeTiny,
    lineHeight: Typography.lineHeightTiny,
    fontFamily: Typography.fontFamilyReadableText,
    fontWeight: 'bold',
    zIndex: 10,
    ...Platform.select({
      web: {
        right: `calc(50vw - ${Dimensions.desktopMiddleWidth.px} * 0.5 + ${CTA_BUTTON_WIDTH}px)`,
      },
      default: {
        right: 0 + Dimensions.horizontalSpaceBig,
      },
    }),
  },

  feedIdInTopBar: {
    zIndex: 20,
    color: Palette.textWeakForBackgroundBrand,
    left:
      Dimensions.horizontalSpaceBig +
      AVATAR_SIZE_TOOLBAR +
      Dimensions.horizontalSpaceBig +
      1,
    right: Dimensions.horizontalSpaceBig + Dimensions.iconSizeNormal,
    ...Platform.select({
      web: {
        top:
          Dimensions.toolbarHeight +
          COVER_HEIGHT -
          Typography.fontSizeLarge * 1.1,
      },
      default: {
        top:
          Dimensions.toolbarHeight +
          COVER_HEIGHT -
          Typography.fontSizeLarge * 1.1,
      },
      ios: {
        top:
          Dimensions.toolbarHeight +
          COVER_HEIGHT -
          Typography.fontSizeLarge * 1.6,
      },
    }),
  },

  header: {
    flex: 1,
    flexDirection: 'column',
    marginTop: Dimensions.toolbarHeight,
    backgroundColor: Palette.backgroundText,
    ...Platform.select({
      web: {
        marginTop: 0,
        width: Dimensions.desktopMiddleWidth.px,
      },
    }),
  },

  sub: {
    marginLeft:
      Dimensions.horizontalSpaceBig + // left margin to the avatar
      AVATAR_SIZE + // avatar
      Dimensions.horizontalSpaceBig - // right margin to the avatar
      Dimensions.horizontalSpaceSmall, // minus follows-you-text margin
    minHeight: AVATAR_SIZE_HALF,
    marginRight: Dimensions.horizontalSpaceBig,
    zIndex: 30,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    ...Platform.select({
      web: {
        marginTop: Dimensions.verticalSpaceLarge,
        marginBottom: AVATAR_SIZE_HALF,
      },
      default: {
        marginTop: COVER_HEIGHT + Dimensions.verticalSpaceNormal,
      },
    }),
  },

  cta: {
    flex: 1,
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

  counterContent: {
    marginLeft: Dimensions.horizontalSpaceSmall,
    flex: 1,
    color: Palette.text,
    fontSize: Typography.fontSizeSmall,
    lineHeight: Typography.lineHeightSmall,
    fontFamily: Typography.fontFamilyReadableText,
    fontWeight: 'bold',
    marginRight: Dimensions.horizontalSpaceSmall,
  },

  counterContentTitle: {
    marginRight: Dimensions.horizontalSpaceLarge,
    color: Palette.textWeak,
    fontSize: Typography.fontSizeSmall,
    lineHeight: Typography.lineHeightSmall,
    fontFamily: Typography.fontFamilyReadableText,
    fontWeight: 'normal',
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
    marginLeft: Dimensions.horizontalSpaceSmall,
    textDecorationLine: 'underline',
    color: Palette.text,
    ...Platform.select({
      web: {
        fontFamily: Typography.fontFamilyReadableText,
      },
    }),
  },

  followsYouText: {
    marginLeft: Dimensions.horizontalSpaceSmall,
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
    paddingBottom: Dimensions.toolbarHeight + Dimensions.verticalSpaceNormal,
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
