/* Copyright (C) 2018-2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import sample from 'xstream-sample';
import {Command} from 'cycle-native-navigation';
import {Screens} from '../enums';
import {navOptions as registerAliasNavOpts} from '../register-alias/layout';
import {Props as RegisterAliasProps} from '../register-alias/props';
import {State} from './model';

export interface NavigationActions {
  save$: Stream<any>;
  discardChanges$: Stream<any>;
  registerAlias$: Stream<any>;
}

export default function navigation(
  actions: NavigationActions,
  state$: Stream<State>,
): Stream<Command> {
  const goBackDiscarding$ = actions.discardChanges$.map(
    () => ({type: 'pop'} as Command),
  );

  const goBackSaving$ = actions.save$.map(() => ({type: 'pop'} as Command));

  const goToRegisterAlias$ = actions.registerAlias$
    .compose(sample(state$))
    .filter((state) => !!state.aliasServers)
    .map(
      (state) =>
        ({
          type: 'push',
          layout: {
            component: {
              name: Screens.RegisterAlias,
              passProps: {
                servers: state.aliasServers!,
              } as RegisterAliasProps,
              options: registerAliasNavOpts,
            },
          },
        } as Command),
    );

  return xs.merge(goBackDiscarding$, goBackSaving$, goToRegisterAlias$);
}
