// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Stream} from 'xstream';
import dropRepeatsByKeys from 'xstream-drop-repeats-by-keys';
import {h} from '@cycle/react';
import {
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  Platform,
} from 'react-native';
const pull = require('pull-stream');
import {isBlurhashValid} from 'blurhash';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  FloatingAction,
  IFloatingActionProps,
} from 'react-native-floating-action';
import {getStatusBarHeight} from 'react-native-status-bar-height';
import {isRootPostMsg, isPublic} from 'ssb-typescript/utils';
import {GetReadable, SSBSource} from '~frontend/drivers/ssb';
import {t} from '~frontend/drivers/localization';
import {Palette} from '~frontend/global-styles/palette';
import {Dimensions} from '~frontend/global-styles/dimens';
import {getImg} from '~frontend/global-styles/utils';
import {IconNames} from '~frontend/global-styles/icons';
import Feed from '~frontend/components/Feed';
import BlurhashAvatar from '~frontend/components/BlurhashAvatar';
import EmptySection from '~frontend/components/EmptySection';
import Avatar from '~frontend/components/Avatar';
import TopBar from '~frontend/components/TopBar';
import {withTitle} from '~frontend/components/withTitle';
import {State} from '../model';
import {
  styles,
  AVATAR_SIZE,
  AVATAR_SIZE_TOOLBAR,
  COVER_HEIGHT,
  NAME_MARGIN_TOOLBAR,
} from './styles';
import ProfileHeader from './ProfileHeader';
import ProfileID from './ProfileID';
import ProfileName from './ProfileName';
import ConnectionDot from './ConnectionDot';

const IOS = getStatusBarHeight(true);

function calcNameTransY(scrollY: Animated.Value): Animated.Animated {
  return scrollY.interpolate({
    inputRange: [-10 - IOS, 0 - IOS, COVER_HEIGHT + NAME_MARGIN_TOOLBAR - IOS],
    outputRange: [10 + IOS, 0 + IOS, -COVER_HEIGHT - NAME_MARGIN_TOOLBAR + IOS],
    extrapolateLeft: 'extend',
    extrapolateRight: 'clamp',
  });
}

function calcAvatarTransX(scrollY: Animated.Value): Animated.Animated {
  return scrollY.interpolate({
    inputRange: [0 - IOS, COVER_HEIGHT + NAME_MARGIN_TOOLBAR - IOS],
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
    inputRange: [-10 - IOS, 0 - IOS, COVER_HEIGHT + NAME_MARGIN_TOOLBAR - IOS],
    outputRange: [
      10 + IOS,
      0 + IOS,
      -COVER_HEIGHT - AVATAR_SIZE_TOOLBAR * 0.5 - margin + IOS,
    ],
    extrapolateLeft: 'extend',
    extrapolateRight: 'clamp',
  });
}

function calcAvatarScale(scrollY: Animated.Value): Animated.Animated {
  return scrollY.interpolate({
    inputRange: [0 - IOS, COVER_HEIGHT + NAME_MARGIN_TOOLBAR - IOS],
    outputRange: [1, AVATAR_SIZE_TOOLBAR / AVATAR_SIZE],
    extrapolate: 'clamp',
  });
}

function calcConnDotTransX(scrollY: Animated.Value): Animated.Animated {
  return scrollY.interpolate({
    inputRange: [0 - IOS, COVER_HEIGHT + NAME_MARGIN_TOOLBAR - IOS],
    outputRange: [0, Dimensions.iconSizeNormal * 0.33],
    extrapolate: 'clamp',
  });
}

function calcConnDotTransY(scrollY: Animated.Value): Animated.Animated {
  const margin =
    (Dimensions.toolbarHeight -
      getStatusBarHeight(true) -
      AVATAR_SIZE_TOOLBAR) *
    0.5;
  return scrollY.interpolate({
    inputRange: [-10 - IOS, 0 - IOS, COVER_HEIGHT + NAME_MARGIN_TOOLBAR - IOS],
    outputRange: [
      10 + IOS,
      0 + IOS,
      -COVER_HEIGHT - AVATAR_SIZE_TOOLBAR * 0.91 - margin + IOS,
    ],
    extrapolateLeft: 'extend',
    extrapolateRight: 'clamp',
  });
}

function calcConnDotScale(scrollY: Animated.Value): Animated.Animated {
  return scrollY.interpolate({
    inputRange: [0 - IOS, COVER_HEIGHT + NAME_MARGIN_TOOLBAR - IOS],
    outputRange: [1, AVATAR_SIZE_TOOLBAR / AVATAR_SIZE],
    extrapolate: 'clamp',
  });
}

