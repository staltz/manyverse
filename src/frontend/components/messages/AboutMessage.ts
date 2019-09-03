/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Component} from 'react';
import {View, Text, Image, StyleSheet} from 'react-native';
import HumanTime from 'react-human-time';
import {h} from '@cycle/react';
import Markdown from '../Markdown';
import {Palette} from '../../global-styles/palette';
import {Dimensions} from '../../global-styles/dimens';
import {Typography} from '../../global-styles/typography';
import MessageContainer from './MessageContainer';
import {Msg, AboutContent as About} from 'ssb-typescript';
import {authorName} from '../../../ssb/from-ssb';

export const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flex: 1,
  },

  account: {
    fontSize: Typography.fontSizeNormal,
    fontFamily: Typography.fontFamilyReadableText,
    maxWidth: 120,
    color: Palette.textWeak,
  },

  followed: {
    fontSize: Typography.fontSizeNormal,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.textWeak,
  },

  timestamp: {
    fontSize: Typography.fontSizeSmall,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.textWeak,
  },

  aboutImage: {
    borderRadius: Dimensions.avatarBorderRadius,
    marginTop: Dimensions.verticalSpaceNormal,
    marginBottom: Dimensions.verticalSpaceNormal,
    width: 120,
    height: 120,
  },
});

const accountTextProps = {
  numberOfLines: 1,
  ellipsizeMode: 'middle' as 'middle',
  style: styles.account,
};

function renderWithImage(
  name: string | null,
  imageUrl: string | null,
  msg: Msg<About>,
) {
  return h(MessageContainer, [
    h(View, {style: styles.row}, [
      h(Text, accountTextProps, authorName(name, msg)),
      h(Text, {style: styles.followed}, ' is using a new picture:'),
    ]),
    h(Image, {
      style: styles.aboutImage as any,
      source: {uri: imageUrl || undefined},
    }),
    h(View, {style: styles.row}, [
      h(Text, {style: styles.timestamp}, [
        h(HumanTime as any, {time: msg.value.timestamp}),
      ]),
    ]),
  ]);
}

function renderWithNameDesc(name: string | null, msg: Msg<About>) {
  return h(MessageContainer, [
    h(View, {style: styles.row}, [
      h(Text, [
        h(Text, accountTextProps, authorName(name, msg)),
        h(Text, {style: styles.followed}, ' is using the name "'),
        h(Text, accountTextProps, msg.value.content.name),
        h(Text, {style: styles.followed}, '" and the description: '),
      ]),
    ]),
    Markdown(msg.value.content.description || ''),
    h(View, {style: styles.row}, [
      h(Text, {style: styles.timestamp}, [
        h(HumanTime as any, {time: msg.value.timestamp}),
      ]),
    ]),
  ]);
}

function renderWithDesc(name: string | null, msg: Msg<About>) {
  return h(MessageContainer, [
    h(View, {style: styles.row}, [
      h(Text, accountTextProps, authorName(name, msg)),
      h(Text, {style: styles.followed}, ' has a new description: '),
    ]),
    Markdown(msg.value.content.description || ''),
    h(View, {style: styles.row}, [
      h(Text, {style: styles.timestamp}, [
        h(HumanTime as any, {time: msg.value.timestamp}),
      ]),
    ]),
  ]);
}

function renderWithName(name: string | null, msg: Msg<About>) {
  return h(MessageContainer, [
    h(View, {style: styles.row}, [
      h(Text, [
        h(Text, accountTextProps, authorName(name, msg)),
        h(Text, {style: styles.followed}, ' is using the name "'),
        h(Text, accountTextProps, msg.value.content.name),
        h(Text, '"'),
      ]),
    ]),
    h(View, {style: styles.row}, [
      h(Text, {style: styles.timestamp}, [
        h(HumanTime as any, {time: msg.value.timestamp}),
      ]),
    ]),
  ]);
}

export type Props = {
  msg: Msg<About>;
  name: string | null;
  imageUrl: string | null;
};

export default class AboutMessage extends Component<Props, {}> {
  constructor(props: Props) {
    super(props);
  }

  public shouldComponentUpdate(nextProps: Props) {
    const prevProps = this.props;
    return (
      nextProps.msg.key !== prevProps.msg.key ||
      nextProps.name !== prevProps.name ||
      nextProps.imageUrl !== prevProps.imageUrl
    );
  }

  public render() {
    const {msg, name, imageUrl} = this.props;

    const hasImage = !!imageUrl;
    const hasName = !!msg.value.content.name;
    const hasDescription = !!msg.value.content.description;

    if (hasImage) {
      return renderWithImage(name, imageUrl, msg);
    } else if (hasName && hasDescription) {
      return renderWithNameDesc(name, msg);
    } else if (hasDescription) {
      return renderWithDesc(name, msg);
    } else {
      return renderWithName(name, msg);
    }
  }
}
