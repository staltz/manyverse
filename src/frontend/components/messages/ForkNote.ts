// SPDX-FileCopyrightText: 2020-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {PureComponent, createElement as $} from 'react';
import {MsgId} from 'ssb-typescript';
import {View, Text, StyleSheet, Platform} from 'react-native';
import {t} from '~frontend/drivers/localization';
import {Palette} from '~frontend/global-styles/palette';
import {Dimensions} from '~frontend/global-styles/dimens';
import {Typography} from '~frontend/global-styles/typography';

export interface Props {
  rootId: MsgId;
  onPress?: (ev: {rootMsgId: MsgId}) => void;
}

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.backgroundText,
    marginBottom: 1,
    flexDirection: 'column',
    paddingHorizontal: Dimensions.horizontalSpaceBig,
    paddingVertical: Dimensions.verticalSpaceNormal,
  },

  label: {
    flexWrap: 'wrap',
    overflow: 'visible',
    color: Palette.text,
    fontSize: Typography.fontSizeNormal,
    ...Platform.select({
      web: {
        fontFamily: Typography.fontFamilyReadableText,
      },
    }),
  },

  cypherlink: {
    color: Palette.textBrand,
    textDecorationLine: 'underline',
  },
});

export default class ForkNote extends PureComponent<Props> {
  constructor(props: Props) {
    super(props);
  }

  public render() {
    const {rootId, onPress} = this.props;

    return $(
      View,
      {style: styles.container},
      $(Text, {style: styles.label, ellipsizeMode: 'tail', numberOfLines: 1}, [
        t('message.fork_note.1_normal'),
        $(
          Text,
          {
            key: 'r',
            style: styles.cypherlink,
            onPress: () => {
              onPress?.({rootMsgId: rootId});
            },
          },
          t('message.fork_note.2_bold', {cypherlink: rootId}),
        ),
        t('message.fork_note.3_normal'),
      ]),
    );
  }
}
