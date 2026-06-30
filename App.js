import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import HomeScreen from './src/screens/HomeScreen';
import { palette } from './src/constants/theme';

export default function App() {
  return (
    <SafeAreaView style={styles.rootContainer}>
      <StatusBar backgroundColor={palette.brandMain} barStyle="light-content" />
      <HomeScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    backgroundColor: palette.screenBg,
    flex: 1
  }
});