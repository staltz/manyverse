// SPDX-FileCopyrightText: 2020-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import MAIL_TO_BUG_REPORT from '~frontend/components/mail-to-bug-report';

interface Actions {
  emailBugReport$: Stream<any>;
  openTranslate$: Stream<any>;
  downloadNewVersion$: Stream<any>;
}

export default function linking(actions: Actions) {
  return xs.merge(
    actions.emailBugReport$.mapTo(MAIL_TO_BUG_REPORT),

    actions.openTranslate$.mapTo('https://manyver.se/translations'),

    actions.downloadNewVersion$.mapTo('https://manyver.se/download'),
  );
}
