// SPDX-FileCopyrightText: 2020 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {PureComponent, createElement as $} from 'react';
import {MsgId} from 'ssb-typescript';
import {View, Text, StyleSheet} from 'react-native';
import {t} from '../../drivers/localization';
import {Palette} from '../../global-styles/palette';
import {Dimensions} from '../../global-styles/dimens';
import {Typography} from '../../global-styles/typography';

export type Props = {
  rootId: MsgId;
  onPress?: (ev: {rootMsgId: MsgId}) => void;
};

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
