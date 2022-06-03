// SPDX-FileCopyrightText: 2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {h} from '@cycle/react';
import {PureComponent} from 'react';
import {StyleSheet, View} from 'react-native';

import {Dimensions as Dimens} from '~frontend/global-styles/dimens';
import {
  GatheringAttendee,
  GatheringAttendees,
  GatheringInfo,
} from '~frontend/ssb/types';

import GatheringBody from './GatheringBody';
import MessageContainer from './MessageContainer';
import MessageHeader, {Props as MessageHeaderProps} from './MessageHeader';
import MessageFooter, {Props as MessageFooterProps} from './MessageFooter';

const styles = StyleSheet.create({
  bodyContainer: {
    marginTop: Dimens.verticalSpaceNormal,
  },
  footer: {
    flex: 0,
    height: MessageFooter.HEIGHT,
    minHeight: MessageFooter.HEIGHT,
    marginBottom: -Dimens.verticalSpaceBig,
  },
});

type Props = MessageHeaderProps &
  MessageFooterProps & {
    webFocusHack?: boolean;
    lastSessionTimestamp: number;
    gatheringInfo: GatheringInfo;
    gatheringAttendees: GatheringAttendees;
    onPressAttendeeList?: (ev: {
      msgKey: string;
      attendees: Array<GatheringAttendee>;
    }) => void;
    onPressAttendGathering?: (ev: {
      isAttending: boolean;
      attendeeId: string;
      gatheringId: string;
    }) => void;
  };

export default class GatheringMessage extends PureComponent<Props> {
  public render() {
    const props = this.props;

    const {
      gatheringAttendees,
      gatheringInfo,
      lastSessionTimestamp,
      msg,
      onPressAttendGathering,
      onPressAttendeeList,
      selfFeedId,
      webFocusHack,
    } = props;

    if (!gatheringInfo) {
      return null;
    }

    const unread = msg.timestamp > lastSessionTimestamp;

    return h(MessageContainer, {webFocusHack}, [
      h(MessageHeader, {...props, unread}),
      h(View, {style: styles.bodyContainer}, [
        h(GatheringBody, {
          attendees: gatheringAttendees,
          gatheringInfo,
          onPressAttendeeList: (attendeeList) =>
            onPressAttendeeList?.({
              msgKey: msg.key,
              attendees: attendeeList,
            }),
          onPressAttend: (isAttending) =>
            onPressAttendGathering?.({
              isAttending,
              attendeeId: selfFeedId,
              gatheringId: gatheringInfo.about,
            }),
          selfFeedId,
        }),
      ]),

      h(MessageFooter, {...props, style: styles.footer}),
    ]);
  }
}
