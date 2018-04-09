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

import {Stream} from 'xstream';
import {h} from '@cycle/native-screen';
import * as Progress from 'react-native-progress';
import {View, ScrollView} from 'react-native';
import {State} from './model';
import {styles} from './styles';
import CompactThread from '../../components/CompactThread';
import {Palette} from '../../global-styles/palette';

const Loading = h(Progress.CircleSnail, {
  style: styles.loading,
  indeterminate: true,
  size: 40,
  color: Palette.brand.backgroundLighterContrast,
});

export default function view(state$: Stream<State>) {
  return state$.map((state: State) => {
    return {
      screen: 'mmmmm.Thread',
      vdom: h(View, {style: styles.container}, [
        h(ScrollView, [
          state.thread.messages.length === 0
            ? Loading
            : h(CompactThread, {
                thread: state.thread,
                selfFeedId: state.selfFeedId,
                onPressLike: () => {},
                onPressAuthor: () => {},
                onPressExpand: () => {},
              }),
        ]),
      ]),
    };
  });
}
