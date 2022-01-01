// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Component} from 'react';
import {View, Text, StyleSheet, Platform} from 'react-native';
import {h} from '@cycle/react';
import {Palette} from '../../global-styles/palette';
import {Typography} from '../../global-styles/typography';
import {Dimensions} from '../../global-styles/dimens';
import {GlobalEventBus} from '../../drivers/eventbus';
const Ref = require('ssb-ref');

export const styles = StyleSheet.create({
  metadataBox: {
    flex: 1,
    backgroundColor: Palette.backgroundTextHacker,
    padding: 5,
    borderRadius: Dimensions.borderRadiusSmall,
  },

  metadataText: {
    fontSize: Typography.fontSizeSmall,
    lineHeight: Typography.lineHeightSmall,
    color: Palette.textHacker,
    fontFamily: Typography.fontFamilyMonospace,
    ...Platform.select({
      web: {
        wordBreak: 'break-all',
      },
    }),
  },

  cypherlink: {
    color: Palette.textHackerStrong,
    textDecorationLine: 'underline',
  },
});

const refRegex = /([@%][A-Za-z0-9/+]{43}=\.[\w\d]+)/g;

function linkify(msg: any) {
  const json = JSON.stringify(
    msg,
    (key, value) => (key === '_$manyverse$metadata' ? undefined : value),
    2,
  );
  let elements = [];
  let parts = json.split(refRegex);
  for (let i = 0; i < parts.length; i += 2) {
    const id = parts[i + 1] || '';
    elements.push(
      parts[i],
      h(
        Text,
        {
          style: styles.cypherlink,
          onPress: () => {
            if (Ref.isFeedId(id)) {
              GlobalEventBus.dispatch({
                type: 'triggerFeedCypherlink',
                feedId: id,
              });
            } else if (Ref.isMsgId(id)) {
              GlobalEventBus.dispatch({
                type: 'triggerMsgCypherlink',
                msgId: id,
              });
            }
          },
        },
        id,
      ),
    );
  }
  return elements;
}

export default class Metadata extends Component<{msg: any}> {
  public render() {
    const {msg} = this.props;
    return h(View, {style: styles.metadataBox}, [
      h(Text, {style: styles.metadataText}, linkify(msg)),
    ]);
  }
}
