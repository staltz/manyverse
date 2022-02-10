// SPDX-FileCopyrightText: 2021-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import sample from 'xstream-sample';
import {Command, PushCommand, StackElement} from 'cycle-native-navigation';
import {navOptions as profileScreenNavOptions} from '~frontend/screens/profile';
import {Props as ProfileProps} from '~frontend/screens/profile/props';
import {navOptions as rawDatabaseScreenNavOptions} from '~frontend/screens/raw-db';
import {navOptions as settingsScreenNavOptions} from '~frontend/screens/settings';
import {Screens} from '~frontend/screens/enums';
import {State} from './model';

interface Actions {
  goToSelfProfile$: Stream<any>;
  showRawDatabase$: Stream<any>;
  goToSettings$: Stream<any>;
  changeTab$: Stream<any>;
}

export default function navigation(
  actions: Actions,
  state$: Stream<State>,
  navStack$: Stream<Array<StackElement>>,
): Stream<Command> {
  const stateAndStack$ = xs.combine(state$, navStack$);

  const toSelfProfile$ = actions.goToSelfProfile$
    .compose(sample(stateAndStack$))
    .filter(([state, stack]) => {
      const currentScreen = stack[stack.length - 1];
      if (
        currentScreen.name === Screens.Profile &&
        (currentScreen.passProps as ProfileProps).feedId === state.selfFeedId
      ) {
        return false;
      } else {
        return true;
      }
    })
    .map(
      ([state]) =>
        ({
          type: 'push',
          id: 'mainstack',
          layout: {
            component: {
              name: Screens.Profile,
              passProps: {
                selfFeedId: state.selfFeedId,
                selfAvatarUrl: state.selfAvatarUrl,
                feedId: state.selfFeedId,
              } as ProfileProps,
              options: profileScreenNavOptions,
            },
          },
        } as PushCommand),
    );

  const toRawDatabase$ = actions.showRawDatabase$
    .compose(sample(navStack$))
    .filter((stack) => stack[stack.length - 1].name !== Screens.RawDatabase)
    .map(
      () =>
        ({
          type: 'push',
          id: 'mainstack',
          layout: {
            component: {
              name: Screens.RawDatabase,
              options: rawDatabaseScreenNavOptions,
            },
          },
        } as PushCommand),
    );

  const toSettings$ = actions.goToSettings$
    .compose(sample(navStack$))
    .filter((stack) => stack[stack.length - 1].name !== Screens.Settings)
    .map(
      () =>
        ({
          type: 'push',
          id: 'mainstack',
          layout: {
            component: {
              name: Screens.Settings,
              options: settingsScreenNavOptions,
            },
          },
        } as PushCommand),
    );

  const popToRoot$ = actions.changeTab$.map(
    () => ({type: 'popToRoot'} as Command),
  );

  return xs.merge(toSelfProfile$, toRawDatabase$, toSettings$, popToRoot$);
}
