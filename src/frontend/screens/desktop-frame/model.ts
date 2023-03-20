// SPDX-FileCopyrightText: 2021-2023 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import concat from 'xstream/extra/concat';
import {FeedId} from 'ssb-typescript';
import {Reducer} from '@cycle/state';
import {NavSource} from 'cycle-native-navigation';
import {AsyncStorageSource} from 'cycle-native-asyncstorage';
import {SSBSource} from '~frontend/drivers/ssb';
import {
  CentralUpdateActivity,
  CentralUpdateConnections,
  CentralUpdatePrivate,
  CentralUpdatePublic,
  CheckingNewVersion,
  GlobalEvent,
} from '~frontend/drivers/eventbus';
import {PeerKV, StagedPeerKV} from '~frontend/ssb/types';
import progressCalculation, {
  State as ProgressState,
  INITIAL_STATE as INITIAL_PROGRESS_STATE,
} from '~frontend/components/progressCalculation';
import currentVersion from '~frontend/versionName';
import {Screens} from '~frontend/screens/enums';

interface ParsedVersion {
  major: number;
  minor: number;
  patch: number;
  tag?: string;
  isBeta: boolean;
}

export interface State extends ProgressState {
  selfFeedId: FeedId;
  selfAvatarUrl?: string;
  name?: string;
  currentTab: 'public' | 'private' | 'activity' | 'connections';
  connections?: {
    status: 'offline' | 'bad' | 'fair' | 'good';
    peers: Array<PeerKV>;
    rooms: Array<PeerKV>;
    stagedPeers: Array<StagedPeerKV>;
    initializedSSB: boolean;
  };
  showButtons: boolean;
  numOfPublicUpdates: number;
  numOfPrivateUpdates: number;
  numOfActivityUpdates: number;
  allowCheckingNewVersion: boolean | null;
  hasNewVersion: boolean;
}

const INITIAL_STATE: State = {
  selfFeedId: '',
  currentTab: 'public',
  numOfPublicUpdates: 0,
  numOfPrivateUpdates: 0,
  numOfActivityUpdates: 0,
  allowCheckingNewVersion: null,
  hasNewVersion: false,
  showButtons: false,
  ...INITIAL_PROGRESS_STATE,
};

interface Actions {
  changeTab$: Stream<State['currentTab']>;
  latestVersionResponse$: Stream<string>;
}

