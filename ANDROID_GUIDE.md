# Building for Android (Native App)

This project is set up as a Progressive Web App (PWA), which means it can be installed on Android devices directly from the browser. However, if you want to build a true native APK/AAB for the Play Store, follow these steps using **Capacitor**.

## Prerequisites
- Node.js installed
- Android Studio installed (for building the APK)

## Steps

1.  **Initialize Capacitor**
    Open a terminal in the project root and run:
    ```bash
    npm init -y
    npm install @capacitor/core @capacitor/cli @capacitor/android
    npx cap init "Touhou 6 Clone" com.touhou6.clone --web-dir=.
    ```

2.  **Add Android Platform**
    ```bash
    npx cap add android
    ```

3.  **Sync Project**
    Every time you make changes to the web code (js/css/html), run:
    ```bash
    npx cap sync
    ```

4.  **Open in Android Studio**
    ```bash
    npx cap open android
    ```

5.  **Build APK**
    - In Android Studio, wait for Gradle sync to finish.
    - Go to **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
    - The APK will be generated in `android/app/build/outputs/apk/debug/`.

## Mobile Features Implemented
- **Touch Controls**: On-screen D-Pad and Action Buttons (Shoot, Bomb, Focus, Pause) automatically appear on touch devices.
- **Responsive Scaling**: The game scales to fit the screen width while maintaining aspect ratio.
- **PWA Support**: `manifest.json` and Service Worker are included for "Add to Home Screen" functionality.
