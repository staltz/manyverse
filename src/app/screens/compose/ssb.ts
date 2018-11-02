/* Copyright (C) 2018 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Stream} from 'xstream';
import {toPostContent} from '../../../ssb/to-ssb';
import {Req, contentToPublishReq} from '../../drivers/ssb';

export type Actions = {
  publishMsg$: Stream<string>;
};

export default function ssb(actions: Actions): Stream<Req> {
  const publishMsg$ = actions.publishMsg$
    .map(toPostContent)
    .map(contentToPublishReq);

  return publishMsg$;
}
