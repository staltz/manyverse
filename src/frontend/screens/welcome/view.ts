/* Copyright (C) 2018-2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Stream} from 'xstream';
import {h} from '@cycle/react';
import {StyleSheet, Text, View, Image, Platform} from 'react-native';
import {Palette} from '../../global-styles/palette';
import {Dimensions} from '../../global-styles/dimens';
import {getImg} from '../../global-styles/utils';
import tutorialSlide from '../../components/tutorial-slide';
import tutorialPresentation from '../../components/tutorial-presentation';
import Button from '../../components/Button';
import {t} from '../../drivers/localization';
import {State} from './model';

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignSelf: 'stretch',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Palette.brandMain,
    flexDirection: 'column',
  },

  logo: {
    width: 48,
    height: 48,
  },

  bold: {
    fontWeight: 'bold',
  },

  italicBold: {
    fontStyle: 'italic',
    fontWeight: 'bold',
  },

  link: {
    textDecorationLine: 'underline',
  },

  button: {
    borderColor: Palette.colors.white,
    ...Platform.select({
      web: {},
      default: {
        marginBottom: 62,
      },
    }),
  },

  buttonText: {
    color: Palette.colors.white,
  },

  ctaButton: {
    backgroundColor: Palette.backgroundCTA,
    marginBottom: Dimensions.verticalSpaceBig,
  },
});

function bold(innerText: string) {
  return h(Text, {style: styles.bold}, innerText);
}

type Actions = {
  scrollBy$: Stream<[number, boolean]>;
};

function overviewSlide(state: State) {
  return tutorialSlide({
    show: state.index >= 0,
    image: getImg(require('../../../../images/noun-butterfly.png')),
    portraitMode: state.isPortraitMode,
    title: t('welcome.overview.title', {
      // Only this screen needs a defaultValue because it's the
      // first screen, and in case or race conditions with loading
      // the translation files, we don't want there to be no text
      defaultValue: 'Welcome to Manyverse!',
    }),
    renderDescription: () => [
      t('welcome.overview.description', {
        // Same reason as above
        defaultValue:
          'Social networking can be simple, neutral, ' +
          'non-commercial, and built on trust between friends. ' +
          'This is what Manyverse stands for, and we hope you too ' +
          'can make it your digital home. All this is made ' +
          'possible by the novel SSB protocol.',
      }),
      ' ',
      h(
        Text,
        {sel: 'learn-more-ssb', style: styles.link},
        t('welcome.learn_more', {defaultValue: 'Learn more'}),
      ),
    ],
    renderBottom: () =>
      h(Button, {
        sel: 'overview-continue',
        style: styles.button,
        textStyle: styles.buttonText,
        text: t('call_to_action.continue', {
          defaultValue: 'Continue',
        }),
        strong: false,
        accessible: true,
        accessibilityLabel: t('call_to_action.continue', {
          defaultValue: 'Continue',
        }),
      }),
  });
}

function offTheGridSlide(state: State) {
  return tutorialSlide({
    show: state.index >= 1,
    image: getImg(require('../../../../images/noun-camping.png')),
    portraitMode: state.isPortraitMode,
    title: t('welcome.off_the_grid.title'),
    renderDescription: () => [
      t('welcome.off_the_grid.description.1_normal'),
      bold(t('welcome.off_the_grid.description.2_bold')),
      t('welcome.off_the_grid.description.3_normal'),
      bold(t('welcome.off_the_grid.description.4_bold')),
      t('welcome.off_the_grid.description.5_normal'),
      ' ',
      h(
        Text,
        {sel: 'learn-more-off-grid', style: styles.link},
        t('welcome.learn_more', {defaultValue: 'Learn more'}),
      ),
    ],
    renderBottom: () =>
      h(Button, {
        sel: 'offgrid-continue',
        style: styles.button,
        textStyle: styles.buttonText,
        text: t('call_to_action.continue'),
        strong: false,
        accessible: true,
        accessibilityLabel: t('call_to_action.continue'),
      }),
  });
}

function connectionsSlide(state: State) {
  return tutorialSlide({
    show: state.index >= 2,
    image: getImg(require('../../../../images/noun-fish.png')),
    portraitMode: state.isPortraitMode,
    title: t('welcome.connections.title'),
    renderDescription: () =>
      Platform.select({
        ios: [
          t('welcome.connections.description.ios.1_normal'),
          bold(t('welcome.connections.description.ios.2_bold')),
          t('welcome.connections.description.ios.3_normal'),
          bold(t('welcome.connections.description.ios.4_bold')),
          t('welcome.connections.description.ios.5_normal'),
          bold(t('welcome.connections.description.ios.6_bold')),
          t('welcome.connections.description.ios.7_normal'),
          bold(t('welcome.connections.description.ios.8_bold')),
          t('welcome.connections.description.ios.9_normal'),
          ' ',
          h(
            Text,
            {sel: 'learn-more-connections', style: styles.link},
            t('welcome.learn_more'),
          ),
        ],
        default: [
          t('welcome.connections.description.default.1_normal'),
          bold(t('welcome.connections.description.default.2_bold')),
          t('welcome.connections.description.default.3_normal'),
          bold(t('welcome.connections.description.default.4_bold')),
          t('welcome.connections.description.default.5_normal'),
          bold(t('welcome.connections.description.default.6_bold')),
          t('welcome.connections.description.default.7_normal'),
          bold(t('welcome.connections.description.default.8_bold')),
          t('welcome.connections.description.default.9_normal'),
          bold(t('welcome.connections.description.default.10_bold')),
          t('welcome.connections.description.default.11_normal'),
          ' ',
          h(
            Text,
            {sel: 'learn-more-connections', style: styles.link},
            t('welcome.learn_more'),
          ),
        ],
      }),
    renderBottom: () =>
      h(Button, {
        sel: 'connections-continue',
        style: styles.button,
        textStyle: styles.buttonText,
        text: t('call_to_action.continue'),
        strong: false,
        accessible: true,
        accessibilityLabel: t('call_to_action.continue'),
      }),
  });
}

function moderationSlide(state: State) {
  return tutorialSlide({
    show: state.index >= 3,
    image: getImg(require('../../../../images/noun-farm.png')),
    portraitMode: state.isPortraitMode,
    title: t('welcome.moderation.title'),
    renderDescription: () => [
      t('welcome.moderation.description.1_normal'),
      bold(t('welcome.moderation.description.2_bold')),
      t('welcome.moderation.description.3_normal'),
      ' ',
      h(
        Text,
        {sel: 'learn-more-moderation', style: styles.link},
        t('welcome.learn_more'),
      ),
    ],
    renderBottom: () =>
      h(Button, {
        sel: 'moderation-continue',
        style: styles.button,
        textStyle: styles.buttonText,
        text: t('call_to_action.continue'),
        strong: false,
        accessible: true,
        accessibilityLabel: t('call_to_action.continue'),
      }),
  });
}

function permanenceSlide(state: State) {
  return tutorialSlide({
    show: state.index >= 4,
    image: getImg(require('../../../../images/noun-roots.png')),
    portraitMode: state.isPortraitMode,
    title: t('welcome.permanence.title'),
    renderDescription: () => [
      t('welcome.permanence.description.1_normal'),
      bold(t('welcome.permanence.description.2_bold')),
      t('welcome.permanence.description.3_normal'),
      ' ',
      h(
        Text,
        {sel: 'learn-more-permanence', style: styles.link},
        t('welcome.learn_more'),
      ),
    ],
    renderBottom: () =>
      h(Button, {
        sel: 'permanence-continue',
        style: styles.button,
        textStyle: styles.buttonText,
        text: t('call_to_action.continue'),
        strong: false,
        accessible: true,
        accessibilityLabel: t('call_to_action.continue'),
      }),
  });
}

function inConstructionSlide(state: State) {
  return tutorialSlide({
    show: state.index >= 5,
    image: getImg(require('../../../../images/noun-wheelbarrow.png')),
    portraitMode: state.isPortraitMode,
    title: t('welcome.in_construction.title'),
    renderDescription: () => [
      t('welcome.in_construction.description.1_normal'),
      bold(t('welcome.in_construction.description.2_bold')),
      t('welcome.in_construction.description.3_normal'),
    ],
    renderBottom: () =>
      h(Button, {
        sel: 'inconstruction-continue',
        style: styles.button,
        textStyle: styles.buttonText,
        text: t('call_to_action.continue'),
        strong: false,
        accessible: true,
        accessibilityLabel: t('call_to_action.continue'),
      }),
  });
}

function setupAccountSlide(state: State) {
  return tutorialSlide({
    show: state.index >= (Platform.OS === 'ios' ? 5 : 6),
    image: getImg(require('../../../../images/noun-flower.png')),
    portraitMode: state.isPortraitMode,
    title: t('welcome.setup_account.title'),
    renderDescription: () => [t('welcome.setup_account.description')],
    renderBottom: () => [
      h(Button, {
        sel: 'create-account',
        style: styles.ctaButton,
        text: t('welcome.setup_account.call_to_action.create.label'),
        strong: true,
        accessible: true,
        accessibilityLabel: t(
          'welcome.setup_account.call_to_action.create.accessibility_label',
        ),
      }),
      h(Button, {
        sel: 'restore-account',
        style: styles.button,
        textStyle: styles.buttonText,
        text: t('welcome.setup_account.call_to_action.restore.label'),
        strong: false,
        accessible: true,
        accessibilityLabel: t(
          'welcome.setup_account.call_to_action.restore.accessibility_label',
        ),
      }),
    ],
  });
}

export default function view(state$: Stream<State>, actions: Actions) {
  return state$.map((state) =>
    h(View, {style: styles.screen}, [
      !state.readyToStart
        ? h(Image, {
            source: {
              uri:
                Platform.OS === 'web'
                  ? 'dist/' +
                    require('../../../../images/logo_outline.png').default
                  : 'logo_outline',
            },
            style: styles.logo,
          })
        : tutorialPresentation('swiper', {scrollBy$: actions.scrollBy$}, [
            overviewSlide(state),
            offTheGridSlide(state),
            connectionsSlide(state),
            moderationSlide(state),
            permanenceSlide(state),
            Platform.OS === 'ios' ? null : inConstructionSlide(state),
            setupAccountSlide(state),
          ]),
    ]),
  );
}
