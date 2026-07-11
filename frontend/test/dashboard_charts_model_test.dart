import 'package:flutter_test/flutter_test.dart';
import 'package:frontend/features/dashboard/data/models/dashboard_model.dart';

void main() {
  group('DashboardModel chart parsing', () {
    test('parses charts, caseMix, and revenue analytics without fake data', () {
      final model = DashboardModel.fromJson({
        'generatedAt': '2026-07-11T12:00:00.000Z',
        'greeting': {
          'message': 'Good Afternoon mohammed',
          'period': 'afternoon',
          'firstName': 'mohammed',
          'serverTime': '2026-07-11T12:00:00.000Z',
          'timezone': 'Asia/Riyadh',
        },
        'user': {
          'id': 'u1',
          'fullName': 'mohammed',
          'email': 'm@example.com',
          'firstName': 'mohammed',
        },
        'workspace': {
          'id': 'w1',
          'role': 'OWNER',
          'timezone': 'Asia/Riyadh',
          'name': "mohammed's Workspace",
        },
        'overview': {
          'activeCases': {
            'active': 3,
            'open': 2,
            'closed': 1,
            'total': 6,
            'pending': 1,
            'draft': 0,
            'won': 1,
            'lost': 0,
          },
          'revenue': {
            'totalPaid': 1500,
            'currency': 'USD',
            'invoiceCount': 4,
            'paidInvoiceCount': 2,
            'outstanding': 200,
          },
          'winRate': {'winRate': 50, 'won': 1, 'lost': 1, 'closed': 2},
          'billableHours': {
            'totalHours': 12,
            'averagePerCase': 2,
            'caseCount': 6,
          },
          'clients': {
            'total': 5,
            'active': 4,
            'inactive': 1,
            'newThisMonth': 2,
            'returning': 1,
          },
        },
        'revenue': {
          'paid': 1500,
          'outstanding': 200,
          'currency': 'USD',
          'defaultCurrency': 'USD',
          'byMonth': [
            {'month': '2026-05', 'amount': 400},
            {'month': '2026-06', 'amount': 600},
            {'month': '2026-07', 'amount': 500},
          ],
          'summary': {
            'paid': 1500,
            'outstanding': 200,
            'pending': 50,
            'cancelled': 0,
            'refunded': 0,
            'currency': 'USD',
          },
          'trend': {
            'months': [
              {
                'month': 5,
                'year': 2026,
                'label': 'May 2026',
                'revenue': 400,
                'growth': 0,
                'invoiceCount': 1,
                'paymentCount': 1,
                'currency': 'USD',
              },
              {
                'month': 6,
                'year': 2026,
                'label': 'Jun 2026',
                'revenue': 600,
                'growth': 50,
                'invoiceCount': 2,
                'paymentCount': 2,
                'currency': 'USD',
              },
            ],
          },
          'comparisons': {
            'monthOverMonth': {
              'currentValue': 500,
              'previousValue': 600,
              'percentage': -16.67,
              'direction': 'DECREASE',
            },
            'weekOverWeek': {
              'currentValue': 100,
              'previousValue': 80,
              'percentage': 25,
              'direction': 'INCREASE',
            },
            'quarterOverQuarter': {
              'currentValue': 1500,
              'previousValue': 1500,
              'percentage': 0,
              'direction': 'NO_CHANGE',
            },
            'yearOverYear': {
              'currentValue': 1500,
              'previousValue': 0,
              'percentage': 100,
              'direction': 'INCREASE',
            },
          },
          'breakdown': {
            'items': [
              {
                'key': 'INVOICE',
                'label': 'Invoice Revenue',
                'amount': 1200,
                'percentage': 80,
                'currency': 'USD',
              },
              {
                'key': 'MANUAL',
                'label': 'Manual Revenue',
                'amount': 300,
                'percentage': 20,
                'currency': 'USD',
              },
            ],
            'total': 1500,
            'currency': 'USD',
          },
          'kpis': {
            'averageInvoiceValue': 375,
            'averageRevenuePerClient': 300,
            'averageRevenuePerCase': 250,
            'revenuePerLawyer': 750,
            'revenuePerMonth': 500,
            'collectionRate': 88.2,
            'paymentSuccessRate': 95,
            'outstandingBalance': 200,
            'averagePaymentDelayDays': 4,
            'currency': 'USD',
          },
          'charts': {
            'line': {
              'id': 'line',
              'name': 'Revenue Trend',
              'chartType': 'line',
              'currency': 'USD',
              'points': [
                {'label': 'May', 'value': 400},
                {'label': 'Jun', 'value': 600},
                {'label': 'Jul', 'value': 500},
              ],
            },
            'area': {
              'id': 'area',
              'name': 'Revenue Area',
              'chartType': 'area',
              'currency': 'USD',
              'points': [
                {'label': 'May', 'value': 400},
                {'label': 'Jun', 'value': 600},
              ],
            },
            'bar': {
              'id': 'bar',
              'name': 'Monthly Revenue',
              'chartType': 'bar',
              'currency': 'USD',
              'points': [
                {'label': 'May', 'value': 400},
                {'label': 'Jun', 'value': 600},
              ],
            },
            'pie': {
              'id': 'pie',
              'name': 'Revenue by Category',
              'chartType': 'pie',
              'currency': 'USD',
              'points': [
                {'label': 'Invoice Revenue', 'value': 1200, 'percentage': 80},
                {'label': 'Manual Revenue', 'value': 300, 'percentage': 20},
              ],
            },
          },
        },
        'charts': {
          'casesByStatus': [
            {'label': 'ACTIVE', 'value': 3, 'percentage': 50},
            {'label': 'CLOSED', 'value': 3, 'percentage': 50},
          ],
          'revenueByMonth': [
            {'month': '2026-05', 'amount': 400},
          ],
          'caseMixByPracticeArea': [
            {'label': 'Commercial', 'value': 2, 'percentage': 40},
            {'label': 'Civil', 'value': 3, 'percentage': 60},
          ],
        },
        'caseMix': {
          'byStatus': [
            {'label': 'ACTIVE', 'value': 3, 'percentage': 50},
          ],
          'byPracticeArea': [
            {'label': 'Commercial', 'value': 2, 'percentage': 40},
          ],
        },
        'team': {
          'totalUsers': 4,
          'activeUsers': 3,
          'averageCasesPerLawyer': 2.5,
          'averageClosedCases': 1,
          'averageWinRate': 50,
          'roles': {
            'lawyers': 2,
            'assistants': 1,
            'admins': 1,
            'byRole': {'LAWYER': 2, 'ASSISTANT': 1, 'ADMIN': 1},
          },
        },
        'hearings': {
          'todayCount': 1,
          'upcomingCount': 2,
          'overdueCount': 0,
          'completedCount': 3,
          'cancelledCount': 0,
          'summary': {
            'today': 1,
            'tomorrow': 1,
            'upcoming': 2,
            'completed': 3,
            'cancelled': 0,
            'rescheduled': 0,
            'overdue': 0,
          },
          'hearings': [],
        },
        'deadlines': {
          'todayCount': 0,
          'upcomingCount': 1,
          'overdueCount': 0,
          'deadlines': [],
        },
        'activities': {
          'total': 7,
          'groups': [],
          'pagination': {
            'page': 1,
            'pageSize': 20,
            'total': 7,
            'hasMore': false,
          },
        },
        'notifications': {
          'unreadNotifications': 0,
          'criticalNotifications': 0,
          'upcomingHearings': 2,
          'urgentDeadlines': 0,
        },
      });

      final charts = model.entity.charts;
      expect(charts.casesByStatus, hasLength(2));
      expect(charts.casesByStatus.first.label, 'ACTIVE');
      expect(charts.revenue.lineChart.points, hasLength(3));
      expect(charts.revenue.lineChart.points[1].value, 600);
      expect(charts.revenue.monthOverMonth.direction, 'DECREASE');
      expect(charts.revenue.breakdown, hasLength(2));
      expect(charts.revenue.kpis.collectionRate, 88.2);
      expect(charts.caseMixByPracticeArea.first.label, 'Commercial');
      expect(charts.team.roleSeries, isNotEmpty);
      expect(charts.hearingDistribution.any((p) => p.label == 'Today'), isTrue);
      expect(charts.billingStatistics.any((p) => p.label == 'Paid'), isTrue);
      expect(model.entity.overview.revenue.value.contains('1,500'), isTrue);
    });

    test('empty payload returns valid empty chart DTOs', () {
      final model = DashboardModel.fromJson({
        'generatedAt': '2026-07-11T12:00:00.000Z',
        'greeting': {
          'message': 'Good Morning',
          'period': 'morning',
          'firstName': 'User',
          'serverTime': '2026-07-11T12:00:00.000Z',
          'timezone': 'UTC',
        },
        'user': {
          'id': 'u1',
          'fullName': 'User',
          'email': 'u@example.com',
          'firstName': 'User',
        },
        'workspace': {'id': 'w1', 'role': 'OWNER', 'timezone': 'UTC'},
        'overview': {},
        'revenue': {},
        'charts': {},
        'caseMix': {},
        'team': {},
        'hearings': {},
        'deadlines': {},
        'activities': {},
        'notifications': {},
      });

      final charts = model.entity.charts;
      expect(charts.casesByStatus, isEmpty);
      expect(charts.revenue.lineChart.points, isEmpty);
      expect(charts.revenue.monthOverMonth.percentage, 0);
      expect(charts.team.totalUsers, 0);
    });
  });
}
