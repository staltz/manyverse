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

import {createElement} from 'react';
import {
  View,
  Text,
  Image,
  ImageBackground,
  Dimensions,
  StyleSheet,
} from 'react-native';
import {Palette} from './palette';
import {Dimensions as Dimens} from './dimens';
import {Typography as Typ} from './typography';
import createMarkdownRenderer from 'rn-markdown';
const pictureIcon = require('../../../images/image-area.png');

const Markdown: any = createMarkdownRenderer({gfm: true});

Markdown.renderer.container = View;

Markdown.renderer.blockquote = ({markdown, ...props}: any) => {
  return createElement(View, {style: styles.blockquote}, props.children);
};

Markdown.renderer.image = ({markdown, ...props}: any) => {
  const d = Dimensions.get('window');
  const width = d.width - Dimens.horizontalSpaceBig * 2;
  const height = width * 0.7;
  return createElement(
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
    createElement(Image, {
      source: {uri: markdown.href},
      style: {resizeMode: 'cover', width, height},
    }),
  );
};

Markdown.renderer.code = ({markdown, style, ...props}: any) => {
  const inline = !markdown.children;
  if (inline) {
    return createElement(
      Text,
      {selectable: true, style: [style, styles.inline_code]},
      markdown.text,
    );
  } else {
    return createElement(
      Text,
      {selectable: true, style: [style, styles.code]},
      props.children,
    );
  }
};

Markdown.renderer.em = ({markdown, style, ...props}: any) => {
  return createElement(
    Text,
    {selectable: true, style: [style, styles.em]},
    props.children,
  );
};

Markdown.renderer.text = ({markdown, style, ...props}: any) => {
  return createElement(
    Text,
    {selectable: true, style: [style.text, style]},
    props.children,
  );
};

Markdown.renderer.link = ({markdown, style, ...props}: any) => {
  return createElement(
    Text,
    {selectable: true, style: [style, styles.link]},
    props.children,
  );
};

Markdown.renderer.strong = ({markdown, style, ...props}: any) => {
  return createElement(
    Text,
    {selectable: true, style: [style, styles.strong]},
    props.children,
  );
};

Markdown.renderer.paragraph = ({markdown, style, ...props}: any) => {
  return createElement(
    View,
    {style: [style, styles.paragraph]},
    props.children,
  );
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
    marginTop: Dimens.verticalSpaceNormal,
    fontSize: Typ.baseSize * Typ.scaleUp * Typ.scaleUp,
  },

  heading2: {
    marginTop: Dimens.verticalSpaceNormal,
    fontSize: Typ.baseSize * Typ.scaleUp,
  },

  heading3: {
    marginTop: Dimens.verticalSpaceSmall,
    fontSize: Typ.baseSize,
  },

  heading4: {
    fontSize: Typ.baseSize * Typ.scaleDown,
  },

  heading5: {
    fontSize: Typ.baseSize * Typ.scaleDown * Typ.scaleDown,
  },

  heading6: {
    fontSize: Typ.baseSize * Typ.scaleDown * Typ.scaleDown * Typ.scaleDown,
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
