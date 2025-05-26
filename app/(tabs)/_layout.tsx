import { Tabs } from 'expo-router';
import React from 'react';
import CustomTabBar from '../../components/CustomTabBar'; // Путь к нашему кастомному таб-бару

export default function TabLayout() {
  return (
    <Tabs 
      tabBar={props => <CustomTabBar {...props} />} // Используем кастомный таб-бар
      screenOptions={{
        headerShown: false, // Скрываем стандартный заголовок для всех экранов табов
      }}
    >
      <Tabs.Screen
        name="main01" // Имя файла без расширения
        options={{
          // Опции для экрана main01 (например, иконка для стандартного таб-бара, если бы он использовался)
          // title: 'Dashboard', 
        }}
      />
      <Tabs.Screen
        name="diets" // Имя файла без расширения
        options={{
          // title: 'Diets', 
        }}
      />
       {/* Пустая вкладка для центральной кнопки, если бы она была частью таб-бара*/}
       {/* 
       <Tabs.Screen 
        name="scan-placeholder" 
        component={() => null} // Пустой компонент
        options={{ tabBarButton: () => null }} // Скрываем кнопку таба
       /> 
       */}
      <Tabs.Screen
        name="allergens" // Имя файла без расширения
        options={{
          // title: 'Allergens',
        }}
      />
      <Tabs.Screen
        name="history" // Имя файла без расширения
        options={{
          // title: 'History',
        }}
      />
    </Tabs>
  );
} 