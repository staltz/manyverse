/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import delay from 'xstream/extra/delay';
import {ReactElement} from 'react';
import {Command, NavSource} from 'cycle-native-navigation';
import {ReactSource} from '@cycle/react';
import {StateSource, Reducer} from '@cycle/state';
import {AsyncStorageSource} from 'cycle-native-asyncstorage';
import {Palette} from '../../global-styles/palette';
import {OrientationEvent} from '../../drivers/orientation';
import {SSBSource, Req} from '../../drivers/ssb';
import navigation from './navigation';
import view from './view';
import intent from './intent';
import model, {State} from './model';
import {SplashCommand} from '../../drivers/splashscreen';

export type Sources = {
  screen: ReactSource;
  orientation: Stream<OrientationEvent>;
  asyncstorage: AsyncStorageSource;
  navigation: NavSource;
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
  layout: {
    backgroundColor: Palette.backgroundBrand,
  },
};

export function welcome(sources: Sources): Sinks {
  const actions = intent(sources.screen, sources.asyncstorage);
  const skip$ = actions.skipOrNot$.filter(skip => skip === true);
  const ssb$ = xs.merge(
    actions.createAccount$.mapTo({type: 'identity.create'} as Req),
    skip$.mapTo({type: 'identity.use'} as Req),
  );
  const command$ = navigation(actions);
  const vdom$ = view(sources.state.stream, actions);
  const reducer$ = model(actions, sources.orientation);

  const hideSplash$ = vdom$
    .take(1)
    .mapTo('hide' as 'hide')
    .compose(delay(80));

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
