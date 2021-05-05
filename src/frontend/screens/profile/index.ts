/* Copyright (C) 2018-2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import dropRepeats from 'xstream/extra/dropRepeats';
import {StateSource, Reducer} from '@cycle/state';
import {ReactElement} from 'react';
import {ReactSource} from '@cycle/react';
import {AsyncStorageSource} from 'cycle-native-asyncstorage';
import {Command, NavSource} from 'cycle-native-navigation';
import {SSBSource, Req} from '../../drivers/ssb';
import {DialogSource} from '../../drivers/dialogs';
import {Toast} from '../../drivers/toast';
import messageEtc from '../../components/messageEtc';
import manageContact from './manage-contact';
import copyCypherlink from './copy-cypherlink';
import intent from './intent';
import model, {State} from './model';
import view from './view';
import ssb from './ssb';
import navigation from './navigation';
export {navOptions} from './layout';
import {Props as P} from './props';

export type Props = P;

export type Sources = {
  props: Stream<Props>;
  screen: ReactSource;
  navigation: NavSource;
  state: StateSource<State>;
  asyncstorage: AsyncStorageSource;
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

export function profile(sources: Sources): Sinks {
  const state$ = sources.state.stream;

  const actions = intent(sources.screen, sources.navigation, state$);

  const messageEtcSinks = messageEtc({
    appear$: actions.openMessageEtc$,
    dialog: sources.dialog,
  });

  const feedId$ = state$
    .map((state) => state.displayFeedId)
    .compose(dropRepeats());

  const manageContactSinks = manageContact({
    feedId$,
    manageContact$: actions.manageContact$,
    dialog: sources.dialog,
  });

  const copyCypherlinkSinks = copyCypherlink({
    feedId$,
    appear$: actions.goToFeedId$,
    dialog: sources.dialog,
  });

  const actionsPlus = {
    ...actions,
    ...manageContactSinks,
    ...copyCypherlinkSinks,
    goToRawMsg$: messageEtcSinks.goToRawMsg$,
  };

  const reducer$ = model(
    actionsPlus,
    sources.asyncstorage,
    sources.props,
    sources.ssb,
  );

  const vdom$ = view(state$, sources.ssb);

  const newContent$ = ssb(actionsPlus, state$);

  const command$ = navigation(
    actionsPlus,
    sources.ssb,
    sources.navigation,
    state$,
  );

  const clipboard$ = xs.merge(
    messageEtcSinks.clipboard,
    copyCypherlinkSinks.clipboard,
  );

  const toast$ = xs.merge(messageEtcSinks.toast, copyCypherlinkSinks.toast);

  return {
    screen: vdom$,
    navigation: command$,
    state: reducer$,
    clipboard: clipboard$,
    toast: toast$,
    ssb: newContent$,
  };
}
