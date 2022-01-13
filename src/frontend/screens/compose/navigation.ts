// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import {Command} from 'cycle-native-navigation';
import delay from 'xstream/extra/delay';
import {Screens} from '../enums';
import {navOptions as composeAudioNavOpts} from '../compose-audio';
import {navOptions as memeSearchNavOpts} from '../meme-search';

export interface Actions {
  goToComposeAudio$: Stream<any>;
  goToMemeSearch$: Stream<any>;
  exit$: Stream<any>;
}

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

  const toMemeSearch$ = actions.goToMemeSearch$.map(
    () =>
      ({
        type: 'push',
        layout: {
          component: {
            name: Screens.MemeSearch,
            options: memeSearchNavOpts,
          },
        },
      } as Command),
  );

  return xs.merge(goBack$, toComposeAudio$, toMemeSearch$);
}
