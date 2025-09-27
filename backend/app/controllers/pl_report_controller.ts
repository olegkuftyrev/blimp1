import type { HttpContext } from '@adonisjs/core/http'
import PlReport from '#models/pl_report'
import PlReportLineItem from '#models/pl_report_line_item'
import Restaurant from '#models/restaurant'
import { PlExcelParserService } from '#services/pl_excel_parser_service'
import { inject } from '@adonisjs/core'
import AuditService from '#services/audit_service'

export default class PlReportController {

  /**
   * Upload and process P&L Excel file
   */
  async upload({ request, response, auth }: HttpContext) {
    try {
      console.log('P&L upload started')
      const restaurantId = request.input('restaurantId')
      
      if (!restaurantId) {
        return response.badRequest({ message: 'Restaurant ID is required' })
      }

      // Verify restaurant exists
      const restaurant = await Restaurant.findOrFail(restaurantId)
      
      // Get uploaded file
      const plFile = request.file('plFile')
      if (!plFile) {
        return response.badRequest({ message: 'P&L file is required' })
      }

      console.log('File received:', {
        fileName: plFile.clientName,
        size: plFile.size,
        isValid: plFile.isValid,
        tmpPath: plFile.tmpPath
      })

      // Validate file type
      if (!plFile.isValid) {
        return response.badRequest({ message: 'Invalid file upload' })
      }

      // Parse Excel file
      let plData
      try {
        plData = PlExcelParserService.parseExcelFile(plFile.tmpPath!)
      } catch (parseError) {
        console.error('Excel parsing error:', parseError)
        return response.badRequest({ 
          message: 'Failed to parse Excel file', 
          error: parseError.message 
        })
      }

      // Check if report already exists for this period
      console.log('Checking for existing report:', {
        restaurantId,
        period: plData.period,
        periodType: typeof plData.period
      })
      
      const existingReport = await PlReport.query()
        .where('restaurant_id', restaurantId)
        .where('period', plData.period)
        .first()

      console.log('Existing report found:', existingReport)

      if (existingReport) {
        console.log('Report already exists, returning 409')
        return response.conflict({ 
          message: `P&L report for period ${plData.period} already exists for this restaurant` 
        })
      }

      // Create P&L report
      const plReport = await PlReport.create({
        restaurantId: restaurantId,
        storeName: plData.storeName,
        company: plData.company,
        period: plData.period,
        translationCurrency: plData.translationCurrency,
        ...plData.summaryData
      })

      // Create line items
      const lineItemsData = plData.lineItems.map(item => ({
        plReportId: plReport.id,
        category: item.category,
        subcategory: item.subcategory,
        ledgerAccount: item.ledgerAccount,
        actuals: item.actuals,
        actualsPercentage: item.actualsPercentage,
        plan: item.plan,
        planPercentage: item.planPercentage,
        vfp: item.vfp,
        priorYear: item.priorYear,
        priorYearPercentage: item.priorYearPercentage,
        actualYtd: item.actualYtd,
        actualYtdPercentage: item.actualYtdPercentage,
        planYtd: item.planYtd,
        planYtdPercentage: item.planYtdPercentage,
        vfpYtd: item.vfpYtd,
        priorYearYtd: item.priorYearYtd,
        priorYearYtdPercentage: item.priorYearYtdPercentage,
        sortOrder: item.sortOrder
      }))

      await PlReportLineItem.createMany(lineItemsData)

      // Load the complete report with line items
      const reportWithItems = await PlReport.query()
        .where('id', plReport.id)
        .preload('lineItems')
        .first()

      // Audit log
      await AuditService.log({
        actorUserId: auth.user?.id || null,
        action: 'pl_report_uploaded',
        entityType: 'pl_report',
        entityId: plReport.id,
        payload: {
          restaurantId,
          period: plData.period,
          storeName: plData.storeName,
          lineItemsCount: lineItemsData.length
        }
      })

      return response.created({
        message: 'P&L report uploaded successfully',
        data: reportWithItems
      })

    } catch (error) {
      console.error('P&L upload error:', error)
      return response.internalServerError({ 
        message: 'Failed to process P&L file',
        error: error.message 
      })
    }
  }

  /**
   * Get P&L reports for a restaurant
   */
  async index({ request, response }: HttpContext) {
    try {
      const restaurantId = request.input('restaurantId')
      const period = request.input('period')

      if (!restaurantId) {
        return response.badRequest({ message: 'Restaurant ID is required' })
      }

      let query = PlReport.query()
        .where('restaurant_id', restaurantId)
        .preload('lineItems')
        .orderBy('created_at', 'desc')

      if (period) {
        query = query.where('period', period)
      }

      const reports = await query

      return response.ok({
        data: reports
      })

    } catch (error) {
      console.error('P&L index error:', error)
      return response.internalServerError({ 
        message: 'Failed to fetch P&L reports',
        error: error.message 
      })
    }
  }

  /**
   * Get specific P&L report
   */
  async show({ params, response }: HttpContext) {
    try {
      const report = await PlReport.query()
        .where('id', params.id)
        .preload('lineItems')
        .preload('restaurant')
        .first()

      if (!report) {
        return response.notFound({ message: 'P&L report not found' })
      }

      return response.ok({
        data: report
      })

    } catch (error) {
      console.error('P&L show error:', error)
      return response.internalServerError({ 
        message: 'Failed to fetch P&L report',
        error: error.message 
      })
    }
  }

  /**
   * Get P&L report line items
   */
  async lineItems({ params, response }: HttpContext) {
    try {
      const plReport = await PlReport.findOrFail(params.id)
      const lineItems = await plReport.related('lineItems').query().orderBy('sortOrder', 'asc')

      return response.ok({
        data: lineItems
      })
    } catch (error) {
      return response.internalServerError({
        message: 'Failed to fetch P&L report line items',
        error: error.message
      })
    }
  }

  /**
   * Delete P&L report
   */
  async destroy({ params, response, auth }: HttpContext) {
    try {
      const report = await PlReport.findOrFail(params.id)

      // Delete line items first (cascade should handle this, but being explicit)
      await PlReportLineItem.query().where('pl_report_id', report.id).delete()

      // Delete the report
      await report.delete()

      // Audit log
      await AuditService.log({
        actorUserId: auth.user?.id || null,
        action: 'pl_report_deleted',
        entityType: 'pl_report',
        entityId: report.id,
        payload: {
          restaurantId: report.restaurantId,
          period: report.period,
          storeName: report.storeName
        }
      })

      return response.ok({
        message: 'P&L report deleted successfully'
      })

    } catch (error) {
      console.error('P&L delete error:', error)
      
      // Check if it's a "Row not found" error from findOrFail
      if (error.message && error.message.includes('Row not found')) {
        return response.notFound({ 
          message: 'P&L report not found',
          error: 'The requested P&L report does not exist or has already been deleted'
        })
      }
      
      return response.internalServerError({ 
        message: 'Failed to delete P&L report',
        error: error.message 
      })
    }
  }
}
