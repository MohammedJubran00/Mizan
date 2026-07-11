import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../domain/entities/dashboard_entity.dart';
import 'overview_cubit.dart';

class RevenueState extends Equatable {
  const RevenueState({
    this.status = SectionStatus.initial,
    this.card,
    this.errorMessage,
  });

  final SectionStatus status;
  final StatCardEntity? card;
  final String? errorMessage;

  @override
  List<Object?> get props => [status, card, errorMessage];
}

class RevenueCubit extends Cubit<RevenueState> {
  RevenueCubit() : super(const RevenueState());

  void setLoading() => emit(const RevenueState(status: SectionStatus.loading));

  void setSuccess(StatCardEntity card) => emit(
        RevenueState(status: SectionStatus.success, card: card),
      );

  void setError(String message) => emit(
        RevenueState(status: SectionStatus.failure, errorMessage: message),
      );
}
