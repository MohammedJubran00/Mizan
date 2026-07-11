import 'package:flutter_test/flutter_test.dart';
import 'package:frontend/core/router/app_router.dart';
import 'package:frontend/core/session/session_cubit.dart';
import 'package:frontend/core/storage/session_storage.dart';
import 'package:frontend/core/storage/token_storage.dart';
import 'package:frontend/core/theme/theme_cubit.dart';
import 'package:frontend/features/dashboard/presentation/cubit/sidebar_cubit.dart';
import 'package:frontend/main.dart';

void main() {
  testWidgets('Onboarding renders welcome screen', (tester) async {
    final sessionCubit = SessionCubit(
      sessionStorage: SessionStorage(),
      tokenStorage: TokenStorage(),
    );
    final themeCubit = ThemeCubit();
    final sidebarCubit = SidebarCubit();

    await tester.pumpWidget(
      MizanApp(
        router: createAppRouter(),
        sessionCubit: sessionCubit,
        themeCubit: themeCubit,
        sidebarCubit: sidebarCubit,
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Welcome to Mizan'), findsOneWidget);
    expect(find.text('Next'), findsOneWidget);
    expect(find.text('Skip'), findsOneWidget);
    expect(find.text('Mizan'), findsWidgets);

    await sessionCubit.close();
    await themeCubit.close();
    await sidebarCubit.close();
  });
}
