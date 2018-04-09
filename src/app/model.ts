/**
 * MMMMM is a mobile app for Secure Scuttlebutt networks
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
import {Reducer} from 'cycle-onionify';
import {Command, PushCommand} from 'cycle-native-navigation';
import {
  State as CentralState,
  initState as initCentralState,
} from './screens/central/model';
import {
  State as ProfileState,
  initState as initProfileState,
  updateSelfFeedId,
  updateDisplayFeedId,
} from './screens/profile/model';
import {
  State as ThreadState,
  initState as initThreadState,
  updateRootMsgId,
} from './screens/thread/model';
import {ScreenID} from './index';
import {SSBSource} from './drivers/ssb';
import {FeedId} from 'ssb-typescript';
import {Lens} from 'cycle-onionify/lib/types';

export type State = {
  selfFeedId: FeedId;
  central: CentralState;
  profile: ProfileState;
  thread: ThreadState;
};

function isPushCommand(c: Command): c is PushCommand {
  return c.type === 'push';
}

export const centralLens: Lens<State, CentralState> = {
  get: (parent: State): CentralState => {
    if (parent.central.selfFeedId !== parent.selfFeedId) {
      return {...parent.central, selfFeedId: parent.selfFeedId};
    } else {
      return parent.central;
    }
  },

  set: (parent: State, child: CentralState): State => {
    return {...parent, central: child};
  },
};

export const profileLens: Lens<State, ProfileState> = {
  get: (parent: State): ProfileState => {
    if (parent.profile.selfFeedId !== parent.selfFeedId) {
      return updateSelfFeedId(parent.profile, parent.selfFeedId);
    } else {
      return parent.profile;
    }
  },

  set: (parent: State, child: ProfileState): State => {
    return {...parent, profile: child};
  },
};

export const threadLens: Lens<State, ThreadState> = {
  get: (parent: State): ThreadState => {
    if (parent.thread.selfFeedId !== parent.selfFeedId) {
      return {...parent.thread, selfFeedId: parent.selfFeedId};
    } else {
      return parent.thread;
    }
  },

  set: (parent: State, child: ThreadState): State => {
    return {...parent, thread: child};
  },
};

export default function model(
  navCommand$: Stream<Command>,
  ssbSource: SSBSource,
): Stream<Reducer<State>> {
  const initReducer$ = xs.of(function initReducer(prev: State): State {
    if (prev) {
      return prev;
    } else {
      const selfFeedId = '';
      return {
        selfFeedId,
        central: initCentralState(selfFeedId),
        profile: initProfileState(selfFeedId),
        thread: initThreadState(selfFeedId),
      };
    }
  });

  const setProfileDisplayFeedId$ = navCommand$
    .filter(isPushCommand)
    .filter(command => (command.screen as ScreenID) === 'mmmmm.Profile')
    .map(
      command =>
        function setProfileDisplayFeedId(prev?: State): State {
          if (!prev || !prev.profile) {
            throw new Error('app/model reducer expects existing state');
          }
          if (command.passProps && command.passProps.feedId) {
            return {
              ...prev,
              profile: updateDisplayFeedId(
                prev.profile,
                command.passProps.feedId,
              ),
            };
          } else {
            return {
              ...prev,
              profile: updateDisplayFeedId(
                prev.profile,
                prev.profile.selfFeedId,
              ),
            };
          }
        },
    );

  const setThreadData$ = navCommand$
    .filter(isPushCommand)
    .filter(command => (command.screen as ScreenID) === 'mmmmm.Thread')
    .map(
      command =>
        function setThreadData(prev?: State): State {
          if (!prev || !prev.thread) {
            throw new Error('app/model reducer expects existing state');
          }
          if (command.passProps && command.passProps.rootMsgId) {
            return {
              ...prev,
              thread: updateRootMsgId(prev.thread, command.passProps.rootMsgId),
            };
          } else {
            return prev;
          }
        },
    );

  const setSelfFeedId$ = ssbSource.selfFeedId$.map(
    selfFeedId =>
      function setSelfFeedId(prev?: State): State {
        if (!prev) {
          throw new Error('app/model reducer expects existing state');
        }
        return {
          ...prev,
          selfFeedId,
          central: {...prev.central, selfFeedId},
          profile: updateSelfFeedId(prev.profile, selfFeedId),
        };
      },
  );

  return xs.merge(
    initReducer$,
    setProfileDisplayFeedId$,
    setThreadData$,
    setSelfFeedId$,
  );
}
