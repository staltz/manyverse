// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {createElement as $, PureComponent} from 'react';
import {
  Linking,
  Platform,
  StyleSheet,
  Text,
  TextProps,
  View,
  ViewProps,
} from 'react-native';
import {Palette} from '../global-styles/palette';
import {Dimensions} from '../global-styles/dimens';
import {Typography} from '../global-styles/typography';
import {GlobalEventBus} from '../drivers/eventbus';
import ZoomableImage from './ZoomableImage';
import AudioPlayer from './AudioPlayer';
import {
  isFeedSSBURI,
  isMessageSSBURI,
  isSSBURI,
  toFeedSigil,
  toMessageSigil,
} from 'ssb-uri2';
const gemojiToEmoji = require('remark-gemoji-to-emoji');
const imagesToSsbServeBlobs = require('remark-images-to-ssb-serve-blobs');
const linkifyRegex = require('remark-linkify-regex');
const normalizeForReactNative = require('mdast-normalize-react-native');
const ReactMarkdown = require('react-markdown');
const Ref = require('ssb-ref');
const remark = require('remark');
const getUnicodeWordRegex = require('unicode-word-regex');

const ELLIPSIS = '\u2026';

const textProps: TextProps = {
  selectable: true,
  textBreakStrategy: 'simple',
  ...Platform.select({
    web: {
      dataSet: {markdownText: 1},
    },
  }),
};

const styles = StyleSheet.create({
  text: {
    ...Platform.select({
      web: {
        fontFamily: Typography.fontFamilyReadableText,
        wordBreak: 'break-word',
      },
    }),
  },

  heading1: {
    fontWeight: '700',
    color: Palette.text,
    fontSize: Typography.fontSizeLarger,
    lineHeight: Typography.lineHeightLarger,
    marginVertical: Dimensions.verticalSpaceSmall,
    ...Platform.select({
      web: {
        fontFamily: Typography.fontFamilyReadableText,
        wordBreak: 'break-word',
      },
    }),
  },

  heading2: {
    fontWeight: '700',
    color: Palette.text,
    fontSize: Typography.fontSizeLarge,
    lineHeight: Typography.lineHeightLarge,
    marginVertical: Dimensions.verticalSpaceSmall,
    ...Platform.select({
      web: {
        fontFamily: Typography.fontFamilyReadableText,
        wordBreak: 'break-word',
      },
    }),
  },

  heading3: {
    fontWeight: '700',
    color: Palette.text,
    fontSize: Typography.fontSizeBig,
    lineHeight: Typography.lineHeightBig,
    marginVertical: Dimensions.verticalSpaceSmall,
    ...Platform.select({
      web: {
        fontFamily: Typography.fontFamilyReadableText,
        wordBreak: 'break-word',
      },
    }),
  },

  heading4: {
    fontWeight: '700',
    color: Palette.text,
    fontSize: Typography.fontSizeNormal,
    lineHeight: Typography.lineHeightNormal,
    marginVertical: Dimensions.verticalSpaceSmall,
    ...Platform.select({
      web: {
        fontFamily: Typography.fontFamilyReadableText,
        wordBreak: 'break-word',
      },
    }),
  },

  heading5: {
    fontWeight: '700',
    color: Palette.text,
    fontSize: Typography.fontSizeSmall,
    lineHeight: Typography.lineHeightSmall,
    marginVertical: Dimensions.verticalSpaceSmall,
    ...Platform.select({
      web: {
        fontFamily: Typography.fontFamilyReadableText,
        wordBreak: 'break-word',
      },
    }),
  },

  heading6: {
    fontWeight: '700',
    color: Palette.text,
    fontSize: Typography.fontSizeTiny,
    lineHeight: Typography.lineHeightTiny,
    marginVertical: Dimensions.verticalSpaceSmall,
    ...Platform.select({
      web: {
        fontFamily: Typography.fontFamilyReadableText,
        wordBreak: 'break-word',
      },
    }),
  },

  paragraph: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    marginVertical: Dimensions.verticalSpaceSmall,
    ...Platform.select({
      web: {
        fontFamily: Typography.fontFamilyReadableText,
        wordBreak: 'break-word',
      },
    }),
  },

  paragraphText: {
    flexWrap: 'wrap',
    overflow: 'visible',
    color: Palette.text,
    fontSize: Typography.fontSizeNormal,
    lineHeight: Typography.lineHeightNormal,
    ...Platform.select({
      web: {
        fontFamily: Typography.fontFamilyReadableText,
        wordBreak: 'break-word',
      },
    }),
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
    fontSize: Typography.fontSizeNormal,
    lineHeight: Typography.lineHeightNormal,
    ...Platform.select({
      web: {
        fontFamily: Typography.fontFamilyReadableText,
        wordBreak: 'break-word',
      },
    }),
  },

  orderedBullet: {
    fontWeight: '700',
  },

  inlineCode: {
    backgroundColor: Palette.backgroundTextWeak,
    fontFamily: Typography.fontFamilyMonospace,
    color: Palette.textWeak,
    ...Platform.select({
      web: {
        wordBreak: 'break-all',
      },
    }),
  },

  codeBlock: {
    backgroundColor: Palette.backgroundTextWeak,
    marginVertical: Dimensions.verticalSpaceSmall,
    padding: Dimensions.verticalSpaceSmall,
    ...Platform.select({
      web: {
        fontFamily: Typography.fontFamilyReadableText,
        wordBreak: 'break-all',
      },
    }),
  },

  codeText: {
    fontWeight: '400',
    color: Palette.textWeak,
    fontSize: Typography.fontSizeSmall,
    lineHeight: Typography.lineHeightSmall,
    fontFamily: Typography.fontFamilyMonospace,
    ...Platform.select({
      web: {
        wordBreak: 'break-all',
      },
    }),
  },

  blockquote: {
    backgroundColor: Palette.backgroundTextWeak,
    borderLeftWidth: 3,
    borderLeftColor: Palette.backgroundTextWeakStrong,
    marginVertical: Dimensions.verticalSpaceSmall,
    paddingLeft: Dimensions.horizontalSpaceSmall,
    paddingRight: 1,
    ...Platform.select({
      web: {
        fontFamily: Typography.fontFamilyReadableText,
        wordBreak: 'break-word',
      },
    }),
  },

  horizontalLine: {
    backgroundColor: Palette.textLine,
    marginVertical: Dimensions.verticalSpaceSmall,
    height: 2,
  },
});

