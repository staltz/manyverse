/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {PureComponent, createElement as $} from 'react';
import {Text, StyleSheet, Platform} from 'react-native';
import {Dimensions} from '../../global-styles/dimens';
import {Palette} from '../../global-styles/palette';
import {Typography} from '../../global-styles/typography';
import {Options} from 'react-native-navigation';
import Dialog from './Dialog';
import DialogButton from './DialogButton';

export const styles = StyleSheet.create({
  content: {
    ...Platform.select({
      default: {
        paddingVertical: Dimensions.verticalSpaceLarger,
        paddingHorizontal: Dimensions.horizontalSpaceLarge,
        fontFamily: 'normal',
        textAlign: 'left',
        marginBottom: Dimensions.verticalSpaceLarge * 2,
      },
      ios: {
        paddingVertical: Dimensions.verticalSpaceBig,
        paddingHorizontal: Dimensions.horizontalSpaceBig,
        fontFamily: Typography.fontFamilyReadableText,
        textAlign: 'center',
      },
    }),
    ...Platform.select({android: {minWidth: 300}}),
    color: Palette.textWeak,
    fontSize: Typography.fontSizeNormal,
  },

  title: {
    fontSize: Typography.fontSizeBig,
    fontWeight: 'bold',
    color: Palette.text,
  },

  spacer: {fontSize: Platform.select({ios: 5, default: 15})},
});

export type Props = {
  title?: string;
  onClose?: () => {};
};

export default class TextDialog extends PureComponent<Props> {
  public static navOptions: Options = Dialog.navOptions;

  private onOkay = () => {
    this.props.onClose?.();
  };

  public render() {
    return $(Dialog, {}, [
      this.props.title
        ? $(Text, {style: styles.content}, [
            $(Text, {style: styles.title}, this.props.title),
            $(Text, {style: styles.spacer}, '\n\n'),
            this.props.children,
          ])
        : $(Text, {style: styles.content}, this.props.children),

      $(DialogButton, {
        onPress: this.onOkay,
        text: 'OK',
        accessible: true,
        accessibilityLabel: 'Close Dialog Button',
      }),
    ]);
  }
}
