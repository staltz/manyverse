/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import {StateSource, Reducer} from '@cycle/state';
import {ReactElement} from 'react';
import {FeedId} from 'ssb-typescript';
import {ReactSource} from '@cycle/react';
import {SSBSource, Req} from '../../drivers/ssb';
import {DialogSource} from '../../drivers/dialogs';
import {Toast} from '../../drivers/toast';
import {Command, NavSource} from 'cycle-native-navigation';
import messageEtc from '../../components/messageEtc';
import manageContact from './manage-contact';
import intent from './intent';
import model, {State} from './model';
import view from './view';
import ssb from './ssb';
import navigation from './navigation';

export type Props = {
  selfFeedId: FeedId;
  feedId: FeedId;
};

export type Sources = {
  props: Stream<Props>;
  screen: ReactSource;
  navigation: NavSource;
  state: StateSource<State>;
  ssb: SSBSource;
  dialog: DialogSource;
};

export type Sinks = {
  screen: Stream<ReactElement<any>>;
  navigation: Stream<Command>;
  state: Stream<Reducer<State>>;
  clipboard: Stream<string>;
  toast: Stream<Toast>;
  ssb: Stream<Req>;
};

export const navOptions = {
  topBar: {
    visible: false,
    height: 0,
  },
  sideMenu: {
    left: {
      enabled: false,
    },
  },
};

export function profile(sources: Sources): Sinks {
  const actions = intent(
    sources.screen,
    sources.navigation,
    sources.state.stream,
  );
  const messageEtcSinks = messageEtc({
    appear$: actions.openMessageEtc$,
    dialog: sources.dialog,
  });
  const manageContactSinks = manageContact({
    feedId$: sources.state.stream.map(state => state.displayFeedId),
    manageContact$: actions.manageContact$,
    dialog: sources.dialog,
  });
  const actionsPlus = {
    ...actions,
    ...manageContactSinks,
    goToRawMsg$: messageEtcSinks.goToRawMsg$,
  };
  const reducer$ = model(sources.props, sources.ssb);
  const vdom$ = view(sources.state.stream, sources.ssb);
  const newContent$ = ssb(actionsPlus, sources.state.stream);
  const command$ = navigation(
    actionsPlus,
    sources.navigation,
    sources.state.stream,
  );
  const clipboard$ = xs.merge(
    messageEtcSinks.clipboard,
    manageContactSinks.clipboard,
  );
  const toast$ = xs.merge(messageEtcSinks.toast, manageContactSinks.toast);

  return {
    screen: vdom$,
    navigation: command$,
    state: reducer$,
    clipboard: clipboard$,
    toast: toast$,
    ssb: newContent$,
  };
}
