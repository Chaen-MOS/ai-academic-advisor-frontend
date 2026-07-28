import React from 'react';
import {Image, StyleSheet, View} from 'react-native';

import {colors} from '../../theme';

const academicHero = require('../../assets/academic-hero.png');

type AuthHeroProps = {
  height: number;
};

export function AuthHero({height}: AuthHeroProps) {
  return (
    <View style={[styles.hero, {height}]}>
      <Image
        accessibilityIgnoresInvertColors
        source={academicHero}
        style={styles.image}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: colors.lightCard,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});
