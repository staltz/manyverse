/* Copyright (C) 2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {StyleSheet} from 'react-native';
import {Dimensions as Dimens} from '../../../global-styles/dimens';
import {Typography} from '../../../global-styles/typography';
import {Palette} from '../../../global-styles/palette';

export const styles = StyleSheet.create({
  emptySection: {
    marginTop: Dimens.verticalSpaceBig * 2,
  },

  activityList: {
    marginTop: Dimens.toolbarHeight, // for the topBar
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
