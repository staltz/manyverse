/* Copyright (C) 2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Stream} from 'xstream';
import {h} from '@cycle/react';
import {ScrollView, View, Text, Platform, NativeModules} from 'react-native';
import TopBar from '../../../components/TopBar';
import {t} from '../../../drivers/localization';
import {State, blobsStorageOptions, hopsOptions} from '../model';
import ToggleSetting from './ToggleSetting';
import LinkSetting from './LinkSetting';
import SliderSetting from './SliderSetting';
import {styles} from './styles';

// Google Play Store has banned Manyverse a couple times over a "policy
// violation regarding Payments", and this Thanks screen is possibly the reason
// for that.
const canShowThanks =
  Platform.OS === 'android'
    ? NativeModules.BuildConfig.FLAVOR !== 'googlePlay'
    : true;

export default function view(state$: Stream<State>) {
  const localizedBlobsStorageOptions = blobsStorageOptions.map((opt) => {
    if (opt === 'unlimited') {
      return t('settings.data_and_storage.blobs_storage.unlimited') as string;
    } else {
      return opt as string;
    }
  });

  const localizedHopsOptions = hopsOptions.map((opt) => {
    if (opt === 'unlimited') {
      return t('settings.preferences.hops.unlimited') as string;
    } else {
      return opt as string;
    }
  });

  return state$.map((state) =>
    h(View, {style: styles.screen}, [
      h(TopBar, {sel: 'topbar', title: t('settings.title')}),
      h(ScrollView, {style: styles.container}, [
        h(View, {style: styles.section}, [
          h(
            Text,
            {style: styles.sectionTitle},
            t('settings.preferences.title'),
          ),

          h(ToggleSetting, {
            sel: 'show-follows',
            title: t('settings.preferences.show_follows.title'),
            subtitle: t('settings.preferences.show_follows.subtitle'),
            value: state.showFollows,
            accessibilityLabel: t(
              'settings.preferences.show_follows.accessibility_label',
            ),
          }),

          h(View, {style: styles.spacer}),
          h(SliderSetting, {
            sel: 'hops',
            key: `hops${state.initialHops}`, // to force a re-render
            options: localizedHopsOptions,
            initial: state.initialHops,
            title: t('settings.preferences.hops.title'),
            subtitle: t('settings.preferences.hops.subtitle'),
            accessibilityLabel: t(
              'settings.preferences.hops.accessibility_label',
            ),
          }),
        ]),

        h(View, {style: styles.section}, [
          h(
            Text,
            {style: styles.sectionTitle},
            t('settings.data_and_storage.title'),
          ),

          h(LinkSetting, {
            sel: 'backup',
            title: t('settings.data_and_storage.backup.title'),
            subtitle: t('settings.data_and_storage.backup.subtitle'),
            accessibilityLabel: t(
              'settings.data_and_storage.backup.accessibility_label',
            ),
          }),

          h(View, {style: styles.spacer}),
          h(SliderSetting, {
            sel: 'blobs-storage',
            key: `blobs${state.initialBlobsStorage}`, // to force a re-render
            options: localizedBlobsStorageOptions,
            initial: state.initialBlobsStorage,
            title: t('settings.data_and_storage.blobs_storage.title'),
            subtitle: t('settings.data_and_storage.blobs_storage.subtitle'),
            accessibilityLabel: t(
              'settings.data_and_storage.blobs_storage.accessibility_label',
            ),
          }),
        ]),

        h(View, {style: styles.section}, [
          h(
            Text,
            {style: styles.sectionTitle},
            t('settings.troubleshooting.title'),
          ),

          h(LinkSetting, {
            sel: 'bug-report',
            title: t('settings.troubleshooting.bug_report.title'),
            accessibilityLabel: t(
              'settings.troubleshooting.bug_report.accessibility_label',
            ),
          }),

          h(View, {style: styles.spacer}),
          h(ToggleSetting, {
            sel: 'detailed-logs',
            title: t('settings.troubleshooting.detailed_logs.title'),
            value: state.enableDetailedLogs,
            accessibilityLabel: t(
              'settings.troubleshooting.detailed_logs.accessibility_label',
            ),
          }),
        ]),

        h(View, {style: styles.section}, [
          h(
            Text,
            {style: styles.sectionTitle},
            t('settings.more_information.title'),
          ),

          canShowThanks
            ? h(LinkSetting, {
                sel: 'thanks',
                title: t('settings.more_information.thanks.title'),
                accessibilityLabel: t(
                  'settings.more_information.thanks.accessibility_label',
                ),
              })
            : null,

          canShowThanks ? h(View, {style: styles.spacer}) : null,
          h(LinkSetting, {
            sel: 'libraries',
            title: t('settings.more_information.third_party_libs.title'),
            accessibilityLabel: t(
              'settings.more_information.third_party_libs.accessibility_label',
            ),
          }),
          h(View, {style: styles.spacer}),
          h(LinkSetting, {
            sel: 'about',
            title: t('settings.more_information.about.title'),
            accessibilityLabel: t(
              'settings.more_information.about.accessibility_label',
            ),
          }),
        ]),
      ]),
    ]),
  );
}
