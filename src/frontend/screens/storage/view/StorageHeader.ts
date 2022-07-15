// SPDX-FileCopyrightText: 2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {h} from '@cycle/react';
import {Key} from 'i18n-js';
import {Component} from 'react';
import {Platform, StyleSheet, View, Text} from 'react-native';
import Button from '~frontend/components/Button';
import {t} from '~frontend/drivers/localization';
const byteSize = require('byte-size').default;
import {Dimensions} from '~frontend/global-styles/dimens';
import {Palette} from '~frontend/global-styles/palette';
import {Typography} from '~frontend/global-styles/typography';
import SliderSetting from '~frontend/screens/settings/view/SliderSetting';
import {State} from '../model';

const CHART_HEIGHT = 12;

const legendIcon = {
  width: CHART_HEIGHT,
  height: CHART_HEIGHT,
  marginRight: Dimensions.horizontalSpaceSmall,
};

const chartSlice = {
  height: CHART_HEIGHT,
  minWidth: 2,
  marginRight: StyleSheet.hairlineWidth,
};

const styles = StyleSheet.create({
  header: {
    ...Platform.select({
      web: {
        width: Dimensions.desktopMiddleWidth.px,
      },
    }),
  },

  subheader: {
    backgroundColor: Palette.backgroundText,
    paddingVertical: Dimensions.verticalSpaceBig,
    paddingHorizontal: Dimensions.horizontalSpaceBig,
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    marginBottom: Dimensions.verticalSpaceBig,
  },

  chart: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    height: CHART_HEIGHT,
    marginBottom: Dimensions.verticalSpaceSmall,
  },

  chartSlice_trashBytes: {
    ...chartSlice,
    backgroundColor: Palette.textNegative,
  },

  chartSlice_contentBytes: {
    ...chartSlice,
    backgroundColor: Palette.textPositive,
  },

  chartSlice_indexesBytes: {
    ...chartSlice,
    backgroundColor: Palette.textWarning,
  },

  chartSlice_blobsBytes: {
    ...chartSlice,
    backgroundColor: Palette.textBrand,
    marginRight: 0,
  },

  legends: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },

  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Dimensions.horizontalSpaceBig,
    marginBottom: Dimensions.verticalSpaceTiny,
  },

  legendIcon_trashBytes: {
    ...legendIcon,
    backgroundColor: Palette.textNegative,
  },

  legendIcon_blobsBytes: {
    ...legendIcon,
    backgroundColor: Palette.textBrand,
  },

  legendIcon_contentBytes: {
    ...legendIcon,
    backgroundColor: Palette.textPositive,
  },

  legendIcon_indexesBytes: {
    ...legendIcon,
    backgroundColor: Palette.textWarning,
  },

  legendText: {
    fontSize: Typography.fontSizeNormal,
    color: Palette.text,
    ...Platform.select({
      web: {
        fontFamily: Typography.fontFamilyReadableText,
      },
    }),
  },

  title: {
    fontSize: Typography.fontSizeNormal,
    lineHeight: Typography.lineHeightNormal,
    color: Palette.text,
    ...Platform.select({
      web: {
        fontFamily: Typography.fontFamilyReadableText,
      },
    }),
  },

  subtitle: {
    fontSize: Typography.fontSizeSmall,
    lineHeight: Typography.lineHeightSmall,
    color: Palette.textWeak,
    marginBottom: Dimensions.verticalSpaceNormal,
    ...Platform.select({
      web: {
        fontFamily: Typography.fontFamilyReadableText,
      },
    }),
  },

  accountsSubtitle: {
    marginBottom: 0,
  },

  sliderContainer: {
    paddingVertical: 0,
    paddingHorizontal: 0,
  },

  accountsContainer: {
    marginBottom: 1,
  },

  bold: {
    fontWeight: 'bold',
  },
});

function bold(innerText: string) {
  return h(Text, {style: styles.bold}, innerText);
}

export default class ProfileHeader extends Component<
  Pick<
    State,
    | 'trashBytes'
    | 'contentBytes'
    | 'indexesBytes'
    | 'blobsBytes'
    | 'initialBlobsStorage'
  > & {
    localizedBlobsStorageOptions: Array<string>;
  }
