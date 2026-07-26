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
import { OnboardingPage } from '@/features/onboarding/OnboardingPage'
import { ComingSoonPage } from '@/features/placeholders/ComingSoonPage'
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
