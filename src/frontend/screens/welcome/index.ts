/* Copyright (C) 2018-2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import {ReactElement} from 'react';
import {Command, NavSource} from 'cycle-native-navigation';
import {ReactSource} from '@cycle/react';
import {StateSource, Reducer} from '@cycle/state';
import {AsyncStorageSource} from 'cycle-native-asyncstorage';
import {Palette} from '../../global-styles/palette';
import {OrientationEvent} from '../../drivers/orientation';
import {SSBSource, Req} from '../../drivers/ssb';
import {SplashCommand} from '../../drivers/splashscreen';
import {FSSource} from '../../drivers/fs';
import {GlobalEvent} from '../../drivers/eventbus';
import {WindowSize} from '../../drivers/window-size';
import navigation from './navigation';
import view from './view';
import intent from './intent';
import model, {State} from './model';

export type Sources = {
  screen: ReactSource;
  orientation: Stream<OrientationEvent>;
  windowSize: Stream<WindowSize>;
  asyncstorage: AsyncStorageSource;
  navigation: NavSource;
  globalEventBus: Stream<GlobalEvent>;
  fs: FSSource;
  state: StateSource<State>;
  ssb: SSBSource;
};

export type Sinks = {
  screen: Stream<ReactElement<any>>;
  navigation: Stream<Command>;
  state: Stream<Reducer<State>>;
  linking: Stream<string>;
  ssb: Stream<Req>;
  splashscreen: Stream<SplashCommand>;
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
  layout: {
    backgroundColor: Palette.brandMain,
  },
};

export function welcome(sources: Sources): Sinks {
  const actions = intent(
    sources.globalEventBus,
    sources.screen,
    sources.fs,
    sources.asyncstorage,
  );
  const skip$ = actions.skipOrNot$.filter((skip) => skip === true);
  const ssb$ = xs.merge(
    actions.createAccount$.mapTo({type: 'identity.create'} as Req),
    skip$.mapTo({type: 'identity.use'} as Req),
  );
  const command$ = navigation(actions);
  const vdom$ = view(sources.state.stream, actions);
  const reducer$ = model(actions, sources.orientation, sources.windowSize);

  const hideSplash$ = vdom$.take(1).mapTo('hide' as const);

  const FAQSITE = 'https://manyver.se/faq';
  const visitLinks$ = xs.merge(
    actions.learnMoreSSB$.mapTo(FAQSITE + '/what-is-manyverse'),
    actions.learnMoreOffGrid$.mapTo(FAQSITE + '/off-the-grid'),
    actions.learnMoreConnections$.mapTo(FAQSITE + '/connections'),
    actions.learnMoreModeration$.mapTo(FAQSITE + '/moderation'),
    actions.learnMorePermanence$.mapTo(FAQSITE + '/permanence'),
  );

  return {
    screen: vdom$,
    navigation: command$,
    state: reducer$,
    ssb: ssb$,
    linking: visitLinks$,
    splashscreen: hideSplash$,
  };
}
