// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {PureComponent, createElement as $} from 'react';
import {View, StyleSheet, Platform} from 'react-native';
import {
  Options,
  OptionsModalPresentationStyle,
  OptionsModalTransitionStyle,
} from 'react-native-navigation';
import {Dimensions} from '~frontend/global-styles/dimens';
import {Palette} from '~frontend/global-styles/palette';
import {Typography} from '~frontend/global-styles/typography';

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    ...Platform.select({
      ios: {backgroundColor: Palette.transparencyDarkIOSModal},
    }),
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
  public static navOptions: Options = Platform.select({
    ios: {
      layout: {
        componentBackgroundColor: 'transparent',
      },
      modalTransitionStyle: OptionsModalTransitionStyle.crossDissolve,
    },

    default: {
      layout: {
        backgroundColor: Palette.transparencyDarkStrong,
      },
      modalPresentationStyle: OptionsModalPresentationStyle.overCurrentContext,
      modalTransitionStyle: OptionsModalTransitionStyle.crossDissolve,
      animations: {
        showModal: {
          alpha: {from: 0, to: 1, duration: 150},
          waitForRender: true,
        },
        dismissModal: {alpha: {from: 1, to: 0, duration: 150}},
      },
    },
  });

  public render() {
    return $(
      View,
      {style: styles.screen},
      $(View, {style: styles.container}, this.props.children),
    );
  }
}
