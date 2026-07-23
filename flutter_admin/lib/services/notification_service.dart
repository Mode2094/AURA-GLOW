import 'package:flutter_local_notifications/flutter_local_notifications.dart';

class NotificationService {
  static final _plugin = FlutterLocalNotificationsPlugin();

  static Future<void> init() async {
    const android = AndroidInitializationSettings('@mipmap/ic_launcher');
    const ios = DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );
    await _plugin.initialize(const InitializationSettings(android: android, iOS: ios));
    await _plugin.resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>()?.requestNotificationsPermission();
  }

  static Future<void> show({required String title, required String body}) async {
    await _plugin.show(
      DateTime.now().millisecondsSinceEpoch ~/ 1000,
      title, body,
      const NotificationDetails(
        android: AndroidNotificationDetails(
          'aura_orders', 'AURA GLOW',
          channelDescription: 'إشعارات الطلبات',
          importance: Importance.high,
          priority: Priority.high,
          playSound: true,
          enableVibration: true,
        ),
        iOS: DarwinNotificationDetails(presentAlert: true, presentBadge: true, presentSound: true),
      ),
    );
  }
}
