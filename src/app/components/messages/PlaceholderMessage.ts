/* Copyright (C) 2018 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {PureComponent} from 'react';
import {View, StyleSheet} from 'react-native';
import {h} from '@cycle/react';
import MessageContainer from './MessageContainer';
import {Palette} from '../../global-styles/palette';
import {Dimensions} from '../../global-styles/dimens';

export const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    flex: 1,
  },

  headerAvatar: {
    height: Dimensions.avatarSizeNormal,
    width: Dimensions.avatarSizeNormal,
    borderRadius: Math.ceil(Dimensions.avatarSizeNormal * 0.5),
    backgroundColor: Palette.backgroundVoidWeak,
    marginRight: Dimensions.horizontalSpaceSmall,
    marginBottom: Dimensions.verticalSpaceSmall,
  },

  headerAuthorColumn: {
    flexDirection: 'column',
    flex: 1,
  },

  headerAuthorName: {
    width: 150,
    height: 16,
    marginTop: 3,
    marginBottom: 10,
    backgroundColor: Palette.backgroundVoidWeak,
  },

  headerTimestamp: {
    width: 60,
    height: 16,
    backgroundColor: Palette.backgroundVoidWeak,
  },

  body: {
    width: 250,
    height: 16,
    marginTop: 10,
    marginBottom: 6,
    backgroundColor: Palette.backgroundVoidWeak,
  },

  footer: {
    flexDirection: 'row',
    flex: 1,
  },

  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Dimensions.verticalSpaceSmall + 6,
    paddingBottom: Dimensions.verticalSpaceBig,
    paddingLeft: 1,
    paddingRight: Dimensions.horizontalSpaceBig,
    marginRight: 3,
    marginBottom: -Dimensions.verticalSpaceBig,
  },

  footerButtonIcon: {
    height: 20,
    width: 20,
    borderRadius: 5,
    backgroundColor: Palette.backgroundVoidWeak,
  },

  footerButtonLabel: {
    marginLeft: Dimensions.horizontalSpaceSmall,
    width: 34,
    height: Dimensions.verticalSpaceBig,
    backgroundColor: Palette.backgroundVoidWeak,
  },
});

class PlaceholderHeader extends PureComponent<{}> {
  public render() {
    return h(View, {style: styles.headerRow}, [
      h(View, {style: styles.headerAvatar}),
      h(View, {style: styles.headerAuthorColumn}, [
        h(View, {
          style: styles.headerAuthorName,
        }),
        h(View, {
          style: styles.headerTimestamp,
        }),
      ]),
    ]);
  }
}

class PlaceholderFooter extends PureComponent<{}> {
  public render() {
    return h(View, {style: styles.footer}, [
      h(View, {style: styles.footerButton}, [
        h(View, {style: styles.footerButtonIcon}),
        h(View, {style: styles.footerButtonLabel}),
      ]),
      h(View, {style: styles.footerButton}, [
        h(View, {style: styles.footerButtonIcon}),
        h(View, {style: styles.footerButtonLabel}),
      ]),
    ]);
  }
}

export default class PlaceholderMessage extends PureComponent<{}> {
  public render() {
    return h(MessageContainer, [
      h(PlaceholderHeader),
      h(View, {style: styles.body}),
      h(PlaceholderFooter),
    ]);
  }
}
