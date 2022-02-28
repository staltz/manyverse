// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import sample from 'xstream-sample';
import {Command} from 'cycle-native-navigation';
import {Screens} from '~frontend/screens/enums';
import {navOptions as resyncNavOpts} from '~frontend/screens/resync';
import {State} from './model';

interface Actions {
  goBack$: Stream<any>;
}

export default function navigation(
  state$: Stream<State>,
  actions: Actions,
  confirmation$: Stream<boolean>,
) {
  return xs.merge(
    actions.goBack$.mapTo({type: 'pop'} as Command),

    confirmation$
      .filter((x) => x === true)
      .take(1)
      .compose(sample(state$))
      .map((state) =>
        state.practiceMode
          ? ({type: 'popToRoot'} as Command)
          : ({
              type: 'push',
              layout: {
                component: {
                  name: Screens.Resync,
                  options: resyncNavOpts,
                },
              },
            } as Command),
      ),
  );
}
