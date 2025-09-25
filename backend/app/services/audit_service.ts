import Audit from '#models/audit'
import { DateTime } from 'luxon'

export type AuditEntity = 'user' | 'restaurant' | 'invite' | 'membership' | 'lead_relation' | 'auth' | 'pl_report'

export default class AuditService {
  static async log(params: {
    actorUserId: number | null
    action: string
    entityType: AuditEntity
    entityId?: number | null
    payload?: unknown
  }) {
    try {
      await Audit.create({
        actorUserId: params.actorUserId ?? null,
        action: params.action,
        entityType: params.entityType,
        entityId: (params.entityId ?? null) as number | null,
        payload: params.payload ? JSON.stringify(params.payload) : null,
      } as any)
    } catch (e) {
      // do not throw from audit; best-effort
    }
  }
}
