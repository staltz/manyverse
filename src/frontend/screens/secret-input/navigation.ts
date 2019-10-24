/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import sample from 'xstream-sample';
import {centralLayout} from '../..';
import {Command} from 'cycle-native-navigation';
import {State} from './model';

type Actions = {
  goBack$: Stream<any>;
};

export default function navigation(
  state$: Stream<State>,
  actions: Actions,
  confirmation$: Stream<boolean>,
) {
  return xs.merge(
    actions.goBack$.mapTo({type: 'pop'} as Command),

    confirmation$
      .filter(x => x === true)
      .compose(sample(state$))
      .map(state =>
        state.practiceMode
          ? ({type: 'popToRoot'} as Command)
          : ({type: 'setStackRoot', layout: centralLayout} as Command),
      ),
  );
}
