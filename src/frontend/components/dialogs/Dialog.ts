/* Copyright (C) 2018-2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {PureComponent, createElement as $} from 'react';
import {View, StyleSheet, Platform} from 'react-native';
import {Dimensions} from '../../global-styles/dimens';
import {Palette} from '../../global-styles/palette';
import {Typography} from '../../global-styles/typography';
import {
  Options,
  OptionsModalPresentationStyle,
  OptionsModalTransitionStyle,
} from 'react-native-navigation';

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignSelf: 'stretch',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },

  container: {
    maxHeight: 500,
    maxWidth: 270,
    minHeight: 100,
    backgroundColor: Palette.backgroundText,
    borderRadius: Platform.select({
      default: 2,
      ios: 10,
    }),
    ...Platform.select({
      android: {
        minWidth: 300,
        elevation: 8,
      },
    }),
  },

  content: {
    paddingVertical: Dimensions.verticalSpaceBig,
    paddingHorizontal: Dimensions.horizontalSpaceBig,
    color: Palette.text,
    fontSize: Typography.fontSizeNormal,
    lineHeight: Typography.lineHeightNormal,
    fontFamily: Typography.fontFamilyReadableText,
    textAlign: Platform.select({
      default: 'left',
      ios: 'center',
    }),
  },
});

export type Props = {};

export default class Dialog extends PureComponent<Props> {
  public static navOptions: Options = {
    layout: {
      backgroundColor: Palette.transparencyDarkStrong,
    },
    modalPresentationStyle: OptionsModalPresentationStyle.overCurrentContext,
    modalTransitionStyle: OptionsModalTransitionStyle.crossDissolve,
    animations: {
      showModal: {alpha: {from: 0, to: 1, duration: 150}, waitForRender: true},
      dismissModal: {alpha: {from: 1, to: 0, duration: 150}},
    },
  };

  public render() {
    return $(
      View,
      {style: styles.screen},
      $(View, {style: styles.container}, this.props.children),
    );
  }
}
