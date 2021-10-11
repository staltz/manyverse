// SPDX-FileCopyrightText: 2020-2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import sample from 'xstream-sample';
import {ReactElement} from 'react';
import {KeyboardSource} from 'cycle-native-keyboard';
import {ReactSource} from '@cycle/react';
import {StateSource, Reducer} from '@cycle/state';
import {Command, NavSource} from 'cycle-native-navigation';
import Path = require('path');
import {
  Response as RecorderResponse,
  Command as RecorderCommand,
} from '../../drivers/recorder';
import {GlobalEvent} from '../../drivers/eventbus';
import {SSBSource} from '../../drivers/ssb';
import {FSSource} from '../../drivers/fs';
import {DialogSource} from '../../drivers/dialogs';
import model, {State} from './model';
import view from './view';
import intent from './intent';
import recorder from './recorder';

export type Sources = {
  screen: ReactSource;
  navigation: NavSource;
  keyboard: KeyboardSource;
  state: StateSource<State>;
  globalEventBus: Stream<GlobalEvent>;
  ssb: SSBSource;
  fs: FSSource;
  dialog: DialogSource;
  recorder: Stream<RecorderResponse>;
};

export type Sinks = {
  screen: Stream<ReactElement<any>>;
  navigation: Stream<Command>;
  state: Stream<Reducer<State>>;
  keyboard: Stream<'dismiss'>;
  fs: Stream<any>;
  globalEventBus: Stream<GlobalEvent>;
  recorder: Stream<RecorderCommand>;
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
  animations: {
    push: {
      enabled: false,
    },
    pop: {
      enabled: false,
    },
  },
};

export function composeAudio(sources: Sources): Sinks {
  const state$ = sources.state.stream;
  const vdom$ = view(state$);
  const actions = intent(
    sources.screen,
    sources.navigation,
    sources.dialog,
    sources.recorder,
    state$,
  );

  function unlinkAndMoveToCache(state: State) {
    return sources.fs
      .unlink(state.path!)
      .map(() =>
        sources.fs
          .exists(state.path!)
          .map((exists) => {
            const dest = Path.join(
              FSSource.CachesDirectoryPath,
              state.filename,
            );
            return exists
              ? sources.fs.moveFile(state.path!, dest).mapTo(null)
              : xs.of(null);
          })
          .flatten(),
      )
      .flatten();
  }

  const fsCommand$ = actions.discardRecording$
    .compose(sample(state$))
    .map(unlinkAndMoveToCache)
    .flatten();

  const submittedAndClearedTmp$ = sources.globalEventBus
    .filter((ev) => ev.type === 'audioBlobComposed')
    .compose(sample(state$))
    .map(unlinkAndMoveToCache)
    .flatten();

  const navCommand$ = xs
    .merge(
      actions.backDuringIdle$,
      actions.backWithConfirmedDiscard$,
      submittedAndClearedTmp$,
    )
    .map(() => ({type: 'pop'} as Command));

  const recCommand$ = recorder(actions, state$);

  const globalEvent$ = actions.submitRecording$
    .compose(sample(state$))
    .filter((state) => !!state.blobId)
    .map(
      (state) =>
        ({type: 'audioBlobComposed', blobId: state.blobId!} as GlobalEvent),
    );

  const reducer$ = model(actions, sources.ssb, state$);

  return {
    screen: vdom$,
    navigation: navCommand$,
    state: reducer$,
    fs: fsCommand$,
    keyboard: xs.of('dismiss'),
    globalEventBus: globalEvent$,
    recorder: recCommand$,
  };
}
