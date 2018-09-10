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
import {ReactSource} from '@cycle/react';
import {h} from '@cycle/react';
import {StateSource} from 'cycle-onionify';
import {View, StyleSheet} from 'react-native';
import {Palette} from '../../../global-styles/palette';
import {Dimensions} from '../../../global-styles/dimens';
import Button from '../../../components/Button';
import HeaderBackButton from '../../../components/HeaderBackButton';
import {ReactElement} from 'react';

export type State = {
  enabled: boolean;
};

export type Sources = {
  screen: ReactSource;
  props: Stream<any>;
  onion: StateSource<State>;
};

export type Sinks = {
  screen: Stream<ReactElement<any>>;
  done: Stream<any>;
  back: Stream<any>;
};

export const styles = StyleSheet.create({
  container: {
    height: Dimensions.toolbarAndroidHeight,
    alignSelf: 'stretch',
    backgroundColor: Palette.brand.background,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Dimensions.horizontalSpaceBig,
  },

  buttonEnabled: {
    backgroundColor: Palette.brand.callToActionBackground,
    width: 80,
  },

  buttonDisabled: {
    backgroundColor: Palette.brand.backgroundLighter,
    width: 80,
  },
});

function intent(reactSource: ReactSource) {
  return {
    back$: reactSource.select('inviteBackButton').events('press'),

    done$: reactSource.select('inviteAcceptButton').events('press'),
  };
}

function view(state$: Stream<State>) {
  return state$.map(state =>
    h(View, {style: styles.container}, [
      HeaderBackButton('inviteBackButton'),
      h(Button, {
        sel: 'inviteAcceptButton',
        style: state.enabled ? styles.buttonEnabled : styles.buttonDisabled,
        text: 'Done',
        strong: state.enabled,
        accessible: true,
        accessibilityLabel: 'Accept Invite Button',
      }),
    ]),
  );
}

export function topBar(sources: Sources): Sinks {
  const actions = intent(sources.screen);
  const vdom$ = view(sources.onion.state$);

  return {
    screen: vdom$,
    done: actions.done$,
    back: actions.back$,
  };
}
