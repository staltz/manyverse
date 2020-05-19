/* Copyright (C) 2018-2020 The Manyverse Authors.
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
import {StyleSheet, View} from 'react-native';
import {ReactSource, h} from '@cycle/react';
import {Palette} from '../../global-styles/palette';
import {SSBSource} from '../../drivers/ssb';
import {t} from '../../drivers/localization';
import RawFeed from '../../components/RawFeed';
import TopBar from '../../components/TopBar';
import {navOptions as rawMessageScreenNavOptions} from '../raw-msg';
import {Screens} from '../enums';

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
    visible: false,
    height: 0,
  },
  sideMenu: {
    left: {
      enabled: false,
    },
  },
};

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignSelf: 'stretch',
    backgroundColor: Palette.backgroundVoid,
    flexDirection: 'column',
  },
});
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

function intent(
  navSource: NavSource,
  reactSource: ReactSource,
  back$: Stream<any>,
) {
  return {
    goBack$: xs.merge(navSource.backPress(), back$),

    goToRawMsg$: reactSource.select('raw-feed').events('pressMsg'),
  };
}

export function rawDatabase(sources: Sources): Sinks {
  const actions = intent(
    sources.navigation,
    sources.screen,
    sources.screen.select('topbar').events('pressBack'),
  );

  const vdom$ = sources.ssb.publicRawFeed$.map(getReadable =>
    h(View, {style: styles.screen}, [
      h(TopBar, {sel: 'topbar', title: t('raw_db.title')}),
      h(RawFeed, {sel: 'raw-feed', getReadable}),
    ]),
  );

  const command$ = navigation(actions);

  return {
    screen: vdom$,
    navigation: command$,
  };
}
