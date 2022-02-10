// SPDX-FileCopyrightText: 2021-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Platform} from 'react-native';
import versionName from '~frontend/versionName';

const platform = Platform.select({
  ios: 'iOS',
  android: 'Android',
  default: 'Desktop',
});

const MAIL_TO_BUG_REPORT =
  'mailto:' +
  'incoming+staltz-manyverse-6814019-issue-@incoming.gitlab.com' +
  `?subject=Bug report for ${platform} v${versionName}` +
  '&body=Explain what happened and what you expected...';

export default MAIL_TO_BUG_REPORT;
