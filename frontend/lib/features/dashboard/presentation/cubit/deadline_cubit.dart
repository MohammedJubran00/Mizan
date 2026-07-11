import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../domain/entities/dashboard_entity.dart';
import 'overview_cubit.dart';

class DeadlineState extends Equatable {
  const DeadlineState({
    this.status = SectionStatus.initial,
    this.items = const [],
    this.errorMessage,
  });

  final SectionStatus status;
  final List<DeadlineEntity> items;
  final String? errorMessage;

  @override
  List<Object?> get props => [status, items, errorMessage];
}

class DeadlineCubit extends Cubit<DeadlineState> {
  DeadlineCubit() : super(const DeadlineState());

  void setLoading() => emit(const DeadlineState(status: SectionStatus.loading));

  void setSuccess(List<DeadlineEntity> items) => emit(
        DeadlineState(status: SectionStatus.success, items: items),
      );

  void setError(String message) => emit(
        DeadlineState(status: SectionStatus.failure, errorMessage: message),
      );
}
