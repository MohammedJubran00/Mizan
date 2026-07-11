import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../features/auth/domain/entities/user_entity.dart';
import '../storage/session_storage.dart';
import '../storage/token_storage.dart';

class SessionState extends Equatable {
  const SessionState({
    this.user,
    this.workspace,
    this.isHydrated = false,
  });

  final UserEntity? user;
  final WorkspaceSession? workspace;
  final bool isHydrated;

  String get displayName => user?.fullName ?? '';
  String get firstName {
    final name = displayName.trim();
    if (name.isEmpty) return '';
    return name.split(RegExp(r'\s+')).first;
  }

  String get initials {
    final parts = displayName.trim().split(RegExp(r'\s+'));
    if (parts.isEmpty || parts.first.isEmpty) return '?';
    if (parts.length == 1) return parts.first[0].toUpperCase();
    return '${parts.first[0]}${parts.last[0]}'.toUpperCase();
  }

  SessionState copyWith({
    UserEntity? user,
    WorkspaceSession? workspace,
    bool? isHydrated,
  }) {
    return SessionState(
      user: user ?? this.user,
      workspace: workspace ?? this.workspace,
      isHydrated: isHydrated ?? this.isHydrated,
    );
  }

  @override
  List<Object?> get props => [user?.id, workspace?.id, isHydrated];
}

class SessionCubit extends Cubit<SessionState> {
  SessionCubit({
    required this.sessionStorage,
    required this.tokenStorage,
  }) : super(const SessionState());

  final SessionStorage sessionStorage;
  final TokenStorage tokenStorage;

  Future<void> hydrate() async {
    final user = await sessionStorage.readUser();
    final workspace = await sessionStorage.readWorkspace();
    emit(SessionState(user: user, workspace: workspace, isHydrated: true));
  }

  Future<void> setSession({
    required UserEntity user,
    required WorkspaceSession workspace,
  }) async {
    await sessionStorage.saveUser(user);
    await sessionStorage.saveWorkspace(workspace);
    emit(SessionState(user: user, workspace: workspace, isHydrated: true));
  }

  Future<void> clear() async {
    await sessionStorage.clear();
    await tokenStorage.clear();
    emit(const SessionState(isHydrated: true));
  }
}
