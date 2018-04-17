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

import xs, {Stream} from 'xstream';
import {ScreensSource, ScreenVNode} from 'cycle-native-navigation';
import {h} from '@cycle/native-screen';
import {StateSource} from 'cycle-onionify';
import {View, StyleSheet} from 'react-native';
import {Palette} from '../../../global-styles/palette';
import {Screens} from '../../..';
import {Dimensions} from '../../../global-styles/dimens';
import Button from '../../../components/Button';

export type State = {
  enabled: boolean;
};

export type Sources = {
  screen: ScreensSource;
  onion: StateSource<State>;
};

export type Sinks = {
  screen: Stream<ScreenVNode>;
  done: Stream<any>;
};

export const styles = StyleSheet.create({
  container: {
    paddingRight: Dimensions.horizontalSpaceBig,
    paddingTop: 6,
    borderWidth: 0,
    width: 120,
    flexDirection: 'row',
    justifyContent: 'flex-end',
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

function intent(source: ScreensSource): Stream<any> {
  return source.select('composePublishButton').events('press');
}

function view(state$: Stream<State>) {
  return state$.map(state => ({
    screen: Screens.ComposePublishButton,
    vdom: h(View, {style: styles.container}, [
      h(Button, {
        selector: 'composePublishButton',
        style: state.enabled ? styles.buttonEnabled : styles.buttonDisabled,
        text: 'Publish',
        strong: state.enabled,
        accessible: true,
        accessibilityLabel: 'Compose Publish Button',
      }),
    ]),
  }));
}

export default function publishButton(sources: Sources): Sinks {
  const done$ = intent(sources.screen);
  const vdom$ = view(sources.onion.state$);

  return {
    screen: vdom$,
    done: done$,
  };
}
