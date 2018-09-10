/**
 * Manyverse is a mobile app for Secure Scuttlebutt networks
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
import {View, Text} from 'react-native';
import {h} from '@cycle/react';
import Feed from '../../components/Feed';
import Button from '../../components/Button';
import ToggleButton from '../../components/ToggleButton';
import {SSBSource} from '../../drivers/ssb';
import {styles, avatarSize} from './styles';
import {State} from './model';
import {isRootPostMsg} from 'ssb-typescript/utils';
import {FloatingAction} from 'react-native-floating-action';
import {Palette} from '../../global-styles/palette';
import {ReactElement} from 'react';
import EmptySection from '../../components/EmptySection';
import Avatar from '../../components/Avatar';

export default function view(
  state$: Stream<State>,
  ssbSource: SSBSource,
  topBarElem$: Stream<ReactElement<any>>,
) {
  return xs.combine(state$, topBarElem$).map(([state, topBarElem]) => {
    const isSelfProfile = state.displayFeedId === state.selfFeedId;

    return h(View, {style: styles.container}, [
      topBarElem,

      h(View, {style: styles.cover}, [
        h(
          Text,
          {
            style: styles.name,
            numberOfLines: 1,
            ellipsizeMode: 'middle',
            accessible: true,
            accessibilityLabel: 'Profile Name',
          },
          state.about.name,
        ),
      ]),

      h(Avatar, {
        size: avatarSize,
        url: state.about.imageUrl,
        style: styles.avatar,
      }),

      isSelfProfile
        ? h(Button, {
            sel: 'editProfile',
            style: styles.follow,
            text: 'Edit profile',
            accessible: true,
            accessibilityLabel: 'Edit Profile Button',
          })
        : h(ToggleButton, {
            sel: 'follow',
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
        [
          h(
            Text,
            {style: styles.description, numberOfLines: 2},
            state.about.description || '',
          ),
        ],
      ),

      h(Feed, {
        sel: 'feed',
        getReadable: state.getFeedReadable,
        getPublicationsReadable: isSelfProfile
          ? state.getSelfRootsReadable
          : null,
        publication$: isSelfProfile
          ? ssbSource.publishHook$.filter(isRootPostMsg)
          : null,
        selfFeedId: state.selfFeedId,
        style: isSelfProfile ? styles.feedWithHeader : styles.feed,
        EmptyComponent: isSelfProfile
          ? h(EmptySection, {
              style: styles.emptySection,
              image: require('../../../../images/noun-plant.png'),
              title: 'No messages',
              description:
                'Write a diary which you can\nshare with friends later',
            })
          : h(EmptySection, {
              style: styles.emptySection,
              title: 'No messages',
              description: "You don't yet have any data\nfrom this account",
            }),
      }),

      h(FloatingAction, {
        sel: 'fab',
        color: Palette.brand.callToActionBackground,
        visible: isSelfProfile,
        actions: [
          {
            color: Palette.brand.callToActionBackground,
            name: 'compose',
            icon: require('../../../../images/pencil.png'),
            text: 'Write a public message',
          },
        ],
        overrideWithAction: true,
        iconHeight: 24,
        iconWidth: 24,
      }),
    ]);
  });
}
