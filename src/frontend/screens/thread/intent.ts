/* Copyright (C) 2018-2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import sample from 'xstream-sample';
import {ReactSource} from '@cycle/react';
import {KeyboardSource} from 'cycle-native-keyboard';
import {NavSource} from 'cycle-native-navigation';
import {isReplyPostMsg} from 'ssb-typescript/utils';
import {FeedId, Msg, MsgId} from 'ssb-typescript';
import {DialogSource} from '../../drivers/dialogs';
import {SSBSource} from '../../drivers/ssb';
import {t} from '../../drivers/localization';
import {Palette} from '../../global-styles/palette';
import {
  PressAddReactionEvent,
  PressReactionsEvent,
  MsgAndExtras,
} from '../../ssb/types';
import {Screens} from '../enums';
import {State} from './model';
import {Props} from './props';

function isTextEmpty(state: State): boolean {
  return !state.replyText;
}

function hasText(state: State): boolean {
  return !!state.replyText && state.replyText.length > 0;
}

export default function intent(
  props$: Stream<Props>,
  reactSource: ReactSource,
  keyboardSource: KeyboardSource,
  navSource: NavSource,
  ssbSource: SSBSource,
  state$: Stream<State>,
  dialogSource: DialogSource,
) {
  const back$ = xs.merge(
    navSource.backPress(),
    reactSource.select('topbar').events('pressBack'),
  );

  const backWithoutDialog$ = back$.compose(sample(state$)).filter(isTextEmpty);

  const backWithDialog$ = back$
    .compose(sample(state$))
    .filter(hasText)
    .map(() =>
      dialogSource.alert('', t('thread.dialogs.save_draft_prompt.title'), {
        positiveText: t('call_to_action.save'),
        positiveColor: Palette.text,
        negativeText: t('call_to_action.delete'),
        negativeColor: Palette.textNegative,
      }),
    )
    .flatten();

  return {
    publishMsg$: reactSource
      .select('reply-send')
      .events('press')
      .compose(sample(state$))
      .filter((state) => !!state.replyText),

    willReply$: ssbSource.publishHook$.filter(isReplyPostMsg),

    keyboardAppeared$: keyboardSource.events('keyboardDidShow').mapTo(null),

    keyboardDisappeared$: keyboardSource.events('keyboardDidHide').mapTo(null),

    goToAccounts$: (reactSource
      .select('thread')
      .events('pressReactions') as Stream<PressReactionsEvent>).map(
      ({msgKey, reactions}) => ({
        title: t('accounts.reactions.title'),
        msgKey,
        accounts: reactions,
      }),
    ),

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

    replySeen$: reactSource.select('thread').events('replySeen') as Stream<
      MsgId
    >,

    focusTextInput$: reactSource
      .select('thread')
      .events('pressReplyToRoot') as Stream<undefined>,

    openMessageEtc$: reactSource.select('thread').events('pressEtc') as Stream<
      Msg
    >,

    updateReplyText$: reactSource
      .select('reply-input')
      .events('changeText') as Stream<string>,

    goToProfile$: reactSource.select('thread').events('pressAuthor') as Stream<{
      authorFeedId: FeedId;
    }>,

    exit$: backWithoutDialog$,

    exitSavingDraft$: backWithDialog$.filter(
      (res) => res.action === 'actionPositive',
    ),

    exitDeletingDraft$: backWithDialog$.filter(
      (res) => res.action === 'actionNegative',
    ),

    exitOfAnyKind$: xs.merge(backWithoutDialog$, backWithDialog$),
  };
}
