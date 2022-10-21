// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import sample from 'xstream-sample';
import sampleCombine from 'xstream/extra/sampleCombine';
import {ReactSource} from '@cycle/react';
import {KeyboardSource} from 'cycle-native-keyboard';
import {NavSource} from 'cycle-native-navigation';
import {isReplyPostMsg} from 'ssb-typescript/utils';
import {FeedId, Msg, MsgId} from 'ssb-typescript';
import {SSBSource} from '~frontend/drivers/ssb';
import {t} from '~frontend/drivers/localization';
import {
  PressAddReactionEvent,
  PressReactionsEvent,
  PressGatheringAttendeesEvent,
  MsgAndExtras,
} from '~frontend/ssb/types';
import {Screens} from '~frontend/screens/enums';
import {State} from './model';
import {Props} from './props';

export default function intent(
  props$: Stream<Props>,
  reactSource: ReactSource,
  keyboardSource: KeyboardSource,
  navSource: NavSource,
  ssbSource: SSBSource,
  state$: Stream<State>,
) {
  return {
    publishMsg$: reactSource
      .select('reply-send')
      .events('press')
      .compose(sample(state$))
      .filter(
        ({replyText}) =>
          typeof replyText === 'string' && replyText.trim().length > 0,
      ),

    attendGathering$: reactSource.select('gathering').events<{
      isAttending: boolean;
      attendeeId: string;
      gatheringId: string;
    }>('pressAttendGathering'),

    willReply$: ssbSource.publishHook$
      .filter(isReplyPostMsg)
      .compose(sampleCombine(state$))
      // Filtering replies that are not relative to the current root of the thread
      .filter(([reply, state]) => state.rootMsgId === reply.value.content.root),

    keyboardAppeared$: keyboardSource.events('keyboardDidShow').mapTo(null),

    keyboardDisappeared$: keyboardSource.events('keyboardDidHide').mapTo(null),

    goToAccounts$: xs.merge(
      reactSource
        .select('thread')
        .events<PressReactionsEvent>('pressReactions')
        .map(({msgKey, reactions}) => ({
          title: t('accounts.reactions.title'),
          msgKey,
          accounts: reactions,
        })),

      reactSource
        .select('gathering')
        .events<PressGatheringAttendeesEvent>('pressAttendeeList')
        .map(({msgKey, attendees}) => ({
          title: t('accounts.gathering_attendees.title'),
          msgKey,
          accounts: attendees.map(({feedId}) => feedId),
        })),
    ),

    goToAnotherThread$: reactSource
      .select('thread')
      .events<{rootMsgId: MsgId; msg: MsgAndExtras}>('pressReplyToReply'),

    goToCompose$: reactSource
      .select('reply-expand')
      .events('press')
      .mapTo(null),

    addReactionMsg$: reactSource
      .select('thread')
      .events<PressAddReactionEvent>('pressAddReaction'),

    loadReplyDraft$: xs.merge(
      props$.map((props) => props.rootMsgId ?? props.rootMsg.key),
      navSource
        .globalDidDisappear(Screens.Compose)
        .compose(sample(state$))
        .map((state) => state.rootMsgId),
    ) as Stream<MsgId>,

    focusTextInput$: reactSource
      .select('thread')
      .events<undefined>('pressReplyToRoot'),

    openMessageEtc$: reactSource.select('thread').events<Msg>('pressEtc'),

    openMessageShare$: reactSource.select('thread').events<Msg>('pressShare'),

    updateReplyText$: reactSource
      .select('reply-input')
      .events<string>('changeText'),

    goToProfile$: reactSource
      .select('thread')
      .events<{authorFeedId: FeedId}>('pressAuthor'),

    exit$: xs.merge(
      navSource.backPress(),
      reactSource.select('topbar').events('pressBack'),
    ),
  };
}
