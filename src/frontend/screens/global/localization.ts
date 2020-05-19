/* Copyright (C) 2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import {Platform} from 'react-native';
import * as RNLocalize from 'react-native-localize';
import {FSSource} from '../../drivers/fs';
import {Command as LocalizationCmd} from '../../drivers/localization';

export default function localization(fsSource: FSSource) {
  const translationsDir$ =
    Platform.OS === 'android'
      ? fsSource.readDirAssets('translations')
      : fsSource.readDir(FSSource.MainBundlePath + '/translations');

  const translationPaths$ = translationsDir$.map(translationsDir =>
    translationsDir
      .filter(({isFile, name}) => isFile() && name.endsWith('.json'))
      .reduce((all, {name, path}) => {
        const languageTag = name.replace('.json', '');
        return {...all, [languageTag]: path};
      }, {} as Record<string, string>),
  );

  const readFile =
    Platform.OS === 'android' ? fsSource.readFileAssets : fsSource.readFile;

  const command$: Stream<LocalizationCmd> = translationPaths$
    .map(translationPaths => {
      const fallbackLanguageTag = 'en';

      const fallbackFileContent$ = readFile(
        translationPaths[fallbackLanguageTag],
        'utf8',
      );

      return fallbackFileContent$.map(fallbackFileContent => ({
        translationPaths,
        fallbackLanguageTag,
        fallbackFileContent,
      }));
    })
    .flatten()
    .map(({translationPaths, fallbackLanguageTag, fallbackFileContent}) => {
      const bestLanguageTag =
        RNLocalize.findBestAvailableLanguage(Object.keys(translationPaths))
          ?.languageTag || fallbackLanguageTag;

      if (bestLanguageTag === fallbackLanguageTag) {
        return xs.of({
          locale: fallbackLanguageTag,
          defaultLocale: fallbackLanguageTag,
          translations: {
            [fallbackLanguageTag]: JSON.parse(fallbackFileContent),
          },
        });
      }

      const bestFileContent$ = readFile(
        translationPaths[bestLanguageTag],
        'utf8',
      );

      return bestFileContent$.map(bestFileContent => {
        return {
          locale: bestLanguageTag,
          defaultLocale: fallbackLanguageTag,
          translations: {
            [bestLanguageTag]: JSON.parse(bestFileContent),
            [fallbackLanguageTag]: JSON.parse(fallbackFileContent),
          },
        };
      });
    })
    .flatten();

  return command$;
}
