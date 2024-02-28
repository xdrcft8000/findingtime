import React, {useEffect, useRef, useState} from 'react';
import {View, Text} from 'react-native';
import {useAuth} from './Auth';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import FastImage from 'react-native-fast-image';

const IntroScreen = () => {
  const auth = useAuth();
  const styles = auth.styles;
  const [step, setStep] = useState(0);
  const [touchEnabled, setTouchEnabled] = useState(false);

  const fadeInValue = useSharedValue(0);
  useEffect(() => {
    if (step === 2) {
      auth.setFirstTime(false);
    }
    if (step === 0) {
      fadeInValue.value = withDelay(
        1000,
        withTiming(1, {duration: 2000}, () => {
          runOnJS(setTouchEnabled)(true);
        }),
      );
    } else {
      fadeInValue.value = withTiming(1, {duration: 2000}, () => {
        runOnJS(setTouchEnabled)(true);
      });
    }
  }, [step]);

  const fadeOut = () => {
    if (!touchEnabled) {
      return;
    } else {
      setTouchEnabled(false);
    }
    fadeInValue.value = withTiming(0, {duration: 2000}, () => {
      runOnJS(setStep)(step + 1);
    });
  };

  const fadeText = useAnimatedStyle(() => {
    return {
      opacity: fadeInValue.value,
    };
  });

  if (step === 1) {
    return (
      <View
        onTouchStart={fadeOut}
        style={{flex: 1, justifyContent: 'center', backgroundColor: 'black'}}>
        <Animated.View
          style={[
            fadeText, // Apply fade-in animation to opacity
          ]}>
          <FastImage
            style={{
              width: '100%',
              height: '100%',
            }}
            source={require('../assets/img/Ludwig_Knaus_-_Der_Unzufriedene_(1877).jpg')}
            resizeMode={FastImage.resizeMode.contain}
          />
        </Animated.View>
      </View>
    );
  }
  return (
    <View
      onTouchStart={fadeOut}
      style={{
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'black',
      }}>
      <Animated.Text
        style={[
          styles.introText,
          fadeText, // Apply fade-in animation to opacity
        ]}>
        "This is precisely the risk modern man runs: He may wake up one day to
        find that he has missed half his life."
      </Animated.Text>
      <Animated.Text
        style={[
          styles.introSubText,
          fadeText, // Apply fade-in animation to opacity
        ]}>
        - Carl Jung, Practice of Psychotherapy
      </Animated.Text>
    </View>
  );
};

export default IntroScreen;
