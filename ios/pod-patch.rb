#!/usr/bin/env ruby

# Патч для решения конфликта версий SDWebImageWebPCoder
# между expo-image и react-native-fast-image

require 'pathname'

def patch_rn_fast_image_for_web_p_support
  project_root = Pathname.new(File.dirname(__FILE__)).parent
  podfile_path = project_root.join('node_modules/react-native-fast-image/ios/FastImage/FLAnimatedImageView+Priority.m')
  
  puts "Patching RNFastImage to resolve SDWebImageWebPCoder conflict..."
  
  # Специфичные для RNFastImage настройки
  post_install do |installer|
    installer.pods_project.targets.each do |target|
      if target.name == 'RNFastImage'
        target.build_configurations.each do |config|
          # Принудительно устанавливаем версию SDWebImageWebPCoder, совместимую с expo-image
          config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] ||= ['$(inherited)']
          config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] << 'SD_WEBP=1'
        end
      end
    end
  end
end

# Вызываем функцию патча
patch_rn_fast_image_for_web_p_support
