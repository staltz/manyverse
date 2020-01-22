/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import {ReactSource} from '@cycle/react';
import {State} from './model';

export type Actions = {
  changeTab$: Stream<State['currentTab']>;
};

export default function intent(reactSource: ReactSource): Actions {
  return {
    changeTab$: xs.merge(
      reactSource
        .select('public-tab-button')
        .events('press')
        .mapTo('public'),
      reactSource
        .select('connections-tab-button')
        .events('press')
        .mapTo('connections'),
    ),
  };
}
