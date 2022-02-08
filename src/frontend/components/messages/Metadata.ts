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
import {
  getFeedSSBURIRegex,
  getMessageSSBURIRegex,
  isMessageSSBURI,
  toMessageSigil,
  isFeedSSBURI,
  toFeedSigil,
} from 'ssb-uri2';
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

function removeExtremes(regex: RegExp): string {
  return regex.source.replace(/^\^/, '').replace(/\$$/, '');
}

function combineRegexes(regexes: Array<RegExp>): RegExp {
  return new RegExp('(' + regexes.map(removeExtremes).join('|') + ')', 'g');
}

function renderNonLink(nonLink: string, i: number) {
  return $(
    Text,
    {key: `${i}`, selectable: true, textBreakStrategy: 'simple'},
    nonLink,
  );
}

function renderLink(link: string, i: number) {
  return $(
    Text,
    {
      key: `${i}`,
      style: styles.cypherlink,
      selectable: true,
      textBreakStrategy: 'simple',
      onPress: () => {
        if (Ref.isFeedId(link)) {
          GlobalEventBus.dispatch({
            type: 'triggerFeedCypherlink',
            feedId: link,
          });
        } else if (Ref.isMsgId(link)) {
          GlobalEventBus.dispatch({
            type: 'triggerMsgCypherlink',
            msgId: link,
          });
        } else if (isFeedSSBURI(link)) {
          const feedId = toFeedSigil(link)!;
          GlobalEventBus.dispatch({
            type: 'triggerFeedCypherlink',
            feedId,
          });
        } else if (isMessageSSBURI(link)) {
          const msgId = toMessageSigil(link)!;
          GlobalEventBus.dispatch({
            type: 'triggerMsgCypherlink',
            msgId,
          });
        }
      },
    },
    link,
  );
}

function linkify(msg: any) {
  const json = JSON.stringify(
    msg,
    (key, value) => (key === '_$manyverse$metadata' ? undefined : value),
    2,
  );
  const elements = [] as Array<string | ReactElement>;
  const regex = combineRegexes([
    Ref.feedIdRegex,
    Ref.msgIdRegex,
    getFeedSSBURIRegex(),
    getMessageSSBURIRegex(),
  ]);

  let start = 0;
  let idx = 0;
  let result: RegExpExecArray | null;
  while ((result = regex.exec(json)) !== null) {
    const positionOfLink = result.index;
    const link = result[1];
    const nonLink = json.slice(start, positionOfLink);
    elements.push(renderNonLink(nonLink, idx++));
    elements.push(renderLink(link, idx++));
    start = positionOfLink + link.length;
  }
  if (start < json.length) {
    const nonLink = json.slice(start);
    elements.push(renderNonLink(nonLink, idx++));
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
