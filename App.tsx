import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {AuthProvider} from './src/contexts/AuthContext';
import {RootNavigator} from './src/navigation/RootNavigator';

const linking = {
  prefixes: ['aiacademicadvisor://'],
  config: {
    screens: {
      ResetPassword: 'reset-password',
    },
  },
};

export default function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer linking={linking}>
          <RootNavigator />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}