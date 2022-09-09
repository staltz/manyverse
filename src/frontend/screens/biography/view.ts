// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import {View, Image, ScrollView, Platform} from 'react-native';
import {h} from '@cycle/react';
import {t} from '~frontend/drivers/localization';
import {Dimensions} from '~frontend/global-styles/dimens';
import {WindowSize} from '~frontend/drivers/window-size';
import Markdown from '~frontend/components/Markdown';
import TopBar from '~frontend/components/TopBar';
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
      width = Dimensions.desktopMiddleWidth.px;
      height = Dimensions.desktopMiddleWidth.px;
    } else {
      width = windowSize.width;
      height = Math.min(windowSize.width, windowSize.height * 0.8);
    }

    return h(View, {style: styles.screen}, [
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
            [
              h(Markdown, {
                text:
                  typeof state.about.description === 'string'
                    ? state.about.description
                    : '',
              }),
            ],
          ),
        ]),
      ]),
    ]);
  });
}
