import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { BRAND_PRIMARY } from '@/constants/brand';

export default function BrandHeader() {
  return (
    <View style={styles.bar}>
      <Image
        source={require('../../assets/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: BRAND_PRIMARY,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  logo: {
    height: 16,
    width: 144,
  },
});
