import type { HttpContext } from '@adonisjs/core/http'
import PlReport from '#models/pl_report'
import PlReportLineItem from '#models/pl_report_line_item'
import Restaurant from '#models/restaurant'
import { PlExcelParserService } from '#services/pl_excel_parser_service'
// import { inject } from '@adonisjs/core'
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
      await Restaurant.findOrFail(restaurantId)
      
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
        // Search for period that contains the requested period (e.g., "P01" matches "FY 2025 - P01")
        query = query.where('period', 'like', `%${period}%`)
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
   * Get P&L report line items with calculations
   */
  async lineItems({ params, response }: HttpContext) {
    try {
      const plReport = await PlReport.findOrFail(params.id)
      const lineItems = await plReport.related('lineItems').query().orderBy('sortOrder', 'asc')

      // Calculate metrics from line items
      const calculations = this.calculateMetrics(lineItems)

      console.log('Backend lineItems response:', {
        lineItemsCount: lineItems.length,
        calculationsKeys: Object.keys(calculations),
        chartsExists: !!calculations.charts,
        pieChartExists: !!calculations.charts?.pieChart,
        pieChartData: calculations.charts?.pieChart
      })

      return response.ok({
        data: lineItems,
        calculations: calculations
      })
    } catch (error) {
      return response.internalServerError({
        message: 'Failed to fetch P&L report line items',
        error: error.message
      })
    }
  }


  /**
   * Calculate all financial metrics from line items
   */
  private calculateMetrics(lineItems: PlReportLineItem[]) {
    const metrics: Record<string, any> = {}

    // Helper function to find line item by ledger account
    const findItem = (ledgerAccount: string) => {
      return lineItems.find(item => item.ledgerAccount === ledgerAccount)
    }

    // Helper function to parse numeric value
    const parseValue = (value: any): number => {
      if (value === null || value === undefined) return 0
      return parseFloat(value.toString()) || 0
    }

    // Helper function to get percentage value
    const getPercentage = (item: PlReportLineItem | undefined): number => {
      if (!item || !item.actualsPercentage) return 0
      return parseValue(item.actualsPercentage) * 100
    }

    // SSS (Same Store Sales) = (Actual Net Sales - Prior Year Net Sales) / Prior Year Net Sales × 100%
    const netSalesItem = findItem('Net Sales')
    if (netSalesItem && netSalesItem.actuals && netSalesItem.priorYear) {
      const actualNetSales = parseValue(netSalesItem.actuals)
      const priorYearNetSales = parseValue(netSalesItem.priorYear)
      if (priorYearNetSales !== 0) {
        metrics.sss = ((actualNetSales - priorYearNetSales) / priorYearNetSales) * 100
      }
    }

    // SST% (Same Store Transactions) = (This Year Transactions - Last Year Transactions) / Last Year Transactions × 100%
    const transactionsItem = findItem('Total Transactions')
    if (transactionsItem && transactionsItem.actuals && transactionsItem.priorYear) {
      const actualTransactions = parseValue(transactionsItem.actuals)
      const priorYearTransactions = parseValue(transactionsItem.priorYear)
      if (priorYearTransactions !== 0) {
        metrics.sst = ((actualTransactions - priorYearTransactions) / priorYearTransactions) * 100
      }
    }

    // Prime Cost = COGS % + Labor % (actual)
    const cogsItem = findItem('Cost of Goods Sold')
    const laborItem = findItem('Total Labor')
    if (cogsItem && laborItem && cogsItem.actualsPercentage && laborItem.actualsPercentage) {
      const cogsPercentage = parseValue(cogsItem.actualsPercentage) * 100
      const laborPercentage = parseValue(laborItem.actualsPercentage) * 100
      metrics.primeCost = cogsPercentage + laborPercentage
      metrics.cogsPercentage = cogsPercentage
      metrics.laborPercentage = laborPercentage
    }

    // Rent Total = Rent - MIN + Storage + Percent + Other + Deferred
    const rentMin = parseValue(findItem('Rent - MIN')?.actuals)
    const rentStorage = parseValue(findItem('Rent - Storage')?.actuals)
    const rentPercent = parseValue(findItem('Rent - Percent')?.actuals)
    const rentOther = parseValue(findItem('Rent - Other')?.actuals)
    const rentDeferred = parseValue(findItem('Rent - Deferred Preopening')?.actuals)
    metrics.rentTotal = rentMin + rentStorage + rentPercent + rentOther + rentDeferred

    // Overtime Hours = Overtime Hours (actual) / Average Hourly Wage (actual)
    const overtimeHoursItem = findItem('Overtime Hours')
    const averageWageItem = findItem('Average Hourly Wage')
    if (overtimeHoursItem && averageWageItem && overtimeHoursItem.actuals && averageWageItem.actuals) {
      const overtimeHours = parseValue(overtimeHoursItem.actuals)
      const averageWage = parseValue(averageWageItem.actuals)
      if (averageWage !== 0) {
        metrics.overtimeHours = overtimeHours / averageWage
      }
    }

    // Flow Thru = (Actual Controllable Profit - Last Year Controllable Profit) / (Actual Net Sales - Prior Year Net Sales)
    const controllableProfitItem = findItem('Controllable Profit')
    if (netSalesItem && controllableProfitItem && 
        netSalesItem.actuals && netSalesItem.priorYear &&
        controllableProfitItem.actuals && controllableProfitItem.priorYear) {
      const actualNetSales = parseValue(netSalesItem.actuals)
      const priorYearNetSales = parseValue(netSalesItem.priorYear)
      const actualControllableProfit = parseValue(controllableProfitItem.actuals)
      const priorYearControllableProfit = parseValue(controllableProfitItem.priorYear)
      const netSalesDiff = actualNetSales - priorYearNetSales
      if (netSalesDiff !== 0) {
        metrics.flowThru = (actualControllableProfit - priorYearControllableProfit) / netSalesDiff
      }
    }

    // Adjusted Controllable Profit = CP + Bonus + Workers Comp
    const bonusItem = findItem('Bonus')
    const workersCompItem = findItem('Workers Comp')
    if (controllableProfitItem && bonusItem && workersCompItem) {
      const actualCP = parseValue(controllableProfitItem.actuals)
      const actualBonus = parseValue(bonusItem.actuals)
      const actualWorkersComp = parseValue(workersCompItem.actuals)
      metrics.adjustedControllableProfitThisYear = actualCP + actualBonus + actualWorkersComp

      const priorCP = parseValue(controllableProfitItem.priorYear)
      const priorBonus = parseValue(bonusItem.priorYear)
      const priorWorkersComp = parseValue(workersCompItem.priorYear)
      metrics.adjustedControllableProfitLastYear = priorCP + priorBonus + priorWorkersComp
    }

    // Bonus Calculations
    if (metrics.adjustedControllableProfitThisYear && metrics.adjustedControllableProfitLastYear) {
      const ACPTY = metrics.adjustedControllableProfitThisYear
      const ACPLY = metrics.adjustedControllableProfitLastYear
      const difference = ACPTY - ACPLY
      
      metrics.bonusCalculations = {
        gmBonus: difference * 0.20,
        smBonus: difference * 0.15,
        amChefBonus: difference * 0.10
      }
    }

    // === NEW CALCULATIONS FOR CLIENT-SIDE OPTIMIZATION ===

    // Key Metrics for Dashboard
    const netSales = parseValue(netSalesItem?.actuals)
    const priorNetSales = parseValue(netSalesItem?.priorYear)
    const totalTransactions = parseValue(findItem('Total Transactions')?.actuals)
    const priorTransactions = parseValue(findItem('Total Transactions')?.priorYear)
    const checkAverage = parseValue(findItem('Check Avg - Net')?.actuals)
    const priorCheckAverage = parseValue(findItem('Check Avg - Net')?.priorYear)
    const thirdPartyDigitalSales = parseValue(findItem('3rd Party Digital Sales')?.actuals)
    const pandaDigitalSales = parseValue(findItem('Panda Digital Sales')?.actuals)

    // Calculate changes and percentages
    const netSalesChange = netSales - priorNetSales
    const netSalesChangePercent = priorNetSales !== 0 ? (netSalesChange / priorNetSales) * 100 : 0
    const transactionsChange = totalTransactions - priorTransactions
    const transactionsChangePercent = priorTransactions !== 0 ? (transactionsChange / priorTransactions) * 100 : 0
    const oloPercentage = netSales !== 0 ? ((thirdPartyDigitalSales + pandaDigitalSales) / netSales) * 100 : 0

    // Dashboard metrics
    metrics.dashboard = {
      netSales,
      priorNetSales,
      netSalesChange,
      netSalesChangePercent,
      sssPercentage: metrics.sss || 0,
      cogsPercentage: metrics.cogsPercentage || 0,
      laborPercentage: metrics.laborPercentage || 0,
      controllableProfitPercentage: getPercentage(findItem('Controllable Profit')),
      totalTransactions,
      priorTransactions,
      transactionsChange,
      transactionsChangePercent,
      sstPercentage: metrics.sst || 0,
      checkAverage,
      priorCheckAverage,
      thirdPartyDigitalSales,
      pandaDigitalSales,
      oloPercentage
    }

    // Key Metrics Cards calculations
    const cogsPercentage = getPercentage(findItem('Cost of Goods Sold'))
    const laborPercentage = getPercentage(findItem('Total Labor'))
    const primeCost = cogsPercentage + laborPercentage
    const controllableProfit = parseValue(findItem('Controllable Profit')?.actuals)

    metrics.keyMetrics = {
      cogsPercentage,
      laborPercentage,
      primeCost,
      controllableProfit,
      cogsColor: cogsPercentage < 30 ? 'green' : 'red',
      laborColor: laborPercentage < 30 ? 'green' : 'red',
      primeCostColor: primeCost > 60 ? 'red' : 'green'
    }

    // Chart data calculations
    // Cost of Sales chart data
    const costOfSalesAccounts = ['Grocery', 'Meat', 'Produce', 'Sea Food', 'DRinks', 'Paper Goods', 'Other']
    const costOfSalesData = costOfSalesAccounts.map(account => {
      const item = findItem(account)
      return {
        category: account,
        actual: parseValue(item?.actuals),
        priorYear: parseValue(item?.priorYear)
      }
    }).filter(item => item.actual > 0 || item.priorYear > 0)

    const totalActual = costOfSalesData.reduce((sum, item) => sum + item.actual, 0)
    const totalPriorYear = costOfSalesData.reduce((sum, item) => sum + item.priorYear, 0)

    metrics.charts = {
      costOfSales: {
        data: costOfSalesData,
        totalActual,
        totalPriorYear,
        cogsActualPercentage: getPercentage(findItem('Cost of Goods Sold')),
        cogsPriorYearPercentage: findItem('Cost of Goods Sold') ? parseValue(findItem('Cost of Goods Sold')?.priorYearPercentage) * 100 : 0
      }
    }

    // Pie chart data for Net Sales breakdown
    const laborPercentageForPie = getPercentage(findItem('Total Labor'))
    const cogsPercentageForPie = getPercentage(findItem('Cost of Goods Sold'))
    const cpPercentageForPie = getPercentage(findItem('Controllable Profit'))
    const otherPercentageForPie = Math.max(0, 100 - laborPercentageForPie - cogsPercentageForPie - cpPercentageForPie)

    console.log('Backend pie chart calculations:', {
      netSales,
      laborPercentageForPie,
      cogsPercentageForPie,
      cpPercentageForPie,
      otherPercentageForPie
    })

    const pieChartData = [
      { 
        category: "Labor %", 
        amount: (netSales * laborPercentageForPie / 100), 
        percentage: laborPercentageForPie,
        fill: "var(--color-labor)" 
      },
      { 
        category: "COGS %", 
        amount: (netSales * cogsPercentageForPie / 100), 
        percentage: cogsPercentageForPie,
        fill: "var(--color-cogs)" 
      },
      { 
        category: "CP %", 
        amount: (netSales * cpPercentageForPie / 100), 
        percentage: cpPercentageForPie,
        fill: "var(--color-cp)" 
      },
      { 
        category: "Other", 
        amount: (netSales * otherPercentageForPie / 100), 
        percentage: otherPercentageForPie,
        fill: "var(--color-other)" 
      },
    ].filter(item => item.percentage > 0)

    console.log('Backend pie chart data:', pieChartData)

    metrics.charts.pieChart = {
      data: pieChartData,
      netSales
    }

    console.log('Backend final metrics.charts.pieChart:', metrics.charts.pieChart)

    return metrics
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
