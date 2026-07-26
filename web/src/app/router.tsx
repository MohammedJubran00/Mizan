import { lazy, Suspense } from 'react'
import {
  createBrowserRouter,
  Navigate,
  Outlet,
  useLocation,
} from 'react-router-dom'

import { AppShell } from '@/app/layout/AppShell'
import { placeholderPaths } from '@/config/nav'
import { LoginPage } from '@/features/auth/LoginPage'
import { SignUpPage } from '@/features/auth/SignUpPage'
import { CaseDetailsPage } from '@/features/cases/CaseDetailsPage'
import { CaseFormPage } from '@/features/cases/CaseFormPage'
import { CasesListPage } from '@/features/cases/CasesListPage'
import { ClientDetailsPage } from '@/features/clients/ClientDetailsPage'
import { ClientFormPage } from '@/features/clients/ClientFormPage'
import { ClientsListPage } from '@/features/clients/ClientsListPage'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { HearingDetailsPage } from '@/features/hearings/HearingDetailsPage'
import { HearingFormPage } from '@/features/hearings/HearingFormPage'
import { HearingsCalendarPage } from '@/features/hearings/HearingsCalendarPage'
import { HearingsListPage } from '@/features/hearings/HearingsListPage'
import { BillingPage } from '@/features/billing/BillingPage'
import { InvoiceDetailsPage } from '@/features/billing/InvoiceDetailsPage'
import { InvoiceFormPage } from '@/features/billing/InvoiceFormPage'
import { PaymentsPage } from '@/features/billing/PaymentsPage'
import { OnboardingPage } from '@/features/onboarding/OnboardingPage'
import { ComingSoonPage } from '@/features/placeholders/ComingSoonPage'
import { RolesPage } from '@/features/users/RolesPage'
import { UserFormPage } from '@/features/users/UserFormPage'
import { UserProfilePage } from '@/features/users/UserProfilePage'
import { UsersAccessPage } from '@/features/users/UsersAccessPage'
import { UsersPage } from '@/features/users/UsersPage'
import { RouteFallback } from '@/shared/components/RouteFallback'
import { useAuthStore } from '@/stores/authStore'

// Split out the PDF viewer bundle so pdf.js only loads on the Documents route.
const DocumentsPage = lazy(() =>
  import('@/features/documents/DocumentsPage').then((module) => ({
    default: module.DocumentsPage,
  })),
)

// The calendar grids and event editor are heavy, so they load on demand.
const CalendarPage = lazy(() =>
  import('@/features/calendar/CalendarPage').then((module) => ({
    default: module.CalendarPage,
  })),
)

const EventDetailsPage = lazy(() =>
  import('@/features/calendar/EventDetailsPage').then((module) => ({
    default: module.EventDetailsPage,
  })),
)

const EventFormPage = lazy(() =>
  import('@/features/calendar/EventFormPage').then((module) => ({
    default: module.EventFormPage,
  })),
)

const ReportsDashboardPage = lazy(() =>
  import('@/features/reports/ReportsDashboardPage').then((module) => ({
    default: module.ReportsDashboardPage,
  })),
)

const ReportLibraryPage = lazy(() =>
  import('@/features/reports/ReportLibraryPage').then((module) => ({
    default: module.ReportLibraryPage,
  })),
)

const ReportBuilderPage = lazy(() =>
  import('@/features/reports/ReportBuilderPage').then((module) => ({
    default: module.ReportBuilderPage,
  })),
)

const ReportPreviewPage = lazy(() =>
  import('@/features/reports/ReportPreviewPage').then((module) => ({
    default: module.ReportPreviewPage,
  })),
)

const PracticeInsightsPage = lazy(() =>
  import('@/features/reports/PracticeInsightsPage').then((module) => ({
    default: module.PracticeInsightsPage,
  })),
)

function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated())
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}

function GuestRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated())
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }
  return children
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <GuestRoute>
        <OnboardingPage />
      </GuestRoute>
    ),
  },
  {
    path: '/login',
    element: (
      <GuestRoute>
        <LoginPage />
      </GuestRoute>
    ),
  },
  {
    path: '/signup',
    element: (
      <GuestRoute>
        <SignUpPage />
      </GuestRoute>
    ),
  },
  {
    path: '/home',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          {
            path: '/dashboard',
            element: <DashboardPage />,
          },
          {
            path: '/clients',
            element: <ClientsListPage />,
          },
          {
            path: '/clients/new',
            element: <ClientFormPage mode="create" />,
          },
          {
            path: '/clients/:clientId',
            element: <ClientDetailsPage />,
          },
          {
            path: '/clients/:clientId/edit',
            element: <ClientFormPage mode="edit" />,
          },
          {
            path: '/cases',
            element: <CasesListPage />,
          },
          {
            path: '/cases/new',
            element: <CaseFormPage mode="create" />,
          },
          {
            path: '/cases/:caseId',
            element: <CaseDetailsPage />,
          },
          {
            path: '/cases/:caseId/edit',
            element: <CaseFormPage mode="edit" />,
          },
          {
            path: '/hearings',
            element: <HearingsListPage />,
          },
          {
            path: '/hearings/calendar',
            element: <HearingsCalendarPage />,
          },
          {
            path: '/hearings/new',
            element: <HearingFormPage mode="create" />,
          },
          {
            path: '/hearings/:hearingId',
            element: <HearingDetailsPage />,
          },
          {
            path: '/hearings/:hearingId/edit',
            element: <HearingFormPage mode="edit" />,
          },
          {
            path: '/calendar',
            element: (
              <Suspense fallback={<RouteFallback />}>
                <CalendarPage />
              </Suspense>
            ),
          },
          {
            path: '/calendar/events/new',
            element: (
              <Suspense fallback={<RouteFallback />}>
                <EventFormPage mode="create" />
              </Suspense>
            ),
          },
          {
            path: '/calendar/events/:eventId',
            element: (
              <Suspense fallback={<RouteFallback />}>
                <EventDetailsPage />
              </Suspense>
            ),
          },
          {
            path: '/calendar/events/:eventId/edit',
            element: (
              <Suspense fallback={<RouteFallback />}>
                <EventFormPage mode="edit" />
              </Suspense>
            ),
          },
          {
            path: '/documents',
            element: (
              <Suspense fallback={<RouteFallback />}>
                <DocumentsPage />
              </Suspense>
            ),
          },
          {
            path: '/billing',
            element: <BillingPage />,
          },
          {
            path: '/billing/payments',
            element: <PaymentsPage />,
          },
          {
            path: '/billing/invoices/new',
            element: <InvoiceFormPage mode="create" />,
          },
          {
            path: '/billing/invoices/:invoiceId',
            element: <InvoiceDetailsPage />,
          },
          {
            path: '/billing/invoices/:invoiceId/edit',
            element: <InvoiceFormPage mode="edit" />,
          },
          {
            path: '/reports',
            element: (
              <Suspense fallback={<RouteFallback />}>
                <ReportsDashboardPage />
              </Suspense>
            ),
          },
          {
            path: '/reports/library',
            element: (
              <Suspense fallback={<RouteFallback />}>
                <ReportLibraryPage />
              </Suspense>
            ),
          },
          {
            path: '/reports/builder',
            element: (
              <Suspense fallback={<RouteFallback />}>
                <ReportBuilderPage mode="create" />
              </Suspense>
            ),
          },
          {
            path: '/reports/builder/:reportId',
            element: (
              <Suspense fallback={<RouteFallback />}>
                <ReportBuilderPage mode="edit" />
              </Suspense>
            ),
          },
          {
            path: '/reports/insights',
            element: (
              <Suspense fallback={<RouteFallback />}>
                <PracticeInsightsPage />
              </Suspense>
            ),
          },
          {
            path: '/reports/:reportId',
            element: (
              <Suspense fallback={<RouteFallback />}>
                <ReportPreviewPage />
              </Suspense>
            ),
          },
          {
            path: '/users-permissions',
            element: <UsersPage />,
          },
          {
            path: '/users-permissions/access',
            element: <UsersAccessPage />,
          },
          {
            path: '/users-permissions/roles',
            element: <RolesPage />,
          },
          {
            path: '/users-permissions/new',
            element: <UserFormPage mode="create" />,
          },
          {
            path: '/users-permissions/:userId',
            element: <UserProfilePage />,
          },
          {
            path: '/users-permissions/:userId/edit',
            element: <UserFormPage mode="edit" />,
          },
          ...placeholderPaths.map((path) => ({
            path,
            element: <ComingSoonPage />,
          })),
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
])
