// SPDX-FileCopyrightText: 2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import native from './ssb-backend.native';
import web from './ssb-backend.web';
declare var _test: typeof native;
declare var _test: typeof web;
export default native;
