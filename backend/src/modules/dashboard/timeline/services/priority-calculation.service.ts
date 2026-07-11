import type { DeadlineImportance, DeadlineStatus } from '@prisma/client';

import type { PriorityLevel } from '../dto/timeline.dto';

export interface DeadlinePriorityInput {
  dueAt: Date;
  now: Date;
  importance: DeadlineImportance;
  status: DeadlineStatus;
}

export interface HearingPriorityInput {
  scheduledAt: Date;
  now: Date;
  status: string;
}

/**
 * Centralized priority rules — never duplicate elsewhere.
 */
export class PriorityCalculationService {
  calculateDeadlinePriority(input: DeadlinePriorityInput): PriorityLevel {
    if (input.status === 'COMPLETED' || input.status === 'CANCELLED') {
      return 'LOW';
    }

    const hoursRemaining =
      (input.dueAt.getTime() - input.now.getTime()) / (1000 * 60 * 60);

    if (hoursRemaining < 0 || input.status === 'OVERDUE') {
      return 'CRITICAL';
    }

    if (hoursRemaining <= 24 || input.importance === 'CRITICAL') {
      return 'CRITICAL';
    }

    if (hoursRemaining <= 72 || input.importance === 'HIGH') {
      return 'HIGH';
    }

    if (hoursRemaining <= 168 || input.importance === 'MEDIUM') {
      return 'MEDIUM';
    }

    return 'LOW';
  }

  calculateHearingPriority(input: HearingPriorityInput): PriorityLevel {
    if (input.status === 'COMPLETED' || input.status === 'CANCELLED') {
      return 'LOW';
    }

    const hoursRemaining =
      (input.scheduledAt.getTime() - input.now.getTime()) / (1000 * 60 * 60);

    if (hoursRemaining < 0 && input.status === 'SCHEDULED') {
      return 'CRITICAL';
    }

    if (hoursRemaining <= 24) {
      return 'CRITICAL';
    }

    if (hoursRemaining <= 72) {
      return 'HIGH';
    }

    if (hoursRemaining <= 168) {
      return 'MEDIUM';
    }

    return 'LOW';
  }

  daysRemaining(target: Date, now: Date): number {
    const msPerDay = 24 * 60 * 60 * 1000;
    return Math.ceil((target.getTime() - now.getTime()) / msPerDay);
  }
}
