// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Stream} from 'xstream';
import dropRepeatsByKeys from 'xstream-drop-repeats-by-keys';
import {h} from '@cycle/react';
import {isRootPostMsg, isPublic} from 'ssb-typescript/utils';
import Feed from '~frontend/components/Feed';
import {SSBSource} from '~frontend/drivers/ssb';
import {t} from '~frontend/drivers/localization';
import EmptySection from '~frontend/components/EmptySection';
import {Dimensions} from '~frontend/global-styles/dimens';
import {Images} from '~frontend/global-styles/images';
import {State} from './model';
import {styles} from './styles';

export default function view(
  state$: Stream<State>,
  ssbSource: SSBSource,
  scrollToTop$: Stream<any>,
) {
  const vdom$ = state$
    .filter((state) => state.isVisible)
    .compose(
      dropRepeatsByKeys([
        'selfFeedId',
        'lastSessionTimestamp',
        'preferredReactions',
        'getPublicFeedReadable',
        'scrollHeaderBy',
        'postsCount',
        'feedType',
        (state) => state.subscribedHashtags?.length ?? -1,
      ]),
    )
    .map((state) => {
      if (
        state.feedType === 'hashtags' &&
        state.subscribedHashtags?.length === 0
      ) {
        return h(EmptySection, {
          key: 'eh',
          style: styles.emptySection,
          image: Images.nounPlant,
          title: t('public.empty_hashtags.title'),
          description: t('public.empty_hashtags.description'),
        });
      }

      return h(Feed, {
        sel: 'publicFeed',
        style: styles.feed,
        contentContainerStyle: styles.feedInner,
        progressViewOffset: Dimensions.toolbarHeight,
        yOffsetAnimVal: state.scrollHeaderBy,
        getReadable: state.getPublicFeedReadable,
        prePublication$: ssbSource.publishHook$
          .filter(isPublic)
          .filter(isRootPostMsg),
        postPublication$: ssbSource.selfPublicRoots$,
        scrollToTop$,
        selfFeedId: state.selfFeedId,
        lastSessionTimestamp: state.lastSessionTimestamp,
        preferredReactions: state.preferredReactions,
        EmptyComponent:
          state.postsCount === 0
            ? h(EmptySection, {
                key: 'e1',
                style: styles.emptySection,
                image: Images.nounBee,
                title: t('central.empty_onboarding.title'),
                description: t('central.empty_onboarding.description'),
                linkLabel: t('central.empty_onboarding.link_label'),
                link: 'https://www.manyver.se/faq/connections',
              })
            : h(EmptySection, {
                key: 'e2',
                style: styles.emptySection,
                image: Images.nounPlant,
                title: t('public.empty.title'),
                description: t('public.empty.description'),
              }),
      });
    });

  return vdom$;
}
