/* eslint-disable react/no-unstable-nested-components */
import { Ionicons } from '@expo/vector-icons';
import { Link, Redirect, SplashScreen, Tabs, useRouter } from 'expo-router';
import React, { useCallback, useEffect } from 'react';
import Animated, { useAnimatedStyle, useSharedValue, withSpring,withTiming } from 'react-native-reanimated';

import { useAuth, useIsFirstTime } from '@/core';
import { Pressable, Text } from '@/ui';

function AnimatedTabBarIcon({ name, color, focused }: { name: keyof typeof Ionicons.glyphMap; color: string; focused: boolean }) {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: withTiming(focused ? 1.15 : 1,{duration:300}) }],
    };
  });

  return (
    <Animated.View style={animatedStyle}>
      <Ionicons name={name} size={24} color={color} />
    </Animated.View>
  );
}

function AnimatedAddButton() {
  const scale = useSharedValue(1);
  const router = useRouter();

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePress = () => {
    scale.value = withSpring(1.05, { damping: 2, stiffness: 80 }, () => {
      scale.value = withSpring(1);
    });
    // 动画完成后导航到 "add" 页面
    setTimeout(() => {
      router.push('/add');
    }, 80);
  };

  return (
    <Pressable 
      onPress={handlePress} 
    >
      <Animated.View style={[{
        backgroundColor: '#FFD700', 
        borderRadius: 30, 
        height: 60, 
        width: 60, 
        justifyContent: 'center', 
        alignItems: 'center',
        marginBottom: 30,
      }, animatedStyle]}>
          <Ionicons name="add" size={35} color="white" />
      </Animated.View> 
    </Pressable>

  );
}

export default function TabLayout() {
  const status = useAuth.use.status();
  const [isFirstTime] = useIsFirstTime();
  const hideSplash = useCallback(async () => {
    await SplashScreen.hideAsync();
  }, []);
  useEffect(() => {
    if (status !== 'idle') {
      setTimeout(() => {
        hideSplash();
      }, 1000);
    }
  }, [hideSplash, status]);

  if (isFirstTime) {
    return <Redirect href="/onboarding" />;//教学
  }
  if (status === 'signOut') {
    return <Redirect href="/login" />;
  }
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#FFA700',
        tabBarInactiveTintColor: '#999999',
        tabBarStyle: { backgroundColor: '#FFFFFF',height:57 },
        tabBarLabelStyle: {
          marginBottom: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Details',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabBarIcon name="list-outline" color={color} focused={focused} />
          ),
          tabBarLabel: 'Details',
        }}
      />
      <Tabs.Screen
        name="chart"
        options={{
          title: 'Chart',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabBarIcon name="bar-chart-outline" color={color} focused={focused} />
          ),
          tabBarLabel: 'Chart',
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: 'add',
          tabBarIcon: () => <AnimatedAddButton />,
          headerRight: () => <CreateNewPostLink />,
          tabBarLabel: 'Add',
          tabBarTestID: 'Add-tab',
        }}
      />
      <Tabs.Screen
        name="report"
        options={{
          title: 'Report',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabBarIcon name="document-outline" color={color} focused={focused} />
          ),
          tabBarLabel: 'Report',
          tabBarTestID: 'Report-tab',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabBarIcon name="settings-outline" color={color} focused={focused} />
          ),
          tabBarLabel: 'Settings',
          tabBarTestID: 'Settings-tab',
        }}
      />
    </Tabs>
  );
}

const CreateNewPostLink = () => {
  return (
    <Link href="/feed/add-post" asChild>
      <Pressable>
        <Text className="px-3 text-primary-300">Create</Text>
      </Pressable>
    </Link>
  );
};

