// SPDX-FileCopyrightText: 2021-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {h} from '@cycle/react';
import {Fragment, Component} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
const stripMarkdownOneline = require('strip-markdown-oneline');
import {t} from '~frontend/drivers/localization';
import {Dimensions} from '~frontend/global-styles/dimens';
import {Palette} from '~frontend/global-styles/palette';
import {IconNames} from '~frontend/global-styles/icons';
import Button from '~frontend/components/Button';
import ToggleButton from '~frontend/components/ToggleButton';
import IconButton from '~frontend/components/IconButton';
import {Alias} from '~frontend/ssb/types';
import {canonicalizeAliasURL} from '~frontend/ssb/utils/alias';
import {State} from '../model';
import {styles} from './styles';
import ProfileAvatar from './ProfileAvatar';
import ProfileName from './ProfileName';
import ProfileID from './ProfileID';
import ConnectionDot from './ConnectionDot';

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
  parenthesized,
  smallMargin,
}: {
  selector: string;
  title: string;
  content: string;
  parenthesized?: boolean;
  smallMargin?: boolean;
}) {
  const openParen =
    parenthesized === true
      ? h(Text, {key: 'p', style: styles.counterContentParen}, '(')
      : '';
  const closeParen = parenthesized === true ? ')' : '';
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
        openParen,
        content,
        title
          ? h(
              Text,
              {
                key: 't',
                style: [
                  styles.counterContentTitle,
                  smallMargin ? styles.counterContentTitleSmallMargin : null,
                ],
              },
              ' ' + title + closeParen,
            )
          : '',
      ],
    ),
  ]);
}

function FollowSection({
  following,
  followers,
  friendsInCommon,
  isSelfProfile,
}: {
  following: State['following'];
  followers: State['followers'];
  friendsInCommon: State['friendsInCommon'];
  isSelfProfile: boolean;
}) {
  if (!following && !followers) return null;
  const inCommonNum = friendsInCommon?.length ?? 0;

  return h(View, {style: styles.detailsRow}, [
    h(Icon, {
      size: Dimensions.iconSizeSmall,
      color: Palette.textPositive,
      name: IconNames.accountFollow,
      style: styles.counterIcon,
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
          smallMargin: true,
        })
      : null,
    !isSelfProfile && inCommonNum > 0
      ? h(Counter, {
          selector: 'friendsInCommon',
          parenthesized: true,
          smallMargin: true,
          content: `${inCommonNum}`,
          title: t('profile.details.counters.friends_in_common'),
        })
      : null,
  ]);
}

function FollowsYou() {
  return h(View, {style: styles.detailsRow}, [
    h(Icon, {
      size: Dimensions.iconSizeSmall,
      color: Palette.textPositive,
      name: IconNames.success,
      style: styles.counterIcon,
    }),
    h(Text, {style: styles.secondaryLabel}, t('profile.info.follows_you')),
  ]);
}

function AliasesSection({
  aliases,
  onPressAlias,
  isSelfProfile,
}: {
  aliases: State['aliases'];
  onPressAlias?: (a: Alias) => void;
  isSelfProfile: boolean;
}) {
  if (aliases.length === 0) return null;

  return h(Fragment, [
    ...aliases.map((a) =>
      h(View, {key: a.aliasURL, style: styles.detailsRow}, [
        h(Icon, {
          size: Dimensions.iconSizeSmall,
          color: Palette.textBrand,
          name: IconNames.roomAliasLink,
          style: styles.counterIcon,
        }),
        h(
          Text,
          {
            selectable: isSelfProfile,
            style: styles.aliasLink,
            onPress: () => {
              if (!isSelfProfile) onPressAlias?.(a);
            },
          },
          canonicalizeAliasURL(a.aliasURL),
        ),
      ]),
    ),
  ]);
}

export default class ProfileHeader extends Component<{state: State}> {
  public shouldComponentUpdate(nextProps: ProfileHeader['props']) {
    const prev = this.props.state;
    const next = nextProps.state;
    if (next.about.name !== prev.about.name) return true;
    if (next.about.imageUrl !== prev.about.imageUrl) return true;
    if (next.about.description !== prev.about.description) return true;
    if (next.aliases.length !== prev.aliases.length) return true;
    if (next.following?.length !== prev.following?.length) return true;
    if (next.followers?.length !== prev.followers?.length) return true;
    if (next.friendsInCommon?.length !== prev.friendsInCommon?.length)
      return true;
    if (next.youBlock?.response !== prev.youBlock?.response) return true;
    if (next.youFollow?.response !== prev.youFollow?.response) return true;
    if (next.followsYou?.response !== prev.followsYou?.response) return true;
    if (next.latestPrivateChat !== prev.latestPrivateChat) return true;
    return false;
  }

  public render() {
    const state = this.props.state;
    const {
      about,
      following,
      followers,
      friendsInCommon,
      aliases,
      latestPrivateChat,
    } = state;

    const isSelfProfile = state.displayFeedId === state.selfFeedId;
    const followsYou = state.followsYou?.response ?? false;
    const youFollow = state.youFollow?.response;
    const youBlock = state.youBlock?.response;
    const commonProps = {state, inTopBar: false};

    const showFollowToggleButton =
      youFollow !== undefined && youBlock === false;

    return h(View, {style: styles.header}, [
      h(View, {style: styles.cover}),

      h(View, {style: styles.sub}, [
        h(ProfileAvatar, commonProps),
        state.connection ? h(ConnectionDot, commonProps) : null,

        h(View, {style: styles.nameContainer}, [
          h(ProfileName, commonProps),
          h(ProfileID, commonProps),

          h(View, {style: styles.cta}, [
            latestPrivateChat
              ? h(IconButton, {
                  sel: 'chat',
                  icon: IconNames.privateChat,
                  accessible: true,
                  accessibilityLabel: t('profile.call_to_action.private_chat'),
                })
              : null,

            isSelfProfile
              ? h(Button, {
                  sel: 'editProfile',
                  text: t('profile.call_to_action.edit_profile.label'),
                  accessible: true,
                  accessibilityLabel: t(
                    'profile.call_to_action.edit_profile.accessibility_label',
                  ),
                })
              : showFollowToggleButton
              ? h(ToggleButton, {
                  sel: 'follow',
                  style: styles.follow,
                  text: youFollow
                    ? t('profile.info.following')
                    : t('profile.call_to_action.follow'),
                  toggled: youFollow,
                })
              : null,
          ]),
        ]),
      ]),

      h(View, {style: styles.detailsArea}, [
        h(Biography, {about}),
        followsYou ? h(FollowsYou) : null,
        h(FollowSection, {
          following,
          followers,
          friendsInCommon,
          isSelfProfile,
        }),
        h(AliasesSection, {sel: 'aliases', aliases, isSelfProfile}),
      ]),

      h(View, {style: styles.headerMarginBottom}),
    ]);
  }
}
