// SPDX-FileCopyrightText: 2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Stream} from 'xstream';
import {View, StyleSheet, Text, Platform} from 'react-native';
import {h} from '@cycle/react';
import {State} from './model';
import Button from '../../../components/Button';
import {Palette} from '../../../global-styles/palette';
import {Dimensions} from '../../../global-styles/dimens';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: 'stretch',
    backgroundColor: Palette.voidMain,
    paddingTop: Dimensions.toolbarHeight,
  },

  innerContainer: {
    flex: 1,
    alignSelf: 'stretch',
    ...Platform.select({
      web: {
        maxWidth: Dimensions.desktopMiddleWidth.vw,
      },
    }),
  },
});

export default function view(state$: Stream<State>) {
  return state$.map((state) => {
    return h(View, {style: styles.container}, [
      h(View, {style: styles.innerContainer}, [
        h(Button, {text: 'Open advanced', sel: 'connections-advanced'}),
        h(
          Text,
          {},
          `rooms: ${state.rooms.length}\n` +
            `connected: ${state.peers.length}\n` +
            `staged: ${state.stagedPeers.length}`,
        ),
      ]),
    ]);
  });
}
