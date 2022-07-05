// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import {h} from '@cycle/react';
import {FeedId} from 'ssb-typescript';
import {t} from '~frontend/drivers/localization';
import {MsgAndExtras} from '~frontend/ssb/types';
import {displayName} from '~frontend/ssb/utils/from-ssb';
import {Palette} from '~frontend/global-styles/palette';
import {Dimensions} from '~frontend/global-styles/dimens';
import {Typography} from '~frontend/global-styles/typography';
import Avatar from '~frontend/components/Avatar';
import TimeAgo from '~frontend/components/TimeAgo';

/**
 * In pixels.
 */
const HEIGHT = Dimensions.avatarSizeNormal;

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 0,
    flex: 0,
    height: HEIGHT,
    minHeight: HEIGHT,
  },

  authorAvatar: {
    marginRight: Dimensions.horizontalSpaceSmall,
  },

  authorNameTouchable: {
    flex: 1,
  },

  authorNameSection: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },

  authorName: {
    fontSize: Typography.fontSizeNormal,
    fontWeight: 'bold',
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.text,
  },

  introducer: {
    fontSize: Typography.fontSizeNormal,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.textWeak,
  },

  introducerName: {
    fontSize: Typography.fontSizeNormal,
    fontWeight: 'bold',
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.textWeak,
  },

  timestamp: {
    marginTop: 1,
    marginLeft: Dimensions.horizontalSpaceTiny,
    fontSize: Typography.fontSizeSmall,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.textWeak,
  },

  timestampUnread: {
    marginTop: 1,
    marginLeft: Dimensions.horizontalSpaceTiny,
    fontSize: Typography.fontSizeSmall,
    fontFamily: Typography.fontFamilyReadableText,
    fontWeight: 'bold',
    color: Palette.textPositive,
  },
});

export interface Props {
  msg: MsgAndExtras;
  style?: ViewStyle;
  name?: string;
  imageUrl: string | null;
  unread?: boolean;
  onPressAuthor?: (ev: {authorFeedId: FeedId}) => void;
}

export default class MessageHeader extends Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  /**
   * in pixels
   */
  public static HEIGHT = HEIGHT;

  private _onPressAuthor = () => {
    const onPressAuthor = this.props.onPressAuthor;
    if (onPressAuthor) {
      onPressAuthor({authorFeedId: this.props.msg.value.author});
    }
  };

  private _onPressIntroducer = () => {
    const onPressAuthor = this.props.onPressAuthor;
    if (onPressAuthor) {
      onPressAuthor({
        authorFeedId: this.props.msg.value._$manyverse$metadata.introducer![0],
      });
    }
  };

  public shouldComponentUpdate(nextProps: Props) {
    const prevProps = this.props;
    return (
      nextProps.msg.key !== prevProps.msg.key ||
      nextProps.name !== prevProps.name ||
      nextProps.imageUrl !== prevProps.imageUrl
    );
  }

  private _renderAuthorName(name: string | undefined, id: FeedId) {
    return h(
      TouchableOpacity,
      {
        onPress: this._onPressAuthor,
        activeOpacity: 0.4,
        key: 'c',
        style: styles.authorNameTouchable,
      },
      [
        h(
          Text,
          {
            numberOfLines: 1,
            ellipsizeMode: 'middle',
            style: styles.authorName,
          },
          displayName(name, id),
        ),
      ],
    );
  }

  private _renderIntroducer(name: string | undefined, id: FeedId) {
    return h(
      Text,
      {numberOfLines: 1, ellipsizeMode: 'head', style: styles.introducer},
      [
        t('message.introducer.1_normal'),
        h(
          Text,
          {style: styles.introducerName, onPress: this._onPressIntroducer},
          t('message.introducer.2_bold', {name: displayName(name, id)}),
        ),
        t('message.introducer.3_normal'),
      ],
    );
  }

  public render() {
    const {msg, name, imageUrl} = this.props;
    const unread = this.props.unread;
    const authorTouchableProps = {
      onPress: this._onPressAuthor,
      activeOpacity: 0.4,
    };

    if (!msg.value._$manyverse$metadata.introducer) {
      console.error('No introducer found for ' + msg.value.author);
    }

    const metadata = msg.value._$manyverse$metadata;
    const [introId, introHop, introName] = metadata.introducer ?? ['', -1, ''];

    return h(View, {style: [styles.container, this.props.style]}, [
      h(TouchableOpacity, {...authorTouchableProps, key: 'a'}, [
        h(Avatar, {
          size: Dimensions.avatarSizeNormal,
          url: imageUrl,
          style: styles.authorAvatar,
        }),
      ]),
      introHop > 1
        ? h(View, {style: styles.authorNameSection, key: 'b'}, [
            this._renderAuthorName(name, msg.value.author),
            this._renderIntroducer(introName, introId),
          ])
        : this._renderAuthorName(name, msg.value.author),
      h(TimeAgo, {timestamp: msg.value.timestamp, unread: unread ?? false}),
    ]);
  }
}
