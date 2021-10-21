// SPDX-FileCopyrightText: 2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import {Command, NavSource} from 'cycle-native-navigation';
import {ReactElement} from 'react';
import {ReactSource} from '@cycle/react';
import {Reducer, StateSource} from '@cycle/state';
import {GlobalEvent} from '../../drivers/eventbus';
import {SSBSource} from '../../drivers/ssb';
import {DialogSource} from '../../drivers/dialogs';
import MAIL_TO_BUG_REPORT from '../../components/mail-to-bug-report';
import model, {State} from './model';
import view from './view';
import intent from './intent';
import navigation from './navigation';

export interface Sources {
  screen: ReactSource;
  navigation: NavSource;
  children: Stream<Array<ReactElement>>;
  globalEventBus: Stream<GlobalEvent>;
  ssb: SSBSource;
  dialog: DialogSource;
  state: StateSource<State>;
}

export interface Sinks {
  screen: Stream<ReactElement<any>>;
  navigation: Stream<Command>;
  state: Stream<Reducer<State>>;
  globalEventBus: Stream<GlobalEvent>;
  linking: Stream<string>;
}

export function desktopFrame(sources: Sources): Sinks {
  const state$ = sources.state.stream;

  const actions = intent(sources.screen, sources.dialog, state$);

  const event$ = xs.merge(
    actions.changeTab$.map(
      (tab) =>
        ({
          type: 'centralScreenUpdate',
          subtype: 'changeTab',
          tab,
        } as GlobalEvent),
    ),

    actions.scrollToTop$.map(
      (tab) =>
        ({
          type: 'centralScreenUpdate',
          subtype: 'scrollToTop',
          tab,
        } as GlobalEvent),
    ),
  );

  const localizationLoaded$ = sources.globalEventBus
    .filter((ev) => ev.type === 'localizationLoaded')
    .take(1)
    .mapTo(true)
    .startWith(false);

  const reducer$ = model(actions, sources.globalEventBus, sources.ssb);

  const vdom$ = view(state$, sources.children, localizationLoaded$);

  const command$ = navigation(actions, state$);

  const linking$ = xs.merge(
    actions.emailBugReport$.mapTo(MAIL_TO_BUG_REPORT),
    actions.openTranslate$.mapTo('https://www.manyver.se/translations/'),
  );

  return {
    screen: vdom$,
    state: reducer$,
    navigation: command$,
    globalEventBus: event$,
    linking: linking$,
  };
}