> {
  public shouldComponentUpdate(next: ProfileHeader['props']) {
    const prev = this.props;
    if (next.trashBytes !== prev.trashBytes) return true;
    if (next.blobsBytes !== prev.blobsBytes) return true;
    if (next.indexesBytes !== prev.indexesBytes) return true;
    if (next.contentBytes !== prev.contentBytes) return true;
    if (next.initialBlobsStorage !== prev.initialBlobsStorage) return true;
    return false;
  }

  private renderChartSlice(propName: keyof ProfileHeader['props']) {
    let bytes = this.props[propName] as number | null;
    if (!bytes) return null;
    return h(View, {style: [styles['chartSlice_' + propName], {flex: bytes}]});
  }

  private renderLegend(propName: keyof ProfileHeader['props'], label: Key) {
    let bytes = this.props[propName] as number | null;
    if (!bytes) return null;
    const size = byteSize(bytes).toString();
    return h(View, {style: styles.legend}, [
      h(View, {style: styles['legendIcon_' + propName]}),
      h(Text, {style: styles.legendText}, t(label, {megabytes: size})),
    ]);
  }

  public render() {
    const {
      trashBytes,
      blobsBytes,
      contentBytes,
      indexesBytes,
      initialBlobsStorage,
    } = this.props;
    if (
      trashBytes === null ||
      blobsBytes === null ||
      contentBytes === null ||
      indexesBytes === null
    ) {
      return null;
    }

    const totalSize = byteSize(
      trashBytes + contentBytes + indexesBytes + blobsBytes,
    ).toString();

    return h(View, {style: styles.header}, [
      h(View, {style: styles.subheader}, [
        h(Text, {style: styles.subtitle}, [
          t('storage.chart.total.1_normal'),
          bold(totalSize),
          t('storage.chart.total.3_normal'),
        ]),

        h(View, {style: styles.chart}, [
          this.renderChartSlice('trashBytes'),
          this.renderChartSlice('contentBytes'),
          this.renderChartSlice('indexesBytes'),
          this.renderChartSlice('blobsBytes'),
        ]),
        h(View, {style: styles.legends}, [
          this.renderLegend('trashBytes', 'storage.chart.legend.trash'),
          this.renderLegend('contentBytes', 'storage.chart.legend.content'),
          this.renderLegend('indexesBytes', 'storage.chart.legend.indexes'),
          this.renderLegend('blobsBytes', 'storage.chart.legend.blobs'),
        ]),
      ]),

      trashBytes
        ? h(View, {style: styles.subheader}, [
            h(Text, {style: styles.title}, 'Trash'), // FIXME: localize
            h(
              Text,
              {style: styles.subtitle},
              // FIXME: localize
              'The trash bin is made of blocked accounts. Compact your database to empty the trash bin. Note that compaction will rebuild database indexes and this can take several minutes.',
            ),
            h(Button, {
              text: 'Compact', // FIXME: localize
              style: {
                borderColor: Palette.textNegative,
                marginRight: Dimensions.horizontalSpaceNormal,
              },
              textStyle: {color: Palette.textNegative},
            }),
          ])
        : null,

      h(View, {style: [styles.subheader, styles.sliderContainer]}, [
        h(SliderSetting, {
          sel: 'blobs-storage',
          key: `blobs${initialBlobsStorage}`, // to force a re-render
          options: this.props.localizedBlobsStorageOptions,
          initial: initialBlobsStorage,
          title: t('settings.data_and_storage.blobs_storage.title'),
          subtitle: t('settings.data_and_storage.blobs_storage.subtitle'),
          accessibilityLabel: t(
            'settings.data_and_storage.blobs_storage.accessibility_label',
          ),
        }),
      ]),

      h(View, {style: [styles.subheader, styles.accountsContainer]}, [
        h(Text, {style: styles.title}, 'Accounts'), // FIXME: localize
        h(
          Text,
          {style: [styles.subtitle, styles.accountsSubtitle]},
          // FIXME: localize
          "Every account you see on your Manyverse occupies a certain amount of space on your device. To free up space, you can block accounts you don't want to see anymore.",
        ),
      ]),
    ]);
  }
}
