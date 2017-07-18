import xs from 'xstream';
import {View, Text, TextInput, TouchableHighlight} from 'react-native';
import {h} from '@cycle/native-screen';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {PagerTabIndicator, IndicatorViewPager} from 'rn-viewpager';
import BetterPagerTabIndicator from './components/BetterPagerTabIndicator';
import {Palette} from './global-styles/palette';
import {Dimensions as Dimens} from './global-styles/dimens';
import {styles, iconProps} from './styles';
import {styles as globalStyles} from './global-styles/styles';

function renderHeader() {
  return h(View, {style: styles.header}, [
    h(TouchableHighlight, {style: styles.headerIcon}, [
      h(Icon, {...iconProps.headerIcon, name: 'menu'})
    ]),
    h(TextInput, {
      underlineColorAndroid: Palette.brand.backgroundLighterContrast,
      placeholderTextColor: Palette.brand.backgroundLighterContrast,
      placeholder: 'Search',
      returnKeyType: 'search',
      style: styles.searchInput
    }),
    h(TouchableHighlight, {style: styles.headerIcon}, [
      h(Icon, {...iconProps.headerIcon, name: 'account-box'})
    ])
  ]);
}

function renderTabs() {
  return h(
    IndicatorViewPager,
    {
      style: styles.indicatorViewPager,
      indicator: h(BetterPagerTabIndicator, {
        style: [globalStyles.noMargin, {elevation: 3}] as any,
        itemStyle: styles.tabItem,
        selectedItemStyle: styles.tabItemSelected,
        tabs: [
          {
            normal: h(Icon, {...iconProps.tab, name: 'newspaper'}),
            selected: h(Icon, {...iconProps.tabSelected, name: 'newspaper'})
          },
          {
            normal: h(Icon, {...iconProps.tab, name: 'pound-box'}),
            selected: h(Icon, {...iconProps.tabSelected, name: 'pound-box'})
          },
          {
            normal: h(Icon, {...iconProps.tab, name: 'wan'}),
            selected: h(Icon, {...iconProps.tabSelected, name: 'wan'})
          },
          {
            normal: h(Icon, {...iconProps.tab, name: 'numeric-0-box'}),
            selected: h(Icon, {...iconProps.tabSelected, name: 'numeric-0-box'})
          }
        ]
      })
    },
    [
      h(View, {style: styles.pageContainer}, [
        h(Text, {style: styles.pagePlaceholder}, 'News feed')
      ]),
      h(View, {style: styles.pageContainer}, [
        h(Text, {style: styles.pagePlaceholder}, 'Channels')
      ]),
      h(View, {style: styles.pageContainer}, [
        h(Text, {style: styles.pagePlaceholder}, 'Metadata')
      ]),
      h(View, {style: styles.pageContainer}, [
        h(Text, {style: styles.pagePlaceholder}, 'Notifications')
      ])
    ]
  );
}

export default function view() {
  const vdom$ = xs.of(
    h(View, {style: styles.root}, [renderHeader(), renderTabs()])
  );

  return {
    vdom$: vdom$,
    statusBar$: xs.of(Palette.brand.backgroundDarker)
  };
}
