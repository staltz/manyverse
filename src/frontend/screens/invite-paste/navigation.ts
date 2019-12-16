/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Stream} from 'xstream';
import {Command} from 'cycle-native-navigation';

export type Actions = {
  quitFromKeyboard$: Stream<any>;
};

export default function navigation(actions: Actions): Stream<Command> {
  const goBack$ = actions.quitFromKeyboard$.map(
    () => ({type: 'pop'} as Command),
  );

  return goBack$;
}
