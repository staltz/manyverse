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

import xs, {Stream} from 'xstream';
import {PureComponent, Component} from 'react';
import {View, FlatList, Text, TextInput, Image} from 'react-native';
import {h} from '@cycle/native-screen';
import {Palette} from '../../global-styles/palette';
import Feed, {FeedData, emptyFeed} from '../../components/Feed';
import ToggleButton from '../../components/ToggleButton';
import {Msg, isVoteMsg, About} from '../../ssb/types';
import {SSBSource} from '../../drivers/ssb';
import {styles} from './styles';
import {State} from './model';

export default function view(state$: Stream<State>) {
  return state$.map((state: State) => ({
    screen: 'mmmmm.Profile',
    vdom: h(
      View,
      {style: styles.container},
      [
        h(View, {style: styles.cover}, [
          h(Text, {style: styles.name}, state.about.name)
        ]),

        h(View, {style: styles.avatarBackground}, [
          h(Image, {
            style: styles.avatar,
            source: {uri: state.about.imageUrl || ''}
          })
        ]),

        state.displayFeedId === state.selfFeedId
          ? null
          : h(ToggleButton, {
              selector: 'follow',
              style: styles.follow,
              text: state.about.following === true ? 'Following' : 'Follow',
              toggled: state.about.following === true
            }),

        h(View, {style: styles.descriptionArea}, [
          h(Text, {style: styles.description}, state.about.description || '')
        ]),

        h(Feed, {
          selector: 'feed',
          style: styles.feed,
          feed: state.feed,
          showPublishHeader: state.displayFeedId === state.selfFeedId
        })
      ] as Array<any>
    )
  }));
}
