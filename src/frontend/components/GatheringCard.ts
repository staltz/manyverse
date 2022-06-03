// SPDX-FileCopyrightText: 2020-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import debounce from 'xstream/extra/debounce';
import {PureComponent} from 'react';
import {LayoutChangeEvent, Platform, StyleSheet} from 'react-native';
import {h} from '@cycle/react';
import {FeedId, Msg} from 'ssb-typescript';
import {withXstreamProps} from 'react-xstream-hoc';
import {
  PressReactionsEvent,
  PressAddReactionEvent,
  ThreadSummaryWithExtras,
  Reactions,
  MsgAndExtras,
  GatheringInfo,
  GatheringAttendees,
} from '~frontend/ssb/types';
import {Dimensions} from '~frontend/global-styles/dimens';

import MessageContainer from './messages/MessageContainer';
import MessageFooter from './messages/MessageFooter';
import MessageHeader from './messages/MessageHeader';
import GatheringBody from './messages/GatheringBody';
import ReadMoreOverlay from './ReadMoreOverlay';

const GatheringBody$ = withXstreamProps(
  GatheringBody,
  'attendees',
  'gatheringInfo',
);
const MessageFooter$ = withXstreamProps(MessageFooter, 'reactions');

const MINIMUM_ADDED_ADJUSTMENT = 200;
const MOBILE_ADDED_ADJUSTMENT = 75;
const READMORE_CONTENT_HEIGHT_THRESHOLD = MINIMUM_ADDED_ADJUSTMENT * 0.75;

// Taken from ThreadCard but adjusted to give more allowance due to larger
// UI pieces like the banner
const CARD_HEIGHT =
  Platform.OS === 'web'
    ? Dimensions.desktopMiddleWidth.number + MINIMUM_ADDED_ADJUSTMENT
    : 350 + MINIMUM_ADDED_ADJUSTMENT + MOBILE_ADDED_ADJUSTMENT;

const POST_HEIGHT =
  CARD_HEIGHT -
  Dimensions.verticalSpaceBig - // MessageContainer padding top
  MessageHeader.HEIGHT -
  Dimensions.verticalSpaceNormal - // post margin top
  MessageFooter.HEIGHT;

interface Props {
  thread: ThreadSummaryWithExtras;
  selfFeedId: FeedId;
  lastSessionTimestamp: number;
  preferredReactions: Array<string>;
  onPressReactions?: (ev: PressReactionsEvent) => void;
  onPressAddReaction?: (ev: PressAddReactionEvent) => void;
  onPressAuthor?: (ev: {authorFeedId: FeedId}) => void;
  onPressEtc?: (msg: Msg) => void;
  onPressExpand?: (msg: MsgAndExtras) => void;
  onPressExpandReplies?: (msg: MsgAndExtras) => void;
}

interface State {
  initialBannerDimensions: {
    height: number;
    width: number;
  };
}

export default class GatheringCard extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      initialBannerDimensions: {
        height: 1,
        width: 1,
      },
    };
  }

  public render() {
    const {
      thread,
      selfFeedId,
      lastSessionTimestamp,
      preferredReactions,
      onPressAddReaction,
      onPressReactions,
      onPressAuthor,
      onPressEtc,
    } = this.props;

    const {initialBannerDimensions} = this.state;

    const {root} = thread;

    const metadata = root.value._$manyverse$metadata;

    const reactions = (
      metadata.reactions ?? (xs.never() as Stream<Reactions>)
    ).compose(debounce(80)); // avoid DB reads flickering

    const gatheringInfo = (
      metadata.gatheringInfo ?? (xs.never() as Stream<GatheringInfo>)
    ).compose(debounce(16)); // avoid DB reads flickering

    const attendees = (
      metadata.gatheringAttendees ?? (xs.never() as Stream<GatheringAttendees>)
    ).compose(debounce(16)); // avoid DB reads flickering

    const unread = thread.timestamp > lastSessionTimestamp;

    const showFading =
      POST_HEIGHT - initialBannerDimensions.height >
      READMORE_CONTENT_HEIGHT_THRESHOLD;

    return h(MessageContainer, {style: styles.container}, [
      h(MessageHeader, {
        key: 'mh',
        msg: root,
        unread,
        name: metadata.about.name,
        imageUrl: metadata.about.imageUrl,
        onPressAuthor,
      }),
      h(
        ReadMoreOverlay,
        {
          key: 'rmo',
          // We want the fade to start after the banner
          fadeStartY: initialBannerDimensions.height,
          fading: showFading,
          maxHeight: POST_HEIGHT,
          onPress: this.onPressReadMoreHandler,
          width: initialBannerDimensions.width,
        },
        [
          h(GatheringBody$, {
            attendees,
            gatheringInfo,
            onBannerLayout: this.onBannerLayout,
            selfFeedId,
          }),
        ],
      ),
      h(MessageFooter$, {
        key: 'mf',
        style: styles.footer,
        msg: root,
        selfFeedId,
        reactions,
        preferredReactions,
        replyCount: thread.replyCount,
        onPressReactions,
        onPressAddReaction,
        onPressReply: this.onPressReplyHandler,
        onPressEtc,
      }),
    ]);
  }

  private onPressReadMoreHandler = () => {
    const {onPressExpand, thread} = this.props;
    onPressExpand?.(thread.root);
  };

  private onBannerLayout = ({nativeEvent}: LayoutChangeEvent) => {
    const {layout} = nativeEvent;

    this.setState({
      initialBannerDimensions: {
        height: layout.height,
        width: layout.width,
      },
    });
  };

  private onPressReplyHandler = () => {
    const {onPressExpandReplies, thread} = this.props;
    onPressExpandReplies?.(thread.root);
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  footer: {
    flex: 0,
    height: MessageFooter.HEIGHT,
    minHeight: MessageFooter.HEIGHT,
    marginBottom: -Dimensions.verticalSpaceBig,
  },
});
