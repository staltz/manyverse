/* Copyright (C) 2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Stream} from 'xstream';
import sample from 'xstream-sample';
import {ReactSource} from '@cycle/react';
import {h} from '@cycle/react';
import {ReactElement} from 'react';
import {View, Text, StyleSheet, Platform} from 'react-native';
import {getStatusBarHeight} from 'react-native-status-bar-height';
import {Palette} from '../../../global-styles/palette';
import {Dimensions} from '../../../global-styles/dimens';
import {Typography} from '../../../global-styles/typography';
import HeaderBackButton from '../../../components/HeaderBackButton';
import {StateSource} from '@cycle/state';
import Button from '../../../components/Button';

export type State = {
  enabled: boolean;
};

export type Sources = {
  screen: ReactSource;
  state: StateSource<State>;
};

export type Sinks = {
  screen: Stream<ReactElement<any>>;
  back: Stream<any>;
  next: Stream<any>;
};

export const styles = StyleSheet.create({
  container: {
    height: Dimensions.toolbarHeight,
    paddingTop: getStatusBarHeight(true),
    alignSelf: 'stretch',
    backgroundColor: Palette.backgroundBrand,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: Dimensions.horizontalSpaceBig,
  },

  title: {
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.textForBackgroundBrand,
    fontSize: Typography.fontSizeLarge,
    fontWeight: 'bold',
    ...Platform.select({
      ios: {
        position: 'absolute',
        top: getStatusBarHeight() + Dimensions.verticalSpaceIOSTitle,
        left: 40,
        right: 40,
        textAlign: 'center',
        marginLeft: 0,
      },
      default: {
        marginLeft: Dimensions.horizontalSpaceLarge,
      },
    }),
  },

  buttonsRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  buttonEnabled: {
    minWidth: 68,
    backgroundColor: Palette.backgroundCTA,
    marginLeft: Dimensions.horizontalSpaceNormal,
  },

  buttonDisabled: {
    backgroundColor: Palette.backgroundBrandWeak,
    minWidth: 68,
    marginLeft: Dimensions.horizontalSpaceNormal,
  },
});

export function topBar(sources: Sources): Sinks {
  const state$ = sources.state.stream;

  const vdom$ = state$.map(state =>
    h(View, {style: styles.container}, [
      HeaderBackButton('recipientsInputBackButton'),
      h(Text, {style: styles.title}, 'New message'),
      h(View, {style: styles.buttonsRight}, [
        h(Button, {
          sel: 'recipientsInputNextButton',
          style: [state.enabled ? styles.buttonEnabled : styles.buttonDisabled],
          text: 'Next',
          strong: state.enabled,
          accessible: true,
          accessibilityLabel: 'Next Button',
        }),
      ]),
    ]),
  );

  const back$ = sources.screen
    .select('recipientsInputBackButton')
    .events('press');

  const next$ = sources.screen
    .select('recipientsInputNextButton')
    .events('press')
    .compose(sample(state$))
    .filter(state => state.enabled);

  return {
    screen: vdom$,
    back: back$,
    next: next$,
  };
}
