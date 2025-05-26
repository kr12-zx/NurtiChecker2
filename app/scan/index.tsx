import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '../../i18n/i18n';

export default function ScanScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { t } = useTranslation();
  const [isTakingPhoto, setIsTakingPhoto] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  
  // Используем хук для запроса разрешений камеры
  const [permission, requestPermission] = useCameraPermissions();
  const hasPermission = permission?.granted;

  // Используем хук для запроса разрешений галереи
  const [galleryStatus, requestGalleryPermission] = ImagePicker.useMediaLibraryPermissions();
  const hasGalleryPermission = galleryStatus?.granted;

  // Автоматически запрашиваем разрешение при каждом входе на экран
  useEffect(() => {
    // Всегда запрашиваем разрешение при монтировании компонента, если оно не предоставлено
    if (permission && !permission.granted) {
      // Короткая задержка для лучшего UX
      const timer = setTimeout(() => {
        requestPermission();
      }, 500);
      
      return () => clearTimeout(timer);
    }
    
    if (galleryStatus && !galleryStatus.granted) {
      requestGalleryPermission();
    }
  }, [permission, requestPermission, galleryStatus, requestGalleryPermission]);

  const pickImage = async () => {
    try {
      // Проверяем разрешение на доступ к галерее
      if (!hasGalleryPermission) {
        await requestGalleryPermission();
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        exif: true,
        maxWidth: 1300,
        maxHeight: 1300,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        
        // Переход на экран анализа фотографии еды
        router.push({
          pathname: "/photo-analysis",
          params: { 
            imageUri: selectedImage.uri
          }
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick an image. Please try again.');
    }
  };

  const takePicture = async () => {
    if (cameraRef.current && !isTakingPhoto) {
      try {
        setIsTakingPhoto(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          exif: true,
          skipProcessing: false,
          imageType: 'jpg',
          maxWidth: 1300,
          maxHeight: 1300
        });

        // Переход на экран анализа фотографии еды
        setIsTakingPhoto(false);
        
        router.push({
          pathname: "/photo-analysis",
          params: { 
            imageUri: photo.uri
          }
        });
      } catch (error) {
        setIsTakingPhoto(false);
        Alert.alert('Error', 'Failed to take picture. Please try again.');
      }
    }
  };

  // Если разрешения еще не запрошены
  if (!permission) {
    return (
      <SafeAreaView style={[styles.container, isDark && styles.darkContainer]}>
        <Text style={[styles.text, isDark && styles.darkText]}>{t('scan.requestingPermission')}</Text>
      </SafeAreaView>
    );
  }

  // Функция для перенаправления в настройки приложения
  const openAppSettings = async () => {
    // Открываем настройки приложения
    try {
      await Linking.openSettings();
    } catch (error) {
      console.error('Не удалось открыть настройки:', error);
      Alert.alert(t('common.error'), t('scan.settingsError'));
    }
  };

  // Если разрешение не предоставлено, показываем экран с сообщением и кнопкой
  if (!hasPermission) {
    return (
      <SafeAreaView style={[styles.container, isDark && styles.darkContainer, styles.centerContainer]}>
        <Text style={[styles.text, isDark && styles.darkText, styles.messageText]}>{t('scan.noAccess')}</Text>
        
        <TouchableOpacity 
          style={styles.permissionButton}
          onPress={openAppSettings}
        >
          <Text style={styles.permissionButtonText}>{t('scan.openSettings')}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
      />
      
      {/* Overlay with scan frame */}
      <View style={styles.overlay}>
        {/* Top bar with close button */}
        <SafeAreaView style={styles.topBar}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => router.back()}
          >
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </SafeAreaView>
        
        {/* Scan frame */}
        <View style={styles.scanFrameContainer}>
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
        </View>
        
        {/* Bottom area with controls */}
        <SafeAreaView style={styles.bottomControls}>
          <Text style={styles.instructions}>
            {t('scan.positionProduct')}
          </Text>
          
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={styles.galleryButton}
              onPress={pickImage}
            >
              <Ionicons name="images" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.captureButton, isTakingPhoto && styles.disabledButton]}
              onPress={takePicture}
              disabled={isTakingPhoto}
            >
              {isTakingPhoto ? (
                <Ionicons name="hourglass-outline" size={28} color="#FFFFFF" />
              ) : (
                <View style={styles.captureButtonInner} />
              )}
            </TouchableOpacity>
            
            <View style={styles.emptySpace} />
          </View>
        </SafeAreaView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  darkContainer: {
    backgroundColor: '#000',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
  },
  messageText: {
    fontSize: 18,
    marginBottom: 20,
  },
  darkText: {
    color: '#FFFFFF',
  },
  camera: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  scanFrameContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: '85%',
    height: '80%',
    borderRadius: 12,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#FFFFFF',
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderBottomWidth: 0,
    borderRightWidth: 0,
    borderTopLeftRadius: 12,
  },
  topRight: {
    top: 0,
    right: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderTopRightRadius: 12,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderBottomLeftRadius: 12,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderBottomRightRadius: 12,
  },
  bottomControls: {
    paddingBottom: 30,
  },
  instructions: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  emptySpace: {
    width: 50,
    height: 50,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFFFFF',
  },
  disabledButton: {
    opacity: 0.7,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  processingIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  galleryButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionButton: {
    marginTop: 20,
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 