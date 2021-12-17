// SPDX-FileCopyrightText: 2018-2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import '@fontsource/roboto';
import iconFont from 'react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf';
import emojiFont from './images/NotoColorEmoji.ttf';
import {run} from 'cycle-native-navigation-web';
import {screens, drivers} from './lib/frontend/index';
import {welcomeLayout} from './lib/frontend/screens/layouts';

// Set up fonts
const fontStyles = `@font-face {
   src: url(renderer-dist/${iconFont});
   font-family: MaterialCommunityIcons;
 }

 @font-face {
  src: url(renderer-dist/${emojiFont}) format('truetype');
  font-family: 'NotoColorEmoji';
}`;
const style = document.createElement('style');
style.appendChild(document.createTextNode(fontStyles));
document.head.appendChild(style);

// Wait for fonts to load before starting Cycle.js app
document.fonts.ready.then(() => {
  run(screens, drivers, welcomeLayout);
});
