# 🚀 Сборка APK для QwikXP Messenger

## 📋 Предварительные требования

### 1. **Установите Flutter SDK:**
```bash
# Скачайте Flutter с официального сайта
# https://flutter.dev/docs/get-started/install

# Добавьте Flutter в PATH
export PATH="$PATH:`pwd`/flutter/bin"

# Проверьте установку
flutter doctor
```

### 2. **Установите Android Studio:**
- Скачайте с: https://developer.android.com/studio
- Установите Android SDK
- Создайте Android Virtual Device (AVD) для тестирования

### 3. **Настройте переменные окружения:**
```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

## 🔧 Сборка APK

### 1. **Перейдите в папку Flutter приложения:**
```bash
cd nova_messenger  # или путь к вашему Flutter проекту
```

### 2. **Получите зависимости:**
```bash
flutter pub get
```

### 3. **Проверьте, что все работает:**
```bash
flutter doctor
flutter devices
```

### 4. **Соберите APK для релиза:**
```bash
# Сборка APK
flutter build apk --release

# Или для App Bundle (рекомендуется для Google Play)
flutter build appbundle --release
```

### 5. **Найдите готовый APK:**
```
build/app/outputs/flutter-apk/app-release.apk
```

## 📱 Тестирование APK

### 1. **Установите на устройство:**
```bash
# Через ADB
adb install build/app/outputs/flutter-apk/app-release.apk

# Или скопируйте файл на устройство и установите вручную
```

### 2. **Тестирование на эмуляторе:**
```bash
# Запустите эмулятор
flutter emulators --launch <emulator_id>

# Установите APK
flutter install
```

## 🔐 Подписание APK

### 1. **Создайте keystore:**
```bash
keytool -genkey -v -keystore ~/upload-keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias upload
```

### 2. **Создайте key.properties:**
```properties
storePassword=<password>
keyPassword=<password>
keyAlias=upload
storeFile=<path to keystore>/upload-keystore.jks
```

### 3. **Настройте подписание в build.gradle:**
```gradle
android {
    ...
    signingConfigs {
        release {
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile keystoreProperties['storeFile'] ? file(keystoreProperties['storeFile']) : null
            storePassword keystoreProperties['storePassword']
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

## 📦 Оптимизация APK

### 1. **Уменьшение размера:**
```bash
# Сборка только для ARM64 (основная архитектура)
flutter build apk --release --target-platform android-arm64

# Исключение ненужных ресурсов
flutter build apk --release --split-per-abi
```

### 2. **ProGuard/R8 оптимизация:**
```gradle
android {
    buildTypes {
        release {
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

## 🚀 Развертывание

### 1. **Google Play Console:**
- Загрузите APK или App Bundle
- Заполните описание, скриншоты, иконки
- Настройте цену и доступность
- Отправьте на проверку

### 2. **Прямое распространение:**
- Разместите APK на вашем сайте
- Используйте QR-коды для скачивания
- Предоставьте прямые ссылки

## 📊 Мониторинг

### 1. **Crashlytics:**
```yaml
# pubspec.yaml
dependencies:
  firebase_crashlytics: ^3.4.8
  firebase_analytics: ^10.7.4
```

### 2. **Аналитика:**
- Firebase Analytics
- Google Analytics
- Пользовательские метрики

## 🔧 Устранение проблем

### 1. **Ошибки сборки:**
```bash
# Очистка кэша
flutter clean
flutter pub get

# Проверка зависимостей
flutter doctor -v
```

### 2. **Проблемы с подписью:**
```bash
# Проверка keystore
keytool -list -v -keystore upload-keystore.jks

# Валидация APK
jarsigner -verify -verbose -certs app-release.apk
```

## 📱 Готовый результат

После успешной сборки у вас будет:
- ✅ `app-release.apk` - готовый к установке APK
- ✅ Подписанный и оптимизированный файл
- ✅ Совместимость с Android 6.0+
- ✅ Размер ~15-25 MB
- ✅ Готовность к публикации

## 🔗 Полезные ссылки

- [Flutter Build Documentation](https://flutter.dev/docs/deployment/android)
- [Android App Signing](https://developer.android.com/studio/publish/app-signing)
- [Google Play Console](https://play.google.com/console)
- [Firebase Console](https://console.firebase.google.com/)
