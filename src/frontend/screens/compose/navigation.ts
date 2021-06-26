/* Copyright (C) 2018-2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import {Command} from 'cycle-native-navigation';
import delay from 'xstream/extra/delay';
import {Screens} from '../enums';
import {navOptions as composeAudioNavOpts} from '../compose-audio';

export type Actions = {
  goToComposeAudio$: Stream<any>;
  exit$: Stream<any>;
};

export default function navigation(actions: Actions): Stream<Command> {
  const goBack$ = actions.exit$
    .compose(delay(100))
    .map(() => ({type: 'pop'} as Command));

  const toComposeAudio$ = actions.goToComposeAudio$.map(
    () =>
      ({
        type: 'push',
        layout: {
          component: {
            name: Screens.ComposeAudio,
            options: composeAudioNavOpts,
          },
        },
      } as Command),
  );

  return xs.merge(goBack$, toComposeAudio$);
}
