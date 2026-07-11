import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import 'core/router/app_router.dart';
import 'core/session/session_cubit.dart';
import 'core/theme/app_theme.dart';
import 'core/theme/theme_cubit.dart';
import 'features/dashboard/presentation/cubit/sidebar_cubit.dart';
import 'features/dashboard/presentation/dashboard_dependencies.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
      systemNavigationBarColor: Colors.white,
      systemNavigationBarIconBrightness: Brightness.dark,
    ),
  );

  final deps = AppDependencies.instance;
  await Future.wait([
    deps.sessionCubit.hydrate(),
    deps.themeCubit.hydrate(),
    deps.sidebarCubit.hydrate(),
  ]);

  runApp(
    MizanApp(
      router: createAppRouter(),
      sessionCubit: deps.sessionCubit,
      themeCubit: deps.themeCubit,
      sidebarCubit: deps.sidebarCubit,
    ),
  );
}

class MizanApp extends StatelessWidget {
  const MizanApp({
    super.key,
    required this.router,
    required this.sessionCubit,
    required this.themeCubit,
    required this.sidebarCubit,
  });

  final GoRouter router;
  final SessionCubit sessionCubit;
  final ThemeCubit themeCubit;
  final SidebarCubit sidebarCubit;

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider.value(value: sessionCubit),
        BlocProvider.value(value: themeCubit),
        BlocProvider.value(value: sidebarCubit),
      ],
      child: BlocBuilder<ThemeCubit, ThemeState>(
        builder: (context, themeState) {
          return MaterialApp.router(
            title: 'Mizan',
            debugShowCheckedModeBanner: false,
            theme: AppTheme.light,
            darkTheme: AppTheme.dark,
            themeMode: themeState.mode,
            routerConfig: router,
          );
        },
      ),
    );
  }
}
