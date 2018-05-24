import React from 'react';
import { Platform, Alert } from 'react-native';
import { Navigation, NativeEventsReceiver } from 'react-native-navigation';
import FCM, { FCMEvent, NotificationType, RemoteNotificationResult, WillPresentNotificationResult } from 'react-native-fcm-extension';


export default class NotificationComponent extends React.PureComponent {
    constructor (props) {
        super(props);
        this.requestPermissions = this.requestPermissions.bind(this);
        this.getToken = this.getToken.bind(this);
        this.setupListeners = this.setupListeners.bind(this);
        this.setupTokenListener = this.setupTokenListener.bind(this);
        this.onInitialNotification = this.onInitialNotification.bind(this);
        this.refreshTokenListener = null;
        this.routeAndroid = this.routeAndroid.bind(this);
        this.setSuppressId = this.setSuppressId.bind(this);
        // this.notificationListener = null;
    }

    componentDidMount () {
        this.requestPermissions();
        this.getToken();
        this.setupTokenListener();
        this.setupListeners();
        if (Platform.OS === 'android') this.routeAndroid();
        FCM.setBadgeNumber(0);
        FCM.getInitialNotification().then(this.onInitialNotification);
        FCM.removeAllDeliveredNotifications();
    }

    componentWillUnmount () {
        // stop listening for events
        // this.notificationListener.remove();
        this.refreshTokenListener.remove();
    }

    onInitialNotification (notification) {
        // console.log('Tweedl FCM The Initial notification is:', notification);
    }

    getToken () {
        FCM.getFCMToken().then((token) => {
            console.log(token);
            if(Platform.os == 'android'){
               // store.dispatch(AppActions.updateDeviceToken(token, 'Android'));
            } else {
               // store.dispatch(AppActions.updateDeviceToken(token, 'iOS'));
            }
            // store.dispatch(AppActions.updateDeviceToken(token, 'iOS'));
            // Alert.alert('Token', token);
        });
    }

    setSuppressId(id) {
        FCM.setSuppressId(id);
    }

    navigate (notif) {
        if (notif && notif.routeName) {
            Navigation.handleDeepLink({
                link: notif.routeName,
                payload : notif,
            });
        }
    }

    async getInboxKeyCount (key) {
        const count = await FCM.getInboxKeyCount(key).then((count) => {
            FCM.removeAllDeliveredNotifications();
            return count;
        });
        return count;
    }

    setupListeners () {
        this.notificationListener = FCM.on(FCMEvent.Notification, async (notif) => {
            console.log('Tweedl FCM Received Notification', notif);
            // there are two parts of notif. notif.notification contains the notification payload, notif.data contains data
            // payload
            if (notif.local_notification) {
                // this is a local notification
                console.log('Tweedl FCM Local Notification', notif);
            }
            if (notif.opened_from_tray && notif.pd && Platform.OS === 'android') {
                console.log('Notification opened from tray:', notif.routeName, notif.pd);
                this.navigate(JSON.parse(notif.pd));
            }

            if (notif.data && notif.data.notificationData) {
                // FCM.presentLocalNotification({
                //     ...notif.data.notificationData,
                // });
                console.log('The notification data is', notif.data);
            }

            if (notif.payloadId) await PayloadUtils.save(notif.payloadId, notif.payloadData);

            if (Platform.OS === 'ios') {
                // optional
                // iOS requires developers to call completionHandler to end notification process. If you do not call it your
                // background remote notifications could be throttled, to read more about it see the above documentation link.
                // This library handles it for you automatically with default behavior (for remote notification, finish with
                // NoData; for WillPresent, finish depend on "show_in_foreground"). However if you want to return different
                // result, follow the following code to override notif._notificationType is available for iOS platfrom
                switch (notif._notificationType) {
                    case NotificationType.Remote:
                        console.log('Tweedl FCM Remote Notification:', notif);
                        notif.finish(RemoteNotificationResult.NewData); // other types available:
                        // RemoteNotificationResult.NewData,
                        // RemoteNotificationResult.ResultFailed
                        break;
                    case NotificationType.NotificationResponse:
                        notif.finish();
                        break;
                    case NotificationType.WillPresent:
                        notif.finish(WillPresentNotificationResult.All); // other types available:
                        // WillPresentNotificationResult.None
                        break;
                    default:
                        break;
                }
            }
        });
    }

    setupTokenListener () {
        this.refreshTokenListener = FCM.on(FCMEvent.RefreshToken, (token) => {
            console.log('fcm_device_token_is: ', token);
           // store.dispatch(AppActions.updateDeviceToken(token));
            // fcm token may not be available on first load, catch it here
        });
    }

