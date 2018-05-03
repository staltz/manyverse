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
import {View, Text, Image} from 'react-native';
import {h} from '@cycle/native-screen';
import Markdown, {markdownStyles} from '../../global-styles/markdown';
import Feed from '../../components/Feed';
import Button from '../../components/Button';
import ToggleButton from '../../components/ToggleButton';
import {SSBSource} from '../../drivers/ssb';
import {styles} from './styles';
import {State} from './model';
import {Screens} from '../..';
import {isRootPostMsg} from 'ssb-typescript/utils';

export default function view(state$: Stream<State>, ssbSource: SSBSource) {
  return state$.map((state: State) => {
    const isSelfProfile = state.displayFeedId === state.selfFeedId;

    return {
      screen: Screens.Profile,
      vdom: h(
        View,
        {style: styles.container},
        [
          h(View, {style: styles.cover}, [
            h(
              Text,
              {
                style: styles.name,
                numberOfLines: 1,
                ellipsizeMode: 'middle',
                accessible: true,
                accessibilityLabel: 'Profile Name',
              } as any,
              state.about.name,
            ),
          ]),

          h(View, {style: styles.avatarBackground}, [
            h(Image, {
              style: styles.avatar,
              source: {uri: state.about.imageUrl || undefined},
            }),
          ]),

          isSelfProfile
            ? h(Button, {
                selector: 'editProfile',
                style: styles.follow,
                text: 'Edit profile',
                accessible: true,
                accessibilityLabel: 'Edit Profile Button',
              })
            : h(ToggleButton, {
                selector: 'follow',
                style: styles.follow,
                text: state.about.following === true ? 'Following' : 'Follow',
                toggled: state.about.following === true,
              }),

          h(
            View,
            {
              style: styles.descriptionArea,
              accessible: true,
              accessibilityLabel: 'Profile Description',
            },
            [h(Markdown, {markdownStyles}, state.about.description || '')],
          ),

          h(Feed, {
            selector: 'feed',
            getReadable: state.getFeedReadable,
            getPublicationsReadable: isSelfProfile
              ? state.getSelfRootsReadable
              : null,
            publication$: isSelfProfile
              ? ssbSource.publishHook$.filter(isRootPostMsg)
              : null,
            selfFeedId: state.selfFeedId,
            style: isSelfProfile ? styles.feedWithHeader : styles.feed,
            showPublishHeader: isSelfProfile,
          }),
        ] as Array<any>,
      ),
    };
  });
}