export default function model(
  actions: Actions,
  navSource: NavSource,
  globalEventBus: Stream<GlobalEvent>,
  ssbSource: SSBSource,
  state$: Stream<State>,
  asyncStorageSource: AsyncStorageSource,
) {
  const centralUpdatePublic$ = globalEventBus.filter(
    (ev) => ev.type === 'centralScreenUpdate' && ev.subtype === 'publicUpdates',
  ) as Stream<CentralUpdatePublic>;

  const centralUpdatePrivate$ = globalEventBus.filter(
    (ev) =>
      ev.type === 'centralScreenUpdate' && ev.subtype === 'privateUpdates',
  ) as Stream<CentralUpdatePrivate>;

  const centralUpdateActivity$ = globalEventBus.filter(
    (ev) =>
      ev.type === 'centralScreenUpdate' && ev.subtype === 'activityUpdates',
  ) as Stream<CentralUpdateActivity>;

  const centralUpdateConnections$ = globalEventBus.filter(
    (ev) => ev.type === 'centralScreenUpdate' && ev.subtype === 'connections',
  ) as Stream<CentralUpdateConnections>;

  const updateShowButtonsReducer$ = xs.of(
    function updateShowButtonsReducer(): State {
      return {...INITIAL_STATE, showButtons: true};
    },
  );

  const selfFeedIdReducer$ = ssbSource.selfFeedId$
    .map((selfFeedId) =>
      selfFeedId
        ? xs.of(function selfFeedIdReducer(prev: State): State {
            return {...prev, selfFeedId};
          })
        : xs.empty(),
    )
    .flatten()
    .take(1);

  const aboutReducer$ = state$
    .filter((state) => !!state.selfFeedId)
    .take(1)
    .map((state) => ssbSource.profileAboutLive$(state.selfFeedId))
    .flatten()
    .map(
      (about) =>
        function aboutReducer(prev: State): State {
          let name;
          if (!!about.name && about.name !== about.id) {
            name = about.name;
          }
          return {
            ...prev,
            selfAvatarUrl: about.imageUrl,
            name,
          };
        },
    );

  const changeTabReducer$ = actions.changeTab$.map(
    (nextTab) =>
      function changeTabReducer(prev: State): State {
        return {...prev, currentTab: nextTab};
      },
  );

  const updatePublicCounterReducer$ = centralUpdatePublic$.map(
    ({counter}) =>
      function updatePublicCounterReducer(prev: State): State {
        if (!prev) return prev;
        if (counter !== prev.numOfPublicUpdates) {
          return {...prev, numOfPublicUpdates: counter};
        } else {
          return prev;
        }
      },
  );

  const updatePrivateCounterReducer$ = centralUpdatePrivate$.map(
    ({counter}) =>
      function updatePrivateCounterReducer(prev: State): State {
        if (!prev) return prev;
        if (counter !== prev.numOfPrivateUpdates) {
          return {...prev, numOfPrivateUpdates: counter};
        } else {
          return prev;
        }
      },
  );

  const updateActivityCounterReducer$ = centralUpdateActivity$.map(
    ({counter}) =>
      function updateActivityCounterReducer(prev: State): State {
        if (!prev) return prev;
        if (counter !== prev.numOfActivityUpdates) {
          return {...prev, numOfActivityUpdates: counter};
        } else {
          return prev;
        }
      },
  );

  const updateConnectionsReducer$ = centralUpdateConnections$.map(
    (ev) =>
      function updateConnectionsReducer(prev: State): State {
        if (!prev) return prev;
        const prevConnections = prev.connections;
        const nextConnections = ev.substate;
        if (!prevConnections || nextConnections !== prevConnections) {
          return {
            ...prev,
            connections: nextConnections,
          };
        } else {
          return prev;
        }
      },
  );

  const allowCheckingNewVersionReducer$ = xs.merge(
    asyncStorageSource.getItem('allowCheckingNewVersion').map(
      (value) =>
        function initialAllowCheckingNewVersionReducer(prev: State): State {
          const parsed = value && JSON.parse(value);
          return {
            ...prev,
            allowCheckingNewVersion:
              typeof parsed === 'boolean' ? parsed : null,
          };
        },
    ),
    globalEventBus
      .filter(
        (ev): ev is CheckingNewVersion => ev.type === 'checkingNewVersion',
      )
      .map(
        (event) =>
          function allowCheckingNewVersionReducer(prev: State): State {
            return {...prev, allowCheckingNewVersion: event.enabled};
          },
      ),
  );

  const hasNewVersionReducer$ = actions.latestVersionResponse$
    .map((latestVersion) => {
      // `tagPrev` and `tagNext` can be undefined, which is not reflected in the inferred type here
      const [majorPrev, minorPrev, patchAndChannelPrev, tagPrev] =
        currentVersion.split('.');
      const [majorNext, minorNext, patchAndChannelNext, tagNext] =
        latestVersion.split('.');

      const [patchPrev] = patchAndChannelPrev.split('-beta');
      const [patchNext] = patchAndChannelNext.split('-beta');

      return (
        compareParsedVersions(
          {
            major: getInt(majorPrev),
            minor: getInt(minorPrev),
            patch: getInt(patchPrev),
            tag: tagPrev,
            isBeta: currentVersion.includes('beta'),
          },
          {
            major: getInt(majorNext),
            minor: getInt(minorNext),
            patch: getInt(patchNext),
            tag: tagNext,
            isBeta: latestVersion.includes('beta'),
          },
        ) === 1
      );
    })
    .map(
      (hasNewVersion) =>
        function hasNewVersionReducer(prev: State): State {
          return {...prev, hasNewVersion};
        },
    );

  const progressReducer$ = progressCalculation(ssbSource) as Stream<
    Reducer<State>
  >;

  return navSource
    .globalDidAppear(Screens.Central)
    .map(() => {
      return concat(
        updateShowButtonsReducer$,
        selfFeedIdReducer$,
        xs.merge(
          aboutReducer$,
          changeTabReducer$,
          updatePublicCounterReducer$,
          updatePrivateCounterReducer$,
          updateActivityCounterReducer$,
          updateConnectionsReducer$,
          allowCheckingNewVersionReducer$,
          hasNewVersionReducer$,
          progressReducer$,
        ),
      );
    })
    .flatten();
}

function getInt(s: string) {
  return parseInt(s, 10);
}

function compareParsedVersions(prev: ParsedVersion, next: ParsedVersion) {
  if (prev.major < next.major) return 1;
  if (prev.major > next.major) return -1;
  if (prev.minor < next.minor) return 1;
  if (prev.minor > next.minor) return -1;
  if (prev.patch < next.patch) return 1;
  if (prev.patch > next.patch) return -1;

  if (!!prev.tag && !!next.tag) {
    if (next.tag > prev.tag) return 1;
    if (next.tag < prev.tag) return -1;
  }

  if (next.tag && !prev.tag) return 1;
  if (!next.tag && prev.tag) return -1;

  // At this point we know that the version numbers and tag are exactly the same
  if (prev.isBeta && next.isBeta) return -1;
  if (!prev.isBeta && next.isBeta) return -1;
  if (prev.isBeta && !next.isBeta) return 1;

  return 0;
}
