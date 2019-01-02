/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import {h} from '@cycle/react';
import {ReactElement} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {FloatingAction} from 'react-native-floating-action';
import {isRootPostMsg} from 'ssb-typescript/utils';
import {SSBSource} from '../../drivers/ssb';
import {shortFeedId} from '../../../ssb/from-ssb';
import {Palette} from '../../global-styles/palette';
import {Dimensions} from '../../global-styles/dimens';
import Feed from '../../components/Feed';
import Button from '../../components/Button';
import ToggleButton from '../../components/ToggleButton';
import EmptySection from '../../components/EmptySection';
import Avatar from '../../components/Avatar';
import {styles, avatarSize} from './styles';
import {State} from './model';

export default function view(
  state$: Stream<State>,
  ssbSource: SSBSource,
  topBarElem$: Stream<ReactElement<any>>,
) {
  return xs.combine(state$, topBarElem$).map(([state, topBarElem]) => {
    const isSelfProfile = state.displayFeedId === state.selfFeedId;
    const isBlocked = state.about.following === false;

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
          state.about.name || shortFeedId(state.about.id),
        ),
      ]),

      h(Avatar, {
        size: avatarSize,
        url: state.about.imageUrl,
        style: styles.avatar,
      }),

      h(View, {style: styles.cta}, [
        isSelfProfile
          ? null as any
          : h(
              TouchableOpacity,
              {
                sel: 'manage',
                accessible: true,
                accessibilityLabel: 'Manage Contact',
              },
              [
                h(Icon, {
                  size: Dimensions.iconSizeNormal,
                  color: Palette.textVeryWeak,
                  name: 'settings',
                }),
              ],
            ),

        isSelfProfile
          ? h(Button, {
              sel: 'editProfile',
              text: 'Edit profile',
              accessible: true,
              accessibilityLabel: 'Edit Profile Button',
            })
          : isBlocked
            ? null
            : h(ToggleButton, {
                sel: 'follow',
                style: styles.follow,
                text: state.about.following === true ? 'Following' : 'Follow',
                toggled: state.about.following === true,
              }),
      ]),

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

      isBlocked
        ? h(EmptySection, {
            style: styles.emptySection,
            title: 'Blocked',
            description:
              'You have chosen to stop\ninteracting with this account',
          })
        : h(Feed, {
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

      isSelfProfile
        ? h(FloatingAction, {
            sel: 'fab',
            color: Palette.backgroundCTA,
            visible: isSelfProfile,
            actions: [
              {
                color: Palette.backgroundCTA,
                name: 'compose',
                icon: require('../../../../images/pencil.png'),
                text: 'Write a public message',
              },
            ],
            overrideWithAction: true,
            iconHeight: 24,
            iconWidth: 24,
          })
        : null as any,
    ]);
  });
}
