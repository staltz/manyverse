// SPDX-FileCopyrightText: 2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Platform, StyleSheet} from 'react-native';
import {Dimensions as Dimens} from '../../../global-styles/dimens';
import {Typography} from '../../../global-styles/typography';
import {Palette} from '../../../global-styles/palette';

export const styles = StyleSheet.create({
  emptySection: {
    marginTop: Dimens.verticalSpaceLarger,
  },

  activityList: {
    // for the topBar
    marginTop: Platform.select({
      default: Dimens.toolbarHeight,

      // dirty hack because `styles.feed` is used twice in react-native-web
      web: Dimens.toolbarHeight * 0.5,
    }),

    alignSelf: 'stretch',
    flex: 1,
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
        maxWidth: Dimens.desktopMiddleWidth.vw,
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
