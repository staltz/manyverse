import xs, {Stream} from 'xstream';
import {ReactElement} from 'react';
import {View, Text, TextInput, TouchableHighlight} from 'react-native';
import {ScreenSource, h} from '@cycle/native-screen';
import {StateSource, Reducer} from 'cycle-onionify';
import {PagerTabIndicator, IndicatorViewPager} from 'rn-viewpager';

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
  return h(View, {style: {flexDirection: 'row'}}, [
    h(TouchableHighlight, {style: {width: 30, height: 30}}, [
      h(View, [h(Text, '=')])
    ]),
    h(TextInput, {
      underlineColorAndroid: Pallete.indigo4,
      placeholderTextColor: Pallete.indigo4,
      placeholder: 'Search',
      returnKeyType: 'search',
      style: {flex: 1, color: 'white'}
    }),
    h(TouchableHighlight, {style: {width: 30, height: 30}}, [
      h(View, [h(Text, 'Me')])
    ])
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
      indicator: h(PagerTabIndicator, {
        style: {
          paddingTop: 0,
          paddingBottom: 0,
          borderTopWidth: 0,
          margin: 0
        },
        itemStyle: {
          backgroundColor: Pallete.indigo8,
          paddingTop: 10,
          paddingBottom: 10
        },
        selectedItemStyle: {
          backgroundColor: Pallete.indigo8,
          paddingTop: 10,
          paddingBottom: 10,
          borderBottomWidth: 2,
          borderBottomColor: 'white'
        },
        // iconStyle: Image.propTypes.style,
        // selectedIconStyle: Image.propTypes.style,
        textStyle: {
          color: Pallete.indigo10
        },
        selectedTextStyle: {
          color: 'white'
        },
        tabs: [
          {
            text: 'News feed'
            // iconSource: require('../imgs/ic_tab_home_normal.png'),
            // selectedIconSource: require('../imgs/ic_tab_home_click.png')
          },
          {
            text: 'Channels'
            // iconSource: require('../imgs/ic_tab_task_normal.png'),
            // selectedIconSource: require('../imgs/ic_tab_task_click.png')
          },
          {
            text: 'Metadata'
            // iconSource: require('../imgs/ic_tab_my_normal.png'),
            // selectedIconSource: require('../imgs/ic_tab_my_click.png')
          },
          {
            text: 'Notifications'
            // iconSource: require('../imgs/ic_tab_my_normal.png'),
            // selectedIconSource: require('../imgs/ic_tab_my_click.png')
          }
        ]
      })
    },
    [
      h(View, {style: {backgroundColor: 'cadetblue'}}, [h(Text, 'page one')]),
      h(View, {style: {backgroundColor: 'cornflowerblue'}}, [
        h(Text, 'page two')
      ]),
      h(View, {style: {backgroundColor: 'aquamarine'}}, [
        h(Text, 'page three')
      ]),
      h(View, {style: {backgroundColor: 'blanchedalmond'}}, [
        h(Text, 'page four')
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
