// SPDX-FileCopyrightText: 2018-2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

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
