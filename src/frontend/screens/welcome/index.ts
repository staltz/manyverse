// SPDX-FileCopyrightText: 2018-2023 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import {ReactElement} from 'react';
import {Command, NavSource} from 'cycle-native-navigation';
import {ReactSource} from '@cycle/react';
import {StateSource, Reducer} from '@cycle/state';
import {AsyncStorageSource} from 'cycle-native-asyncstorage';
import {Palette} from '~frontend/global-styles/palette';
import {OrientationEvent} from '~frontend/drivers/orientation';
import {SSBSource, Req} from '~frontend/drivers/ssb';
import {SplashCommand} from '~frontend/drivers/splashscreen';
import {FSSource} from '~frontend/drivers/fs';
import {WindowSize} from '~frontend/drivers/window-size';
import {LocalizationSource} from '~frontend/drivers/localization';
import {Command as AlertCommand, DialogSource} from '~frontend/drivers/dialogs';
import navigation from './navigation';
import alert from './alert';
import view from './view';
import intent from './intent';
import model, {State} from './model';

export interface Sources {
  screen: ReactSource;
  orientation: Stream<OrientationEvent>;
  windowSize: Stream<WindowSize>;
  asyncstorage: AsyncStorageSource;
  navigation: NavSource;
  fs: FSSource;
  localization: LocalizationSource;
  linking: Stream<string>;
  state: StateSource<State>;
  dialog: DialogSource;
  ssb: SSBSource;
}

export interface Sinks {
  screen: Stream<ReactElement<any>>;
  navigation: Stream<Command>;
  state: Stream<Reducer<State>>;
  linking: Stream<string>;
  ssb: Stream<Req>;
  dialog: Stream<AlertCommand>;
  splashscreen: Stream<SplashCommand>;
}

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
  layout: {
    backgroundColor: Palette.brandMain,
  },
};

export function welcome(sources: Sources): Sinks {
  const state$ = sources.state.stream;

  const actions = intent(
    sources.screen,
    sources.linking,
    sources.fs,
    sources.dialog,
    sources.asyncstorage,
    sources.localization,
    state$,
  );

  const reducer$ = model(
    actions,
    sources.orientation,
    sources.windowSize,
    sources.fs,
  );

  const ssb$ = xs.merge(
    actions.createAccount$.mapTo({type: 'identity.create'} as Req),
    actions.migrateAccount$.mapTo({type: 'identity.migrate'} as Req),
    actions.skipToCentral$.mapTo({type: 'identity.use'} as Req),
  );

  const command$ = navigation(actions, sources.navigation);

  const vdom$ = view(state$, actions);

  const alert$ = alert(actions);

  const hideSplash$ = vdom$.take(1).mapTo('hide' as const);

  const FAQSITE = 'https://manyver.se/faq';
  const visitLinks$ = xs.merge(
    actions.learnMoreSSB$.mapTo(FAQSITE + '/what-is-manyverse'),
    actions.learnMoreOffGrid$.mapTo(FAQSITE + '/off-the-grid'),
    actions.learnMoreConnections$.mapTo(FAQSITE + '/connections'),
    actions.learnMoreModeration$.mapTo(FAQSITE + '/moderation'),
    actions.learnMorePermanence$.mapTo(FAQSITE + '/permanence'),
    actions.readEULA$.mapTo('https://manyver.se/eula'),
  );

  return {
    screen: vdom$,
    navigation: command$,
    state: reducer$,
    ssb: ssb$,
    linking: visitLinks$,
    splashscreen: hideSplash$,
    dialog: alert$,
  };
}
