/* Copyright (C) 2018-2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Stream} from 'xstream';
import {View, Image, Dimensions, ScrollView} from 'react-native';
import {h} from '@cycle/react';
import {t} from '../../drivers/localization';
import Markdown from '../../components/Markdown';
import TopBar from '../../components/TopBar';
import {State} from './index';
import {styles} from './styles';

export default function view(state$: Stream<State>) {
  return state$.map((state) => {
    const windowDimensions = Dimensions.get('window');
    const windowWidth = windowDimensions.width;

    return h(View, {style: styles.container}, [
      h(TopBar, {sel: 'topbar', title: state.about.name ?? ''}),

      h(ScrollView, {style: styles.container}, [
        state.about.imageUrl
          ? h(Image, {
              style: {
                width: windowWidth,
                height: windowWidth,
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
