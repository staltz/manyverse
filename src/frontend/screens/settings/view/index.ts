/* Copyright (C) 2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import {ReactElement} from 'react';
import {h} from '@cycle/react';
import {ScrollView, View, Text, Platform, NativeModules} from 'react-native';
import {styles} from './styles';
import ToggleSetting from './ToggleSetting';
import {State, blobsStorageOptions, hopsOptions} from '../model';
import LinkSetting from './LinkSetting';
import SliderSetting from './SliderSetting';

// Google Play Store has banned Manyverse a couple times
// over a "policy violation regarding Payments", and this
// Thanks screen is possibly the reason for that.
const canShowThanks =
  Platform.OS === 'android'
    ? NativeModules.BuildConfig.FLAVOR !== 'googlePlay'
    : true;

export default function view(
  topBarVDOM$: Stream<ReactElement<any>>,
  state$: Stream<State>,
) {
  const localizedBlobsStorageOptions = blobsStorageOptions.map(opt => {
    if (opt === 'unlimited') return 'Unlimited' as string;
    else return opt as string;
  });

  const localizedHopsOptions = hopsOptions.map(opt => {
    if (opt === 'unlimited') return 'Unlimited' as string;
    else return opt as string;
  });

  return xs.combine(topBarVDOM$, state$).map(([topBarVDOM, state]) =>
    h(View, {style: styles.screen}, [
      topBarVDOM,
      h(ScrollView, {style: styles.container}, [
        h(View, {style: styles.section}, [
          h(Text, {style: styles.sectionTitle}, 'Preferences'),
          h(ToggleSetting, {
            sel: 'show-follows',
            title: 'Show follow events',
            subtitle:
              'Show follow or block or unfollow cases on the public board',
            value: state.showFollows,
            accessibilityLabel: 'Toggle follow events on the public board',
          }),
          h(View, {style: styles.spacer}),
          h(SliderSetting, {
            sel: 'hops',
            key: `hops${state.initialHops}`, // to force a re-render
            options: localizedHopsOptions,
            initial: state.initialHops,
            title: 'Replication hops',
            subtitle:
              'How far out in the social graph should Manyverse download data; ' +
              '1 is friends-only, 2 is friends-of-friends, etc. ' +
              'Caution: the higher this is, the more data is downloaded!',
            accessibilityLabel: '',
          }),
        ]),

        h(View, {style: styles.section}, [
          h(Text, {style: styles.sectionTitle}, 'Data & Storage'),
          h(LinkSetting, {
            sel: 'backup',
            title: 'Backup',
            subtitle: 'View your 48-word recovery phrase',
            accessibilityLabel: 'Back Up My Account',
          }),
          h(View, {style: styles.spacer}),
          h(SliderSetting, {
            sel: 'blobs-storage',
            key: `blobs${state.initialBlobsStorage}`, // to force a re-render
            options: localizedBlobsStorageOptions,
            initial: state.initialBlobsStorage,
            title: 'Blobs storage limit',
            subtitle:
              'Automatically delete old images and blobs until they ' +
              'occupy at most this amount of storage on your device',
            accessibilityLabel:
              'Choose a storage limit for images and other blobs on this device',
          }),
        ]),

        h(View, {style: styles.section}, [
          h(Text, {style: styles.sectionTitle}, 'Troubleshooting'),
          h(LinkSetting, {
            sel: 'bug-report',
            title: 'Email bug report',
            accessibilityLabel: 'Email Bug Report',
          }),
          h(View, {style: styles.spacer}),
          h(ToggleSetting, {
            sel: 'detailed-logs',
            title: 'Enable detailed logs',
            value: state.enableDetailedLogs,
            accessibilityLabel: 'Toggle detailed developer logs',
          }),
        ]),

        h(View, {style: styles.section}, [
          h(Text, {style: styles.sectionTitle}, 'More information'),
          canShowThanks
            ? h(LinkSetting, {
                sel: 'thanks',
                title: 'Thanks',
                accessibilityLabel: 'Show Thanks',
              })
            : null,
          canShowThanks ? h(View, {style: styles.spacer}) : null,
          h(LinkSetting, {
            sel: 'licenses',
            title: 'Open source licenses',
            accessibilityLabel: 'View Open Source Licenses',
          }),
          h(View, {style: styles.spacer}),
          h(LinkSetting, {
            sel: 'about',
            title: 'About',
            accessibilityLabel: 'About This App',
          }),
        ]),
      ]),
    ]),
  );
}
