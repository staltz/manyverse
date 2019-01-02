/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Stream} from 'xstream';
import {h} from '@cycle/react';
import Feed from '../../../components/Feed';
import {State} from './model';
import {SSBSource} from '../../../drivers/ssb';
import {isRootPostMsg} from 'ssb-typescript/utils';
import {styles} from './styles';
import EmptySection from '../../../components/EmptySection';

export default function view(
  state$: Stream<State>,
  ssbSource: SSBSource,
  scrollToTop$: Stream<any>,
) {
  const vdom$ = state$.map(state =>
    h(Feed, {
      sel: 'publicFeed',
      getReadable: state.getPublicFeedReadable,
      getPublicationsReadable: state.getSelfRootsReadable,
      publication$: ssbSource.publishHook$.filter(isRootPostMsg),
      scrollToTop$,
      selfFeedId: state.selfFeedId,
      EmptyComponent: h(EmptySection, {
        style: styles.emptySection,
        image: require('../../../../../images/noun-plant.png'),
        title: 'No messages',
        description: 'Write a diary which you can\nshare with friends later',
      }),
    }),
  );

  return vdom$;
}
