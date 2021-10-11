// SPDX-FileCopyrightText: 2020-2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import * as Path from 'path';
import xs, {Stream} from 'xstream';
import {Platform} from 'react-native';
import * as RNLocalize from 'react-native-localize';
import {FSSource} from '../../drivers/fs';
import {Command as LocalizationCmd} from '../../drivers/localization';

export default function localization(fsSource: FSSource) {
  const translationsDir$: Stream<
    {isFile: CallableFunction; name: string; path: string}[]
  > =
    Platform.OS === 'android'
      ? (fsSource.readDirAssets('translations') as any)
      : Platform.OS === 'ios'
      ? fsSource.readDir(Path.join(FSSource.MainBundlePath, 'translations'))
      : fsSource.readDir('./translations', {withFileTypes: true});

  const translationPaths$ = translationsDir$.map((translationsDir) =>
    translationsDir
      .filter((dirent) => dirent.isFile() && dirent.name.endsWith('.json'))
      .map((file) =>
        Platform.OS === 'web'
          ? {
              ...file,
              path: Path.resolve(process.cwd(), 'translations', file.name),
            }
          : file,
      )
      .reduce((all, {name, path}) => {
        const languageTag = name.replace('.json', '');
        const commonLanguageTag = languageTag.split('-')[0];
        return {[commonLanguageTag]: path, ...all, [languageTag]: path};
      }, {} as Record<string, string>),
  );

  const readFile =
    Platform.OS === 'android' ? fsSource.readFileAssets : fsSource.readFile;

  const command$: Stream<LocalizationCmd> = translationPaths$
    .map((translationPaths) => {
      const fallbackLanguageTag = 'en';

      const fallbackFileContent$ = readFile(
        translationPaths[fallbackLanguageTag],
        'utf8',
      );

      return fallbackFileContent$.map((fallbackFileContent) => ({
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
            [fallbackLanguageTag]: JSON.parse(fallbackFileContent as any),
          },
        });
      }

      const bestFileContent$ = readFile(
        translationPaths[bestLanguageTag],
        'utf8',
      );

      return bestFileContent$.map((bestFileContent) => {
        return {
          locale: bestLanguageTag,
          defaultLocale: fallbackLanguageTag,
          translations: {
            [bestLanguageTag]: JSON.parse(bestFileContent as any),
            [fallbackLanguageTag]: JSON.parse(fallbackFileContent as any),
          },
        };
      });
    })
    .flatten();

  return command$;
}
