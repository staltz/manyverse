/* Copyright (C) 2018-2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import {View, Image, ScrollView} from 'react-native';
import {h} from '@cycle/react';
import {t} from '../../drivers/localization';
import {WindowSize} from '../../drivers/window-size';
import Markdown from '../../components/Markdown';
import TopBar from '../../components/TopBar';
import {State} from './index';
import {styles} from './styles';

export default function view(
  state$: Stream<State>,
  windowSize$: Stream<WindowSize>,
) {
  return xs.combine(state$, windowSize$).map(([state, windowSize]) => {
    const {width: windowWidth, height: windowHeight} = windowSize;

    return h(View, {style: styles.container}, [
      h(TopBar, {sel: 'topbar', title: state.about.name ?? ''}),

      h(ScrollView, {style: styles.container}, [
        state.about.imageUrl
          ? h(Image, {
              style: {
                width: windowWidth,
                height: Math.min(windowWidth, windowHeight * 0.8),
                resizeMode: 'cover',
              },
              accessible: true,
              accessibilityRole: 'image',
              accessibilityLabel: t('biography.picture.accessibility_label'),
              source: {uri: state.about.imageUrl},
            })
          : null,

        h(
          View,
          {
            style: styles.bioArea,
            accessible: true,
            accessibilityRole: 'text',
            accessibilityLabel: t('biography.description.accessibility_label'),
          },
          [h(Markdown, {text: state.about.description ?? ''})],
        ),
      ]),
    ]);
  });
}
