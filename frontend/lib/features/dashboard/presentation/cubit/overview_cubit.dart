import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../domain/entities/dashboard_entity.dart';

enum SectionStatus { initial, loading, success, failure }

class OverviewState extends Equatable {
  const OverviewState({
    this.status = SectionStatus.initial,
    this.overview,
    this.errorMessage,
  });

  final SectionStatus status;
  final OverviewEntity? overview;
  final String? errorMessage;

  @override
  List<Object?> get props => [status, overview, errorMessage];
}

class OverviewCubit extends Cubit<OverviewState> {
  OverviewCubit() : super(const OverviewState());

  void setLoading() => emit(const OverviewState(status: SectionStatus.loading));

  void setSuccess(OverviewEntity overview) => emit(
        OverviewState(status: SectionStatus.success, overview: overview),
      );

  void setError(String message) => emit(
        OverviewState(status: SectionStatus.failure, errorMessage: message),
      );
}
