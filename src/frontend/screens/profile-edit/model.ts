// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import {Reducer} from '@cycle/state';
import {About, FeedId} from 'ssb-typescript';
import {Image} from '@staltz/react-native-image-crop-picker';
import {Alias, PeerKV} from '~frontend/ssb/types';
import {Props} from './props';

export interface State {
  about: About & {id: FeedId};
  aliases: Array<Alias>;
  newName?: string;
  newAvatar?: string;
  newDescription?: string;
  aliasServers?: Array<PeerKV>;
}

export interface Actions {
  changeName$: Stream<string>;
  changeAvatar$: Stream<Image>;
  changeDescription$: Stream<string>;
}

export default function model(
  props$: Stream<Props>,
  actions: Actions,
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
    changeNameReducer$,
    changeAvatarReducer$,
    changeDescriptionReducer$,
  );
}
