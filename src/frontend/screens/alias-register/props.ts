// SPDX-FileCopyrightText: 2021-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {PeerKV} from '~frontend/ssb/types';

export interface Props {
  servers: Array<PeerKV>;
}
