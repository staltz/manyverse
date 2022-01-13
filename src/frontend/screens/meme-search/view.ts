// SPDX-FileCopyrightText: 2020-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Stream} from 'xstream';
import {h} from '@cycle/react';
import {View} from 'react-native';
import TopBar from '../../components/TopBar';
import {State} from './model';
import {styles} from './styles';

export default function view(state$: Stream<State>) {
  return state$.map((state) => {
    return h(View, {style: styles.screen}, [
      h(TopBar, {sel: 'topbar', title: 'hellooo memes'}), //t('compose_audio.title')}),

      h(View, {style: styles.footer}, 'hello!'),
    ]);
  });
}
