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
import sampleCombine from 'xstream/extra/sampleCombine';
import {FeedId} from 'ssb-typescript';
import {Command} from 'cycle-native-navigation';
import {Screens} from '../../..';
import {navOptions as profileScreenNavOptions} from '../../profile';
import {navOptions as pasteInviteScreenNavOptions} from '../../invite-paste';
import {navOptions as createInviteScreenNavOptions} from '../../invite-create';
import {State} from './model';

export type Actions = {
  goToPeerProfile$: Stream<FeedId>;
  goToPasteInvite$: Stream<any>;
  goToCreateInvite$: Stream<any>;
};

export default function navigation(
  actions: Actions,
  state$: Stream<State>,
): Stream<Command> {
  const toProfile$ = actions.goToPeerProfile$
    .compose(sampleCombine(state$))
    .map(
      ([feedId, state]) =>
        ({
          type: 'push',
          layout: {
            component: {
              name: Screens.Profile,
              passProps: {
                selfFeedId: state.selfFeedId,
                feedId,
              },
              options: profileScreenNavOptions,
            },
          },
        } as Command),
    );

  const toPasteInvite$ = actions.goToPasteInvite$.map(
    () =>
      ({
        type: 'showOverlay',
        layout: {
          component: {
            name: Screens.InvitePaste,
            options: pasteInviteScreenNavOptions,
          },
        },
      } as Command),
  );

  const toCreateInvite$ = actions.goToCreateInvite$.map(
    () =>
      ({
        type: 'showOverlay',
        layout: {
          component: {
            name: Screens.InviteCreate,
            options: createInviteScreenNavOptions,
          },
        },
      } as Command),
  );

  return xs.merge(toProfile$, toPasteInvite$, toCreateInvite$);
}
