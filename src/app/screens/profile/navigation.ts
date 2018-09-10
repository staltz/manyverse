/**
 * Manyverse is a mobile app for Secure Scuttlebutt networks
 *
 * Copyright (C) 2017 Andre 'Staltz' Medeiros
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import xs, {Stream} from 'xstream';
import sample from 'xstream-sample';
import sampleCombine from 'xstream/extra/sampleCombine';
import {Command, NavSource, PopCommand} from 'cycle-native-navigation';
import {navOptions as composeScreenNavOptions} from '../compose';
import {navOptions as editProfileScreenNavOptions} from '../profile-edit';
import {navOptions as threadScreenNavOptions} from '../thread';
import {MsgId} from 'ssb-typescript';
import {Screens} from '../..';
import {State} from './model';

export type Actions = {
  goToCompose$: Stream<null>;
  goToEdit$: Stream<null>;
  goToThread$: Stream<{rootMsgId: MsgId; replyToMsgId?: MsgId}>;
};

export default function navigation(
  actions: Actions,
  navSource: NavSource,
  state$: Stream<State>,
  back$: Stream<any>,
): Stream<Command> {
  const toCompose$ = actions.goToCompose$.map(
    () =>
      ({
        type: 'showOverlay',
        layout: {
          component: {
            name: Screens.Compose,
            options: composeScreenNavOptions,
          },
        },
      } as Command),
  );

  const toEdit$ = actions.goToEdit$.compose(sample(state$)).map(
    state =>
      ({
        type: 'push',
        layout: {
          component: {
            name: Screens.ProfileEdit,
            passProps: {
              about: state.about,
            },
            options: editProfileScreenNavOptions,
          },
        },
      } as Command),
  );

  const toThread$ = actions.goToThread$.compose(sampleCombine(state$)).map(
    ([ev, state]) =>
      ({
        type: 'push',
        layout: {
          component: {
            name: Screens.Thread,
            passProps: {
              selfFeedId: state.selfFeedId,
              rootMsgId: ev.rootMsgId,
              replyToMsgId: ev.replyToMsgId,
            },
            options: threadScreenNavOptions,
          },
        },
      } as Command),
  );

  const pop$ = xs.merge(navSource.backPress(), back$).mapTo(
    {
      type: 'pop',
    } as PopCommand,
  );

  return xs.merge(toCompose$, toEdit$, toThread$, pop$);
}
