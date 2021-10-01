/* Copyright (C) 2018-2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Stream} from 'xstream';
import {NativeModules, Platform} from 'react-native';
const packageJson =
  Platform.OS === 'web' ? require('../../../../package.json') : {version: ''};

const version =
  'v' + (NativeModules.BuildConfig?.VERSION_NAME ?? packageJson.version);
const platform = Platform.select({
  ios: 'iOS',
  android: 'Android',
  default: '',
});

type Actions = {
  emailBugReport$: Stream<any>;
};

export default function linking(actions: Actions) {
  return actions.emailBugReport$.mapTo(
    'mailto:' +
      'incoming+staltz-manyverse-6814019-issue-@incoming.gitlab.com' +
      `?subject=Bug report for ${platform} ${version}` +
      '&body=Explain what happened and what you expected...',
  );
}
