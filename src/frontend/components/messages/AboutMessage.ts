/* Copyright (C) 2018-2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Component} from 'react';
import {View, Text, Image, StyleSheet} from 'react-native';
import {h} from '@cycle/react';
import {Msg, AboutContent as About} from 'ssb-typescript';
import {t} from '../../drivers/localization';
import {Palette} from '../../global-styles/palette';
import {Dimensions} from '../../global-styles/dimens';
import {Typography} from '../../global-styles/typography';
import {displayName} from '../../ssb/utils/from-ssb';
import LocalizedHumanTime from '../LocalizedHumanTime';
import Markdown from '../Markdown';
import MessageContainer from './MessageContainer';

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
  name: string | undefined,
  imageUrl: string | null,
  msg: Msg<About>,
  unread: boolean,
) {
  return h(MessageContainer, {unread}, [
    h(View, {style: styles.row}, [
      h(
        Text,
        {style: styles.followed},
        t('message.about.new_picture.1_normal'),
      ),
      h(
        Text,
        accountTextProps,
        t('message.about.new_picture.2_bold', {
          name: displayName(name, msg.value.author),
        }),
      ),
      h(
        Text,
        {style: styles.followed},
        t('message.about.new_picture.3_normal'),
      ),
    ]),
    h(Image, {
      style: styles.aboutImage,
      source: {uri: imageUrl ?? undefined},
    }),
    h(View, {style: styles.row}, [
      h(Text, {style: styles.timestamp}, [
        h(LocalizedHumanTime, {time: msg.value.timestamp}),
      ]),
    ]),
  ]);
}

function renderWithNameDesc(
  name: string | undefined,
  msg: Msg<About>,
  unread: boolean,
) {
  return h(MessageContainer, {unread}, [
    h(View, {style: styles.row}, [
      h(Text, [
        h(
          Text,
          {style: styles.followed},
          t('message.about.new_name_and_description.1_normal'),
        ),
        h(
          Text,
          accountTextProps,
          t('message.about.new_name_and_description.2_bold', {
            name: displayName(name, msg.value.author),
          }),
        ),
        h(
          Text,
          {style: styles.followed},
          t('message.about.new_name_and_description.3_normal'),
        ),
        h(
          Text,
          accountTextProps,
          t('message.about.new_name_and_description.4_bold', {
            name: msg.value.content.name,
          }),
        ),
        h(
          Text,
          {style: styles.followed},
          t('message.about.new_name_and_description.5_normal'),
        ),
      ]),
    ]),
    h(Markdown, {text: msg.value.content.description ?? ''}),
    h(View, {style: styles.row}, [
      h(Text, {style: styles.timestamp}, [
        h(LocalizedHumanTime, {time: msg.value.timestamp}),
      ]),
    ]),
  ]);
}

function renderWithDesc(
  name: string | undefined,
  msg: Msg<About>,
  unread: boolean,
) {
  return h(MessageContainer, {unread}, [
    h(View, {key: 'a', style: styles.row}, [
      h(
        Text,
        {style: styles.followed},
        t('message.about.new_description.1_normal'),
      ),
      h(
        Text,
        accountTextProps,
        t('message.about.new_description.2_bold', {
          name: displayName(name, msg.value.author),
        }),
      ),
      h(
        Text,
        {style: styles.followed},
        t('message.about.new_description.3_normal'),
      ),
    ]),
    h(Markdown, {key: 'b', text: msg.value.content.description ?? ''}),
    h(View, {key: 'c', style: styles.row}, [
      h(Text, {style: styles.timestamp}, [
        h(LocalizedHumanTime, {time: msg.value.timestamp}),
      ]),
    ]),
  ]);
}

function renderWithName(
  name: string | undefined,
  msg: Msg<About>,
  unread: boolean,
) {
  return h(MessageContainer, {unread}, [
    h(View, {style: styles.row}, [
      h(Text, [
        h(Text, {style: styles.followed}, t('message.about.new_name.1_normal')),
        h(
          Text,
          accountTextProps,
          t('message.about.new_name.2_bold', {
            name: displayName(name, msg.value.author),
          }),
        ),
        h(Text, {style: styles.followed}, t('message.about.new_name.3_normal')),
        h(
          Text,
          accountTextProps,
          t('message.about.new_name.4_bold', {
            name: msg.value.content.name,
          }),
        ),
        h(Text, {style: styles.followed}, t('message.about.new_name.5_normal')),
      ]),
    ]),
    h(View, {style: styles.row}, [
      h(Text, {style: styles.timestamp}, [
        h(LocalizedHumanTime, {time: msg.value.timestamp}),
      ]),
    ]),
  ]);
}

export type Props = {
  msg: Msg<About>;
  name?: string;
  imageUrl: string | null;
  lastSessionTimestamp: number;
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
    const {msg, name, imageUrl, lastSessionTimestamp} = this.props;

    const hasImage = !!imageUrl;
    const hasName = !!msg.value.content.name;
    const hasDescription = !!msg.value.content.description;
    const unread = msg.timestamp > lastSessionTimestamp;

    if (hasImage) {
      return renderWithImage(name, imageUrl, msg, unread);
    } else if (hasName && hasDescription) {
      return renderWithNameDesc(name, msg, unread);
    } else if (hasDescription) {
      return renderWithDesc(name, msg, unread);
    } else {
      return renderWithName(name, msg, unread);
    }
  }
}
