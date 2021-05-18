/* Copyright (C) 2018-2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import {Command} from 'cycle-native-navigation';

export interface NavigationActions {
  save$: Stream<any>;
  discardChanges$: Stream<any>;
}

export default function navigation(
  actions: NavigationActions,
): Stream<Command> {
  const goBackDiscarding$ = actions.discardChanges$.map(
    () => ({type: 'pop'} as Command),
  );

  const goBackSaving$ = actions.save$.map(() => ({type: 'pop'} as Command));

  return xs.merge(goBackDiscarding$, goBackSaving$);
}
