/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
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
  const thanksDialog$ = actions.openThanks$.mapTo({
    type: 'alert',
    title: 'Thank you!',
    content:
      'This app is funded through donations from:<br /><br />' +
      '<strong>DC Posch, Jean-Baptiste Giraudeau</strong>, ' +
      'and dozens of other backers on our OpenCollective.' +
      '<br /><br />' +
      '<a href="https://opencollective.com/manyverse">Become a backer too!</a>',
    options: {
      contentIsHtml: true,
      contentColor: Palette.textWeak,
      linkColor: Palette.text,
      positiveColor: Palette.text,
    },
  } as DialogCmd);
  const aboutDialog$ = actions.openAbout$.mapTo({
    type: 'alert',
    title: 'About Manyverse',
    content:
      '<a href="https://manyver.se">manyver.se</a><br />' +
      'A social network off the grid<br />' +
      'Version ' +
      pkgJSON.version +
      '<br /><br />' +
      'Copyright (C) 2018-2019 ' +
      '<a href="https://gitlab.com/staltz/manyverse/blob/master/AUTHORS">The Manyverse Authors</a>' +
      '<br /><br />' +
      '<a href="https://gitlab.com/staltz/manyverse">Open source on GitLab</a>' +
      '<br />' +
      'Licensed MPL 2.0',
    options: {
      contentIsHtml: true,
      contentColor: Palette.textWeak,
      linkColor: Palette.text,
      positiveColor: Palette.text,
    },
  } as DialogCmd);
  const dialog$ = xs.merge(thanksDialog$, aboutDialog$);
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
