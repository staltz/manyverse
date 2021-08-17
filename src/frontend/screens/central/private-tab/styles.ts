/* Copyright (C) 2020-2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Platform, StyleSheet} from 'react-native';
import {Dimensions as Dimens} from '../../../global-styles/dimens';
import {Typography} from '../../../global-styles/typography';
import {Palette} from '../../../global-styles/palette';

export const styles = StyleSheet.create({
  emptySection: {
    marginTop: Dimens.verticalSpaceLarger,
  },

  conversationList: {
    marginTop: Dimens.toolbarHeight, // for the topBar
    alignSelf: 'stretch',
    flex: 1,
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
        maxWidth: Dimens.desktopMiddleWidth.vw,
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

  conversationAuthors: {
    flex: 1,
    fontSize: Typography.fontSizeNormal,
    color: Palette.text,
    textAlign: 'left',
    textAlignVertical: 'center',
    minWidth: 120,
  },

  conversationAuthorsUnread: {
    flex: 1,
    fontSize: Typography.fontSizeNormal,
    fontFamily: Typography.fontFamilyReadableText,
    fontWeight: 'bold',
    color: Palette.text,
    textAlign: 'left',
    textAlignVertical: 'center',
    minWidth: 120,
  },
});
