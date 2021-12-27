// SPDX-FileCopyrightText: 2018-2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import sample from 'xstream-sample';
import {ReactSource} from '@cycle/react';
import {Platform} from 'react-native';
import {KeyboardSource} from 'cycle-native-keyboard';
import {NavSource} from 'cycle-native-navigation';
import {isReplyPostMsg} from 'ssb-typescript/utils';
import {FeedId, Msg, MsgId} from 'ssb-typescript';
import {SSBSource} from '../../drivers/ssb';
import {t} from '../../drivers/localization';
import {DialogSource} from '../../drivers/dialogs';
import {readOnlyDisclaimer} from '../../components/read-only-disclaimer';
import {
  PressAddReactionEvent,
  PressReactionsEvent,
  MsgAndExtras,
} from '../../ssb/types';
import {Screens} from '../enums';
import {State} from './model';
import {Props} from './props';

export default function intent(
  props$: Stream<Props>,
  reactSource: ReactSource,
  keyboardSource: KeyboardSource,
  navSource: NavSource,
  ssbSource: SSBSource,
  dialogSource: DialogSource,
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
      )
      .map((x) => {
        if (Platform.OS === 'web' && process.env.SSB_DB2_READ_ONLY) {
          return readOnlyDisclaimer(dialogSource);
        } else {
          return xs.of(x);
        }
      })
      .flatten(),

    willReply$: ssbSource.publishHook$.filter(isReplyPostMsg),

    keyboardAppeared$: keyboardSource.events('keyboardDidShow').mapTo(null),

    keyboardDisappeared$: keyboardSource.events('keyboardDidHide').mapTo(null),

    goToAccounts$: (
      reactSource
        .select('thread')
        .events('pressReactions') as Stream<PressReactionsEvent>
    ).map(({msgKey, reactions}) => ({
      title: t('accounts.reactions.title'),
      msgKey,
      accounts: reactions,
    })),

    goToAnotherThread$: reactSource
      .select('thread')
      .events('pressReplyToReply') as Stream<{
      rootMsgId: MsgId;
      msg: MsgAndExtras;
    }>,

    goToCompose$: reactSource
      .select('reply-expand')
      .events('press')
      .mapTo(null),

    addReactionMsg$: reactSource
      .select('thread')
      .events('pressAddReaction') as Stream<PressAddReactionEvent>,

    loadReplyDraft$: xs.merge(
      props$.map((props) => props.rootMsgId ?? props.rootMsg.key),
      navSource
        .globalDidDisappear(Screens.Compose)
        .compose(sample(state$))
        .map((state) => state.rootMsgId),
    ) as Stream<MsgId>,

    threadViewabilityChanged$: reactSource
      .select('thread')
      .events('viewableItemsChanged') as Stream<any>,

    replySeen$: reactSource
      .select('thread')
      .events('replySeen') as Stream<MsgId>,

    focusTextInput$: reactSource
      .select('thread')
      .events('pressReplyToRoot') as Stream<undefined>,

    openMessageEtc$: reactSource
      .select('thread')
      .events('pressEtc') as Stream<Msg>,

    updateReplyText$: reactSource
      .select('reply-input')
      .events('changeText') as Stream<string>,

    goToProfile$: reactSource.select('thread').events('pressAuthor') as Stream<{
      authorFeedId: FeedId;
    }>,

    exit$: xs.merge(
      navSource.backPress(),
      reactSource.select('topbar').events('pressBack'),
    ),
  };
}
