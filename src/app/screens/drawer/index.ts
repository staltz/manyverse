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
import {Command as NavCmd} from 'cycle-native-navigation';
import {ReactSource} from '@cycle/react';
import {StateSource, Reducer} from '@cycle/state';
import {SSBSource} from '../../drivers/ssb';
import {Command as DialogCmd} from '../../drivers/dialogs';
import intent from './intent';
import model, {State} from './model';
import view from './view';
import navigation from './navigation';
import {ReactElement} from 'react';
import {Palette} from '../../global-styles/palette';
const pkgJSON = require('../../../../package.json');

export type Sources = {
  screen: ReactSource;
  state: StateSource<State>;
  ssb: SSBSource;
};

export type Sinks = {
  dialog: Stream<DialogCmd>;
  screen: Stream<ReactElement<any>>;
  navigation: Stream<NavCmd>;
  linking: Stream<string>;
  state: Stream<Reducer<State>>;
};

export function drawer(sources: Sources): Sinks {
  const actions = intent(sources.screen);
  const vdom$ = view(sources.state.stream);
  const command$ = navigation(actions, sources.state.stream);
  const reducer$ = model(sources.ssb);
  const dialog$ = actions.openAbout$.mapTo(
    {
      type: 'alert',
      title: 'About Manyverse',
      content:
        '<a href="https://manyver.se">manyver.se</a><br />' +
        'A social network off the grid<br />' +
        'Version ' +
        pkgJSON.version +
        '<br /><br />' +
        "Copyright (C) 2017-2018 Andre 'Staltz' Medeiros<br />" +
        '<a href="https://gitlab.com/staltz/manyverse">Open source on GitLab</a>' +
        '<br />' +
        'Licensed GPL 3.0',
      options: {
        contentIsHtml: true,
        contentColor: Palette.brand.textWeak,
        linkColor: Palette.brand.text,
      },
    } as DialogCmd,
  );
  const mailto$ = actions.emailBugReport$.mapTo(
    'mailto:' +
      'incoming+staltz/manyverse@incoming.gitlab.com' +
      '?subject=Bug report for version ' +
      pkgJSON.version +
      '&body=Explain what happened and what you expected...',
  );

  return {
    dialog: dialog$,
    screen: vdom$,
    navigation: command$,
    linking: mailto$,
    state: reducer$,
  };
}
