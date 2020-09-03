import {Animated, Easing} from 'react-native';

export function getBreathingComposition(
  value: Animated.Value,
): Animated.CompositeAnimation {
  return Animated.loop(
    Animated.sequence([
      Animated.timing(value, {
        toValue: 0.6,
        duration: 2100,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(value, {
        toValue: 1,
        easing: Easing.linear,
        duration: 2400,
        useNativeDriver: true,
      }),
    ]),
  );
}
