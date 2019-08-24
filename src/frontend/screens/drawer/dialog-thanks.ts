/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Command} from '../../drivers/dialogs';
import {Palette} from '../../global-styles/palette';

const top5backers = [
  'Connor Turland',
  'DC Posch',
  'Jean-Baptiste Giraudeau',
  'Audrey Tang',
  'Romain Prignon',
];

export default {
  type: 'alert',
  title: 'Thank you!',
  content:
    'Development of this app was supported by donations from:' + 
    '<br /><br />' +
    '<strong>' +
    top5backers.join(', ') +
    '</strong>, and ' +
    '<a href="https://manyver.se/donate">dozens of other backers</a>. ' + 
    'Thanks!',
  options: {
    contentIsHtml: true,
    contentColor: Palette.textWeak,
    linkColor: Palette.text,
    positiveColor: Palette.text,
  },
} as Command;
