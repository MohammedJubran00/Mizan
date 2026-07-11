import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../domain/entities/dashboard_entity.dart';
import 'overview_cubit.dart';

class ActivityState extends Equatable {
  const ActivityState({
    this.status = SectionStatus.initial,
    this.groups = const [],
    this.pagination,
    this.errorMessage,
    this.isLoadingMore = false,
  });

  final SectionStatus status;
  final List<ActivityGroupEntity> groups;
  final PaginationEntity? pagination;
  final String? errorMessage;
  final bool isLoadingMore;

  bool get hasMore => pagination?.hasMore ?? false;

  @override
  List<Object?> get props =>
      [status, groups, pagination, errorMessage, isLoadingMore];
}

class ActivityCubit extends Cubit<ActivityState> {
  ActivityCubit() : super(const ActivityState());

  void setLoading() => emit(const ActivityState(status: SectionStatus.loading));

  void setLoadingMore() => emit(state.copyWith(isLoadingMore: true));

  void setSuccess(
    List<ActivityGroupEntity> groups,
    PaginationEntity pagination,
  ) =>
      emit(
        ActivityState(
          status: SectionStatus.success,
          groups: groups,
          pagination: pagination,
        ),
      );

  void setError(String message) => emit(
        ActivityState(
          status: SectionStatus.failure,
          groups: state.groups,
          pagination: state.pagination,
          errorMessage: message,
          isLoadingMore: false,
        ),
      );

  List<ActivityGroupEntity> mergeGroups(
    List<ActivityGroupEntity> existing,
    List<ActivityGroupEntity> incoming,
  ) {
    final map = <String, List<ActivityEntity>>{};
    final labels = <String, String>{};
    final order = <String>[];

    void ingest(List<ActivityGroupEntity> source) {
      for (final group in source) {
        labels[group.key] = group.label;
        final list = map.putIfAbsent(group.key, () {
          order.add(group.key);
          return <ActivityEntity>[];
        });
        final seen = list.map((e) => e.id).toSet();
        for (final item in group.items) {
          if (seen.add(item.id)) list.add(item);
        }
      }
    }

    ingest(existing);
    ingest(incoming);

    return [
      for (final key in order)
        ActivityGroupEntity(
          key: key,
          label: labels[key] ?? key,
          items: map[key]!,
        ),
    ];
  }
}

extension on ActivityState {
  ActivityState copyWith({
    SectionStatus? status,
    List<ActivityGroupEntity>? groups,
    PaginationEntity? pagination,
    String? errorMessage,
    bool? isLoadingMore,
  }) {
    return ActivityState(
      status: status ?? this.status,
      groups: groups ?? this.groups,
      pagination: pagination ?? this.pagination,
      errorMessage: errorMessage ?? this.errorMessage,
      isLoadingMore: isLoadingMore ?? this.isLoadingMore,
    );
  }
}
