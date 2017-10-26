import {createElement} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Palette} from './palette';
import {Dimensions} from './dimens';
import {Typography as Typ} from './typography';

export const styles = StyleSheet.create({
  blockQuote: {
    flexDirection: 'row',
    backgroundColor: Palette.brand.textWeakBackground,
    marginTop: Dimensions.verticalSpaceNormal,
    marginBottom: Dimensions.verticalSpaceNormal,
  },

  blockQuoteSectionBar: {
    width: 3,
    backgroundColor: Palette.gray5,
    marginRight: Dimensions.horizontalSpaceSmall,
  },

  blockQuoteText: {
    marginTop: 0,
    marginBottom: 0,
    paddingTop: 4,
    paddingBottom: 5,
    color: Palette.brand.textWeak,
  },

  codeBlock: {
    backgroundColor: Palette.brand.textWeakBackground,
    color: Palette.brand.textWeak,
    paddingTop: 3,
    paddingBottom: 3,
    paddingLeft: 5,
    paddingRight: 5,
    borderRadius: 2,
    fontFamily: 'monospace',
  },

  inlineCode: {
    backgroundColor: Palette.brand.textWeakBackground,
    color: Palette.brand.textWeak,
    paddingTop: 2,
    paddingBottom: 2,
    paddingLeft: 4,
    paddingRight: 4,
    borderRadius: 2,
    fontFamily: 'monospace',
  },

  em: {
    fontStyle: 'italic',
  },

  heading: {
    fontWeight: 'bold',
  },

  heading1: {
    fontSize: Typ.baseSize * Typ.scaleUp * Typ.scaleUp * Typ.scaleUp,
  },

  heading2: {
    fontSize: Typ.baseSize * Typ.scaleUp * Typ.scaleUp,
  },

  heading3: {
    fontSize: Typ.baseSize * Typ.scaleUp,
  },

  heading4: {
    fontSize: Typ.baseSize,
  },

  heading5: {
    fontSize: Typ.baseSize * Typ.scaleDown,
  },

  heading6: {
    fontSize: Typ.baseSize * Typ.scaleDown * Typ.scaleDown,
  },

  hr: {
    backgroundColor: Palette.gray4,
    height: 2,
  },

  image: {
    width: 640,
    height: 480,
    backgroundColor: Palette.indigo1,
  },

  link: {
    textDecorationLine: 'underline',
  },

  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  listItemNumber: {
    fontWeight: 'bold',
  },

  mailTo: {
    textDecorationLine: 'underline',
  },

  paragraph: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    marginTop: Dimensions.verticalSpaceSmall,
    marginBottom: Dimensions.verticalSpaceSmall,
  },

  listItemText: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    color: Palette.brand.text,
  },

  text: {
    color: Palette.brand.text,
  },

  video: {
    width: 300,
    height: 300,
  },
});

export const rules = {
  inlineCode: {
    react: (node: any, output: any, state: any) => {
      state.withinText = true;
      return createElement(
        Text,
        {key: state.key, style: styles.inlineCode},
        node.content,
      );
    },
  },

  codeBlock: {
    react: (node: any, output: any, state: any) => {
      state.withinText = true;
      return createElement(
        Text,
        {
          key: state.key,
          style: styles.codeBlock,
        },
        node.content,
      );
    },
  },

  blockQuote: {
    react: (node: any, output: any, state: any) => {
      const wasWithinQuote = !!state.withinQuote;
      state.withinText = true;
      state.withinQuote = true;

      const blockBar = createElement(View, {
        key: state.key,
        style: styles.blockQuoteSectionBar,
      });

      const blockText = createElement(
        Text,
        {key: state.key + 1, style: styles.blockQuoteText},
        output(node.content, state),
      );

      state.withinQuote = wasWithinQuote;
      return createElement(View, {key: state.key, style: styles.blockQuote}, [
        blockBar,
        blockText,
      ]);
    },
  },

  text: {
    react: (node: any, output: any, state: any) => {
      if (state.withinQuote) {
        return createElement(
          Text,
          {key: state.key, style: styles.blockQuoteText},
          node.content,
        );
      } else {
        return createElement(
          Text,
          {key: state.key, style: styles.text},
          node.content,
        );
      }
    },
  },
};
