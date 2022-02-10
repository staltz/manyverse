// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Stream} from 'xstream';
import MAIL_TO_BUG_REPORT from '~frontend/components/mail-to-bug-report';

interface Actions {
  emailBugReport$: Stream<any>;
}

export default function linking(actions: Actions) {
  return actions.emailBugReport$.mapTo(MAIL_TO_BUG_REPORT);
}
