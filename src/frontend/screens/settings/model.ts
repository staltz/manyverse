// SPDX-FileCopyrightText: 2020-2023 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import concat from 'xstream/extra/concat';
import {AsyncStorageSource} from 'cycle-native-asyncstorage';
import {FeedId} from 'ssb-typescript';
import {SSBSource} from '~frontend/drivers/ssb';
import {Props} from './props';

type UnwrapArray<T> = T extends Array<infer X> ? X : never;

export const hopsOptions = [
  '1' as const,
  '2' as const,
  '3' as const,
  '4' as const,
  'unlimited' as const,
];

export type HopsOption = UnwrapArray<typeof hopsOptions>;

const DEFAULT_HOPS: HopsOption = '2';

export interface State {
  selfFeedId: FeedId;
  initialHops: number;
  showFollows: boolean;
  enableDetailedLogs: boolean;
  enableFirewall: boolean;
  allowCrashReports: boolean;
  allowCheckingNewVersion: boolean | null;
}

interface Actions {
  toggleFollowEvents$: Stream<boolean>;
  toggleDetailedLogs$: Stream<boolean>;
  toggleEnableFirewall$: Stream<boolean>;
  toggleAllowCrashReports$: Stream<boolean>;
  toggleAllowCheckingNewVersion$: Stream<boolean>;
}

function hopsToOpt(hops?: number): HopsOption {
  if (typeof hops !== 'number') return DEFAULT_HOPS;
  if (hops >= 999) return 'unlimited';
  if (hops === 1) return '1';
  if (hops === 2) return '2';
  if (hops === 3) return '3';
  if (hops === 4) return '4';
  return DEFAULT_HOPS;
}

export default function model(
  props$: Stream<Props>,
  actions: Actions,
  ssbSource: SSBSource,
  asyncStorageSource: AsyncStorageSource,
) {
  const propsReducer$ = props$.take(1).map(
    (props) =>
      function propsReducer(): State {
        return {
          selfFeedId: props.selfFeedId,
          showFollows: true,
          enableDetailedLogs: false,
          initialHops: hopsOptions.indexOf(DEFAULT_HOPS),
          enableFirewall: true,
          allowCrashReports: false,
          allowCheckingNewVersion: null,
        };
      },
  );

  const initialAllowCheckingNewVersionReducer$ = asyncStorageSource
    .getItem('allowCheckingNewVersion')
    .map(
      (value) =>
        function initialAllowCheckingNewVersionReducer(prev: State): State {
          const parsed = value && JSON.parse(value);
          return {
            ...prev,
            allowCheckingNewVersion:
              typeof parsed === 'boolean' ? parsed : null,
          };
        },
    );

  const readSettingsReducer$ = ssbSource.readSettings().map(
    (settings) =>
      function readSettingsReducer(prev: State): State {
        return {
          ...prev,
          showFollows: settings.showFollows ?? prev.showFollows,
          initialHops: hopsOptions.indexOf(hopsToOpt(settings.hops)),
          enableDetailedLogs: settings.detailedLogs ?? prev.enableDetailedLogs,
          enableFirewall: settings.enableFirewall ?? prev.enableFirewall,
          allowCrashReports:
            settings.allowCrashReports ?? prev.allowCrashReports,
        };
      },
  );

  const toggleFollowEventsReducer$ = actions.toggleFollowEvents$.map(
    (showFollows) =>
      function toggleFollowEventsReducer(prev: State): State {
        return {...prev, showFollows};
      },
  );

  const toggleDetailedLogsReducer$ = actions.toggleDetailedLogs$.map(
    (enableDetailedLogs) =>
      function toggleDetailedLogsReducer(prev: State): State {
        return {...prev, enableDetailedLogs};
      },
  );

  const toggleEnableFirewallReducer$ = actions.toggleEnableFirewall$.map(
    (enableFirewall) =>
      function toggleEnableFirewallReducer(prev: State): State {
        return {...prev, enableFirewall};
      },
  );

  const toggleCheckingNewVersionReducer$ =
    actions.toggleAllowCheckingNewVersion$.map(
      (checkNewVersion) =>
        function toggleCheckingNewVersionReducer(prev: State): State {
          return {...prev, allowCheckingNewVersion: checkNewVersion};
        },
    );

  const toggleCrashReportsReducer$ = actions.toggleAllowCrashReports$.map(
    (allowCrashReports) =>
      function toggleCrashReportsReducer(prev: State): State {
        return {...prev, allowCrashReports};
      },
  );

  return concat(
    propsReducer$,
    xs.merge(
      initialAllowCheckingNewVersionReducer$,
      readSettingsReducer$,
      toggleFollowEventsReducer$,
      toggleDetailedLogsReducer$,
      toggleEnableFirewallReducer$,
      toggleCrashReportsReducer$,
      toggleCheckingNewVersionReducer$,
    ),
  );
}
