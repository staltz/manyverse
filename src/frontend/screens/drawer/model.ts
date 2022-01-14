// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import {FeedId} from 'ssb-typescript';
import {Reducer} from '@cycle/state';
import {SSBSource} from '../../drivers/ssb';
import {GlobalEvent} from '../../drivers/eventbus';
import progressCalculation, {
  State as ProgressState,
  INITIAL_STATE as INITIAL_PROGRESS_STATE,
} from '../../components/progressCalculation';
import currentVersion from '../../versionName';

export interface State extends ProgressState {
  selfFeedId: FeedId;
  canPublishSSB: boolean;
  allowCheckingNewVersion: boolean;
  hasNewVersion: boolean;
  selfAvatarUrl?: string;
  name?: string;
}

interface Actions {
  latestVersionResponse$: Stream<string>;
}

export default function model(
  actions: Actions,
  ssbSource: SSBSource,
  globalEventBus: Stream<GlobalEvent>,
): Stream<Reducer<State>> {
  const selfFeedId$ = ssbSource.selfFeedId$.take(1);

  const selfFeedIdReducer$ = selfFeedId$.map(
    (selfFeedId: FeedId) =>
      function selfFeedIdReducer(prev: State): State {
        if (!prev) {
          return {
            selfFeedId,
            canPublishSSB: true,
            allowCheckingNewVersion: false,
            hasNewVersion: false,
            ...INITIAL_PROGRESS_STATE,
          };
        } else {
          return {...prev, selfFeedId};
        }
      },
  );

  const aboutReducer$ = selfFeedId$
    .map((selfFeedId) => ssbSource.profileAboutLive$(selfFeedId))
    .flatten()
    .map(
      (about) =>
        function aboutReducer(prev: State): State {
          let name;
          if (!!about.name && about.name !== about.id) {
            name = about.name;
          }
          if (!prev) {
            return {
              selfFeedId: about.id,
              selfAvatarUrl: about.imageUrl,
              name,
              canPublishSSB: true,
              allowCheckingNewVersion: false,
              hasNewVersion: false,
              ...INITIAL_PROGRESS_STATE,
            };
          } else {
            return {
              ...prev,
              selfAvatarUrl: about.imageUrl,
              name,
            };
          }
        },
    );

  const readSettingsReducer$ = ssbSource.readSettings().map(
    (settings) =>
      function readSettingsReducer(prev: State): State {
        return {
          ...prev,
          allowCheckingNewVersion: settings.allowCheckingNewVersion ?? false,
        };
      },
  );

  const allowCheckingNewVersionReducer$ = globalEventBus
    .filter((ev) => ev.type === 'approveCheckingNewVersion')
    .map(
      () =>
        function allowCheckingNewVersionReducer(prev: State): State {
          return {...prev, allowCheckingNewVersion: true};
        },
    );

  const hasNewVersionReducer$ = actions.latestVersionResponse$
    .map((latestVersion) => {
      const [majorPrev, minorPrev, restPrev] = currentVersion.split('.');
      const [majorNext, minorNext, restNext] = latestVersion.split('.');
      const [patchPrev, tagPrev] = restPrev.split('-beta');
      const [patchNext, tagNext] = restNext.split('-beta');
      if (parseInt(majorNext, 10) > parseInt(majorPrev, 10)) return true;
      if (parseInt(minorNext, 10) > parseInt(minorPrev, 10)) return true;
      if (parseInt(patchNext, 10) > parseInt(patchPrev, 10)) return true;
      if (tagNext > tagPrev) return true;
      return false;
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

  return xs.merge(
    selfFeedIdReducer$,
    aboutReducer$,
    progressReducer$,
    readSettingsReducer$,
    allowCheckingNewVersionReducer$,
    hasNewVersionReducer$,
  );
}
