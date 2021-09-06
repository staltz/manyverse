/* Copyright (C) 2018-2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import {View, Image, ScrollView, Platform} from 'react-native';
import {h} from '@cycle/react';
import {t} from '../../drivers/localization';
import {Dimensions} from '../../global-styles/dimens';
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
    let width: any;
    let height: any;
    if (Platform.OS === 'web') {
      width = Dimensions.desktopMiddleWidth.vw;
      height = Dimensions.desktopMiddleWidth.vw;
    } else {
      width = windowSize.width;
      height = Math.min(windowSize.width, windowSize.height * 0.8);
    }

    return h(View, {style: styles.container}, [
      h(TopBar, {sel: 'topbar', title: state.about.name ?? ''}),

      h(ScrollView, {style: styles.container}, [
        h(View, {style: styles.innerContainer}, [
          state.about.imageUrl
            ? h(Image, {
                style: {
                  width,
                  height,
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
              accessibilityLabel: t(
                'biography.description.accessibility_label',
              ),
            },
            [h(Markdown, {text: state.about.description ?? ''})],
          ),
        ]),
      ]),
    ]);
  });
}
