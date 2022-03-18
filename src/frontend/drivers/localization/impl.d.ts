// SPDX-FileCopyrightText: 2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import native from './impl.native';
import web from './impl.web';
declare var _test: typeof native;
declare var _test: typeof web;
export default native;
