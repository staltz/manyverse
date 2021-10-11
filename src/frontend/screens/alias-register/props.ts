// SPDX-FileCopyrightText: 2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {PeerKV} from '../../ssb/types';

export interface Props {
  servers: Array<PeerKV>;
}
