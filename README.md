# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

## Deploy with EAS

This project is configured for Expo Application Services (EAS):

- `eas.json` profiles are ready for `development`, `preview`, and `production`
- EAS Workflows are defined in `.eas/workflows/`

### 1. One-time setup

1. Login to Expo

    ```bash
    npx eas login
    ```

2. Initialize EAS in the project (creates project link and IDs)

    ```bash
    npx eas init
    ```

3. Set your app identifiers in `app.json` before first store build:

- `expo.ios.bundleIdentifier`
- `expo.android.package`

### 2. Build store binaries

- Android (AAB):

   ```bash
   npm run eas:build:android
   ```

- iOS (IPA):

   ```bash
   npm run eas:build:ios
   ```

### 3. Submit to stores

- Android:

   ```bash
   npm run eas:submit:android
   ```

- iOS:

   ```bash
   npm run eas:submit:ios
   ```

### 4. Publish OTA updates

```bash
npm run eas:update:production -- --message "UI improvements"
```

### 5. EAS Workflows

Run EAS cloud workflows from Expo:

- `.eas/workflows/build-production.yml`
- `.eas/workflows/update-production.yml`

These can be triggered manually via workflow dispatch.

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
