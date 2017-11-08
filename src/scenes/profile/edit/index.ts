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
import sampleCombine from 'xstream/extra/sampleCombine';
import {ReactElement} from 'react';
import {StateSource, Reducer} from 'cycle-onionify';
import {
  ScreenVNode,
  Command,
  PopCommand,
  ScreensSource,
} from 'cycle-native-navigation';
import {Content, AboutContent, About} from '../../../ssb/types';
import {SSBSource} from '../../../drivers/ssb';
import {
  Response as DialogRes,
  Request as DialogReq,
} from '../../../drivers/dialogs';
import intent from './intent';
import model, {State, Actions} from './model';
import view from './view';
export {navigatorStyle} from './view';
export {State} from './model';

export type Sources = {
  screen: ScreensSource;
  navigation: Stream<any>;
  onion: StateSource<State>;
  ssb: SSBSource;
  dialog: Stream<DialogRes>;
};

export type Sinks = {
  screen: Stream<ScreenVNode>;
  navigation: Stream<Command>;
  onion: Stream<Reducer<State>>;
  ssb: Stream<Content>;
  dialog: Stream<DialogReq>;
};

function prepareForSSB(dataToSave$: Stream<State>): Stream<Content> {
  const newAboutContent$ = dataToSave$.map(state => {
    const content: AboutContent = {
      type: 'about',
      about: state.about.id as string,
    };
    if (state.newName) {
      content.name = state.newName;
    }
    if (state.newDescription) {
      content.description = state.newDescription;
    }
    return content;
  });

  return newAboutContent$;
}

function navigation(
  dialogRes$: Stream<DialogRes>,
  dataToSave$: Stream<any>,
): Stream<Command> {
  const goBackDiscarding$ = dialogRes$
    .filter(
      res => res.category === 'edit-profile-discard' && res.type === 'positive',
    )
    .map(() => ({type: 'pop'} as PopCommand));

  const goBackSaving$ = dataToSave$.map(() => ({type: 'pop'} as PopCommand));

  return xs.merge(goBackDiscarding$, goBackSaving$);
}

function dialogs(back$: Stream<any>) {
  return back$.mapTo(
    {
      title: 'Edit profile',
      category: 'edit-profile-discard',
      content: 'Discard changes?',
      positiveText: 'Discard',
      negativeText: 'Cancel',
    } as DialogReq,
  );
}

export default function editProfile(sources: Sources): Sinks {
  const back$ = sources.navigation.filter(ev => ev.id === 'backPress');

  const dialog$ = dialogs(back$);
  const screenActions = intent(sources.screen);
  const dataToSave$ = screenActions.save$
    .compose(sampleCombine(sources.onion.state$))
    .map(([_, state]) => state)
    .filter(
      state =>
        (!!state.newName && state.newName !== state.about.name) ||
        (!!state.newDescription && state.newDescription !== state.about.name),
    );
  const reducer$ = model({...screenActions, dataToSave$});
  const vdom$ = view(sources.onion.state$);
  const content$ = prepareForSSB(dataToSave$);
  const command$ = navigation(sources.dialog, dataToSave$);

  return {
    screen: vdom$,
    navigation: command$,
    onion: reducer$,
    ssb: content$,
    dialog: dialog$,
  };
}
