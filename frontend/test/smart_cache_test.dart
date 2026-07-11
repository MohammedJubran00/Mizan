import 'package:flutter_test/flutter_test.dart';
import 'package:frontend/core/cache/smart_cache.dart';
import 'package:frontend/core/utils/debouncer.dart';
import 'package:frontend/core/utils/optimistic_update.dart';

void main() {
  group('SmartCache', () {
    test('isolates workspaces', () async {
      final cache = SmartCache();
      cache.set(
        'a',
        1,
        workspaceId: 'ws-a',
        ttl: const Duration(minutes: 1),
        tags: {CacheDomain.dashboard},
      );
      cache.set(
        'b',
        2,
        workspaceId: 'ws-b',
        ttl: const Duration(minutes: 1),
        tags: {CacheDomain.dashboard},
      );

      cache.invalidateWorkspace('ws-a');
      expect(cache.get<int>('a'), isNull);
      expect(cache.get<int>('b'), 2);
    });

    test('deduplicates concurrent getOrLoad', () async {
      final cache = SmartCache();
      var loads = 0;

      Future<int> loader() async {
        loads++;
        await Future<void>.delayed(const Duration(milliseconds: 30));
        return 42;
      }

      final results = await Future.wait([
        cache.getOrLoad<int>(
          'k',
          workspaceId: 'ws',
          ttl: const Duration(minutes: 1),
          tags: {CacheDomain.dashboard},
          loader: loader,
        ),
        cache.getOrLoad<int>(
          'k',
          workspaceId: 'ws',
          ttl: const Duration(minutes: 1),
          tags: {CacheDomain.dashboard},
          loader: loader,
        ),
      ]);

      expect(results, [42, 42]);
      expect(loads, 1);
    });

    test('selectively invalidates tags', () {
      final cache = SmartCache();
      cache.set(
        'rev',
        1,
        workspaceId: 'ws',
        ttl: const Duration(minutes: 1),
        tags: {CacheDomain.revenue, CacheDomain.dashboard},
      );
      cache.set(
        'hear',
        2,
        workspaceId: 'ws',
        ttl: const Duration(minutes: 1),
        tags: {CacheDomain.hearings},
      );

      final removed = cache.invalidateTags('ws', {CacheDomain.revenue});
      expect(removed, 1);
      expect(cache.get<int>('rev'), isNull);
      expect(cache.get<int>('hear'), 2);
    });
  });

  group('Debouncer', () {
    test('fires once after delay', () async {
      final debouncer = Debouncer(delay: const Duration(milliseconds: 50));
      var count = 0;
      debouncer.run(() => count++);
      debouncer.run(() => count++);
      debouncer.run(() => count++);
      await Future<void>.delayed(const Duration(milliseconds: 80));
      expect(count, 1);
      debouncer.dispose();
    });
  });

  group('OptimisticUpdate', () {
    test('rolls back on failure', () async {
      var value = 0;
      final update = OptimisticUpdate<int>(
        read: () => value,
        write: (v) => value = v,
      );

      await expectLater(
        update.run(
          optimistic: 10,
          commit: () async {
            throw Exception('fail');
          },
        ),
        throwsA(isA<Exception>()),
      );
      expect(value, 0);
    });

    test('keeps optimistic value on success', () async {
      var value = 0;
      final update = OptimisticUpdate<int>(
        read: () => value,
        write: (v) => value = v,
      );

      await update.run(
        optimistic: 5,
        commit: () async => true,
      );
      expect(value, 5);
    });
  });
}
