/* Copyright (C) 2018-2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import {Reducer} from '@cycle/state';
import {About, FeedId} from 'ssb-typescript';
import {Image} from 'react-native-image-crop-picker';
import {SSBSource} from '../../drivers/ssb';
import {Alias, PeerKV} from '../../ssb/types';
import {Props} from './props';

export type State = {
  about: About & {id: FeedId};
  aliases: Array<Alias>;
  newName?: string;
  newAvatar?: string;
  newDescription?: string;
  aliasServers?: Array<PeerKV>;
};

export type Actions = {
  changeName$: Stream<string>;
  changeAvatar$: Stream<Image>;
  changeDescription$: Stream<string>;
};

export default function model(
  props$: Stream<Props>,
  actions: Actions,
  ssbSource: SSBSource,
): Stream<Reducer<State>> {
  const propsReducer$ = props$.map(
    (props) =>
      function propsReducer(): State {
        return {
          about: props.about,
          aliases: props.aliases,
        };
      },
  );

  const loadAliasServersReducer$ = ssbSource.aliasRegistrationRooms$().map(
    (aliasServers) =>
      function loadAliasServersReducer(prev: State): State {
        return {...prev, aliasServers};
      },
  );

  const updateAliasesReducer$ = props$
    .map((props) => ssbSource.getAliasesLive$(props.about.id))
    .flatten()
    .map(
      (aliases) =>
        function updateAliasesReducer(prev: State): State {
          return {...prev, aliases};
        },
    );

  const changeNameReducer$ = actions.changeName$.map(
    (newName) =>
      function changeNameReducer(prev: State): State {
        return {...prev, newName};
      },
  );

  const changeAvatarReducer$ = actions.changeAvatar$.map(
    (image) =>
      function changeAvatarReducer(prev: State): State {
        return {...prev, newAvatar: image.path.replace('file://', '')};
      },
  );

  const changeDescriptionReducer$ = actions.changeDescription$.map(
    (newDescription) =>
      function changeDescriptionReducer(prev: State): State {
        return {...prev, newDescription};
      },
  );

  return xs.merge(
    propsReducer$,
    loadAliasServersReducer$,
    updateAliasesReducer$,
    changeNameReducer$,
    changeAvatarReducer$,
    changeDescriptionReducer$,
  );
}
