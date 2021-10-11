// SPDX-FileCopyrightText: 2018-2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

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
