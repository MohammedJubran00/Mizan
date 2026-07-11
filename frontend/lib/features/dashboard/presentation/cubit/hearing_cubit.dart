import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../domain/entities/dashboard_entity.dart';
import 'overview_cubit.dart';

class HearingState extends Equatable {
  const HearingState({
    this.status = SectionStatus.initial,
    this.items = const [],
    this.errorMessage,
  });

  final SectionStatus status;
  final List<HearingEntity> items;
  final String? errorMessage;

  @override
  List<Object?> get props => [status, items, errorMessage];
}

class HearingCubit extends Cubit<HearingState> {
  HearingCubit() : super(const HearingState());

  void setLoading() => emit(const HearingState(status: SectionStatus.loading));

  void setSuccess(List<HearingEntity> items) => emit(
        HearingState(status: SectionStatus.success, items: items),
      );

  void setError(String message) => emit(
        HearingState(status: SectionStatus.failure, errorMessage: message),
      );
}
