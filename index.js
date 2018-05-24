__STRESS_TEST__ = false;
import App from './src/app';
// @ts-check

import { Navigation, NativeEventsReceiver } from 'react-native-navigation';

require('./src/notification');

Promise.resolve(Navigation.isAppLaunched())
    .then((appLaunched) => {
        if (appLaunched) {
            App.start(); // App is launched -> show UI
        } else {
            new NativeEventsReceiver().appLaunched(() => App.start()); // App hasn't been launched yet -> show the UI only when needed.
        }
    });

// import App from './src/presentation';

// App.start();
