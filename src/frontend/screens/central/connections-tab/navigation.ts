// SPDX-FileCopyrightText: 2021-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import sample from 'xstream-sample';
import {Command} from 'cycle-native-navigation';
import {t} from '~frontend/drivers/localization';
import {Screens} from '~frontend/screens/enums';
import {navOptions as connectionsScreenNavOpts} from '~frontend/screens/connections-panel/layout';
import {Props as ConnPanelProps} from '~frontend/screens/connections-panel/props';
import {navOptions as invitePasteNavOpts} from '~frontend/screens/invite-paste';
import {navOptions as instructionsNavOpts} from '~frontend/screens/instructions/layout';
import {makeInstructionsProps as makeFollowStagedManuallyInstructionsProps} from './instructions/follow-staged-manually';
import {Props as InstructionsProps} from '~frontend/screens/instructions/props';
import {State} from './model';

export interface Actions {
  goToConnectionsPanel$: Stream<any>;
  goToConsumeInviteDialog$: Stream<any>;
  goToPasteInvite$: Stream<any>;
  goToFollowStagedManuallyDialog$: Stream<any>;
  goToHostSsbRoomDialog$: Stream<any>;
}

export default function navigation(
  actions: Actions,
  state$: Stream<State>,
): Stream<Command> {
  const toConnectionsPanel$ = actions.goToConnectionsPanel$
    .compose(sample(state$))
    .map(
      (state) =>
        ({
          type: 'push',
          layout: {
            component: {
              name: Screens.ConnectionsPanel,
              passProps: {
                selfFeedId: state.selfFeedId,
                selfAvatarUrl: state.selfAvatarUrl,
                peers: state.peers,
                rooms: state.rooms,
                stagedPeers: state.stagedPeers,
              } as ConnPanelProps,
              options: connectionsScreenNavOpts,
            },
          },
        } as Command),
    );

  const toPasteInvite$ = actions.goToPasteInvite$.map(
    () =>
      ({
        type: 'push',
        layout: {
          component: {
            name: Screens.InvitePaste,
            options: invitePasteNavOpts,
          },
        },
      } as Command),
  );

  const toConsumeInviteInstructions$ = actions.goToConsumeInviteDialog$.map(
    () =>
      ({
        type: 'push',
        layout: {
          component: {
            name: Screens.Instructions,
            passProps: {
              title: t('connections.recommendations.consume_invite'),
              content1: t(
                'connections.recommendation_descriptions.consume_invite',
              ),
            } as InstructionsProps,
            options: instructionsNavOpts,
          },
        },
      } as Command),
  );

  const toFollowStagedManuallyInstructions$ =
    actions.goToFollowStagedManuallyDialog$
      .compose(sample(state$))
      .map((state) =>
        xs.of(
          {
            type: 'push',
            layout: {
              component: {
                name: Screens.ConnectionsPanel,
                passProps: {
                  selfFeedId: state.selfFeedId,
                  selfAvatarUrl: state.selfAvatarUrl,
                  peers: state.peers,
                  rooms: state.rooms,
                  stagedPeers: state.stagedPeers,
                } as ConnPanelProps,
                options: connectionsScreenNavOpts,
              },
            },
          } as Command,

          {
            type: 'push',
            layout: {
              component: {
                name: Screens.Instructions,
                passProps: makeFollowStagedManuallyInstructionsProps(state),
                options: instructionsNavOpts,
              },
            },
          } as Command,
        ),
      )
      .flatten();

  return xs.merge(
    toConnectionsPanel$,
    toPasteInvite$,
    toConsumeInviteInstructions$,
    toFollowStagedManuallyInstructions$,
  );
}
