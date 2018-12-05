/* Copyright (C) 2018 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import {Command, PopCommand} from 'cycle-native-navigation';

export type NavigationActions = {
  save$: Stream<any>;
  discardChanges$: Stream<any>;
};

export default function navigation(
  actions: NavigationActions,
): Stream<Command> {
  const goBackDiscarding$ = actions.discardChanges$.map(
    () => ({type: 'pop'} as PopCommand),
  );

  const goBackSaving$ = actions.save$.map(() => ({type: 'pop'} as PopCommand));

  return xs.merge(goBackDiscarding$, goBackSaving$);
}
