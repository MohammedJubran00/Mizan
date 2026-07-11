import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../domain/entities/dashboard_charts_entity.dart';
import 'overview_cubit.dart';

class ChartState extends Equatable {
  const ChartState({
    this.status = SectionStatus.initial,
    this.charts,
    this.errorMessage,
  });

  final SectionStatus status;
  final DashboardChartsEntity? charts;
  final String? errorMessage;

  @override
  List<Object?> get props => [status, charts, errorMessage];
}

/// Independent chart section — only chart widgets rebuild when this emits.
class ChartCubit extends Cubit<ChartState> {
  ChartCubit() : super(const ChartState());

  void setLoading() => emit(const ChartState(status: SectionStatus.loading));

  void setSuccess(DashboardChartsEntity charts) => emit(
        ChartState(status: SectionStatus.success, charts: charts),
      );

  void setError(String message) => emit(
        ChartState(status: SectionStatus.failure, errorMessage: message),
      );
}
