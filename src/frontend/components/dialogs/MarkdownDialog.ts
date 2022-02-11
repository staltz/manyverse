// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {PureComponent, createElement as $} from 'react';
import {View, Text, StyleSheet, Platform} from 'react-native';
import {Options} from 'react-native-navigation';
import {Dimensions} from '~frontend/global-styles/dimens';
import {Palette} from '~frontend/global-styles/palette';
import {Typography} from '~frontend/global-styles/typography';
import {t} from '~frontend/drivers/localization';
import Markdown from '~frontend/components/Markdown';
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

export interface Props {
  title?: string;
  content: string;
  onClose?: () => {};
}

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
