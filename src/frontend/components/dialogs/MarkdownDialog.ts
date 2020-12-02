/* Copyright (C) 2018-2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {PureComponent, createElement as $} from 'react';
import {View, Text, StyleSheet, Platform} from 'react-native';
import {Options} from 'react-native-navigation';
import {Dimensions} from '../../global-styles/dimens';
import {Palette} from '../../global-styles/palette';
import {Typography} from '../../global-styles/typography';
import {t} from '../../drivers/localization';
import Markdown from '../Markdown';
import Dialog from './Dialog';
import DialogButton from './DialogButton';

export const styles = StyleSheet.create({
  content: {
    ...Platform.select({
      default: {
        paddingVertical: Dimensions.verticalSpaceLarger,
        paddingHorizontal: Dimensions.horizontalSpaceLarge,
        marginBottom: Dimensions.verticalSpaceLarge * 2,
      },
      ios: {
        paddingVertical: Dimensions.verticalSpaceBig,
        paddingHorizontal: Dimensions.horizontalSpaceBig,
      },
    }),
    ...Platform.select({android: {minWidth: 300}}),
    color: Palette.textWeak,
  },

  title: {
    marginBottom: Dimensions.verticalSpaceNormal,
    ...Platform.select({
      default: {
        fontFamily: 'normal',
        textAlign: 'left',
      },
      ios: {
        fontFamily: Typography.fontFamilyReadableText,
        textAlign: 'center',
      },
    }),
    fontSize: Typography.fontSizeBig,
    fontWeight: 'bold',
    color: Palette.text,
  },

  spacer: {
    fontSize: Platform.select({ios: 5, default: Typography.fontSizeNormal}),
  },
});

export type Props = {
  title?: string;
  content: string;
  onClose?: () => {};
};

export default class TextDialog extends PureComponent<Props> {
  public static navOptions: Options = Dialog.navOptions;

  private onOkay = () => {
    this.props.onClose?.();
  };

  public render() {
    const {title, content} = this.props;
    return $(Dialog, {key: 'dialog'}, [
      $(View, {key: 'content', style: styles.content}, [
        title ? $(Text, {key: 'title', style: styles.title}, title) : null,
        $(Markdown, {key: 'md', text: content}),
      ]),
      $(DialogButton, {
        key: 'button',
        onPress: this.onOkay,
        text: t('call_to_action.ok'),
        accessible: true,
        accessibilityLabel: t(
          'call_to_action.close_dialog.accessibility_label',
        ),
      }),
    ]);
  }
}
