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
import {Command} from 'cycle-native-navigation';
import {Command as AlertCommand} from 'cycle-native-alert';
import {ReactSource} from '@cycle/react';
import {StateSource, Reducer} from 'cycle-onionify';
import {SSBSource} from '../../drivers/ssb';
import intent from './intent';
import model, {State} from './model';
import view from './view';
import navigation from './navigation';
import {ReactElement} from 'react';
const pkgJSON = require('../../../../package.json');

export type Sources = {
  screen: ReactSource;
  onion: StateSource<State>;
  ssb: SSBSource;
};

export type Sinks = {
  alert: Stream<AlertCommand>;
  screen: Stream<ReactElement<any>>;
  navigation: Stream<Command>;
  linking: Stream<string>;
  onion: Stream<Reducer<State>>;
};

export function drawer(sources: Sources): Sinks {
  const actions = intent(sources.screen);
  const vdom$ = view(sources.onion.state$);
  const command$ = navigation(actions, sources.onion.state$);
  const reducer$ = model(sources.ssb);
  const alert$ = actions.openAbout$.mapTo({
    title: 'About Manyverse',
    message:
      'A social network off the grid\n' +
      '(Licensed GPLv3)\n\n' +
      'Version ' +
      pkgJSON.version,
    buttons: [{text: 'OK', id: 'okay'}],
  });
  const mailto$ = actions.emailBugReport$.mapTo(
    'mailto:' +
      'incoming+staltz/manyverse@incoming.gitlab.com' +
      '?subject=Bug report for version ' +
      pkgJSON.version +
      '&body=Explain what happened and what you expected...',
  );

  return {
    alert: alert$,
    screen: vdom$,
    navigation: command$,
    linking: mailto$,
    onion: reducer$,
  };
}
