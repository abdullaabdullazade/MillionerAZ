import { Stack } from 'expo-router';
import React from 'react';

import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Stack
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        
      }}
      >
      <Stack.Screen
        name="index"/>
        <Stack.Screen
      name="welcome" options={{animation:'slide_from_bottom'}}/>
        <Stack.Screen
      name="finishgame" options={{animation:'slide_from_bottom'}}/>
  </Stack>
  );
}
