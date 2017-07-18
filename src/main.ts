import xs, {Stream} from 'xstream';
import {ReactElement} from 'react';
import {View, Text, TextInput, TouchableHighlight} from 'react-native';
import {ScreenSource, h} from '@cycle/native-screen';
import {StateSource, Reducer} from 'cycle-onionify';
import {PagerTabIndicator, IndicatorViewPager} from 'rn-viewpager';
import BetterPagerTabIndicator from './components/BetterPagerTabIndicator';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
const StatusBarAndroid = require('react-native-android-statusbar');

export type Sources = {
  Screen: ScreenSource;
  onion: StateSource<any>;
};

export type Sinks = {
  Screen: Stream<ReactElement<any>>;
  onion: Stream<Reducer<any>>;
};

const Pallete = {
  indigo4: '#748ffc',
  indigo8: '#3b5bdb',
  indigo9: '#364fc7',
  indigo10: '#1930a0'
};

function renderHeader() {
  return h(View, {style: {flexDirection: 'row', minHeight: 55}}, [
    h(
      TouchableHighlight,
      {
        style: {
          marginLeft: 12,
          marginRight: 12,
          marginTop: 10,
          width: 28,
          height: 28
        }
      },
      [h(Icon, {name: 'menu', size: 28, color: 'white'})]
    ),
    h(TextInput, {
      underlineColorAndroid: Pallete.indigo4,
      placeholderTextColor: Pallete.indigo4,
      placeholder: 'Search',
      returnKeyType: 'search',
      style: {flex: 1, color: 'white'}
    }),
    h(
      TouchableHighlight,
      {
        style: {
          marginLeft: 12,
          marginRight: 12,
          marginTop: 10,
          width: 28,
          height: 28
        }
      },
      [h(Icon, {name: 'account-box', size: 28, color: 'white'})]
    )
  ]);
}

function renderTabs() {
  return h(
    IndicatorViewPager,
    {
      style: {
        flex: 1,
        flexDirection: 'column-reverse',
        backgroundColor: 'white'
      },
      indicator: h(BetterPagerTabIndicator, {
        style: {
          paddingTop: 0,
          paddingBottom: 0,
          borderTopWidth: 0,
          margin: 0
        },
        itemStyle: {
          backgroundColor: Pallete.indigo8,
          paddingTop: 10,
          paddingBottom: 8
        },
        selectedItemStyle: {
          backgroundColor: Pallete.indigo8,
          paddingTop: 10,
          paddingBottom: 8,
          borderBottomWidth: 2,
          borderBottomColor: 'white'
        },
        tabs: [
          {
            normal: h(Icon, {
              name: 'newspaper',
              size: 28,
              color: Pallete.indigo10
            }),
            selected: h(Icon, {name: 'newspaper', size: 28, color: 'white'})
          },
          {
            normal: h(Icon, {
              name: 'pound-box',
              size: 28,
              color: Pallete.indigo10
            }),
            selected: h(Icon, {name: 'pound-box', size: 28, color: 'white'})
          },
          {
            normal: h(Icon, {
              name: 'wan',
              size: 28,
              color: Pallete.indigo10
            }),
            selected: h(Icon, {name: 'wan', size: 28, color: 'white'})
          },
          {
            normal: h(Icon, {
              name: 'numeric-0-box',
              size: 28,
              color: Pallete.indigo10
            }),
            selected: h(Icon, {
              name: 'numeric-0-box',
              size: 28,
              color: 'white'
            })
          }
        ]
      })
    },
    [
      h(View, {style: {backgroundColor: 'cadetblue'}}, [h(Text, 'News feed')]),
      h(View, {style: {backgroundColor: 'cornflowerblue'}}, [
        h(Text, 'Channels')
      ]),
      h(View, {style: {backgroundColor: 'aquamarine'}}, [h(Text, 'Metadata')]),
      h(View, {style: {backgroundColor: 'blanchedalmond'}}, [
        h(Text, 'Notifications')
      ])
    ]
  );
}

export function main(sources: Sources): Sinks {
  const vdom$ = xs.of(
    h(
      View,
      {
        style: {
          flex: 1,
          backgroundColor: Pallete.indigo8
        }
      },
      [renderHeader(), renderTabs()]
    )
  );
  const reducer$ = xs.empty();

  return {
    Screen: vdom$,
    onion: reducer$
  };
}

StatusBarAndroid.setHexColor(Pallete.indigo9);
