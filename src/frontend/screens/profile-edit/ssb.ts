/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Stream} from 'xstream';
import sample from 'xstream-sample';
import {State} from './model';
import {toAboutContent} from '../../ssb/utils/to-ssb';
import {Req, PublishAboutReq} from '../../drivers/ssb';

export type SSBActions = {
  save$: Stream<null>;
};

/**
 * Define streams of new content to be flushed onto SSB.
 */
export default function ssb(
  state$: Stream<State>,
  actions: SSBActions,
): Stream<Req> {
  const newAboutContent$ = actions.save$
    .compose(sample(state$))
    .filter(
      state =>
        (!!state.newName && state.newName !== state.about.name) ||
        !!state.newAvatar ||
        (!!state.newDescription && state.newDescription !== state.about.name),
    )
    .map(
      state =>
        ({
          type: 'publishAbout',
          content: toAboutContent(
            state.about.id,
            state.newName,
            state.newDescription,
            state.newAvatar,
          ),
        } as PublishAboutReq),
    );

  return newAboutContent$;
}
