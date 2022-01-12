// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Component, ReactElement, createElement as $} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  StyleProp,
  ViewStyle,
} from 'react-native';
import {Palette} from '../../global-styles/palette';
import {Typography} from '../../global-styles/typography';
import {Dimensions} from '../../global-styles/dimens';
import {GlobalEventBus} from '../../drivers/eventbus';
const Ref = require('ssb-ref');

export const styles = StyleSheet.create({
  metadataBox: {
    flex: 1,
    flexDirection: 'column',
    alignSelf: 'stretch',
    backgroundColor: Palette.backgroundTextHacker,
    paddingHorizontal: 5,
    paddingVertical: 5,
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
  const elements = [] as Array<string | ReactElement>;
  const parts = json.split(refRegex);
  for (let i = 0; i < parts.length; i += 2) {
    const nonRef = parts[i];
    const ref = parts[i + 1] as string | undefined;
    elements.push(
      $(
        Text,
        {key: `${i}`, selectable: true, textBreakStrategy: 'simple'},
        nonRef,
      ),
    );
    if (ref) {
      elements.push(
        $(
          Text,
          {
            key: `${i + 1}`,
            style: styles.cypherlink,
            selectable: true,
            textBreakStrategy: 'simple',
            onPress: () => {
              if (Ref.isFeedId(ref)) {
                GlobalEventBus.dispatch({
                  type: 'triggerFeedCypherlink',
                  feedId: ref,
                });
              } else if (Ref.isMsgId(ref)) {
                GlobalEventBus.dispatch({
                  type: 'triggerMsgCypherlink',
                  msgId: ref,
                });
              }
            },
          },
          ref,
        ),
      );
    }
  }
  return elements;
}

export default class Metadata extends Component<{
  msg: any;
  style?: StyleProp<ViewStyle>;
}> {
  public render() {
    const {msg, style} = this.props;

    return $(
      View,
      {style: [styles.metadataBox, style]},
      $(
        Text,
        {
          selectable: true,
          textBreakStrategy: 'simple',
          style: styles.metadataText,
        },
        linkify(msg),
      ),
    );
  }
}
