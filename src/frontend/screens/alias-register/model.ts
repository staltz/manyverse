// SPDX-FileCopyrightText: 2021-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import concat from 'xstream/extra/concat';
import {SSBSource} from '~frontend/drivers/ssb';
import {PeerKV} from '~frontend/ssb/types';
import {Props} from './props';

interface Actions {
  registerAlias$: Stream<{roomId: string; alias: string}>;
  tryAgain$: Stream<any>;
}

export interface State {
  uiState: 'initial' | 'submitting' | 'error' | 'success';
  servers: Array<PeerKV>;
  registeredAliasURL?: string;
  error?: string;
}

export function model(
  props$: Stream<Props>,
  actions: Actions,
  ssbSource: SSBSource,
) {
  const propsReducer$ = props$.take(1).map(
    (props) =>
      function propsReducer(): State {
        return {
          uiState: 'initial',
          servers: props.servers,
        };
      },
  );

  const updateConnectionReducer$ = ssbSource.peers$.map(
    (peers) =>
      function updateConnectionReducer(prev: State): State {
        const updatedServers = prev.servers.map(([addr, data]) => {
          const peer = peers.find(([a, _d]) => a === addr);
          const updatedData =
            peer && peer[1]?.state !== data.state
              ? {...data, state: peer[1].state}
              : data;
          return [addr, updatedData] as PeerKV;
        });
        return {
          ...prev,
          servers: updatedServers,
        };
      },
  );

  const submitReducer$ = actions.registerAlias$.map(
    () =>
      function submitReducer(prev: State): State {
        return {
          ...prev,
          uiState: 'submitting',
        };
      },
  );

  const successfulResponseReducer$ = actions.registerAlias$
    .map(({roomId, alias}) => ssbSource.registerAlias$(roomId, alias))
    .flatten()
    .map(
      (url) =>
        function successfulResponseReducer(prev: State): State {
          return {
            ...prev,
            uiState: 'success',
            registeredAliasURL: url,
          };
        },
    );

  const responseReducer$ = successfulResponseReducer$.replaceError((err) =>
    successfulResponseReducer$.startWith(function failedResponseReducer(
      prev: State,
    ): State {
      return {
        ...prev,
        uiState: 'error',
        error: err.message ?? err ?? 'Unknown error',
      };
    }),
  );

  const tryAgainReducer$ = actions.tryAgain$.map(
    () =>
      function tryAgainReducer(prev: State): State {
        return {
          ...prev,
          uiState: 'initial',
        };
      },
  );

  return concat(
    propsReducer$,
    xs.merge(
      updateConnectionReducer$,
      submitReducer$,
      responseReducer$,
      tryAgainReducer$,
    ),
  );
}
