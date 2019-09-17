/* Copyright (C) 2018-2019 The Manyverse Authors.
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
import {Palette} from '../../global-styles/palette';
import {Likes} from '../../ssb/types';
import {Screens} from '../..';
import {State} from './model';
import {Props} from './index';

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
  topBarBack$: Stream<any>,
  state$: Stream<State>,
  dialogSource: DialogSource,
) {
  const back$ = xs.merge(navSource.backPress(), topBarBack$);

  const backWithoutDialog$ = back$.compose(sample(state$)).filter(isTextEmpty);

  const backWithDialog$ = back$
    .compose(sample(state$))
    .filter(hasText)
    .map(() =>
      dialogSource.alert('', 'Save reply draft?', {
        positiveText: 'Save',
        positiveColor: Palette.text,
        negativeText: 'Delete',
        negativeColor: Palette.textNegative,
      }),
    )
    .flatten();

  return {
    publishMsg$: reactSource
      .select('reply-send')
      .events('press')
      .compose(sample(state$))
      .filter(state => !!state.replyText && !!state.rootMsgId),

    willReply$: ssbSource.publishHook$.filter(isReplyPostMsg),

    keyboardAppeared$: keyboardSource.events('keyboardDidShow').mapTo(null),

    keyboardDisappeared$: keyboardSource.events('keyboardDidHide').mapTo(null),

    goToAccounts$: reactSource
      .select('thread')
      .events('pressLikeCount') as Stream<{msgKey: MsgId; likes: Likes}>,

    goToCompose$: reactSource
      .select('reply-expand')
      .events('press')
      .mapTo(null),

    likeMsg$: reactSource.select('thread').events('pressLike') as Stream<{
      msgKey: string;
      like: boolean;
    }>,

    loadReplyDraft$: xs
      .merge(
        props$.map(props => props.rootMsgId),
        navSource
          .globalDidDisappear(Screens.Compose)
          .compose(sample(state$))
          .map(state => state.rootMsgId),
      )
      .filter(rootMsgId => !!rootMsgId) as Stream<MsgId>,

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
      res => res.action === 'actionPositive',
    ),

    exitDeletingDraft$: backWithDialog$.filter(
      res => res.action === 'actionNegative',
    ),

    exitOfAnyKind$: xs.merge(backWithoutDialog$, backWithDialog$),
  };
}
