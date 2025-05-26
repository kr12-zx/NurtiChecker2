import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur'; // Для эффекта размытия фона таб-бара
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';

// Props, которые получает tabBar компонент от expo-router
interface CustomTabBarProps {
  state: any; // Состояние навигации (routes, index)
  descriptors: any; // Описания экранов (options)
  navigation: any; // Объект навигации
}

const CustomTabBar: React.FC<CustomTabBarProps> = ({ state, descriptors, navigation }) => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const tabs = [
    { name: 'main01', label: 'Dashboard', icon: 'grid-outline', target: '/(tabs)/main01' },
    { name: 'diets', label: 'Diets', icon: 'nutrition-outline', target: '/(tabs)/diets' },
    { name: 'allergens', label: 'Allergens', icon: 'alert-circle-outline', target: '/(tabs)/allergens' },
    { name: 'history', label: 'History', icon: 'time-outline', target: '/(tabs)/history' },
  ];

  const scanButtonSize = 64;
  const tabBarHeight = 65;

  return (
    <View style={styles.tabBarContainerWrapper}>
      {/* Плавающая кнопка Scan */}
      <TouchableOpacity
        style={[styles.scanButton, { bottom: tabBarHeight - scanButtonSize / 2 }]}
        onPress={() => router.push('/scan')}
      >
        <Ionicons name="scan" size={32} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Сам таб-бар с размытым фоном */}
      <BlurView
        intensity={isDark ? 80 : 90}
        tint={isDark ? 'dark' : 'light'}
        style={[styles.tabBar, { height: tabBarHeight }]}
      >
        {tabs.map((tab, index) => {
          const { options } = descriptors[state.routes[index].key];
          const isFocused = state.index === index;
          const color = isFocused ? (isDark ? '#0A84FF' : '#007AFF') : (isDark ? '#8E8E93' : '#8E8E93');

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: state.routes[index].key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(state.routes[index].name, state.routes[index].params);
            }
          };
          
          const buttonStyle = [
            styles.tabButton,
            index === 1 && { marginRight: scanButtonSize * 0.75 },
            index === 2 && { marginLeft: scanButtonSize * 0.75 }
          ];

          return (
            <TouchableOpacity
              key={tab.name}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel || tab.label}
              testID={options.tabBarTestID}
              onPress={onPress}
              style={buttonStyle}
            >
              <Ionicons name={tab.icon as any} size={24} color={color} />
              {/* Можно добавить Text label, если нужно */}
              {/* <Text style={{ color, fontSize: 10 }}>{tab.label}</Text> */}
            </TouchableOpacity>
          );
        })}
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  tabBarContainerWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center', // Центрируем кнопку Scan
    backgroundColor: 'transparent', // Важно для видимости контента под таб-баром
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(0,0,0,0.1)', // Цвет разделителя для светлой темы
    width: '100%',
    // backgroundColor установливается через BlurView tint
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10, // Стандартный отступ сверху
    paddingBottom: 15, // Увеличили отступ снизу, чтобы поднять иконку
    height: '100%', // Убедимся, что кнопка занимает всю высоту таб-бара
  },
  scanButton: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: '#007AFF', // Цвет кнопки Scan
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    zIndex: 1, // Кнопка должна быть поверх таб-бара
  },
});

export default CustomTabBar;