function makeRenderers(
  onLayout?: ViewProps['onLayout'],
  mentions?: Array<any>,
) {
  function feedIdFromMention(linkName: string): string | null {
    if (!mentions) return null;
    for (const mention of mentions) {
      if (
        mention &&
        mention.name &&
        mention.link &&
        linkName === '@' + mention.name
      ) {
        return mention.link;
      }
    }
    return null;
  }

  const renderers = {
    root: (props: {children: any}) => $(View, {onLayout}, props.children),

    paragraph: (props: {children: any}) =>
      $(
        View,
        {style: styles.paragraph},
        $(Text, {...textProps, style: styles.paragraphText}, props.children),
      ),

    text: (props: {children: any; nodeKey?: string}) =>
      $(
        Text,
        {...textProps, key: props.nodeKey, style: styles.text},
        props.children,
      ),

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
      const {children, href} = props;
      if (!href) return renderers.text(props);

      const feedId = Ref.isFeedId(href)
        ? href
        : isFeedSSBURI(href)
        ? toFeedSigil(href)
        : feedIdFromMention(href);
      const msgId = Ref.isMsgId(href)
        ? href
        : isMessageSSBURI(href)
        ? toMessageSigil(href)
        : null;
      const hashtag = href.startsWith('#') ? href : null;
      const isCypherlink = !!feedId || !!msgId || !!hashtag;

      if (!isCypherlink && !href.startsWith('http')) {
        return renderers.text(props);
      }

      let child: string | null = null;
      if (isCypherlink) {
        child =
          typeof children?.[0] === 'string'
            ? children[0]
            : typeof children?.[0]?.props?.children === 'string'
            ? children[0].props.children
            : null;
      }
      if (child) {
        if (Ref.isFeedId(child) || Ref.isMsgId(child)) {
          child = child.slice(0, 10) + ELLIPSIS;
        } else if (isFeedSSBURI(child)) {
          child = child.slice(0, 26) + ELLIPSIS;
        } else if (isMessageSSBURI(child)) {
          child = child.slice(0, 28) + ELLIPSIS;
        }
      }

      if (isCypherlink) {
        return $(
          Text,
          {
            ...textProps,
            style: styles.cypherlink,
            onPress: () => {
              if (feedId) {
                GlobalEventBus.dispatch({
                  type: 'triggerFeedCypherlink',
                  feedId,
                });
              } else if (msgId) {
                GlobalEventBus.dispatch({type: 'triggerMsgCypherlink', msgId});
              } else if (hashtag) {
                GlobalEventBus.dispatch({type: 'triggerHashtagLink', hashtag});
              } else {
                throw new Error('unreachable');
              }
            },
          },
          child ?? children,
        );
      } else if (Platform.OS === 'web') {
        return $(
          'a',
          {
            style: {textDecoration: 'underline', color: Palette.text},
            href: props.href,
          },
          child ?? children,
        );
      } else {
        return $(
          Text,
          {
            ...textProps,
            style: styles.link,
            onPress: () => {
              Linking.openURL(props.href);
            },
          },
          child ?? props.children,
        );
      }
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

    image: (props: {src: string; title?: string; alt?: string}) => {
      // Audio and video are recognized as images but their caption start with `audio:` or `video:`
      if (props.alt?.startsWith('audio:')) {
        if (Platform.OS === 'web') {
          return $('audio', {
            src: props.src,
            controls: true,
            style: {
              width: '100%',
              margin: `${Dimensions.verticalSpaceSmall}px 0`,
            },
          });
        } else {
          return $(AudioPlayer, {src: props.src});
        }
      }

      return $(ZoomableImage, {
        src: props.src,
        title: props.title ?? props.alt,
      });
    },

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

  return renderers;
}

export interface Props {
  text: string;
  onLayout?: ViewProps['onLayout'];
  mentions?: Array<any>;
}

function transformLinkUri(uri: string) {
  if (isSSBURI(uri)) return uri; // don't interfere with SSB URIs
  return ReactMarkdown.uriTransformer(uri); // interfere with all others
}

export default class Markdown extends PureComponent<Props> {
  public render() {
    const linkifySsbFeeds = linkifyRegex(
      /@[A-Za-z0-9._\-+=\/]*[A-Za-z0-9_\-+=/]/g,
    );
    const linkifySsbMsgs = linkifyRegex(Ref.msgIdRegex);
    const linkifyHashtags = linkifyRegex(
      new RegExp('#(' + getUnicodeWordRegex().source + '|\\d|-)+', 'gu'),
    );
    const renderers = makeRenderers(this.props.onLayout, this.props.mentions);

    return $<any>(ReactMarkdown, {
      source: remark()
        .use(gemojiToEmoji)
        .use(linkifySsbFeeds)
        .use(linkifySsbMsgs)
        .use(linkifyHashtags)
        .use(imagesToSsbServeBlobs)
        .processSync(this.props.text).contents,
      astPlugins: [normalizeForReactNative()],
      allowedTypes: Object.keys(renderers),
      transformLinkUri,
      renderers,
    });
  }
}
