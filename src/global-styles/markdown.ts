import {createElement} from 'react';
import {
  View,
  Text,
  Image,
  Dimensions,
  StyleSheet,
  PixelRatio,
} from 'react-native';
import {Palette} from './palette';
import {Dimensions as Dimens} from './dimens';
import {Typography as Typ} from './typography';
import createMarkdownRenderer from 'rn-markdown';

const Markdown = createMarkdownRenderer({gfm: true});

Markdown.renderer.container = View;

Markdown.renderer.blockquote = ({markdown, ...props}: any) => {
  return createElement(View, {style: styles.blockquote}, props.children);
};

Markdown.renderer.image = ({markdown, ...props}: any) => {
  const {width} = Dimensions.get('window');
  const size = PixelRatio.getPixelSizeForLayoutSize(width);
  return createElement(Image, {
    source: {uri: markdown.href},
    style: {
      width: size,
      height: size * 0.75,
      position: 'relative',
      left: 0,
      right: 0,
      marginTop: Dimens.verticalSpaceSmall,
      marginBottom: Dimens.verticalSpaceSmall,
      backgroundColor: Palette.indigo1,
      resizeMode: 'cover',
    },
  });
};

Markdown.renderer.code = ({markdown, ...props}: any) => {
  const inline = !markdown.children;
  if (inline) {
    return createElement(Text, {style: styles.inline_code}, markdown.text);
  } else {
    return createElement(Text, {style: styles.code}, props.children);
  }
};

Markdown.renderer.em = ({markdown, ...props}: any) => {
  return createElement(Text, {style: styles.em}, props.children);
};

Markdown.renderer.text = ({markdown, ...props}: any) => {
  return createElement(Text, {style: styles.text}, props.children);
};

Markdown.renderer.link = ({markdown, ...props}: any) => {
  return createElement(Text, {style: styles.link}, props.children);
};

Markdown.renderer.strong = ({markdown, ...props}: any) => {
  return createElement(Text, {style: styles.strong}, props.children);
};

Markdown.renderer.paragraph = ({markdown, ...props}: any) => {
  return createElement(Text, {style: styles.paragraph}, props.children);
};

const styles = StyleSheet.create({
  blockquote: {
    backgroundColor: Palette.brand.textWeakBackground,
    borderLeftWidth: 3,
    borderLeftColor: Palette.gray5,
    paddingLeft: Dimens.horizontalSpaceSmall,
    paddingRight: 1,
  },

  link: {
    textDecorationLine: 'underline',
  },

  paragraph: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    marginTop: Dimens.verticalSpaceSmall,
    marginBottom: Dimens.verticalSpaceSmall,
  },

  em: {
    fontStyle: 'italic',
  },

  strong: {
    fontWeight: 'bold',
  },

  text: {
    color: Palette.brand.text,
  },

  code: {
    backgroundColor: Palette.brand.textWeakBackground,
    color: Palette.brand.textWeak,
    fontSize: Typ.fontSizeSmall,
    fontWeight: 'normal',
    fontFamily: 'monospace',
    paddingTop: 3,
    paddingBottom: 3,
    paddingLeft: 5,
    paddingRight: 5,
    borderRadius: 2,
  },

  inline_code: {
    backgroundColor: Palette.brand.textWeakBackground,
    color: Palette.brand.textWeak,
    paddingLeft: 4,
    paddingRight: 4,
    borderRadius: 2,
    fontFamily: 'monospace',
  },
});

export default Markdown;

export const markdownStyles = {
  blockquote: {},

  code: {
    color: Palette.brand.textWeak,
    fontSize: Typ.fontSizeSmall,
    fontWeight: 'normal',
    fontFamily: 'monospace',
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

  list: {
    paddingLeft: Dimens.horizontalSpaceSmall,
    paddingRight: Dimens.horizontalSpaceSmall,
  },

  list_item_bullet: {
    fontSize: 20,
    lineHeight: 20,
    marginTop: 6,
    color: Palette.brand.text,
  },

  list_item_number: {
    fontWeight: 'bold',
  },

  video: {
    width: 300,
    height: 300,
  },
};
