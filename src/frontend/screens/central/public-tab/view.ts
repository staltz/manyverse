/* Copyright (C) 2018-2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Stream} from 'xstream';
import dropRepeatsByKeys from 'xstream-drop-repeats-by-keys';
import {h} from '@cycle/react';
import {isRootPostMsg, isPublic} from 'ssb-typescript/utils';
import Feed from '../../../components/Feed';
import {SSBSource} from '../../../drivers/ssb';
import {t} from '../../../drivers/localization';
import EmptySection from '../../../components/EmptySection';
import {Dimensions} from '../../../global-styles/dimens';
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
        'getPublicFeedReadable',
        'scrollHeaderBy',
      ]),
    )
    .map((state) => {
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
        EmptyComponent: h(EmptySection, {
          style: styles.emptySection,
          image: require('../../../../../images/noun-plant.png'),
          title: t('public.empty.title'),
          description: t('public.empty.description'),
        }),
      });
    });

  return vdom$;
}
