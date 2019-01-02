/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {createElement, PureComponent} from 'react';
import {
  View,
  Text,
  Image,
  ImageBackground,
  Dimensions,
  Linking,
  StyleSheet,
} from 'react-native';
import {Palette} from './palette';
import {Dimensions as Dimens} from './dimens';
import {Typography as Typ} from './typography';
import {GlobalEventBus} from '../drivers/eventbus';
const remark = require('remark');
const ReactMarkdown = require('react-markdown');
const normalizeForReactNative = require('mdast-normalize-react-native');
const gemojiToEmoji = require('remark-gemoji-to-emoji');
const stripHtml = require('remark-strip-html');
const imagesToSsbServeBlobs = require('remark-images-to-ssb-serve-blobs');
const ref = require('ssb-ref');
const linkifyRegex = require('remark-linkify-regex');

const pictureIcon = require('../../../images/image-area.png');
const $ = createElement;

const styles = StyleSheet.create({
  text: {
    color: Palette.text,
  },

  paragraph: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    marginVertical: Dimens.verticalSpaceSmall,
  },

  heading1: {
    fontWeight: 'bold',
    marginVertical: Dimens.verticalSpaceNormal,
    fontSize: Typ.baseSize * Typ.scaleUp * Typ.scaleUp,
    color: Palette.text,
  },

  heading2: {
    fontWeight: 'bold',
    marginVertical: Dimens.verticalSpaceNormal,
    fontSize: Typ.baseSize * Typ.scaleUp,
    color: Palette.text,
  },

  heading3: {
    fontWeight: 'bold',
    marginVertical: Dimens.verticalSpaceSmall,
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
    paddingLeft: Dimens.horizontalSpaceSmall,
    paddingRight: 1,
  },

  codeBlock: {
    backgroundColor: Palette.backgroundTextWeak,
    paddingTop: 3,
    paddingBottom: 3,
    paddingLeft: 5,
    paddingRight: 5,
    borderRadius: 2,
  },

  codeText: {
    color: Palette.textWeak,
    fontSize: Typ.fontSizeSmall,
    fontWeight: 'normal',
    fontFamily: 'monospace',
  },

  horizontalLine: {
    backgroundColor: Palette.textVeryWeak,
    height: 2,
    marginTop: Dimens.verticalSpaceSmall,
    marginBottom: Dimens.verticalSpaceSmall,
  },

  orderedBullet: {
    fontWeight: 'bold',
  },
});

class ImageWithBG extends PureComponent<{src: string}, {loaded: boolean}> {
  constructor(props: {src: string}) {
    super(props);
    this.state = {loaded: false};
    this.onLoad = () => {
      this.setState({loaded: true});
    };
  }

  private onLoad: () => void;

  public render() {
    const d = Dimensions.get('window');
    const width = d.width - Dimens.horizontalSpaceBig * 2;
    const height = width * 0.7;
    if (this.state.loaded) {
      return $(Image, {
        source: {uri: this.props.src},
        style: {
          marginTop: Dimens.verticalSpaceSmall,
          marginBottom: Dimens.verticalSpaceSmall,
          resizeMode: 'cover',
          width,
          height,
        },
      });
    } else {
      return $(
        ImageBackground,
        {
          style: {
            marginTop: Dimens.verticalSpaceSmall,
            marginBottom: Dimens.verticalSpaceSmall,
            backgroundColor: Palette.backgroundVoidWeak,
            width,
            height,
          },
          resizeMode: 'center',
          source: pictureIcon,
        },
        $(Image, {
          source: {uri: this.props.src},
          onLoad: this.onLoad,
          style: {resizeMode: 'cover', width, height},
        }),
      );
    }
  }
}

const renderers = {
  root: (props: {children: any}) => $(View, null, props.children),

  paragraph: (props: {children: any}) =>
    $(
      View,
      {style: styles.paragraph},
      $(Text, {selectable: true, style: styles.text}, props.children),
    ),

  heading: (props: {children: any; level: 1 | 2 | 3 | 4 | 5 | 6}) =>
    $(
      Text,
      {selectable: true, style: styles['heading' + props.level]},
      props.children,
    ),

  emphasis: (props: {children: any}) =>
    $(Text, {selectable: true, style: styles.em}, props.children),

  strong: (props: {children: any}) =>
    $(Text, {selectable: true, style: styles.strong}, props.children),

  link: (props: {children: any; href: string}) => {
    const isFeedCypherlink = ref.isFeedId(props.href);
    const isMsgCypherlink = ref.isMsgId(props.href);
    const isCypherlink = isFeedCypherlink || isMsgCypherlink;
    const isChildCypherlink =
      props.children.length === 1 &&
      (ref.isFeedId(props.children[0]) || ref.isMsgId(props.children[0]));
    return $(
      Text,
      {
        selectable: true,
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
    $(Text, {selectable: true, style: styles.inlineCode}, props.children),

  delete: (props: {children: any}) =>
    $(Text, {selectable: true, style: styles.strikethrough}, props.children),

  blockquote: (props: {children: any}) =>
    $(View, {style: styles.blockquote}, props.children),

  code: (props: {value: string; language: string}) =>
    $(
      View,
      {style: styles.codeBlock},
      $(Text, {selectable: true, style: styles.codeText}, props.value),
    ),

  thematicBreak: () => $(View, {style: styles.horizontalLine}),

  image: (props: {src: string; title: string; alt: string}) => {
    return $(ImageWithBG, {src: props.src});
  },

  list: (props: {children: any; depth: number; ordered: boolean}) =>
    $(
      View,
      {
        style: {
          paddingLeft: Dimens.horizontalSpaceNormal * (props.depth + 1),
        },
      },
      props.children,
    ),

  listItem: (props: {children: any; index: number; ordered: boolean}) => {
    return $(
      Text,
      {selectable: true, style: styles.text},
      props.ordered
        ? $(Text, {style: styles.orderedBullet}, `${props.index + 1}. `)
        : $(Text, null, `\u2022 `),
      props.children,
    );
  },
};

function Markdown(markdownText: string) {
  const linkifySsbFeeds = linkifyRegex(ref.feedIdRegex);
  const linkifySsbMsgs = linkifyRegex(ref.msgIdRegex);

  return $<any>(ReactMarkdown, {
    source: remark()
      .use(gemojiToEmoji)
      .use(stripHtml)
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
