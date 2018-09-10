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

import {Stream} from 'xstream';
import {Command, NavSource} from 'cycle-native-navigation';
import {StateSource, Reducer} from 'cycle-onionify';
import {MsgId, FeedId} from 'ssb-typescript';
import {KeyboardSource} from 'cycle-native-keyboard';
import {SSBSource, Req} from '../../drivers/ssb';
import model, {State} from './model';
import view from './view';
import intent from './intent';
import ssb from './ssb';
import navigation from './navigation';
import {ReactSource} from '@cycle/react';
import {ReactElement} from 'react';
import {Dimensions} from '../../global-styles/dimens';

export type Props = {
  selfFeedId: FeedId;
  rootMsgId: MsgId;
  replyToMsgId: MsgId;
};

export type Sources = {
  screen: ReactSource;
  navigation: NavSource;
  props: Stream<Props>;
  keyboard: KeyboardSource;
  onion: StateSource<State>;
  ssb: SSBSource;
};

export type Sinks = {
  screen: Stream<ReactElement<any>>;
  navigation: Stream<Command>;
  keyboard: Stream<'dismiss'>;
  onion: Stream<Reducer<State>>;
  ssb: Stream<Req>;
};

export const navOptions = {
  topBar: {
    visible: true,
    drawBehind: false,
    height: Dimensions.toolbarAndroidHeight,
    title: {
      text: 'Thread',
    },
    backButton: {
      icon: require('../../../../images/icon-arrow-left.png'),
      visible: true,
    },
  },
};

export function thread(sources: Sources): Sinks {
  const actions = intent(
    sources.screen,
    sources.keyboard,
    sources.ssb,
    sources.onion.state$,
  );
  const reducer$ = model(sources.props, actions, sources.ssb);
  const command$ = navigation(
    actions,
    sources.navigation,
    sources.onion.state$,
  );
  const vdom$ = view(sources.onion.state$, actions);
  const newContent$ = ssb(actions);
  const dismiss$ = actions.publishMsg$.mapTo('dismiss' as 'dismiss');

  return {
    screen: vdom$,
    navigation: command$,
    keyboard: dismiss$,
    onion: reducer$,
    ssb: newContent$,
  };
}
