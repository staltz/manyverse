/* Copyright (C) 2018 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Stream} from 'xstream';
import {ReactSource} from '@cycle/react';
import {NavSource} from 'cycle-native-navigation';

export type Actions = {
  changeTab$: Stream<number>;
};

export default function intent(
  reactSource: ReactSource,
  navSource: NavSource,
): Actions {
  return {
    changeTab$: reactSource.select('tabs').events('select'),
  };
}
