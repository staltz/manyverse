/* Copyright (C) 2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {h} from '@cycle/react';
import {PureComponent} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
const stripMarkdownOneline = require('strip-markdown-oneline');
import {t} from '../../../drivers/localization';
import Button from '../../../components/Button';
import ToggleButton from '../../../components/ToggleButton';
import {Dimensions} from '../../../global-styles/dimens';
import {Palette} from '../../../global-styles/palette';
import {State} from '../model';
import {styles} from './styles';

function Biography({about}: {about: State['about']}) {
  if (!about.description) return null;

  return h(
    TouchableOpacity,
    {
      sel: 'bio',
      accessible: true,
      accessibilityLabel: t('profile.details.biography.accessibility_label'),
    },
    [
      h(View, {style: styles.biographyContainer, pointerEvents: 'box-only'}, [
        h(
          Text,
          {
            key: 'c',
            numberOfLines: 2,
            ellipsizeMode: 'tail',
            style: styles.biographyContent,
          },
          [stripMarkdownOneline(about.description)],
        ),
      ]),
    ],
  );
}

function Counter({
  selector,
  title,
  content,
}: {
  selector: string;
  title: string;
  content: string;
}) {
  return h(TouchableOpacity, {sel: selector}, [
    h(
      Text,
      {
        key: 'c',
        numberOfLines: 1,
        ellipsizeMode: 'tail',
        style: styles.counterContent,
      },
      [
        content,
        title
          ? h(Text, {key: 't', style: styles.counterContentTitle}, ' ' + title)
          : '',
      ],
    ),
  ]);
}

function FollowSection({
  following,
  followers,
}: {
  following: State['following'];
  followers: State['followers'];
}) {
  if (!following && !followers) return null;

  return h(View, {style: styles.detailsRow}, [
    h(Icon, {
      size: Dimensions.iconSizeSmall,
      color: Palette.textPositive,
      name: 'account-plus',
    }),

    following
      ? h(Counter, {
          selector: 'following',
          content: `${following.length}`,
          title: t('profile.details.counters.following'),
        })
      : null,
    followers
      ? h(Counter, {
          selector: 'followers',
          content: `${followers.length}`,
          title: t('profile.details.counters.followers'),
        })
      : null,
  ]);
}

function FollowsYou() {
  return h(View, {style: styles.detailsRow}, [
    h(Icon, {
      size: Dimensions.iconSizeSmall,
      color: Palette.textPositive,
      name: 'check-bold',
    }),
    h(Text, {style: styles.followsYouText}, t('profile.info.follows_you')),
  ]);
}

export default class ProfileHeader extends PureComponent<{
  about: State['about'];
  following: State['following'];
  followers: State['followers'];
  isSelfProfile: boolean;
}> {
  public render() {
    const {about, following, followers, isSelfProfile} = this.props;
    const followsYou = about.followsYou === true;
    const isBlocked = about.following === false;

    return h(View, {style: styles.header}, [
      h(View, {style: styles.cover}),

      h(View, {style: styles.sub}, [
        h(View, {style: styles.cta}, [
          isSelfProfile
            ? h(Button, {
                sel: 'editProfile',
                text: t('profile.call_to_action.edit_profile.label'),
                accessible: true,
                accessibilityLabel: t(
                  'profile.call_to_action.edit_profile.accessibility_label',
                ),
              })
            : isBlocked
            ? null
            : h(ToggleButton, {
                sel: 'follow',
                style: styles.follow,
                text:
                  about.following === true
                    ? t('profile.info.following')
                    : t('profile.call_to_action.follow'),
                toggled: about.following === true,
              }),
        ]),
      ]),

      h(View, {style: styles.detailsArea}, [
        h(Biography, {about}),
        h(FollowSection, {following, followers}),
        followsYou ? h(FollowsYou) : null,
      ]),

      h(View, {style: styles.headerMarginBottom}),
    ]);
  }
}
