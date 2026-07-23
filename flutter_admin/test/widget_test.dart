import 'package:flutter_test/flutter_test.dart';
import 'package:aura_glow_admin/main.dart';

void main() {
  testWidgets('App loads', (WidgetTester tester) async {
    await tester.pumpWidget(const AuraGlowApp());
    expect(find.text('AURA GLOW Admin'), findsOneWidget);
  });
}
