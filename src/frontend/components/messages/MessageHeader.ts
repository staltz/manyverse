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
import {FeedId, Msg} from 'ssb-typescript';
import {displayName} from '../../ssb/utils/from-ssb';
import {Palette} from '../../global-styles/palette';
import {Dimensions} from '../../global-styles/dimens';
import {Typography} from '../../global-styles/typography';
import Avatar from '../Avatar';
import TimeAgo from '../TimeAgo';

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

  authorName: {
    fontSize: Typography.fontSizeNormal,
    fontWeight: 'bold',
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.text,
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
  msg: Msg;
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
    const unread = this.props.unread;
    const authorTouchableProps = {
      onPress: this._onPressAuthor,
      activeOpacity: 0.4,
    };

    return h(View, {style: [styles.container, this.props.style]}, [
      h(TouchableOpacity, {...authorTouchableProps, key: 'a'}, [
        h(Avatar, {
          size: Dimensions.avatarSizeNormal,
          url: imageUrl,
          style: styles.authorAvatar,
        }),
      ]),
      h(
        TouchableOpacity,
        {...authorTouchableProps, key: 'b', style: styles.authorNameTouchable},
        [
          h(
            Text,
            {
              numberOfLines: 1,
              ellipsizeMode: 'middle',
              style: styles.authorName,
            },
            displayName(name, msg.value.author),
          ),
        ],
      ),
      h(TimeAgo, {timestamp: msg.value.timestamp, unread: unread ?? false}),
    ]);
  }
}
