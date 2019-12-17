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
    paddingVertical: Dimensions.verticalSpaceBig,
    paddingHorizontal: Dimensions.horizontalSpaceBig,
    color: Palette.textWeak,
    fontSize: Typography.fontSizeNormal,
    fontFamily: Typography.fontFamilyReadableText,
    textAlign: Platform.select({ios: 'center', default: 'left'}),
  },

  title: {
    fontSize: Typography.fontSizeBig,
    fontWeight: 'bold',
    color: Palette.text,
  },

  spacer: {fontSize: 5},
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
