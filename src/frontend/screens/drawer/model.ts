// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import concat from 'xstream/extra/concat';
import {Reducer} from '@cycle/state';
import {FeedId} from 'ssb-typescript';
import {SSBSource} from '~frontend/drivers/ssb';
import {GlobalEvent} from '~frontend/drivers/eventbus';
import currentVersion from '~frontend/versionName';

interface ParsedVersion {
  major: number;
  minor: number;
  patch: number;
  tag?: string;
  isBeta: boolean;
}

export interface State {
  selfFeedId: FeedId;
  canPublishSSB: boolean;
  allowCheckingNewVersion: boolean;
  hasNewVersion: boolean;
  selfAvatarUrl?: string;
  name?: string;
}

const INITIAL_STATE: State = {
  selfFeedId: '',
  canPublishSSB: true,
  allowCheckingNewVersion: false,
  hasNewVersion: false,
};

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
          return {...INITIAL_STATE, selfFeedId};
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
          return {
            ...prev,
            selfAvatarUrl: about.imageUrl,
            name,
          };
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

  return concat(
    selfFeedIdReducer$,
    xs.merge(
      aboutReducer$,
      readSettingsReducer$,
      allowCheckingNewVersionReducer$,
      hasNewVersionReducer$,
    ),
  );
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
