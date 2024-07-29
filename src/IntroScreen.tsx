import React, {useEffect, useState} from 'react';
import {View, SafeAreaView} from 'react-native';
import {useAuth} from './context/Auth';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import FastImage from 'react-native-fast-image';
import COLOURS from '../constants/colours';
import {Button} from './components/Button';
import {Text as EasyText} from './components/Button';

const IntroScreen = () => {
  const auth = useAuth();
  const styles = auth.styles;
  const [step, setStep] = useState(0);
  const [touchEnabled, setTouchEnabled] = useState(false);

  const fadeInValue = useSharedValue(0);
  useEffect(() => {
    if (step === 3) {
      auth.setFirstTime(false);
    }
    if (step === 2) {
      fadeInValue.value = withTiming(1, {duration: 600});
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

  if (step === 3) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: auth.dark ? COLOURS.black : COLOURS.white,
        }}
      />
    );
  }

  if (step === 2) {
    return (
      <SafeAreaView
        style={{flex: 1, justifyContent: 'center', backgroundColor: 'black'}}>
        <Animated.View
          style={{
            flex: 1,
            alignItems: 'center',
            backgroundColor: auth.dark ? COLOURS.black : COLOURS.white,
            opacity: fadeInValue,
          }}>
          <EasyText
            darkbg={auth.dark}
            size={24}
            font={'P'}
            style={{paddingTop: '20%'}}>
            How to Find Time
          </EasyText>
          <View style={{width: '90%', paddingTop: '20%', paddingBottom: '5%'}}>
            <EasyText
              darkbg={auth.dark}
              size={18}
              font={'G'}
              style={{paddingBottom: '5%'}}>
              1. Press the ‘+’ button to create a new availability selection.
            </EasyText>
            <EasyText
              darkbg={auth.dark}
              size={18}
              font={'G'}
              style={{paddingBottom: '5%'}}>
              2. Fill out your availabile time for the foreseeable future. The
              next week will always be a copy of the previous week unless you
              make changes to it.
            </EasyText>
            <EasyText darkbg={auth.dark} size={18} font={'G'}>
              3. Join or create a group to see where you align with others.
            </EasyText>
          </View>

          <EasyText
            darkbg={auth.dark}
            size={18}
            font={'G'}
            style={{textAlign: 'center', width: '100%'}}>
            That's it!
          </EasyText>

          <Button
            title={'Start Finding Time'}
            containerStyle={{position: 'absolute', bottom: '12%'}}
            onPress={() => {
              setStep(3);
            }}
          />
        </Animated.View>
      </SafeAreaView>
    );
  }

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
