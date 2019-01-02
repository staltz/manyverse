/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Stream} from 'xstream';
import {ReactSource} from '@cycle/react';
import {h} from '@cycle/react';
import {StateSource} from '@cycle/state';
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
  state: StateSource<State>;
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
    backgroundColor: Palette.backgroundBrand,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Dimensions.horizontalSpaceBig,
  },

  buttonEnabled: {
    backgroundColor: Palette.backgroundCTA,
    width: 80,
  },

  buttonDisabled: {
    backgroundColor: Palette.backgroundBrandWeak,
    width: 80,
  },
});

function intent(reactSource: ReactSource) {
  return {
    back$: reactSource.select('composeBackButton').events('press'),

    done$: reactSource.select('composePublishButton').events('press'),
  };
}

function view(state$: Stream<State>) {
  return state$.map(state =>
    h(View, {style: styles.container}, [
      HeaderBackButton('composeBackButton'),
      h(Button, {
        sel: 'composePublishButton',
        style: state.enabled ? styles.buttonEnabled : styles.buttonDisabled,
        text: 'Publish',
        strong: state.enabled,
        accessible: true,
        accessibilityLabel: 'Compose Publish Button',
      }),
    ]),
  );
}

export function topBar(sources: Sources): Sinks {
  const actions = intent(sources.screen);
  const vdom$ = view(sources.state.stream);

  return {
    screen: vdom$,
    done: actions.done$,
    back: actions.back$,
  };
}
