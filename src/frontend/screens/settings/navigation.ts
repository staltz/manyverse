// SPDX-FileCopyrightText: 2018-2023 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import sample from 'xstream-sample';
import delay from 'xstream/extra/delay';
import {Command, NavSource} from 'cycle-native-navigation';
import {navOptions as librariesNavOptions} from '~frontend/screens/libraries';
import {navOptions as backupScreenNavOptions} from '~frontend/screens/backup';
import {navOptions as storagesScreenNavOptions} from '~frontend/screens/storage';
import {navOptions as feedSettingsScreenNavOptions} from '~frontend/screens/feed-settings';
import {navOptions as aboutScreenNavOptions} from '~frontend/screens/about';
import {navOptions as thanksScreenNavOptions} from '~frontend/screens/thanks';
import {Screens} from '~frontend/screens/enums';
import {welcomeLayout} from '~frontend/screens/layouts';
import {State} from './model';

export interface Actions {
  forceReindex$: Stream<any>;
  deleteAccount$: Stream<any>;
  goBack$: Stream<any>;
  goToBackup$: Stream<any>;
  goToStorage$: Stream<any>;
  goToLibraries$: Stream<any>;
  goToAbout$: Stream<any>;
  goToThanks$: Stream<any>;
  goToFeedSettings$: Stream<any>;
}

export default function navigationCommands(
  actions: Actions,
  navSource: NavSource,
  state$: Stream<State>,
): Stream<Command> {
  const back$ = xs.merge(navSource.backPress(), actions.goBack$).mapTo({
    type: 'pop',
  } as Command);

  const toBackup$ = actions.goToBackup$.map(
    () =>
      ({
        type: 'push',
        layout: {
          component: {
            name: Screens.Backup,
            options: backupScreenNavOptions,
          },
        },
      } as Command),
  );

  const toStorage$ = actions.goToStorage$.compose(sample(state$)).map(
    (state) =>
      ({
        type: 'push',
        id: 'mainstack',
        layout: {
          component: {
            name: Screens.Storage,
            passProps: {
              selfFeedId: state.selfFeedId,
            },
            options: storagesScreenNavOptions,
          },
        },
      } as Command),
  );

  const toLibraries$ = actions.goToLibraries$.map(
    () =>
      ({
        type: 'push',
        layout: {
          component: {
            name: Screens.Libraries,
            options: librariesNavOptions,
          },
        },
      } as Command),
  );

  const toAbout$ = actions.goToAbout$.map(
    () =>
      ({
        type: 'push',
        layout: {
          component: {
            name: Screens.About,
            options: aboutScreenNavOptions,
          },
        },
      } as Command),
  );

  const toThanks$ = actions.goToThanks$.map(
    () =>
      ({
        type: 'push',
        layout: {
          component: {
            name: Screens.Thanks,
            options: thanksScreenNavOptions,
          },
        },
      } as Command),
  );

  const toRoot$ = actions.forceReindex$
    .compose(delay(800))
    .mapTo({type: 'popToRoot'} as Command);

  const toWelcome$ = actions.deleteAccount$
    .compose(delay(800))
    .mapTo({type: 'setStackRoot', layout: welcomeLayout} as Command);

  const toFeedSettings$ = actions.goToFeedSettings$.compose(sample(state$)).map(
    (state) =>
      ({
        type: 'push',
        layout: {
          component: {
            name: Screens.FeedSettings,
            options: feedSettingsScreenNavOptions,
            passProps: {selfFeedId: state.selfFeedId},
          },
        },
      } as Command),
  );

  return xs.merge(
    back$,
    toBackup$,
    toStorage$,
    toLibraries$,
    toAbout$,
    toThanks$,
    toRoot$,
    toWelcome$,
    toFeedSettings$,
  );
}
