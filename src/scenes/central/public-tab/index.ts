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

import xs, {Stream, Listener} from 'xstream';
import {ReactElement} from 'react';
import {StateSource, Reducer} from 'cycle-onionify';
import {Content, PostContent, VoteContent} from '../../../ssb/types';
import {Command, ScreensSource} from 'cycle-native-navigation';
import {navigatorStyle as profileNavigatorStyle} from '../../profile/styles';
import {SSBSource} from '../../../drivers/ssb';
import intent, {Actions} from './intent';
import view from './view';

export type Sources = {
  screen: ScreensSource;
  navigation: Stream<any>;
  onion: StateSource<any>;
  ssb: SSBSource;
};

export type Sinks = {
  screen: Stream<ReactElement<any>>;
  navigation: Stream<Command>;
  onion: Stream<Reducer<any>>;
  ssb: Stream<any>;
};

function prepareForSSB(actions: Actions): Stream<Content> {
  const publishMsg$ = actions.publishMsg.map(text => {
    return {
      text,
      type: 'post',
      mentions: [],
    } as PostContent;
  });

  const toggleLikeMsg$ = actions.likeMsg.map(ev => {
    return {
      type: 'vote',
      vote: {
        link: ev.msgKey,
        value: ev.like ? 1 : 0,
        expression: ev.like ? 'Like' : 'Unlike',
      },
    } as VoteContent;
  });

  return xs.merge(publishMsg$, toggleLikeMsg$);
}

function navigationCommands(actions: Actions): Stream<Command> {
  return actions.goToProfile.map(
    ev =>
      ({
        type: 'push',
        screen: 'mmmmm.Profile',
        navigatorStyle: profileNavigatorStyle,
        animated: true,
        animationType: 'slide-horizontal',
        passProps: {
          feedId: ev.authorFeedId,
        },
      } as Command),
  );
}

export function publicTab(sources: Sources): Sinks {
  const actions = intent(sources.screen);
  const vdom$ = view(sources.ssb.publicFeed$);
  const command$ = navigationCommands(actions);
  const newContent$ = prepareForSSB(actions);
  const reducer$ = xs.empty();

  return {
    screen: vdom$,
    navigation: command$,
    onion: reducer$,
    ssb: newContent$,
  };
}
