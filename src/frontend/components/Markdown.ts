/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {createElement as $, PureComponent} from 'react';
import {Linking, StyleSheet, Text, TextProperties, View} from 'react-native';
import {Palette} from '../global-styles/palette';
import {Dimensions} from '../global-styles/dimens';
import {Typography as Typ} from '../global-styles/typography';
import {GlobalEventBus} from '../drivers/eventbus';
import ZoomableImage from './ZoomableImage';
const gemojiToEmoji = require('remark-gemoji-to-emoji');
const imagesToSsbServeBlobs = require('remark-images-to-ssb-serve-blobs');
const linkifyRegex = require('remark-linkify-regex');
const normalizeForReactNative = require('mdast-normalize-react-native');
const ReactMarkdown = require('react-markdown');
const Ref = require('ssb-ref');
const remark = require('remark');

const textProps: TextProperties = {
  selectable: true,
  textBreakStrategy: 'simple',
};

const styles = StyleSheet.create({
  text: {},

  heading1: {
    fontWeight: '700',
    color: Palette.text,
    fontSize: Typ.baseSize * Math.pow(Typ.scaleUp, 3),
    lineHeight: Typ.baseSize * Math.pow(Typ.scaleUp, 3) * Typ.baseLeading,
    marginVertical: Dimensions.verticalSpaceSmall,
  },

  heading2: {
    fontWeight: '700',
    color: Palette.text,
    fontSize: Typ.baseSize * Math.pow(Typ.scaleUp, 2),
    lineHeight: Typ.baseSize * Math.pow(Typ.scaleUp, 2) * Typ.baseLeading,
    marginVertical: Dimensions.verticalSpaceSmall,
  },

  heading3: {
    fontWeight: '700',
    color: Palette.text,
    fontSize: Typ.baseSize * Typ.scaleUp,
    lineHeight: Typ.baseSize * Typ.scaleUp * Typ.baseLeading,
    marginVertical: Dimensions.verticalSpaceSmall,
  },

  heading4: {
    fontWeight: '700',
    color: Palette.text,
    fontSize: Typ.baseSize,
    lineHeight: Typ.baseSize * Typ.baseLeading,
    marginVertical: Dimensions.verticalSpaceSmall,
  },

  heading5: {
    fontWeight: '700',
    color: Palette.text,
    fontSize: Typ.baseSize * Typ.scaleDown,
    lineHeight: Typ.baseSize * Typ.baseLeading,
    marginVertical: Dimensions.verticalSpaceSmall,
  },

  heading6: {
    fontWeight: '700',
    color: Palette.text,
    fontSize: Typ.baseSize * Math.pow(Typ.scaleDown, 2),
    lineHeight: Typ.baseSize * Typ.baseLeading,
    marginVertical: Dimensions.verticalSpaceSmall,
  },

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
    fontSize: Typ.baseSize,
    lineHeight: Typ.baseSize * Typ.baseLeading,
  },

  strong: {
    fontWeight: '700',
  },

  em: {
    fontStyle: 'italic',
  },

  strikethrough: {
    textDecorationLine: 'line-through',
  },

  link: {
    textDecorationLine: 'underline',
  },

  cypherlink: {
    color: Palette.textBrand,
    textDecorationLine: 'underline',
  },

  listItemText: {
    color: Palette.text,
    fontSize: Typ.baseSize,
    lineHeight: Typ.baseSize * Typ.baseLeading,
  },

  orderedBullet: {
    fontWeight: '700',
  },

  inlineCode: {
    backgroundColor: Palette.backgroundTextWeak,
    fontFamily: Typ.fontFamilyMonospace,
    color: Palette.textWeak,
  },

  codeBlock: {
    backgroundColor: Palette.backgroundTextWeak,
    marginVertical: Dimensions.verticalSpaceSmall,
    padding: Dimensions.verticalSpaceSmall,
  },

  codeText: {
    fontFamily: Typ.fontFamilyMonospace,
    fontWeight: '400',
    color: Palette.textWeak,
    fontSize: Typ.fontSizeSmall,
    lineHeight: Typ.fontSizeSmall * Typ.baseLeading,
  },

  blockquote: {
    backgroundColor: Palette.backgroundTextWeak,
    borderLeftWidth: 3,
    borderLeftColor: Palette.backgroundTextWeakStrong,
    marginVertical: Dimensions.verticalSpaceSmall,
    paddingLeft: Dimensions.horizontalSpaceSmall,
    paddingRight: 1,
  },

  horizontalLine: {
    backgroundColor: Palette.textLine,
    marginVertical: Dimensions.verticalSpaceSmall,
    height: 2,
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

export default class Markdown extends PureComponent<{text: string}> {
  public render() {
    const linkifySsbFeeds = linkifyRegex(Ref.feedIdRegex);
    const linkifySsbMsgs = linkifyRegex(Ref.msgIdRegex);

    return $<any>(ReactMarkdown, {
      source: remark()
        .use(gemojiToEmoji)
        .use(linkifySsbFeeds)
        .use(linkifySsbMsgs)
        .use(imagesToSsbServeBlobs)
        .processSync(this.props.text).contents,
      astPlugins: [normalizeForReactNative()],
      allowedTypes: Object.keys(renderers),
      renderers,
    });
  }
}