function ProfileTopBar({
  state,
  isSelfProfile,
  nameTransY,
}: {
  state: State;
  isSelfProfile: boolean;
  nameTransY: Animated.AnimatedInterpolation;
}) {
  return h(TopBar, {sel: 'topbar', style: styles.topBar}, [
    // This spacer exists to stretch the innerContainer of the topBar because we
    // want its dimensions to be always the same since the innerContainer will
    // have children (such as ProfileName) that are `absolute`ly positioned.
    h(View, {style: styles.topBarSpacer}),

    h(ProfileName, {state, translateY: nameTransY, inTopBar: true}),

    h(ProfileID, {state, translateY: nameTransY, inTopBar: true}),

    isSelfProfile
      ? null
      : h(
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
              color: Palette.textWeak,
              name: IconNames.etcDropdown,
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
  const animStyle = {
    transform: [{translateX}, {translateY}, {scale}],
  };

  if (
    !state.about.imageUrl &&
    state.snapshot.blurhash &&
    isBlurhashValid(state.snapshot.blurhash).result
  ) {
    return h(Animated.View, {style: [styles.avatarTouchable, animStyle]}, [
      h(BlurhashAvatar, {
        blurhash: state.snapshot.blurhash,
        size: AVATAR_SIZE,
      }),
    ]);
  }

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

const pullNever: GetReadable<any> = () => () => {};

export default function view(state$: Stream<State>, ssbSource: SSBSource) {
  const scrollHeaderBy = new Animated.Value(0);
  const avatarScale = calcAvatarScale(scrollHeaderBy);
  const avatarTransX = calcAvatarTransX(scrollHeaderBy);
  const avatarTransY = calcAvatarTransY(scrollHeaderBy);
  const nameTransY = calcNameTransY(scrollHeaderBy);
  const connDotTransX = calcConnDotTransX(scrollHeaderBy);
  const connDotTransY = calcConnDotTransY(scrollHeaderBy);
  const connDotScale = calcConnDotScale(scrollHeaderBy);

  return state$
    .compose(
      dropRepeatsByKeys([
        'displayFeedId',
        'selfFeedId',
        'lastSessionTimestamp',
        'preferredReactions',
        'about',
        'snapshot',
        'following',
        'followers',
        'friendsInCommon',
        'followsYou',
        'youFollow',
        'youBlock',
        'aliases',
        'connection',
        'getFeedReadable',
        'storageUsed',
      ]),
    )
    .map((state) => {
      const isSelfProfile = state.displayFeedId === state.selfFeedId;
      const isBlocked = state.youBlock?.response ?? false;

      const fab = h(FloatingAction, {
        sel: 'fab',
        color: Palette.backgroundCTA,
        visible: isSelfProfile,
        actions: [
          {
            color: Palette.backgroundCTA,
            name: 'compose',
            icon: getImg(require('~images/pencil.png')),
            text: t('profile.floating_action_button.compose'),
          },
        ],
        overrideWithAction: true,
        iconHeight: 24,
        iconWidth: 24,
        distanceToEdge:
          Platform.OS === 'web'
            ? ({
                vertical: Dimensions.verticalSpaceLarge,
                horizontal: Dimensions.horizontalSpaceBig,
              } as any)
            : 30,
      } as IFloatingActionProps);

      const fabSection =
        Platform.OS === 'web'
          ? h(
              withTitle(View),
              {
                style: styles.desktopFabContainer,
                title: t('profile.floating_action_button.compose'),
              },
              [fab],
            )
          : fab;

      let getReadable = pullNever;
      if (isBlocked) getReadable = pull.empty;
      else if (state.getFeedReadable) getReadable = state.getFeedReadable;

      return h(View, {style: styles.screen}, [
        h(ProfileTopBar, {state, isSelfProfile, nameTransY}),

        h(ProfileAvatar, {
          state,
          translateX: avatarTransX,
          translateY: avatarTransY,
          scale: avatarScale,
        }),

        h(ProfileName, {state, translateY: nameTransY, inTopBar: false}),

        h(ProfileID, {state, translateY: nameTransY, inTopBar: false}),

        state.connection
          ? h(ConnectionDot, {
              state,
              translateX: connDotTransX,
              translateY: connDotTransY,
              scale: connDotScale,
            })
          : null,

        h(Feed, {
          sel: 'feed',
          getReadable,
          prePublication$: isBlocked
            ? null
            : isSelfProfile
            ? ssbSource.publishHook$.filter(isPublic).filter(isRootPostMsg)
            : null,
          postPublication$: isBlocked
            ? null
            : isSelfProfile
            ? ssbSource.selfPublicRoots$
            : null,
          selfFeedId: state.selfFeedId,
          lastSessionTimestamp: state.lastSessionTimestamp,
          preferredReactions: state.preferredReactions,
          yOffsetAnimVal: scrollHeaderBy,
          HeaderComponent: h(ProfileHeader, {state}),
          style: styles.feed,
          contentContainerStyle: styles.feedInner,
          EmptyComponent: isBlocked
            ? h(EmptySection, {
                style: styles.emptySection,
                title: t('profile.empty.blocked.title'),
                description: t('profile.empty.blocked.description'),
              })
            : isSelfProfile
            ? h(EmptySection, {
                style: styles.emptySection,
                image: getImg(require('~images/noun-plant.png')),
                title: t('profile.empty.no_self_messages.title'),
                description: t('profile.empty.no_self_messages.description'),
              })
            : h(EmptySection, {
                style: styles.emptySection,
                title: t('profile.empty.no_messages.title'),
                description: t('profile.empty.no_messages.description'),
              }),
        }),

        isSelfProfile ? fabSection : null,
      ]);
    });
}
