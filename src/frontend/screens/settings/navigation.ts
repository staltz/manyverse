/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import {Command, NavSource} from 'cycle-native-navigation';
import {navOptions as dialogAboutNavOptions} from '../dialog-about';
import {navOptions as dialogThanksNavOptions} from '../dialog-thanks';
import {navOptions as backupScreenNavOptions} from '../backup';
import {Screens} from '../..';

export type Actions = {
  goToBackup$: Stream<any>;
  goToAbout$: Stream<any>;
  goToThanks$: Stream<any>;
};

export default function navigationCommands(
  actions: Actions,
  navSource: NavSource,
  topBarBack$: Stream<any>,
): Stream<Command> {
  const back$ = xs.merge(navSource.backPress(), topBarBack$).mapTo({
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

  const toAbout$ = actions.goToAbout$.mapTo({
    type: 'showModal',
    layout: {
      component: {
        name: Screens.DialogAbout,
        options: dialogAboutNavOptions,
      },
    },
  } as Command);

  const toThanks$ = actions.goToThanks$.mapTo({
    type: 'showModal',
    layout: {
      component: {
        name: Screens.DialogThanks,
        options: dialogThanksNavOptions,
      },
    },
  } as Command);

  return xs.merge(back$, toBackup$, toAbout$, toThanks$);
}
