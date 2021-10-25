// SPDX-FileCopyrightText: 2018-2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {t} from '../../drivers/localization';
import topBackers from './backers';

/**
 * This is a function and not a constant because localization loading is async.
 */
export default function getContent() {
  return t('dialog_thanks.description', {
    sponsor1: '[NGI0 PET](https://nlnet.nl/project/Manyverse)',
    sponsor2: '[Handshake / ACCESS](https://opencollective.com/access)',
    topBackers: topBackers.join(', '),
    donateLink: 'https://manyver.se/donate',
  });
}
