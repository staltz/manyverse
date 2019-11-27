/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {createElement} from 'react';
import {View, Text, Linking, StyleSheet, TextProperties} from 'react-native';
import {Palette} from '../global-styles/palette';
import {Dimensions} from '../global-styles/dimens';
import {Typography as Typ} from '../global-styles/typography';
import {GlobalEventBus} from '../drivers/eventbus';
import ZoomableImage from './ZoomableImage';
const remark = require('remark');
const ReactMarkdown = require('react-markdown');
const normalizeForReactNative = require('mdast-normalize-react-native');
const gemojiToEmoji = require('remark-gemoji-to-emoji');
const imagesToSsbServeBlobs = require('remark-images-to-ssb-serve-blobs');
const Ref = require('ssb-ref');
const linkifyRegex = require('remark-linkify-regex');

const $ = createElement;

const textProps: TextProperties = {
  selectable: true,
  textBreakStrategy: 'simple',
};

const styles = StyleSheet.create({
  paragraph: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    marginVertical: Dimensions.verticalSpaceSmall,
  },

  paragraphText: {
    flexWrap: 'wrap',
    overflow: 'visible',
    color: Palette.text,
  },

  text: {},

  listItemText: {
    color: Palette.text,
  },

  heading1: {
    fontWeight: 'bold',
    marginVertical: Dimensions.verticalSpaceNormal,
    fontSize: Typ.baseSize * Typ.scaleUp * Typ.scaleUp,
    color: Palette.text,
  },

  heading2: {
    fontWeight: 'bold',
    marginVertical: Dimensions.verticalSpaceNormal,
    fontSize: Typ.baseSize * Typ.scaleUp,
    color: Palette.text,
  },

  heading3: {
    fontWeight: 'bold',
    marginVertical: Dimensions.verticalSpaceSmall,
    fontSize: Typ.baseSize,
    color: Palette.text,
  },

  heading4: {
    fontWeight: 'bold',
    fontSize: Typ.baseSize * Typ.scaleDown,
    color: Palette.text,
  },

  heading5: {
    fontWeight: 'bold',
    fontSize: Typ.baseSize * Typ.scaleDown * Typ.scaleDown,
    color: Palette.text,
  },

  heading6: {
    fontWeight: 'bold',
    fontSize: Typ.baseSize * Typ.scaleDown * Typ.scaleDown * Typ.scaleDown,
    color: Palette.text,
  },

  em: {
    fontStyle: 'italic',
  },

  strong: {
    fontWeight: 'bold',
  },

  link: {
    textDecorationLine: 'underline',
  },

  cypherlink: {
    color: Palette.textBrand,
    textDecorationLine: 'underline',
  },

  inlineCode: {
    backgroundColor: Palette.backgroundTextWeak,
    color: Palette.textWeak,
    paddingLeft: 4,
    paddingRight: 4,
    borderRadius: 2,
    fontFamily: 'monospace',
  },

  strikethrough: {
    textDecorationLine: 'line-through',
  },

  blockquote: {
    backgroundColor: Palette.backgroundTextWeak,
    borderLeftWidth: 3,
    borderLeftColor: Palette.backgroundTextWeakStrong,
    paddingLeft: Dimensions.horizontalSpaceSmall,
    paddingRight: 1,
  },

  codeBlock: {
    backgroundColor: Palette.backgroundTextWeak,
    marginVertical: 2,
    paddingVertical: 3,
    paddingHorizontal: 5,
    borderRadius: 2,
  },

  codeText: {
    color: Palette.textWeak,
    fontSize: Typ.fontSizeSmall,
    fontWeight: 'normal',
    fontFamily: 'monospace',
  },

  horizontalLine: {
    backgroundColor: Palette.textLine,
    height: 2,
    marginTop: Dimensions.verticalSpaceSmall,
    marginBottom: Dimensions.verticalSpaceSmall,
  },

  orderedBullet: {
    fontWeight: 'bold',
  },
});

const renderers = {
  root: (props: {children: any}) => $(View, null, props.children),

  paragraph: (props: {children: any}) =>
    $(
      View,
      {style: styles.paragraph},
      $(Text, {...textProps, style: styles.paragraphText}, props.children),
    ),

  text: (props: {children: any}) =>
    $(Text, {...textProps, style: styles.text}, props.children),

  heading: (props: {children: any; level: 1 | 2 | 3 | 4 | 5 | 6}) =>
    $(
      Text,
      {...textProps, style: styles['heading' + props.level]},
      props.children,
    ),

  emphasis: (props: {children: any}) =>
    $(Text, {...textProps, style: styles.em}, props.children),

  strong: (props: {children: any}) =>
    $(Text, {...textProps, style: styles.strong}, props.children),

  link: (props: {children: any; href: string}) => {
    const isFeedCypherlink = Ref.isFeedId(props.href);
    const isMsgCypherlink = Ref.isMsgId(props.href);
    const isCypherlink = isFeedCypherlink || isMsgCypherlink;
    const isChildCypherlink =
      props.children.length === 1 &&
      (Ref.isFeedId(props.children[0]) || Ref.isMsgId(props.children[0]));
    return $(
      Text,
      {
        ...textProps,
        style: isCypherlink ? styles.cypherlink : styles.link,
        onPress: () => {
          if (isFeedCypherlink) {
            GlobalEventBus.dispatch({
              type: 'triggerFeedCypherlink',
              feedId: props.href,
            });
          } else if (isMsgCypherlink) {
            GlobalEventBus.dispatch({
              type: 'triggerMsgCypherlink',
              msgId: props.href,
            });
          } else {
            Linking.openURL(props.href);
          }
        },
      },
      isChildCypherlink
        ? [props.children[0].slice(0, 10) + '\u2026']
        : props.children,
    );
  },

  inlineCode: (props: {children: any}) =>
    $(Text, {...textProps, style: styles.inlineCode}, props.children),

  delete: (props: {children: any}) =>
    $(Text, {...textProps, style: styles.strikethrough}, props.children),

  blockquote: (props: {children: any}) =>
    $(View, {style: styles.blockquote}, props.children),

  code: (props: {value: string; language: string}) =>
    $(
      View,
      {style: styles.codeBlock},
      $(Text, {...textProps, style: styles.codeText}, props.value),
    ),

  thematicBreak: () => $(View, {style: styles.horizontalLine}),

  image: (props: {src: string; title?: string; alt?: string}) =>
    $(ZoomableImage, {src: props.src, title: props.title ?? props.alt}),

  list: (props: {children: any; depth: number; ordered: boolean}) =>
    $(
      View,
      {
        style: {
          paddingLeft: Dimensions.horizontalSpaceNormal * (props.depth + 1),
        },
      },
      props.children,
    ),

  listItem: (props: {children: any; index: number; ordered: boolean}) => {
    return $(
      Text,
      {...textProps, style: styles.listItemText},
      props.ordered
        ? $(Text, {style: styles.orderedBullet}, `${props.index + 1}. `)
        : $(Text, null, `\u2022 `),
      props.children,
    );
  },
};

function Markdown(markdownText: string) {
  const linkifySsbFeeds = linkifyRegex(Ref.feedIdRegex);
  const linkifySsbMsgs = linkifyRegex(Ref.msgIdRegex);

  return $<any>(ReactMarkdown, {
    source: remark()
      .use(gemojiToEmoji)
      .use(linkifySsbFeeds)
      .use(linkifySsbMsgs)
      .use(imagesToSsbServeBlobs)
      .processSync(markdownText).contents,
    astPlugins: [normalizeForReactNative()],
    allowedTypes: Object.keys(renderers),
    renderers,
  });
}

export default Markdown;
