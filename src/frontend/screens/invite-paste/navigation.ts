// SPDX-FileCopyrightText: 2018-2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import {Command} from 'cycle-native-navigation';
import {Platform} from 'react-native';

export type Actions = {
  quitFromKeyboard$: Stream<any>;
  done$: Stream<any>;
  back$: Stream<any>;
};

export default function navigation(actions: Actions): Stream<Command> {
  const goBack$ = xs
    .merge(
      Platform.OS === 'web' ? actions.done$ : xs.never(),
      actions.back$,
      actions.quitFromKeyboard$,
    )
    .map(() => ({type: 'pop'} as Command));

  return goBack$;
}
