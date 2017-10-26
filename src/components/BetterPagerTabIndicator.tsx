/**
 * This component is a fork of
 * https://github.com/zbtang/React-Native-ViewPager/blob/
 * 3d28ac7cdd68d397ba926fcd473e3ac35f7eef58/viewpager/
 * indicator/PagerTabIndicator.js
 * to allow custom tabs items, not just Text and Image.
 */
import * as React from 'react';
import {Component, ReactElement} from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  RegisteredStyle,
} from 'react-native';
import {IndicatorViewPager} from 'rn-viewpager';

export type Props = {
  initialPage?: number;
  tabs: Array<Tab>;
  pager?: any;
  style?: StyleProp<ViewStyle>;
  itemStyle?: StyleProp<ViewStyle>;
  selectedItemStyle?: StyleProp<ViewStyle>;
  changePageWithAnimation?: boolean;
};

export type State = {
  selectedIndex?: number;
};

export type Tab = {
  normal: ReactElement<any>;
  selected: ReactElement<any>;
};

export default class BetterPagerTabIndicator extends Component<Props, State> {
  public static defaultProps = {
    tabs: [],
    changePageWithAnimation: true,
  };

  public state = {
    selectedIndex: this.props.initialPage,
  };

  public render() {
    const {
      tabs,
      pager,
      style,
      itemStyle,
      selectedItemStyle,
      changePageWithAnimation,
    } = this.props;
    if (!tabs || tabs.length === 0) return null;

    const tabsView = tabs.map((tab: Tab, index: number) => {
      const isSelected = this.state.selectedIndex === index;
      return (
        <TouchableOpacity
          style={
            [
              styles.itemContainer,
              isSelected ? selectedItemStyle : itemStyle,
            ] as any
          }
          activeOpacity={0.6}
          key={index}
          onPress={() => {
            if (!isSelected) {
              if (this.props.changePageWithAnimation) pager.setPage(index);
              else pager.setPageWithoutAnimation(index);
            }
          }}
        >
          {isSelected ? tab.selected : tab.normal}
        </TouchableOpacity>
      );
    });
    return (
      <View style={[styles.container, style] as any}>
        {tabsView}
      </View>
    );
  }

  public onPageSelected(e: any) {
    this.setState({selectedIndex: e.position});
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  itemContainer: {
    alignItems: 'center',
    flex: 1,
  },
});