    routeAndroid() {
        try {
            this.routeListener = FCM.on(FCMEvent.NotificationRoute, async(notif) => {
                const { routeName } = JSON.parse(notif.pd);
                console.log(`the route is ${routeName}`);
                if (routeName) {
                    console.log('going to handle deeplink');
                    Navigation.handleDeepLink({
                        link: routeName,
                        payload : JSON.parse(notif.pd),
                    });
                }
            });
        } catch (err) {
            log.error(err.message, err, ErrorType.NOTIFICATION);
        }
    }

    requestPermissions () {
        if (Platform.OS === 'ios') FCM.requestPermissions();
    }

    testLocalNotification () {
        FCM.presentLocalNotification({
            id                : 'UNIQ_ID_STRING',                               // (optional for instant notification)
            title             : 'My Notification Title',                     // as FCM payload
            body              : 'My Notification Message',                    // as FCM payload (required)
            sound             : 'default',                                   // as FCM payload
            priority          : 'high',                                   // as FCM payload
            click_action      : 'ACTION',                             // as FCM payload
            badge             : 10,                                          // as FCM payload IOS only, set 0 to clear badges
            number            : 10,                                         // Android only
            ticker            : 'My Notification Ticker',                   // Android only
            auto_cancel       : true,                                  // Android only (default true)
            large_icon        : 'ic_launcher',                           // Android only
            icon              : 'ic_launcher',                                // as FCM payload, you can relace this with custom
            // icon you put in mipmap
            big_text          : 'Show when notification is expanded',     // Android only
            sub_text          : 'This is a subText',                      // Android only
            color             : 'red',                                       // Android only
            vibrate           : 300,                                       // Android only default: 300, no vibration if you pass
            // null
            tag               : 'some_tag',                                    // Android only
            group             : 'group',                                     // Android only
            picture           : 'http://icons.iconarchive.com/icons/graphicloads/100-flat/256/home-icon.png',                      // Android only bigPicture style
            my_custom_data    : 'my_custom_field_value',             // extra data you want to throw
            lights            : true,                                       // Android only, LED blinking (default false)
            show_in_foreground: true,                                  // notification when app is in foreground (local & remote)
        });
    }

    render () {
        return null;
    }
}

// PushNotification.configure({
//     onRegister (token) {
//         if (Platform.OS !== 'ios') {
//             console.log('Tweedl FCM TOKEN:', token);
//             store.dispatch(AppActions.updateDeviceToken(token.token));
//         }
//     },
//     async onNotification (notification) {
//         if (notification.userInteraction) {
//             // PushNotification.cancelAllLocalNotifications();
//             // store.dispatch(AppActions.pushNavigate(notification.routeName, notification.routeParams));
//             if (notification.routeName) Navigation.handleDeepLink({ link: notification.routeName });
//             if (notification.data && notification.data.routeName) Navigation.handleDeepLink({ link:
// notification.data.routeName }); Navigation.dismissInAppNotification(); } else { console.log('Tweedl FCM Received the notification:',
// notification); const { payloadId, payloadData, schemaVersion } = notification; const res = await PayloadUtils.save(payloadId,
// payloadData); return res; } }, senderID: '889873665066', permissions: { alert: true, badge: true, sound: true, },
// popInitialNotification: true, requestPermissions: false, });

// let NotificationComponent = () => null;

// if (Platform.OS === 'ios') {
//     const mapDispatchToProps = dispatch => bindActionCreators({
//         updateDeviceToken: AppActions.updateDeviceToken,
//         parsePayload: Payload.parsePayload,
//     }, dispatch);

//     class VoipNotificationComponent extends React.PureComponent {

//         constructor (props) {
//             super(props);
//             this.saveDeviceToken = this.saveDeviceToken.bind(this);
//             this.onNotification = this.onNotification.bind(this);
//         }

//         componentDidMount () {
//             VoipPushNotification.addEventListener('register', token => this.saveDeviceToken(token));
//             VoipPushNotification.addEventListener('notification', notification => this.onNotification(notification));
//             VoipPushNotification.requestPermissions({ alert: true, badge: true, sound: true });
//         }

//         componentWillUnmount () {
//             VoipPushNotification.removeEventListener('register', this.saveDeviceToken);
//             VoipPushNotification.removeEventListener('notification', this.onNotification);
//         }

//         async onNotification (notification) {
//             if (VoipPushNotification.wakeupByPush) {
//                 VoipPushNotification.wakeupByPush = false;
//             }
//             console.log('The notification is:');
//             console.log(notification);
//             const { payloadId, payloadData, schemaVersion } = notification.getData();
//             const res = await PayloadUtils.save(payloadId, payloadData);
//             return res;
//             // this.props.parsePayload({ id: payloadId, data: JSON.parse(payloadData), schemaVersion });
//         }

//         saveDeviceToken (token) {
//             console.log('Tweedl FCM VOIP Token:', token);
//             this.props.updateDeviceToken(token);
//         }

//         render () {
//             return null;
//         }
//     }

//     NotificationComponent = connect(null, mapDispatchToProps)(VoipNotificationComponent);
// }

// export default NotificationComponent;
