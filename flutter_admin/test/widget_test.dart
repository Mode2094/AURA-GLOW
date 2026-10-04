import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aura_glow_admin/main.dart';

void main() {
  test('لوحة التحكم مضبوطة على اللغة العربية', () {
    expect(appLocale.languageCode, 'ar');
    expect(appSupportedLocales.first.languageCode, 'ar');
    expect(appSupportedLocales.map((l) => l.languageCode), contains('ar'));
  });

  test('تفويضات الترجمة الخاصة بـ Material مفعّلة', () {
    expect(appLocalizationsDelegates, isNotEmpty);
    expect(appLocalizationsDelegates.length, 3);
  });

  testWidgets('التطبيق يبني بدون أخطاء', (WidgetTester tester) async {
    // Avoid network/Firebase: build only the localization shell.
    await tester.pumpWidget(
      MaterialApp(
        locale: appLocale,
        supportedLocales: appSupportedLocales,
        localizationsDelegates: appLocalizationsDelegates,
        home: const Scaffold(body: Text('الطلبات')),
      ),
    );
    expect(find.text('الطلبات'), findsOneWidget);
    expect(
      Directionality.of(tester.element(find.text('الطلبات'))),
      TextDirection.rtl,
    );
  });
}