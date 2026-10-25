import type { AuditLog, AuditActionType, AuditSeverity } from '../src/types.ts';

export interface AuditLogQueryFilters {
  actionType?: string;
  severity?: string;
  performedBy?: string;
  targetEntity?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export class AuditLogManagerService {
  private logs: AuditLog[] = [];

  constructor(initialLogs: AuditLog[] = []) {
    this.logs = [...initialLogs];
  }

  public setInitialLogs(initialLogs: AuditLog[]) {
    this.logs = [...initialLogs];
  }

  public getLogs(): AuditLog[] {
    return this.logs;
  }

  /**
   * Log an administrative or system event
   */
  public log(entry: {
    actionType: AuditActionType;
    action: string;
    performedBy: string;
    role?: string;
    targetEntity?: string;
    targetId?: string;
    targetName?: string;
    details: string;
    previousState?: Record<string, any> | string;
    newState?: Record<string, any> | string;
    severity?: AuditSeverity;
    ipAddress?: string;
  }): AuditLog {
    const auditRecord: AuditLog = {
      id: `audit_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
      action: entry.action,
      actionType: entry.actionType,
      performedBy: entry.performedBy || 'System Administrator',
      role: entry.role || 'Administrator',
      targetEntity: entry.targetEntity,
      targetId: entry.targetId,
      targetName: entry.targetName,
      details: entry.details,
      previousState: entry.previousState,
      newState: entry.newState,
      severity: entry.severity || this.determineSeverity(entry.actionType),
      ipAddress: entry.ipAddress || '192.168.10.1 (Campus LAN - Quetta)',
      timestamp: new Date().toISOString(),
    };

    this.logs.unshift(auditRecord);

    // Keep up to 1000 records
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(0, 1000);
    }

    return auditRecord;
  }

  private determineSeverity(actionType: AuditActionType): AuditSeverity {
    switch (actionType) {
      case 'FEE_STRUCTURE_CHANGED':
      case 'FEE_CONFIG_UPDATED':
      case 'APPLICATION_REJECTED':
      case 'MANUAL_ATTENDANCE_CORRECTION':
        return 'critical';
      case 'APPLICATION_APPROVED':
      case 'ENROLLMENT_STATUS_UPDATED':
      case 'EXAM_RESULT_PUBLISHED':
      case 'STUDENT_RECORD_MODIFIED':
      case 'SETTINGS_UPDATED':
        return 'warning';
      default:
        return 'info';
    }
  }

  /**
   * Query logs with multi-parameter filtering
   */
  public query(filters?: AuditLogQueryFilters): AuditLog[] {
    let results = [...this.logs];

    if (!filters) return results;

    if (filters.actionType && filters.actionType !== 'All') {
      results = results.filter((l) => l.actionType === filters.actionType);
    }

    if (filters.severity && filters.severity !== 'All') {
      results = results.filter((l) => l.severity === filters.severity);
    }

    if (filters.targetEntity && filters.targetEntity !== 'All') {
      results = results.filter((l) => l.targetEntity === filters.targetEntity);
    }

    if (filters.performedBy && filters.performedBy.trim()) {
      const term = filters.performedBy.toLowerCase();
      results = results.filter((l) => l.performedBy.toLowerCase().includes(term));
    }

    if (filters.search && filters.search.trim()) {
      const term = filters.search.toLowerCase();
      results = results.filter(
        (l) =>
          l.details.toLowerCase().includes(term) ||
          l.action.toLowerCase().includes(term) ||
          l.actionType.toLowerCase().includes(term) ||
          (l.targetName && l.targetName.toLowerCase().includes(term)) ||
          (l.targetId && l.targetId.toLowerCase().includes(term)) ||
          l.performedBy.toLowerCase().includes(term)
      );
    }

    if (filters.startDate) {
      results = results.filter((l) => l.timestamp >= filters.startDate!);
    }

    if (filters.endDate) {
      results = results.filter((l) => l.timestamp <= filters.endDate!);
    }

    if (filters.limit && filters.limit > 0) {
      results = results.slice(0, filters.limit);
    }

    return results;
  }

  /**
   * Export logs as CSV string
   */
  public exportCsv(filters?: AuditLogQueryFilters): string {
    const list = this.query(filters);
    const headers = ['ID', 'Timestamp', 'Action Type', 'Action', 'Severity', 'Performed By', 'Target Entity', 'Target Name', 'Details'];
    const rows = list.map((l) => [
      l.id,
      l.timestamp,
      l.actionType,
      `"${(l.action || '').replace(/"/g, '""')}"`,
      l.severity,
      `"${(l.performedBy || '').replace(/"/g, '""')}"`,
      l.targetEntity || '',
      `"${(l.targetName || '').replace(/"/g, '""')}"`,
      `"${(l.details || '').replace(/"/g, '""')}"`,
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  /**
   * Summary stats for audit compliance overview
   */
  public getStats() {
    const total = this.logs.length;
    const critical = this.logs.filter((l) => l.severity === 'critical').length;
    const warning = this.logs.filter((l) => l.severity === 'warning').length;
    const info = this.logs.filter((l) => l.severity === 'info').length;

    const feeChanges = this.logs.filter(
      (l) => l.actionType === 'FEE_STRUCTURE_CHANGED' || l.actionType === 'FEE_CONFIG_UPDATED'
    ).length;

    const attendanceCorrections = this.logs.filter(
      (l) => l.actionType === 'MANUAL_ATTENDANCE_CORRECTION'
    ).length;

    const enrollmentUpdates = this.logs.filter(
      (l) =>
        l.actionType === 'APPLICATION_APPROVED' ||
        l.actionType === 'APPLICATION_REJECTED' ||
        l.actionType === 'ENROLLMENT_STATUS_UPDATED'
    ).length;

    return {
      total,
      critical,
      warning,
      info,
      feeChanges,
      attendanceCorrections,
      enrollmentUpdates,
      lastAuditTime: this.logs[0]?.timestamp || new Date().toISOString(),
    };
  }
}

export const auditLogManager = new AuditLogManagerService();
