/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import {
  Command,
  PopCommand,
  NavSource,
  PushCommand,
} from 'cycle-native-navigation';
import {Msg} from 'ssb-typescript';
import {ReactElement} from 'react';
import {ReactSource, h} from '@cycle/react';
import {getStatusBarHeight} from 'react-native-status-bar-height';
import {SSBSource} from '../../drivers/ssb';
import {Dimensions} from '../../global-styles/dimens';
import RawFeed from '../../components/RawFeed';
import {navOptions as rawMessageScreenNavOptions} from '../raw-msg';
import {Screens} from '../..';

export type Sources = {
  screen: ReactSource;
  navigation: NavSource;
  ssb: SSBSource;
};

export type Sinks = {
  screen: Stream<ReactElement<any>>;
  navigation: Stream<Command>;
};

export const navOptions = {
  topBar: {
    visible: true,
    drawBehind: false,
    height: Dimensions.toolbarHeight,
    paddingTop: getStatusBarHeight(true),
    title: {
      text: 'Raw database',
    },
    backButton: {
      icon: require('../../../../images/icon-arrow-left.png'),
      visible: true,
    },
  },
};

export type Actions = {
  goBack$: Stream<any>;
  goToRawMsg$: Stream<Msg>;
};

function navigation(actions: Actions) {
  const pop$ = actions.goBack$.mapTo({
    type: 'pop',
  } as PopCommand);

  const toRawMsg$ = actions.goToRawMsg$.map(
    msg =>
      ({
        type: 'push',
        layout: {
          component: {
            name: Screens.RawMessage,
            passProps: {msg},
            options: rawMessageScreenNavOptions,
          },
        },
      } as PushCommand),
  );

  return xs.merge(pop$, toRawMsg$);
}

function intent(navSource: NavSource, reactSource: ReactSource) {
  return {
    goBack$: navSource.backPress(),

    goToRawMsg$: reactSource.select('raw-feed').events('pressMsg'),
  };
}

export function rawDatabase(sources: Sources): Sinks {
  const actions = intent(sources.navigation, sources.screen);
  const vdom$ = sources.ssb.publicRawFeed$.map(getReadable =>
    h(RawFeed, {sel: 'raw-feed', getReadable}),
  );
  const command$ = navigation(actions);

  return {
    screen: vdom$,
    navigation: command$,
  };
}
