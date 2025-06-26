import { Stack } from 'expo-router';
import React from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import RecommendationsSection from '../../components/RecommendationsSection';

export default function DemoRecommendationsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Демо рекомендаций',
          headerStyle: {
            backgroundColor: '#F2F2F7',
          },
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: '600',
          },
        }} 
      />
      <View style={styles.content}>
        {/* Полная версия рекомендаций */}
        <RecommendationsSection />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  content: {
    flex: 1,
  },
}); 