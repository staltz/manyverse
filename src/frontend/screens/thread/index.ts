/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Stream} from 'xstream';
import {Command, NavSource} from 'cycle-native-navigation';
import {StateSource, Reducer} from '@cycle/state';
import {MsgId, FeedId} from 'ssb-typescript';
import {KeyboardSource} from 'cycle-native-keyboard';
import {SSBSource, Req} from '../../drivers/ssb';
import {DialogSource} from '../../drivers/dialogs';
import {Toast} from '../../drivers/toast';
import {Dimensions} from '../../global-styles/dimens';
import messageEtc from '../../components/messageEtc';
import model, {State} from './model';
import view from './view';
import intent from './intent';
import ssb from './ssb';
import navigation from './navigation';
import {ReactSource} from '@cycle/react';
import {ReactElement} from 'react';

export type Props = {
  selfFeedId: FeedId;
  rootMsgId: MsgId;
  replyToMsgId: MsgId;
};

export type Sources = {
  screen: ReactSource;
  navigation: NavSource;
  props: Stream<Props>;
  keyboard: KeyboardSource;
  dialog: DialogSource;
  state: StateSource<State>;
  ssb: SSBSource;
};

export type Sinks = {
  screen: Stream<ReactElement<any>>;
  navigation: Stream<Command>;
  keyboard: Stream<'dismiss'>;
  state: Stream<Reducer<State>>;
  clipboard: Stream<string>;
  toast: Stream<Toast>;
  ssb: Stream<Req>;
};

export const navOptions = {
  topBar: {
    visible: true,
    drawBehind: false,
    height: Dimensions.toolbarAndroidHeight,
    title: {
      text: 'Thread',
    },
    backButton: {
      icon: require('../../../../images/icon-arrow-left.png'),
      visible: true,
    },
  },
};

export function thread(sources: Sources): Sinks {
  const actions = intent(
    sources.screen,
    sources.keyboard,
    sources.ssb,
    sources.state.stream,
  );
  const messageEtcSinks = messageEtc({
    appear$: actions.openMessageEtc$,
    dialog: sources.dialog,
  });
  const actionsPlus = {...actions, goToRawMsg$: messageEtcSinks.goToRawMsg$};
  const reducer$ = model(sources.props, actionsPlus, sources.ssb);
  const command$ = navigation(
    actionsPlus,
    sources.navigation,
    sources.state.stream,
  );
  const vdom$ = view(sources.state.stream, actionsPlus);
  const newContent$ = ssb(actionsPlus);
  const dismiss$ = actions.publishMsg$.mapTo('dismiss' as 'dismiss');

  return {
    screen: vdom$,
    navigation: command$,
    keyboard: dismiss$,
    state: reducer$,
    clipboard: messageEtcSinks.clipboard,
    toast: messageEtcSinks.toast,
    ssb: newContent$,
  };
}
