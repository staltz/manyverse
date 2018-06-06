/**
 * MMMMM is a mobile app for Secure Scuttlebutt networks
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

export enum Screens {
  Central = 'mmmmm.Central',
  Profile = 'mmmmm.Profile',
  ProfileEdit = 'mmmmm.Profile.Edit',
  Thread = 'mmmmm.Thread',
  Compose = 'mmmmm.Compose',
  ComposePublishButton = 'mmmmm.Compose.PublishButton',
}

import xs, {Stream} from 'xstream';
import isolate from '@cycle/isolate';
import {h} from '@cycle/native-screen';
import {View, Text} from 'react-native';
import {StateSource, Reducer} from 'cycle-onionify';
import {SSBSource} from './drivers/ssb';
import {LifecycleEvent} from './drivers/lifecycle';
import {Response as DialogRes, Request as DialogReq} from './drivers/dialogs';
import {KeyboardSource} from '@cycle/native-keyboard';
import {ScreenVNode, Command, ScreensSource} from 'cycle-native-navigation';
import {central} from './screens/central/index';
import {profile} from './screens/profile/index';
import {thread} from './screens/thread/index';
import {compose} from './screens/compose/index';
import {Content} from 'ssb-typescript';
import model, {State, centralLens, profileLens, threadLens} from './model';

export type Sources = {
  screen: ScreensSource;
  navigation: Stream<any>;
  keyboard: KeyboardSource;
  onion: StateSource<State>;
  ssb: SSBSource;
  lifecycle: Stream<LifecycleEvent>;
  dialog: Stream<DialogRes>;
};

export type Sinks = {
  screen: Stream<ScreenVNode>;
  navigation: Stream<Command>;
  keyboard: Stream<'dismiss'>;
  onion: Stream<Reducer<State>>;
  ssb: Stream<Content | null>;
  dialog: Stream<DialogReq>;
};

// tslint:disable-next-line:no-string-literal
export const screenIDs = Object['values'](Screens);

function addAlphaDisclaimer(screen$: Stream<ScreenVNode>): Stream<ScreenVNode> {
  return screen$.map(screen => ({
    screen: screen.screen,
    vdom: h(View, {style: {flex: 1}}, [
      screen.vdom,
      h(
        Text,
        {
          style: {
            position: 'absolute',
            left: 0,
            bottom: 0,
            color: 'black',
            fontSize: 15,
            transform: [
              {rotateZ: '-90deg'},
              {translateY: -96},
              {translateX: 140},
            ],
          },
        },
        'Alpha version, not ready for use',
      ),
    ]),
  }));
}

export function app(sources: Sources): Sinks {
  const centralSinks: Sinks = isolate(central, {
    onion: centralLens,
    '*': 'central',
  })(sources);
  const composeSinks: Sinks = isolate(compose, {'*': 'compose'})(sources);
  const profileSinks: Sinks = isolate(profile, {
    onion: profileLens,
    '*': 'profile',
  })(sources);
  const threadSinks: Sinks = isolate(thread, {
    onion: threadLens,
    '*': 'thread',
  })(sources);

  const screen$ = xs.merge(
    centralSinks.screen,
    composeSinks.screen,
    profileSinks.screen,
    threadSinks.screen,
  );
  const navCommand$ = xs.merge(
    centralSinks.navigation,
    composeSinks.navigation,
    profileSinks.navigation,
    threadSinks.navigation,
  );
  const mainReducer$ = model(navCommand$, sources.ssb);
  const reducer$ = xs.merge(
    mainReducer$,
    composeSinks.onion,
    centralSinks.onion,
    profileSinks.onion,
    threadSinks.onion,
  );
  const initSSB$ = sources.screen.didAppear(Screens.Central).mapTo(null);
  const ssb$ = xs.merge(
    initSSB$,
    centralSinks.ssb,
    composeSinks.ssb,
    profileSinks.ssb,
    threadSinks.ssb,
  );
  const dismiss$ = threadSinks.keyboard;

  return {
    screen: screen$.compose(addAlphaDisclaimer),
    navigation: navCommand$,
    keyboard: dismiss$,
    onion: reducer$,
    ssb: ssb$,
    dialog: profileSinks.dialog,
  };
}
