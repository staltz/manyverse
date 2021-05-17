/* Copyright (C) 2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {About, FeedId} from 'ssb-typescript';
import {Alias} from '../../ssb/types';

export interface Props {
  about: About & {id: FeedId};
  aliases: Array<Alias>;
}
