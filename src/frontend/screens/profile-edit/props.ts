// SPDX-FileCopyrightText: 2021-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {About, FeedId} from 'ssb-typescript';
import {Alias} from '~frontend/ssb/types';

export interface Props {
  about: About & {id: FeedId};
  aliases: Array<Alias>;
}
