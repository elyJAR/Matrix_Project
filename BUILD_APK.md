# How to Build the APK for Matrix Machine Learning

We have set up your project to be built as an Android App using **Capacitor**.

## Prerequisites
You must have **Android Studio** installed on your computer.
[Download Android Studio](https://developer.android.com/studio) if you haven't already.

## Steps to Build APK

1.  **Open the Android Project**
    - Open **Android Studio**.
    - Select **Open**.
    - Navigate to your project folder: `c:\Users\Elyjah\Documents\Matrix_Machine_Learning\android`.
    - Click **OK**.

2.  **Wait for Sync**
    - Android Studio will take a few minutes to sync Gradle and index the project. Wait until the loading bars at the bottom finish.

3.  **Build the APK**
    - In the top menu, go to **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
    - Wait for the build to complete.

4.  **Locate the APK**
    - Once finished, a notification will appear in the bottom right: "APK(s) generated successfully".
    - Click **locate** to open the folder containing your `app-debug.apk`.
    - You can transfer this file to your phone and install it!

## Development Customization
- **Change App Icon**: Replace the icons in `android/app/src/main/res/mipmap-*` folders.
- **Change App Name**: Edit `android/app/src/main/res/values/strings.xml`.

## Updating the App
If you make changes to your React/Vite code, run the following commands in your terminal to update the Android project:
```bash
npm run build
npx cap sync
```
Then build the APK again in Android Studio.
