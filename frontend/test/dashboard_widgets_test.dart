import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:frontend/core/theme/app_theme.dart';
import 'package:frontend/features/dashboard/presentation/widgets/dashboard_empty_state.dart';
import 'package:frontend/features/dashboard/presentation/widgets/section_error.dart';

void main() {
  testWidgets('DashboardEmptyState renders title and message', (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        theme: AppTheme.light,
        home: const Scaffold(
          body: DashboardEmptyState(
            icon: Icons.inbox_outlined,
            title: 'No Cases Yet',
            message: 'Create your first case.',
          ),
        ),
      ),
    );

    expect(find.text('No Cases Yet'), findsOneWidget);
    expect(find.text('Create your first case.'), findsOneWidget);
    expect(find.byIcon(Icons.inbox_outlined), findsOneWidget);
  });

  testWidgets('SectionError shows retry action', (tester) async {
    var retried = false;
    await tester.pumpWidget(
      MaterialApp(
        theme: AppTheme.light,
        home: Scaffold(
          body: SectionError(
            message: 'Failed to load',
            onRetry: () => retried = true,
          ),
        ),
      ),
    );

    await tester.tap(find.text('Retry'));
    expect(retried, isTrue);
  });
}
