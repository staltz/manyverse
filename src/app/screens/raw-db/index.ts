/**
 * Manyverse is a mobile app for Secure Scuttlebutt networks
 *
 * Copyright (C) 2017 Andre 'Staltz' Medeiros
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import xs, {Stream} from 'xstream';
import {
  Command,
  PopCommand,
  NavSource,
  PushCommand,
} from 'cycle-native-navigation';
import {Msg} from 'ssb-typescript';
import {SSBSource} from '../../drivers/ssb';
import {ReactSource, h} from '@cycle/react';
import {ReactElement} from 'react';
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
    height: Dimensions.toolbarAndroidHeight,
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
  const pop$ = actions.goBack$.mapTo(
    {
      type: 'pop',
    } as PopCommand,
  );

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
