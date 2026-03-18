import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { deviceApi } from '@/api/device';

export const useNotifications = () => {
    const registerForPushNotifications = async (userId: number, authToken: string) => {
        // 1. Check if the app is running on a physical device
        if (!Device.isDevice) {
            console.log("[Notifications] Must use physical device for Push Notifications");
            return;
        }

        try {
            // 2. request permissions
            const { status: existingStatus} = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.log("[Notifications] Permission not granted");
            return;
        }

        // 3. get Project ID from app.json
        const projectId = Constants?.expoConfig?.extra?.eas?.projectId ??
                        Constants?.easConfig?.projectId;
        
        if (!projectId) {
            console.error("[Notifications] Project ID not found in app.json");
            return;
        }

        // 4. Get the Expo Push Token
        const expoToken = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
        console.log("[Notifications] Token generated:", expoToken);

        // 5. Call register API
        await deviceApi.register(
            {
                user_id: userId,
                expo_push_token: expoToken,
                platform: Platform.OS,
            },
            authToken // Pass the auth token for API authentication
        );

        console.log("[Notifications] Device registered to backend successfully");
    } catch (error) {
        console.error("[Notifications] Registration Error:", error);
    }
};

    return { registerForPushNotifications };
};