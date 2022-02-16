// SPDX-FileCopyrightText: 2021-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Platform, StyleSheet} from 'react-native';
import {Dimensions as Dimens} from '~frontend/global-styles/dimens';
import {Typography} from '~frontend/global-styles/typography';
import {Palette} from '~frontend/global-styles/palette';
import {globalStyles} from '~frontend/global-styles/styles';

export const styles = StyleSheet.create({
  emptySection: {
    marginTop: Dimens.verticalSpaceLarger,
  },

  activityList: {
    ...globalStyles.containerWithDesktopSideBar,
    // for the topBar
    marginTop: Platform.select({
      default: Dimens.toolbarHeight,

      // dirty hack because `styles.feed` is used twice in react-native-web
      web: Dimens.toolbarHeight * 0.5,
    }),
  },

  activityListInner: {
    paddingBottom: Dimens.verticalSpaceNormal,
  },

  activityRow: {
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

  activityRowTouchable: {
    ...Platform.select({
      web: {
        width: Dimens.desktopMiddleWidth.px,
      },
    }),
  },

  activityBody: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },

  activityText: {
    fontSize: Typography.fontSizeNormal,
    lineHeight: Typography.lineHeightNormal,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.text,
  },

  activityMetatext: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },

  account: {
    fontSize: Typography.fontSizeNormal,
    fontWeight: 'bold',
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.text,
  },

  avatar: {
    marginRight: Dimens.horizontalSpaceSmall,
  },

  timestamp: {
    fontSize: Typography.fontSizeSmall,
    fontFamily: Typography.fontFamilyReadableText,
    marginLeft: Dimens.horizontalSpaceSmall,
    color: Palette.textWeak,
  },
});
