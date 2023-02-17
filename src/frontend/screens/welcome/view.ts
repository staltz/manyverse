// SPDX-FileCopyrightText: 2018-2023 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Stream} from 'xstream';
import {h} from '@cycle/react';
import {StyleSheet, Text, View, Image, Platform} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import {Palette} from '~frontend/global-styles/palette';
import {Dimensions} from '~frontend/global-styles/dimens';
import {Images} from '~frontend/global-styles/images';
import {Typography} from '~frontend/global-styles/typography';
import tutorialSlide from '~frontend/components/tutorial-slide';
import tutorialPresentation from '~frontend/components/tutorial-presentation';
import Button from '~frontend/components/Button';
import StatusBarBrand from '~frontend/components/StatusBarBrand';
import {t} from '~frontend/drivers/localization';
import {State, requireEULA} from './model';

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignSelf: 'stretch',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Palette.brandMain,
    flexDirection: 'column',
    ...Platform.select({
      web: {
        '-webkit-app-region': 'drag',
      },
    }),
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

  eulaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Dimensions.verticalSpaceLarge,
  },

  eulaCheckbox: {
    marginRight: Dimensions.horizontalSpaceSmall,
  },

  eulaText: {
    color: Palette.textForBackgroundBrand,
    fontSize: Typography.fontSizeNormal,
    lineHeight: Typography.lineHeightNormal,
    fontFamily: Typography.fontFamilyReadableText,
  },

  buttonText: {
    color: Palette.colors.white,
  },

  buttonDisabled: {
    backgroundColor: 'transparent',
    borderColor: Palette.textWeakForBackgroundBrand,
    borderWidth: 1,
  },

  buttonTextDisabled: {
    color: Palette.textWeakForBackgroundBrand,
  },

  ctaButton: {
    backgroundColor: Palette.backgroundCTA,
    borderWidth: 1,
    borderColor: Palette.backgroundCTA,
    marginBottom: Dimensions.verticalSpaceBig,
  },

  migrateButton: {
    borderColor: Palette.colors.white,
    marginTop: Dimensions.verticalSpaceBig,
  },
});

function bold(innerText: string) {
  return h(Text, {style: styles.bold}, innerText);
}

interface Actions {
  scrollBy$: Stream<[number, boolean]>;
}

function overviewSlide(state: State) {
  return tutorialSlide({
    show: state.index >= 0,
    image: Images.nounButterfly,
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
    image: Images.nounCamping,
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
    image: Images.nounFish,
    portraitMode: state.isPortraitMode,
    title: t('welcome.connections.title'),
    renderDescription: () => [
      t('welcome.connections.description.1_normal'),
      bold(t('welcome.connections.description.2_bold')),
      t('welcome.connections.description.3_normal'),
      bold(t('welcome.connections.description.4_bold')),
      t('welcome.connections.description.5_normal'),
      bold(t('welcome.connections.description.6_bold')),
      t('welcome.connections.description.7_normal'),
      ' ',
      h(
        Text,
        {sel: 'learn-more-connections', style: styles.link},
        t('welcome.learn_more'),
      ),
    ],
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
    image: Images.nounFarm,
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
    image: Images.nounRoots,
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
    image: Images.nounWheelbarrow,
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

function renderEULA(state: State) {
  return h(View, {key: 'eula', style: styles.eulaRow}, [
    h(CheckBox, {
      sel: 'eula-checkbox',
      key: 'eula-checkbox',
      style: styles.eulaCheckbox,
      value: state.acceptedEULA,
      accessible: true,
      accessibilityLabel: t(
        'welcome.setup_account.call_to_action.accept_eula.accessibility_label',
      ),
      tintColors: {
        true: Palette.textForBackgroundBrand,
        false: Palette.textForBackgroundBrand,
      },
    }),

    h(Text, {key: 'eulat', style: styles.eulaText}, [
      t('welcome.setup_account.call_to_action.accept_eula.1_normal'),
      h(
        Text,
        {sel: 'read-eula', style: styles.link},
        t('welcome.setup_account.call_to_action.accept_eula.2_bold'),
      ),
      t('welcome.setup_account.call_to_action.accept_eula.3_normal'),
    ]),
  ]);
}

function setupAccountSlide(state: State) {
  return tutorialSlide({
    show: state.index >= (Platform.OS === 'ios' ? 5 : 6),
    image: Images.nounFlower,
    portraitMode: state.isPortraitMode,
    title: t('welcome.setup_account.title'),
    renderDescription: () => [t('welcome.setup_account.description')],
    renderBottom: () => [
      requireEULA ? renderEULA(state) : null,
      h(Button, {
        sel: 'create-account',
        strong: state.acceptedEULA,
        enabled: state.acceptedEULA,
        style: styles.ctaButton,
        styleDisabled: styles.buttonDisabled,
        textStyleDisabled: styles.buttonTextDisabled,
        text: t('welcome.setup_account.call_to_action.create.label'),
        accessible: true,
        accessibilityLabel: t(
          'welcome.setup_account.call_to_action.create.accessibility_label',
        ),
      }),
      h(Button, {
        sel: 'restore-account',
        strong: false,
        enabled: state.acceptedEULA,
        style: styles.button,
        styleDisabled: styles.buttonDisabled,
        textStyle: styles.buttonText,
        textStyleDisabled: styles.buttonTextDisabled,
        text: t('welcome.setup_account.call_to_action.restore.label'),
        accessible: true,
        accessibilityLabel: t(
          'welcome.setup_account.call_to_action.restore.accessibility_label',
        ),
      }),
      Platform.OS === 'web' && state.sharedSSBAccountExists
        ? h(Button, {
            sel: 'migrate-account',
            style: styles.migrateButton,
            textStyle: styles.buttonText,
            text: t('welcome.setup_account.call_to_action.migrate.label'),
            strong: false,
            accessible: true,
            accessibilityLabel: t(
              'welcome.setup_account.call_to_action.migrate.accessibility_label',
            ),
          })
        : (null as any),
    ],
  });
}

export default function view(state$: Stream<State>, actions: Actions) {
  return state$.map((state) =>
    h(View, {style: styles.screen}, [
      h(StatusBarBrand),
      !state.readyToStart
        ? h(Image, {
            source: Images.logoOutline,
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
