import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { useTranslation } from '../i18n/i18n';
import { Ionicons } from '@expo/vector-icons';

interface PortionSizeModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (data: PortionData) => void;
  productName?: string;
}

export interface PortionData {
  portionSize: 'small' | 'regular' | 'large';
  quantity: number;
  quantityEaten: 'all' | 'half' | 'quarter';
  addons: {
    sauce: number;
    sugar: number;
    oil: number;
  };
}

/**
 * Компонент модального окна для выбора размера порции и добавок
 */
const PortionSizeModal: React.FC<PortionSizeModalProps> = ({ visible, onClose, onConfirm, productName }) => {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Состояния
  const [selectedPortion, setSelectedPortion] = useState<'small' | 'regular' | 'large'>('regular');
  const [selectedQuantity, setSelectedQuantity] = useState<'all' | 'half' | 'quarter'>('all');
  const [quantity, setQuantity] = useState(1);
  const [addons, setAddons] = useState({
    sauce: 0, // количество порций соуса
    sugar: 0, // количество порций сахара
    oil: 0,  // количество порций масла
  });

  // Функция для увеличения счетчика
  const increment = (type: 'quantity' | 'sauce' | 'sugar' | 'oil') => {
    if (type === 'quantity') {
      if (quantity < 10) setQuantity(quantity + 1);
    } else {
      setAddons(prev => ({
        ...prev,
        [type]: prev[type] < 5 ? prev[type] + 1 : prev[type]
      }));
    }
  };

  // Функция для уменьшения счетчика
  const decrement = (type: 'quantity' | 'sauce' | 'sugar' | 'oil') => {
    if (type === 'quantity') {
      if (quantity > 1) setQuantity(quantity - 1);
    } else {
      setAddons(prev => ({
        ...prev,
        [type]: prev[type] > 0 ? prev[type] - 1 : 0
      }));
    }
  };

  // Отображение калорий для добавок
  const getAddonCalories = (type: 'sauce' | 'sugar' | 'oil') => {
    const caloriesPerUnit = {
      sauce: 30,
      sugar: 12,
      oil: 45
    };
    
    return addons[type] * caloriesPerUnit[type];
  };

  // Функция для отправки данных
  const handleConfirm = () => {
    onConfirm({
      portionSize: selectedPortion,
      quantity: quantity,
      quantityEaten: selectedQuantity,
      addons: addons
    });
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalView, isDark && styles.darkModalView]}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <Ionicons name="close" size={24} color={isDark ? '#FFFFFF' : '#000000'} />
          </TouchableOpacity>
          
          <Text style={[styles.modalTitle, isDark && styles.darkText]}>
            {t('product.setPortionTitle')}
          </Text>

          {/* Количество */}
          <Text style={[styles.modalSectionTitle, isDark && styles.darkText]}>
            {t('common.quantity') || 'Количество'}
          </Text>
          <View style={styles.counterContainer}>
            <TouchableOpacity 
              style={[styles.counterButton, isDark && styles.darkCounterButton]}
              onPress={() => decrement('quantity')}
            >
              <Ionicons name="remove" size={16} color={isDark ? '#CCC' : '#555'} />
            </TouchableOpacity>
            <Text style={[styles.counterText, isDark && styles.darkText]}>{quantity}</Text>
            <TouchableOpacity 
              style={[styles.counterButton, isDark && styles.darkCounterButton]}
              onPress={() => increment('quantity')}
            >
              <Ionicons name="add" size={16} color={isDark ? '#CCC' : '#555'} />
            </TouchableOpacity>
          </View>

          {/* Размер порции */}
          <Text style={[styles.modalSectionTitle, isDark && styles.darkText]}>
            {t('product.portionSize')}
          </Text>
          <View style={styles.optionsRow}>
            {[
              { key: 'small', label: t('product.portions.маленький') },
              { key: 'regular', label: t('product.portions.обычный') },
              { key: 'large', label: t('product.portions.большой') }
            ].map((portion) => (
              <TouchableOpacity
                key={portion.key}
                style={[
                  styles.segmentOption,
                  selectedPortion === portion.key && styles.selectedSegmentOption,
                  isDark && styles.darkOptionItem
                ]}
                onPress={() => setSelectedPortion(portion.key as 'small' | 'regular' | 'large')}
              >
                <Text 
                  style={[
                    styles.segmentText,
                    selectedPortion === portion.key && styles.selectedSegmentText,
                    isDark && styles.darkText
                  ]}
                >
                  {portion.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {/* Съеденное количество */}
          <Text style={[styles.modalSectionTitle, isDark && styles.darkText]}>
            {t('product.quantityEaten')}
          </Text>
          <View style={styles.optionsRow}>
            {[
              { key: 'all', label: t('product.quantities.все') },
              { key: 'half', label: t('product.quantities.половина') },
              { key: 'quarter', label: t('product.quantities.четверть') }
            ].map((qty) => (
              <TouchableOpacity
                key={qty.key}
                style={[
                  styles.segmentOption,
                  selectedQuantity === qty.key && styles.selectedSegmentOption,
                  isDark && styles.darkOptionItem
                ]}
                onPress={() => setSelectedQuantity(qty.key as 'all' | 'half' | 'quarter')}
              >
                <Text 
                  style={[
                    styles.segmentText,
                    selectedQuantity === qty.key && styles.selectedSegmentText,
                    isDark && styles.darkText
                  ]}
                >
                  {qty.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Добавки */}
          <Text style={[styles.modalSectionTitle, isDark && styles.darkText]}>
            {t('product.addons') || 'Добавки'}
          </Text>
          
          {/* Соус */}
          <View style={styles.addonRow}>
            <View style={styles.addonInfo}>
              <Text style={[styles.addonText, isDark && styles.darkText]}>
                {t('product.sauce') || 'Соус'}
              </Text>
              <Text style={[styles.caloriesText, isDark && styles.darkCaloriesText]}>
                +{getAddonCalories('sauce')} {t('nutrition.kcal')}
              </Text>
            </View>
            <View style={styles.counterContainer}>
              <TouchableOpacity 
                style={[styles.counterButton, isDark && styles.darkCounterButton]}
                onPress={() => decrement('sauce')}
              >
                <Ionicons name="remove" size={16} color={isDark ? '#CCC' : '#555'} />
              </TouchableOpacity>
              <Text style={[styles.counterText, isDark && styles.darkText]}>{addons.sauce}</Text>
              <TouchableOpacity 
                style={[styles.counterButton, isDark && styles.darkCounterButton]}
                onPress={() => increment('sauce')}
              >
                <Ionicons name="add" size={16} color={isDark ? '#CCC' : '#555'} />
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Сахар */}
          <View style={styles.addonRow}>
            <View style={styles.addonInfo}>
              <Text style={[styles.addonText, isDark && styles.darkText]}>
                {t('product.sugar') || 'Сахар'}
              </Text>
              <Text style={[styles.caloriesText, isDark && styles.darkCaloriesText]}>
                +{getAddonCalories('sugar')} {t('nutrition.kcal')}
              </Text>
            </View>
            <View style={styles.counterContainer}>
              <TouchableOpacity 
                style={[styles.counterButton, isDark && styles.darkCounterButton]}
                onPress={() => decrement('sugar')}
              >
                <Ionicons name="remove" size={16} color={isDark ? '#CCC' : '#555'} />
              </TouchableOpacity>
              <Text style={[styles.counterText, isDark && styles.darkText]}>{addons.sugar}</Text>
              <TouchableOpacity 
                style={[styles.counterButton, isDark && styles.darkCounterButton]}
                onPress={() => increment('sugar')}
              >
                <Ionicons name="add" size={16} color={isDark ? '#CCC' : '#555'} />
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Масло */}
          <View style={styles.addonRow}>
            <View style={styles.addonInfo}>
              <Text style={[styles.addonText, isDark && styles.darkText]}>
                {t('product.oil') || 'Масло'}
              </Text>
              <Text style={[styles.caloriesText, isDark && styles.darkCaloriesText]}>
                +{getAddonCalories('oil')} {t('nutrition.kcal')}
              </Text>
            </View>
            <View style={styles.counterContainer}>
              <TouchableOpacity 
                style={[styles.counterButton, isDark && styles.darkCounterButton]}
                onPress={() => decrement('oil')}
              >
                <Ionicons name="remove" size={16} color={isDark ? '#CCC' : '#555'} />
              </TouchableOpacity>
              <Text style={[styles.counterText, isDark && styles.darkText]}>{addons.oil}</Text>
              <TouchableOpacity 
                style={[styles.counterButton, isDark && styles.darkCounterButton]}
                onPress={() => increment('oil')}
              >
                <Ionicons name="add" size={16} color={isDark ? '#CCC' : '#555'} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Кнопки действий */}
          <TouchableOpacity
            style={[styles.confirmButton, isDark && styles.darkConfirmButton]}
            onPress={handleConfirm}
          >
            <Text style={styles.confirmButtonText}>{t('product.confirmAndAdd')}</Text>
          </TouchableOpacity>


        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '100%',
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    padding: 20,
    paddingTop: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    position: 'absolute',
    bottom: 0,
  },
  closeButton: {
    position: 'absolute',
    left: 15,
    top: 15,
    zIndex: 10,
  },
  darkModalView: {
    backgroundColor: '#1E1E1E',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    alignSelf: 'flex-start',
    marginTop: 15,
    marginBottom: 10,
    color: '#333',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 15,
  },
  segmentOption: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    marginHorizontal: 4,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedSegmentOption: {
    backgroundColor: '#007AFF',
  },
  darkOptionItem: {
    backgroundColor: '#333333',
  },
  segmentText: {
    color: '#333',
    fontWeight: '500',
    fontSize: 14,
  },
  selectedSegmentText: {
    color: 'white',
  },
  darkText: {
    color: 'white',
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  counterButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  darkCounterButton: {
    backgroundColor: '#333333',
  },
  counterText: {
    fontSize: 16,
    fontWeight: '500',
    minWidth: 30,
    textAlign: 'center',
  },
  addonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
  },
  addonInfo: {
    flex: 1,
  },
  addonText: {
    fontSize: 16,
    fontWeight: '400',
  },
  caloriesText: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },
  darkCaloriesText: {
    color: '#AAA',
  },
  confirmButton: {
    backgroundColor: '#007BFF',
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    alignItems: 'center',
    width: '100%',
  },
  darkConfirmButton: {
    backgroundColor: '#0A84FF',
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default PortionSizeModal;
