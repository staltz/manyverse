/* Copyright (C) 2018-2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Stream} from 'xstream';
import dropRepeatsByKeys from 'xstream-drop-repeats-by-keys';
import {h} from '@cycle/react';
import {PureComponent} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  ViewProps,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {FloatingAction} from 'react-native-floating-action';
import {getStatusBarHeight} from 'react-native-status-bar-height';
import {isRootPostMsg, isPublic} from 'ssb-typescript/utils';
import {SSBSource} from '../../drivers/ssb';
import {t} from '../../drivers/localization';
import {displayName} from '../../ssb/utils/from-ssb';
import {Palette} from '../../global-styles/palette';
import {Dimensions} from '../../global-styles/dimens';
import Feed from '../../components/Feed';
import Button from '../../components/Button';
import ToggleButton from '../../components/ToggleButton';
import EmptySection from '../../components/EmptySection';
import Avatar from '../../components/Avatar';
import TopBar from '../../components/TopBar';
import Markdown from '../../components/Markdown';
import {State} from './model';
import {
  styles,
  AVATAR_SIZE,
  AVATAR_SIZE_TOOLBAR,
  COVER_HEIGHT,
  NAME_MARGIN_TOOLBAR,
  BIO_MARKDOWN_MAX_HEIGHT,
} from './styles';

function calcNameTransY(scrollY: Animated.Value): Animated.Animated {
  return scrollY.interpolate({
    inputRange: [-10, 0, COVER_HEIGHT + NAME_MARGIN_TOOLBAR],
    outputRange: [10, 0, -COVER_HEIGHT - NAME_MARGIN_TOOLBAR],
    extrapolateLeft: 'extend',
    extrapolateRight: 'clamp',
  });
}

function calcAvatarTransX(scrollY: Animated.Value): Animated.Animated {
  return scrollY.interpolate({
    inputRange: [0, COVER_HEIGHT + NAME_MARGIN_TOOLBAR],
    outputRange: [0, Dimensions.iconSizeNormal],
    extrapolate: 'clamp',
  });
}

function calcAvatarTransY(scrollY: Animated.Value): Animated.Animated {
  const margin =
    (Dimensions.toolbarHeight -
      getStatusBarHeight(true) -
      AVATAR_SIZE_TOOLBAR) *
    0.5;
  return scrollY.interpolate({
    inputRange: [-10, 0, COVER_HEIGHT + NAME_MARGIN_TOOLBAR],
    outputRange: [10, 0, -COVER_HEIGHT - AVATAR_SIZE_TOOLBAR * 0.5 - margin],
    extrapolateLeft: 'extend',
    extrapolateRight: 'clamp',
  });
}

function calcAvatarScale(scrollY: Animated.Value): Animated.Animated {
  return scrollY.interpolate({
    inputRange: [0, COVER_HEIGHT + NAME_MARGIN_TOOLBAR],
    outputRange: [1, AVATAR_SIZE_TOOLBAR / AVATAR_SIZE],
    extrapolate: 'clamp',
  });
}

function ProfileTopBar() {
  return h(TopBar, {sel: 'topbar'}, [
    h(
      TouchableOpacity,
      {
        sel: 'manage',
        accessible: true,
        accessibilityRole: 'button',
        accessibilityLabel: t(
          'profile.call_to_action.manage.accessibility_label',
        ),
      },
      [
        h(Icon, {
          size: Dimensions.iconSizeNormal,
          color: Palette.textForBackgroundBrand,
          name: 'dots-vertical',
        }),
      ],
    ),
  ]);
}

function ProfileAvatar({
  state,
  translateX,
  translateY,
  scale,
}: {
  state: State;
  translateX: Animated.AnimatedInterpolation;
  translateY: Animated.AnimatedInterpolation;
  scale: Animated.AnimatedInterpolation;
}) {
  const animStyle = {transform: [{translateX}, {translateY}, {scale}]};

  return h(
    TouchableWithoutFeedback,
    {
      sel: 'avatar',
      accessible: true,
      accessibilityRole: 'image',
      accessibilityLabel: t('profile.picture.accessibility_label'),
    },
    [
      h(
        Animated.View,
        {style: [styles.avatarTouchable, animStyle], pointerEvents: 'box-only'},
        [
          h(Avatar, {
            size: AVATAR_SIZE,
            url: state.about.imageUrl,
            style: styles.avatar,
          }),
        ],
      ),
    ],
  );
}

function ProfileName({
  state,
  translateY,
}: {
  state: State;
  translateY: Animated.AnimatedInterpolation;
}) {
  const animStyle = {transform: [{translateY}]};

  return h(
    Animated.Text,
    {
      style: [styles.name, animStyle],
      numberOfLines: 1,
      ellipsizeMode: 'middle',
      accessible: true,
      accessibilityRole: 'text',
      accessibilityLabel: t('profile.name.accessibility_label'),
    },
    displayName(state.about.name, state.about.id),
  );
}

class ProfileHeader extends PureComponent<{
  about: State['about'];
  isSelfProfile: boolean;
}> {
  public state = {
    showReadBio: false,
  };

  private onMarkdownMeasured: ViewProps['onLayout'] = (ev) => {
    if (ev.nativeEvent.layout.height > BIO_MARKDOWN_MAX_HEIGHT) {
      this.setState({showReadBio: true});
    }
  };

  public render() {
    const {about, isSelfProfile} = this.props;
    const followsYouTristate = about.followsYou;
    const isBlocked = about.following === false;

    return h(View, {style: styles.header}, [
      h(View, {style: styles.cover}),

      h(View, {style: styles.sub}, [
        followsYouTristate === true
          ? h(View, {style: styles.followsYou}, [
              h(
                Text,
                {style: styles.followsYouText},
                t('profile.info.follows_you'),
              ),
            ])
          : followsYouTristate === false
          ? h(View, {style: styles.followsYou}, [
              h(
                Text,
                {style: styles.followsYouText},
                t('profile.info.blocks_you'),
              ),
            ])
          : null,

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

      about.description
        ? h(View, {style: styles.descriptionArea}, [
            h(Markdown, {
              key: 'md',
              text: about.description!,
              onLayout: this.onMarkdownMeasured,
            }),
            this.state.showReadBio
              ? h(Button, {
                  sel: 'bio',
                  key: 'bio',
                  text: t('profile.call_to_action.open_biography.label'),
                  strong: false,
                  small: true,
                  style: styles.readBio,
                  accessible: true,
                  accessibilityLabel: t(
                    'profile.call_to_action.open_biography.accessibility_label',
                  ),
                })
              : null,
          ])
        : null,

      h(View, {style: styles.headerMarginBottom}),
    ]);
  }
}

export default function view(state$: Stream<State>, ssbSource: SSBSource) {
  const scrollHeaderBy = new Animated.Value(0);
  const avatarScale = calcAvatarScale(scrollHeaderBy);
  const avatarTransX = calcAvatarTransX(scrollHeaderBy);
  const avatarTransY = calcAvatarTransY(scrollHeaderBy);
  const nameTransY = calcNameTransY(scrollHeaderBy);

  return state$
    .compose(
      dropRepeatsByKeys([
        'displayFeedId',
        'selfFeedId',
        'lastSessionTimestamp',
        'about',
        'getFeedReadable',
        'getSelfRootsReadable',
      ]),
    )
    .map((state) => {
      const isSelfProfile = state.displayFeedId === state.selfFeedId;
      const isBlocked = state.about.following === false;

      return h(View, {style: styles.container}, [
        h(ProfileTopBar),

        h(ProfileAvatar, {
          state,
          translateX: avatarTransX,
          translateY: avatarTransY,
          scale: avatarScale,
        }),

        h(ProfileName, {state, translateY: nameTransY}),

        isBlocked
          ? h(EmptySection, {
              style: styles.emptySection,
              title: t('profile.empty.blocked.title'),
              description: t('profile.empty.blocked.description'),
            })
          : h(Feed, {
              sel: 'feed',
              getReadable: state.getFeedReadable,
              getPublicationsReadable: isSelfProfile
                ? state.getSelfRootsReadable
                : null,
              publication$: isSelfProfile
                ? ssbSource.publishHook$.filter(isPublic).filter(isRootPostMsg)
                : null,
              selfFeedId: state.selfFeedId,
              lastSessionTimestamp: state.lastSessionTimestamp,
              yOffsetAnimVal: scrollHeaderBy,
              HeaderComponent: h(ProfileHeader, {
                about: state.about,
                isSelfProfile,
              }),
              style: styles.feed,
              EmptyComponent: isSelfProfile
                ? h(EmptySection, {
                    style: styles.emptySection,
                    image: require('../../../../images/noun-plant.png'),
                    title: t('profile.empty.no_self_messages.title'),
                    description: t(
                      'profile.empty.no_self_messages.description',
                    ),
                  })
                : h(EmptySection, {
                    style: styles.emptySection,
                    title: t('profile.empty.no_messages.title'),
                    description: t('profile.empty.no_messages.description'),
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
                  text: t('profile.floating_action_button.compose'),
                },
              ],
              overrideWithAction: true,
              iconHeight: 24,
              iconWidth: 24,
            })
          : null,
      ]);
    });
}
