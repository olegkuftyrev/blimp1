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
    // If actual Net Sales is 0, use plan Net Sales as fallback
    const netSalesItem = findItem('Net Sales')
    console.log('SSS Debug - netSalesItem found:', !!netSalesItem)
    if (netSalesItem) {
      console.log('SSS Debug - netSalesItem data:', {
        ledgerAccount: netSalesItem.ledgerAccount,
        actuals: netSalesItem.actuals,
        plan: netSalesItem.plan,
        priorYear: netSalesItem.priorYear
      })
    }
    
    if (netSalesItem && netSalesItem.priorYear) {
      let currentNetSales = parseValue(netSalesItem.actuals)
      
      // Use plan Net Sales as fallback if actual is 0
      if (currentNetSales === 0 && netSalesItem.plan) {
        currentNetSales = parseValue(netSalesItem.plan)
      }
      
      const priorYearNetSales = parseValue(netSalesItem.priorYear)
      console.log('SSS Debug - calculation values:', {
        currentNetSales,
        priorYearNetSales,
        willCalculate: priorYearNetSales !== 0 && currentNetSales > 0
      })
      
      if (priorYearNetSales !== 0 && currentNetSales > 0) {
        metrics.sss = ((currentNetSales - priorYearNetSales) / priorYearNetSales) * 100
        console.log('SSS Debug - calculated SSS:', metrics.sss)
      } else {
        console.log('SSS Debug - SSS not calculated due to conditions')
      }
    } else {
      console.log('SSS Debug - SSS not calculated: netSalesItem missing or no priorYear')
    }

    // SST% (Same Store Transactions) = (This Year Transactions - Last Year Transactions) / Last Year Transactions × 100%
    // If actual Transactions is 0, use plan Transactions as fallback
    const transactionsItem = findItem('Total Transactions')
    if (transactionsItem && transactionsItem.priorYear) {
      let currentTransactions = parseValue(transactionsItem.actuals)
      
      // Use plan Transactions as fallback if actual is 0
      if (currentTransactions === 0 && transactionsItem.plan) {
        currentTransactions = parseValue(transactionsItem.plan)
      }
      
      const priorYearTransactions = parseValue(transactionsItem.priorYear)
      if (priorYearTransactions !== 0 && currentTransactions > 0) {
        metrics.sst = ((currentTransactions - priorYearTransactions) / priorYearTransactions) * 100
      }
    }

    // SSS YTD (Same Store Sales Year-to-Date) = (Actual YTD Net Sales - Prior Year YTD Net Sales) / Prior Year YTD Net Sales × 100%
    // If actual YTD Net Sales is 0, use plan YTD Net Sales as fallback
    if (netSalesItem && netSalesItem.priorYearYtd) {
      let currentYtdNetSales = parseValue(netSalesItem.actualYtd)
      
      // Use plan YTD Net Sales as fallback if actual is 0
      if (currentYtdNetSales === 0 && netSalesItem.planYtd) {
        currentYtdNetSales = parseValue(netSalesItem.planYtd)
      }
      
      const priorYearYtdNetSales = parseValue(netSalesItem.priorYearYtd)
      if (priorYearYtdNetSales !== 0 && currentYtdNetSales > 0) {
        metrics.sssYtd = ((currentYtdNetSales - priorYearYtdNetSales) / priorYearYtdNetSales) * 100
      }
    }

    // SST YTD (Same Store Transactions Year-to-Date) = (This Year YTD Transactions - Last Year YTD Transactions) / Last Year YTD Transactions × 100%
    // If actual YTD Transactions is 0, use plan YTD Transactions as fallback
    if (transactionsItem && transactionsItem.priorYearYtd) {
      let currentYtdTransactions = parseValue(transactionsItem.actualYtd)
      
      // Use plan YTD Transactions as fallback if actual is 0
      if (currentYtdTransactions === 0 && transactionsItem.planYtd) {
        currentYtdTransactions = parseValue(transactionsItem.planYtd)
      }
      
      const priorYearYtdTransactions = parseValue(transactionsItem.priorYearYtd)
      if (priorYearYtdTransactions !== 0 && currentYtdTransactions > 0) {
        metrics.sstYtd = ((currentYtdTransactions - priorYearYtdTransactions) / priorYearYtdTransactions) * 100
      }
    }

    // COGS YTD % = (Cost of Goods Sold YTD / Net Sales YTD) × 100%
    const cogsItem = findItem('Cost of Goods Sold')
    if (cogsItem && cogsItem.actualYtd && netSalesItem && netSalesItem.actualYtd) {
      const cogsYtd = parseValue(cogsItem.actualYtd)
      const netSalesYtd = parseValue(netSalesItem.actualYtd)
      if (netSalesYtd !== 0) {
        metrics.cogsYtdPercentage = (cogsYtd / netSalesYtd) * 100
      }
    }

    // TL YTD % = (Total Labor YTD / Net Sales YTD) × 100%
    const laborItem = findItem('Total Labor')
    if (laborItem && laborItem.actualYtd && netSalesItem && netSalesItem.actualYtd) {
      const laborYtd = parseValue(laborItem.actualYtd)
      const netSalesYtd = parseValue(netSalesItem.actualYtd)
      if (netSalesYtd !== 0) {
        metrics.laborYtdPercentage = (laborYtd / netSalesYtd) * 100
      }
    }

    // CP YTD % = (Controllable Profit YTD / Net Sales YTD) × 100%
    const controllableProfitItem = findItem('Controllable Profit')
    if (controllableProfitItem && controllableProfitItem.actualYtd && netSalesItem && netSalesItem.actualYtd) {
      const cpYtd = parseValue(controllableProfitItem.actualYtd)
      const netSalesYtd = parseValue(netSalesItem.actualYtd)
      if (netSalesYtd !== 0) {
        metrics.controllableProfitYtdPercentage = (cpYtd / netSalesYtd) * 100
      }
    }

    // RC YTD % = (Restaurant Contribution YTD / Net Sales YTD) × 100%
    const restaurantContributionItem = findItem('Restaurant Contribution')
    if (restaurantContributionItem && restaurantContributionItem.actualYtd && netSalesItem && netSalesItem.actualYtd) {
      const rcYtd = parseValue(restaurantContributionItem.actualYtd)
      const netSalesYtd = parseValue(netSalesItem.actualYtd)
      if (netSalesYtd !== 0) {
        metrics.restaurantContributionYtdPercentage = (rcYtd / netSalesYtd) * 100
      }
    }

    // Prime Cost = COGS % + Labor % (actual)
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
    
    // Individual rent components for display
    metrics.rentMin = rentMin
    metrics.rentOther = rentOther
    
    // Rent % = (Rent Total / Net Sales) × 100%
    if (netSalesItem && netSalesItem.actuals && metrics.rentTotal !== 0) {
      const netSales = parseValue(netSalesItem.actuals)
      if (netSales !== 0) {
        metrics.rentPercentage = (metrics.rentTotal / netSales) * 100
      }
    }

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
      
      // Individual bonus components for display
      metrics.gmBonus = difference * 0.20
      metrics.smBonus = difference * 0.15
      metrics.amChefBonus = difference * 0.10
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

  /**
   * Get multiple P&L reports in batch
   */
  async batch({ request, response }: HttpContext) {
    try {
      const qs = request.qs()
      const restaurantIds = qs['restaurantIds[]'] || qs.restaurantIds
      const periods = qs['periods[]'] || qs.periods
      const year = qs.year || new Date().getFullYear()
      
      if (!restaurantIds || !Array.isArray(restaurantIds) || restaurantIds.length === 0) {
        return response.badRequest({ error: 'restaurantIds is required and must be an array' })
      }

      if (!periods || !Array.isArray(periods) || periods.length === 0) {
        return response.badRequest({ error: 'periods is required and must be an array' })
      }

      // Convert restaurantIds to integers
      const restaurantIdNumbers = restaurantIds.map(id => parseInt(id)).filter(id => !isNaN(id))
      
      if (restaurantIdNumbers.length === 0) {
        return response.badRequest({ error: 'Invalid restaurantIds provided' })
      }

      // Query for reports
      let query = PlReport.query()
        .whereIn('restaurant_id', restaurantIdNumbers)
        .where('year', parseInt(year))
      
      // Filter by periods using LIKE to match format "FY 2025 - P01"
      if (periods && periods.length > 0) {
        const periodConditions = periods.map(period => 
          `period LIKE '%${period}%'`
        )
        query = query.whereRaw(`(${periodConditions.join(' OR ')})`)
      }
      
      const reports = await query

      // Format response to match frontend expectations
      const batchReports = reports.map(report => ({
        report: {
          id: report.id,
          restaurantId: report.restaurantId,
          storeName: report.storeName,
          company: report.company,
          period: report.period,
          year: report.year,
          netSales: report.netSales,
          grossSales: report.grossSales,
          costOfGoodsSold: report.costOfGoodsSold,
          totalLabor: report.totalLabor,
          controllables: report.controllables,
          controllableProfit: report.controllableProfit,
          advertising: report.advertising,
          fixedCosts: report.fixedCosts,
          restaurantContribution: report.restaurantContribution,
          cashflow: report.cashflow,
          createdAt: report.createdAt,
          updatedAt: report.updatedAt
        },
        restaurantId: report.restaurantId,
        period: report.period
      }))

      return response.ok({ data: batchReports })
    } catch (error) {
      console.error('P&L batch error:', error)
      return response.internalServerError({ 
        message: 'Failed to fetch P&L reports batch',
        error: error.message 
      })
    }
  }

  /**
   * Get multiple P&L line items with calculations in batch
   */
  async batchLineItems({ request, response }: HttpContext) {
    try {
      const qs = request.qs()
      const reportIds = qs['reportIds[]'] || qs.reportIds
      
      if (!reportIds || !Array.isArray(reportIds) || reportIds.length === 0) {
        return response.badRequest({ error: 'reportIds is required and must be an array' })
      }

      // Convert reportIds to integers
      const reportIdNumbers = reportIds.map(id => parseInt(id)).filter(id => !isNaN(id))
      
      if (reportIdNumbers.length === 0) {
        return response.badRequest({ error: 'Invalid reportIds provided' })
      }

      const results = []

      for (const reportId of reportIdNumbers) {
        try {
          // Get the report with line items
          const report = await PlReport.query()
            .where('id', reportId)
            .preload('lineItems')
            .first()

          if (!report) {
            results.push({
              reportId,
              lineItems: [],
              calculations: null,
              error: 'Report not found'
            })
            continue
          }

          // Calculate metrics using the same logic as individual reports
          const calculations = this.calculateMetrics(report.lineItems)

          results.push({
            reportId,
            lineItems: report.lineItems,
            calculations
          })
        } catch (error) {
          console.error(`Error processing report ${reportId}:`, error)
          results.push({
            reportId,
            lineItems: [],
            calculations: null,
            error: error.message
          })
        }
      }

      return response.ok({ data: results })
    } catch (error) {
      console.error('P&L batch line items error:', error)
      return response.internalServerError({ 
        message: 'Failed to fetch P&L line items batch',
        error: error.message 
      })
    }
  }

}
