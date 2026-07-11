import 'package:flutter_test/flutter_test.dart';
import 'package:frontend/core/router/app_router.dart';
import 'package:frontend/main.dart';

void main() {
  testWidgets('Onboarding renders welcome screen', (tester) async {
    await tester.pumpWidget(MizanApp(router: createAppRouter()));
    await tester.pumpAndSettle();

    expect(find.text('Welcome to Mizan'), findsOneWidget);
    expect(find.text('Next'), findsOneWidget);
    expect(find.text('Skip'), findsOneWidget);
    expect(find.text('Mizan'), findsWidgets);
  });
}
