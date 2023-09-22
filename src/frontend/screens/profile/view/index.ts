// SPDX-FileCopyrightText: 2018-2023 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Stream} from 'xstream';
import dropRepeatsByKeys from 'xstream-drop-repeats-by-keys';
import {h} from '@cycle/react';
import {View, Animated, Platform} from 'react-native';
const pull = require('pull-stream');
import {getStatusBarHeight} from 'react-native-status-bar-height';
import {isRootPostMsg, isPublic} from 'ssb-typescript/utils';
import {GetReadable, SSBSource} from '~frontend/drivers/ssb';
import {t} from '~frontend/drivers/localization';
import {Palette} from '~frontend/global-styles/palette';
import {Dimensions} from '~frontend/global-styles/dimens';
import {Images} from '~frontend/global-styles/images';
import Feed from '~frontend/components/Feed';
import EmptySection from '~frontend/components/EmptySection';
import StatusBarBlank from '~frontend/components/StatusBarBlank';
import {FloatingActionButton} from '~frontend/components/FloatingActionButton';
import {State} from '../model';
import {styles, AVATAR_SIZE} from './styles';
import ProfileHeader from './ProfileHeader';
import ProfileTopBar from './ProfileTopBar';

const IOS = getStatusBarHeight(true);

function calcOpacity(scrollY: Animated.Value) {
  const FIRST = 0 - IOS;
  const SECOND = FIRST + Dimensions.verticalSpaceBig + AVATAR_SIZE;
  const THIRD = SECOND + Dimensions.toolbarHeight;
  return scrollY.interpolate({
    inputRange: [FIRST, SECOND, THIRD],
    outputRange: [0, 0, 1],
    extrapolate: 'clamp',
  });
}

/**
 * The purpose of this animation is to make the top bar elements not be
 * clickable when the elements are not visible.
 */
function calcTransY(scrollY: Animated.Value) {
  const FIRST = 0 - IOS;
  const SECOND = FIRST + Dimensions.verticalSpaceBig + AVATAR_SIZE;
  const THIRD = SECOND + 1;
  return scrollY.interpolate({
    inputRange: [FIRST, SECOND, THIRD],
    outputRange: [-400, 0, 0],
    extrapolate: 'clamp',
  });
}

const pullNever: GetReadable<any> = () => () => {};

export default function view(state$: Stream<State>, ssbSource: SSBSource) {
  const scrollHeaderBy = new Animated.Value(0);
  const topBarElementsOpacity = calcOpacity(scrollHeaderBy);
  const topBarElementsTransY = calcTransY(scrollHeaderBy);

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
        'friendsInCommonAbouts',
        'followsYou',
        'youFollow',
        'youBlock',
        'aliases',
        'connection',
        'latestPrivateChat',
        'getFeedReadable',
      ]),
    )
    .map((state) => {
      const isSelfProfile = state.displayFeedId === state.selfFeedId;
      const isBlocked = state.youBlock?.response ?? false;

      const fabSection = FloatingActionButton({
        sel: 'fab',
        title: t('profile.floating_action_button.compose'),
        color: Palette.backgroundCTA,
        visible: isSelfProfile,
        actions: [
          {
            color: Palette.backgroundCTA,
            name: 'compose',
            icon: Images.pencil,
            text: t('profile.floating_action_button.compose'),
          },
        ],
        distanceToEdge:
          Platform.OS === 'web'
            ? {
                vertical: Dimensions.verticalSpaceLarge,
                horizontal: Dimensions.horizontalSpaceBig,
              }
            : 30,
      });

      let getReadable = pullNever;
      if (isBlocked) getReadable = pull.empty;
      else if (state.getFeedReadable) getReadable = state.getFeedReadable;

      return h(View, {style: styles.screen}, [
        h(StatusBarBlank),
        h(ProfileTopBar, {
          state,
          isSelfProfile,
          opacity: topBarElementsOpacity,
          transY: topBarElementsTransY,
        }),

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
                image: Images.nounPlant,
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
