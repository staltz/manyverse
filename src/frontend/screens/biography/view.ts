/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import {ReactElement} from 'react';
import {View, Image, Dimensions, ScrollView} from 'react-native';
import {h} from '@cycle/react';
import {State} from './index';
import {styles} from './styles';
import Markdown from '../../global-styles/markdown';

export default function view(
  state$: Stream<State>,
  topBarElem$: Stream<ReactElement<any>>,
) {
  return xs.combine(state$, topBarElem$).map(([state, topBarElem]) => {
    const windowDimensions = Dimensions.get('window');
    const windowWidth = windowDimensions.width;

    return h(View, {style: styles.container}, [
      topBarElem,

      h(ScrollView, {style: styles.container}, [
        state.about.imageUrl
          ? h(Image, {
              style: {
                width: windowWidth,
                height: windowWidth,
                resizeMode: 'cover',
              },
              source: {uri: state.about.imageUrl},
            })
          : (null as any),

        h(View, {style: styles.bioArea}, [
          Markdown(state.about.description || ''),
        ]),
      ]),
    ]);
  });
}
