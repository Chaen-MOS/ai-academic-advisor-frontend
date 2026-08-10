import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  View,
} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import ChatHistoryScreen from '../screens/ChatHistoryScreen';
import ContactAdvisorScreen from '../screens/ContactAdvisorScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import HomeScreen from '../screens/HomeScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import LecturerPortalScreen from '../screens/LecturerPortalScreen';
import AdminPortalScreen from '../screens/AdminPortalScreen';
import type {RootStackParamList} from '../types/navigation';
import {useAuth} from '../contexts/AuthContext';
import {colors} from '../theme';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';
import MyTimetableScreen from '../screens/MyTimetableScreen';


const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const {
    session,
    isLoading,
    isPasswordRecovery,
    role,
    isRoleLoading,
  } = useAuth();

  if (
    isLoading ||
    (session &&
      !isPasswordRecovery &&
      isRoleLoading)
  ) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator
          size="large"
          color={colors.accent}
        />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      {isPasswordRecovery ? (
        <Stack.Screen
          name="ResetPassword"
          component={ResetPasswordScreen}
        />
      ) : session ? (
        <>
          <Stack.Screen
            name="Home"
            component={HomeScreen}
          />

          <Stack.Screen
            name="ChatHistory"
            component={ChatHistoryScreen}
          />

          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
          />

          <Stack.Screen
            name="Notifications"
            component={NotificationsScreen}
          />

          <Stack.Screen
            name="ContactAdvisor"
            component={ContactAdvisorScreen}
          />

          <Stack.Screen
            name="EditProfile"
            component={EditProfileScreen}
          />

          <Stack.Screen
            name="MyTimetable"
            component={MyTimetableScreen}
          />
          
          {role === 'LECTURER' && (
            <Stack.Screen
              name="LecturerPortal"
              component={LecturerPortalScreen}
            />
          )}

          {role === 'ADMIN' && (
            <Stack.Screen
              name="AdminPortal"
              component={AdminPortalScreen}
            />
            
          )}
        </>
      ) : (
        <>
          <Stack.Screen
            name="Login"
            component={LoginScreen}
          />

          <Stack.Screen
            name="SignUp"
            component={SignUpScreen}
          />

          <Stack.Screen
            name="ForgotPassword"
            component={ForgotPasswordScreen}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});