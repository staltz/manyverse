/* Copyright (C) 2018 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {StyleSheet} from 'react-native';
import {Palette} from '../../global-styles/palette';
import {Dimensions} from '../../global-styles/dimens';
import {Typography} from '../../global-styles/typography';

export const avatarSize = Dimensions.avatarSizeSmall;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: 'stretch',
    backgroundColor: Palette.backgroundVoid,
  },

  loading: {
    alignSelf: 'center',
    marginTop: Dimensions.verticalSpaceBig,
  },

  scrollView: {
    flex: 1,
  },

  replyRow: {
    backgroundColor: Palette.backgroundText,
    paddingLeft: Dimensions.horizontalSpaceBig,
    borderTopWidth: 1,
    borderTopColor: Palette.backgroundVoidWeak,
    flexDirection: 'row',
    alignItems: 'center',
  },

  spacerInReply: {
    width: Dimensions.horizontalSpaceBig,
    height: 10,
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
    color: Palette.text,
    maxHeight: 136, // approx. 6.5 lines of text
  },

  replySend: {
    alignSelf: 'flex-end',
    borderRadius: 3,
    paddingLeft: Dimensions.horizontalSpaceSmall,
    paddingRight: Dimensions.horizontalSpaceBig,
    paddingVertical: Dimensions.verticalSpaceTiny,
    marginBottom: Dimensions.verticalSpaceNormal,
  },

  missingMsgId: {
    fontSize: Typography.fontSizeNormal,
    fontFamily: Typography.fontFamilyMonospace,
    textAlignVertical: 'top',
    color: Palette.brand.textVeryWeak,
  },

  emptySection: {
    marginTop: Dimensions.verticalSpaceBig * 2,
  },
});
