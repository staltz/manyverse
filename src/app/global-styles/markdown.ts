/**
 * Manyverse is a mobile app for Secure Scuttlebutt networks
 *
 * Copyright (C) 2017 Andre 'Staltz' Medeiros
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import {createElement} from 'react';
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
const remark = require('remark');
const ReactMarkdown = require('react-markdown');
const normalizeForReactNative = require('mdast-normalize-react-native');
const gemojiToEmoji = require('remark-gemoji-to-emoji');
const stripHtml = require('remark-strip-html');

const pictureIcon = require('../../../images/image-area.png');
const $ = createElement;

const styles = StyleSheet.create({
  text: {
    color: Palette.brand.text,
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
    color: Palette.brand.text,
  },

  heading2: {
    fontWeight: 'bold',
    marginVertical: Dimens.verticalSpaceNormal,
    fontSize: Typ.baseSize * Typ.scaleUp,
    color: Palette.brand.text,
  },

  heading3: {
    fontWeight: 'bold',
    marginVertical: Dimens.verticalSpaceSmall,
    fontSize: Typ.baseSize,
    color: Palette.brand.text,
  },

  heading4: {
    fontWeight: 'bold',
    fontSize: Typ.baseSize * Typ.scaleDown,
    color: Palette.brand.text,
  },

  heading5: {
    fontWeight: 'bold',
    fontSize: Typ.baseSize * Typ.scaleDown * Typ.scaleDown,
    color: Palette.brand.text,
  },

  heading6: {
    fontWeight: 'bold',
    fontSize: Typ.baseSize * Typ.scaleDown * Typ.scaleDown * Typ.scaleDown,
    color: Palette.brand.text,
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

  inlineCode: {
    backgroundColor: Palette.brand.textWeakBackground,
    color: Palette.brand.textWeak,
    paddingLeft: 4,
    paddingRight: 4,
    borderRadius: 2,
    fontFamily: 'monospace',
  },

  strikethrough: {
    textDecorationLine: 'line-through',
  },

  blockquote: {
    backgroundColor: Palette.brand.textWeakBackground,
    borderLeftWidth: 3,
    borderLeftColor: Palette.gray5,
    paddingLeft: Dimens.horizontalSpaceSmall,
    paddingRight: 1,
  },

  codeBlock: {
    backgroundColor: Palette.brand.textWeakBackground,
    paddingTop: 3,
    paddingBottom: 3,
    paddingLeft: 5,
    paddingRight: 5,
    borderRadius: 2,
  },

  codeText: {
    color: Palette.brand.textWeak,
    fontSize: Typ.fontSizeSmall,
    fontWeight: 'normal',
    fontFamily: 'monospace',
  },

  horizontalLine: {
    backgroundColor: Palette.gray4,
    height: 2,
    marginTop: Dimens.verticalSpaceSmall,
    marginBottom: Dimens.verticalSpaceSmall,
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

  link: (props: {children: any; href: string}) =>
    $(
      Text,
      {
        selectable: true,
        style: styles.link,
        onPress: () => Linking.openURL(props.href),
      },
      props.children,
    ),

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
    const d = Dimensions.get('window');
    const width = d.width - Dimens.horizontalSpaceBig * 2;
    const height = width * 0.7;
    return $(
      ImageBackground,
      {
        style: {
          marginTop: Dimens.verticalSpaceSmall,
          marginBottom: Dimens.verticalSpaceSmall,
          backgroundColor: Palette.gray1,
          width,
          height,
        },
        resizeMode: 'center',
        source: pictureIcon,
      },
      $(Image, {
        source: {uri: props.src},
        style: {resizeMode: 'cover', width, height},
      }),
    );
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
  return $<any>(ReactMarkdown, {
    source: remark().use(gemojiToEmoji).use(stripHtml).processSync(markdownText)
      .contents,
    astPlugins: [normalizeForReactNative()],
    allowedTypes: Object.keys(renderers),
    renderers,
  });
}

export default Markdown;
