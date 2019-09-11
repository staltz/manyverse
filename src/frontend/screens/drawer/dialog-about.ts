/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Command} from '../../drivers/dialogs';
import {Palette} from '../../global-styles/palette';
const json = require('../../app-version');

export default {
  type: 'alert',
  title: 'About Manyverse',
  content:
    '<a href="https://manyver.se">manyver.se</a><br />' +
    'A social network off the grid<br />' +
    'Version ' +
    json.version +
    '<br /><br />' +
    'Copyright (C) 2018-2019 ' +
    '<a href="https://gitlab.com/staltz/manyverse/blob/master/AUTHORS">The Manyverse Authors</a>' +
    '<br /><br />' +
    '<a href="https://gitlab.com/staltz/manyverse">Open source on GitLab</a>' +
    '<br />' +
    'Licensed MPL 2.0',
  options: {
    contentIsHtml: true,
    contentColor: Palette.textWeak,
    linkColor: Palette.text,
    positiveColor: Palette.text,
  },
} as Command;
