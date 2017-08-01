/**
 * MMMMM is a mobile app for Secure Scuttlebutt networks
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

import {PureComponent, createElement} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Markdown from 'react-native-simple-markdown';
import {h} from '@cycle/native-screen';
import {Palette} from '../../global-styles/palette';
import {Dimensions} from '../../global-styles/dimens';
import {Typography as Typ} from '../../global-styles/typography';
import MessageContainer from './MessageContainer';
import MessageHeader from './MessageHeader';
import {PostMsg, PostContent} from '../../types';

export const styles = StyleSheet.create({
  blockQuote: {
    flexDirection: 'row',
    backgroundColor: Palette.brand.textWeakBackground,
    marginTop: Dimensions.verticalSpaceNormal,
    marginBottom: Dimensions.verticalSpaceNormal
  },

  blockQuoteSectionBar: {
    width: 3,
    backgroundColor: Palette.gray5,
    marginRight: Dimensions.horizontalSpaceSmall
  },

  blockQuoteText: {
    marginTop: 0,
    marginBottom: 0,
    paddingTop: 4,
    paddingBottom: 5,
    color: Palette.brand.textWeak
  },

  codeBlock: {
    backgroundColor: Palette.brand.textWeakBackground,
    color: Palette.brand.textWeak,
    paddingTop: 3,
    paddingBottom: 3,
    paddingLeft: 5,
    paddingRight: 5,
    borderRadius: 2,
    fontFamily: 'monospace'
  },

  inlineCode: {
    backgroundColor: Palette.brand.textWeakBackground,
    color: Palette.brand.textWeak,
    paddingTop: 2,
    paddingBottom: 2,
    paddingLeft: 4,
    paddingRight: 4,
    borderRadius: 2,
    fontFamily: 'monospace'
  },

  em: {
    fontStyle: 'italic'
  },

  heading: {
    fontWeight: 'bold'
  },

  heading1: {
    fontSize: Typ.baseSize * Typ.scaleUp * Typ.scaleUp * Typ.scaleUp
  },

  heading2: {
    fontSize: Typ.baseSize * Typ.scaleUp * Typ.scaleUp
  },

  heading3: {
    fontSize: Typ.baseSize * Typ.scaleUp
  },

  heading4: {
    fontSize: Typ.baseSize
  },

  heading5: {
    fontSize: Typ.baseSize * Typ.scaleDown
  },

  heading6: {
    fontSize: Typ.baseSize * Typ.scaleDown * Typ.scaleDown
  },

  hr: {
    backgroundColor: Palette.gray4,
    height: 2
  },

  image: {
    width: 640,
    height: 480
  },

  link: {
    textDecorationLine: 'underline'
  },

  listItem: {
    flexDirection: 'row',
    alignItems: 'center'
  },

  listItemNumber: {
    fontWeight: 'bold'
  },

  mailTo: {
    textDecorationLine: 'underline'
  },

  paragraph: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    marginTop: Dimensions.verticalSpaceSmall,
    marginBottom: Dimensions.verticalSpaceSmall
  },

  listItemText: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    color: Palette.brand.text
  },

  text: {
    color: Palette.brand.text
  },

  video: {
    width: 300,
    height: 300
  }
});

const rules = {
  inlineCode: {
    react: (node: any, output: any, state: any) => {
      state.withinText = true;
      return createElement(
        Text,
        {key: state.key, style: styles.inlineCode},
        node.content
      );
    }
  },

  codeBlock: {
    react: (node: any, output: any, state: any) => {
      state.withinText = true;
      return createElement(
        Text,
        {
          key: state.key,
          style: styles.codeBlock
        },
        node.content
      );
    }
  },

  blockQuote: {
    react: (node: any, output: any, state: any) => {
      const wasWithinQuote = !!state.withinQuote;
      state.withinText = true;
      state.withinQuote = true;

      const blockBar = createElement(View, {
        key: state.key,
        style: styles.blockQuoteSectionBar
      });

      const blockText = createElement(
        Text,
        {key: state.key + 1, style: styles.blockQuoteText},
        output(node.content, state)
      );

      state.withinQuote = wasWithinQuote;
      return createElement(View, {key: state.key, style: styles.blockQuote}, [
        blockBar,
        blockText
      ]);
    }
  },

  text: {
    react: (node: any, output: any, state: any) => {
      if (state.withinQuote) {
        return createElement(
          Text,
          {key: state.key, style: styles.blockQuoteText},
          node.content
        );
      } else {
        return createElement(
          Text,
          {key: state.key, style: styles.text},
          node.content
        );
      }
    }
  }
};

function escapeRegExp(str: string): string {
  return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1');
}

function replaceAll(str: string, find: string, replace: string): string {
  return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

function materializeMarkdown(content: PostContent): string {
  let result = content.text;
  if (content.mentions) {
    content.mentions.forEach(mention => {
      if (
        mention.link &&
        mention.name &&
        mention.type &&
        mention.type === 'image/jpeg'
      ) {
        const name = mention.name;
        const link = mention.link;
        result = replaceAll(
          result,
          `![${name}](${link})`,
          `![${name}](http://localhost:7777/${encodeURIComponent(link)})`
        );
      }
    });
  }
  return result;
}

export default class PostMessage extends PureComponent<{msg: PostMsg}> {
  render() {
    const {msg} = this.props;
    const md = materializeMarkdown(msg.value.content);
    return h(MessageContainer, [
      h(MessageHeader, {msg}),
      h(Markdown, {styles, rules}, [md as any])
    ]);
  }
}
