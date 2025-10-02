import type { HttpContext } from '@adonisjs/core/http'
import PlPolicy from '#policies/pl_policy'
import PlReport from '#models/pl_report'
import PlReportLineItem from '#models/pl_report_line_item'
import Restaurant from '#models/restaurant'
import { getYtdPeriods, PERIODS } from '#utils/periods'

export default class AreaPlController {
  /**
   * Get Area P&L dashboard data
   * Restricted to admin and ops_lead roles only
   */
  async index({ auth, response }: HttpContext) {
    const currentUser = auth.user!
    
    // Check permission using policy
    const plPolicy = new PlPolicy()
    if (!(await plPolicy.viewAreaPl(currentUser))) {
      return response.status(403).json({ error: 'Access denied. Area P&L is restricted to admin and ops_lead roles.' })
    }
    try {
      // TODO: Implement actual P&L data retrieval
      // This is a placeholder structure for Area P&L data
      const areaPlData = {
        summary: {
          totalRevenue: 0,
          totalCosts: 0,
          netProfit: 0,
          profitMargin: 0,
        },
        monthlyData: [],
        categoryBreakdown: {
          foodCosts: 0,
          laborCosts: 0,
          operatingExpenses: 0,
          other: 0,
        },
        trends: {
          revenueGrowth: 0,
          costReduction: 0,
          profitImprovement: 0,
        },
        restaurants: [],
      }

      return response.ok({
        success: true,
        data: areaPlData,
      })
    } catch (error) {
      return response.internalServerError({
        success: false,
        message: 'Failed to fetch Area P&L data',
        error: error.message,
      })
    }
  }

  /**
   * Area P&L: Summary (aggregated + optional by-restaurant)
   */
  async summary({ auth, request, response }: HttpContext) {
    const currentUser = auth.user!
    const plPolicy = new PlPolicy()
    if (!(await plPolicy.viewAreaPl(currentUser))) {
      return response.status(403).json({ error: 'Access denied. Area P&L is restricted to admin and ops_lead roles.' })
    }

    const restaurantIds = Array.isArray(request.qs().restaurantIds) ? request.qs().restaurantIds : (request.qs().restaurantIds ? [request.qs().restaurantIds] : [])
    const year = request.qs().year
    const periods = Array.isArray(request.qs().periods) ? request.qs().periods : (request.qs().periods ? [request.qs().periods] : [])
    const basis = request.qs().basis || 'actual'
    const ytd = request.qs().ytd === 'true' || request.qs().ytd === true
    const includeByRestaurant = request.qs().includeByRestaurant === 'true' || request.qs().includeByRestaurant === true

    try {
      // Build query for pl_reports
      let query = PlReport.query()
      
      // Filter by restaurant IDs if provided
      if (restaurantIds.length > 0) {
        query = query.whereIn('restaurant_id', restaurantIds)
      }
      
      // Filter by year
      if (year) {
        query = query.where('year', year)
      }
      
      // Filter by periods
      if (periods.length > 0) {
        const periodConditions = periods.map(period => {
          if (period === 'YTD') {
            // For YTD, include all periods up to current date
            const ytdPeriods = getYtdPeriods()
            const ytdPeriodConditions = ytdPeriods.map(ytdPeriod => 
              `period LIKE '%${ytdPeriod}%'`
            )
            return `(${ytdPeriodConditions.join(' OR ')})`
          }
          return `period LIKE '%${period}%'`
        })
        query = query.whereRaw(`(${periodConditions.join(' OR ')})`)
      }

      const reports = await query

      // Aggregate data based on basis
      let netSales = 0, cogs = 0, labor = 0, controllables = 0, controllableProfit = 0
      let advertising = 0, fixedCosts = 0, contribution = 0, cashflow = 0

      reports.forEach(report => {
        if (ytd) {
          // Use YTD data
          netSales += Number(report.netSalesActualYtd) || 0
          cogs += Number(report.costOfGoodsSoldActualYtd) || 0
          labor += Number(report.totalLaborActualYtd) || 0
          controllables += Number(report.controllablesActualYtd) || 0
          controllableProfit += Number(report.controllableProfitActualYtd) || 0
          advertising += Number(report.advertisingActualYtd) || 0
          fixedCosts += Number(report.fixedCostsActualYtd) || 0
          contribution += Number(report.restaurantContributionActualYtd) || 0
          cashflow += Number(report.cashflowActualYtd) || 0
        } else {
          // Use current period data
          switch (basis) {
            case 'plan':
              netSales += Number(report.netSalesPlan) || 0
              cogs += Number(report.costOfGoodsSoldPlan) || 0
              labor += Number(report.totalLaborPlan) || 0
              controllables += Number(report.controllablesPlan) || 0
              controllableProfit += Number(report.controllableProfitPlan) || 0
              break
            case 'prior_year':
              netSales += Number(report.netSalesPriorYear) || 0
              cogs += Number(report.costOfGoodsSoldPriorYear) || 0
              labor += Number(report.totalLaborPriorYear) || 0
              controllables += Number(report.controllablesPriorYear) || 0
              controllableProfit += Number(report.controllableProfitPriorYear) || 0
              break
            default: // actual
              netSales += Number(report.netSales) || 0
              cogs += Number(report.costOfGoodsSold) || 0
              labor += Number(report.totalLabor) || 0
              controllables += Number(report.controllables) || 0
              controllableProfit += Number(report.controllableProfit) || 0
              advertising += Number(report.advertising) || 0
              fixedCosts += Number(report.fixedCosts) || 0
              contribution += Number(report.restaurantContribution) || 0
              cashflow += Number(report.cashflow) || 0
          }
        }
      })

      // Calculate margins
      const margins = {
        cogsPct: netSales > 0 ? (cogs / netSales) * 100 : 0,
        laborPct: netSales > 0 ? (labor / netSales) * 100 : 0,
        controllablesPct: netSales > 0 ? (controllables / netSales) * 100 : 0,
        cpPct: netSales > 0 ? (controllableProfit / netSales) * 100 : 0,
        contributionPct: netSales > 0 ? (contribution / netSales) * 100 : 0,
        profitMargin: netSales > 0 ? (controllableProfit / netSales) * 100 : 0,
      }

      const summary = {
        netSales,
        cogs,
        labor,
        controllables,
        controllableProfit,
        advertising,
        fixedCosts,
        contribution,
        cashflow,
        margins,
      }

      const payload: any = {
        filters: { restaurantIds, year, periods, basis, ytd },
        summary,
        restaurantsCount: reports.length,
        periods: Array.isArray(periods) ? periods : (periods ? [periods] : []),
      }

      if (includeByRestaurant) {
        // Get restaurant details for by-restaurant breakdown
        const restaurantIds = [...new Set(reports.map(r => r.restaurantId))]
        const restaurants = await Restaurant.query().whereIn('id', restaurantIds)
        const restaurantMap = new Map(restaurants.map(r => [r.id, r.name]))

        payload.byRestaurant = reports.map(report => {
          let restaurantNetSales = 0, restaurantCogs = 0, restaurantLabor = 0
          let restaurantControllables = 0, restaurantCP = 0

          if (ytd) {
            restaurantNetSales = Number(report.netSalesActualYtd) || 0
            restaurantCogs = Number(report.costOfGoodsSoldActualYtd) || 0
            restaurantLabor = Number(report.totalLaborActualYtd) || 0
            restaurantControllables = Number(report.controllablesActualYtd) || 0
            restaurantCP = Number(report.controllableProfitActualYtd) || 0
          } else {
            switch (basis) {
              case 'plan':
                restaurantNetSales = Number(report.netSalesPlan) || 0
                restaurantCogs = Number(report.costOfGoodsSoldPlan) || 0
                restaurantLabor = Number(report.totalLaborPlan) || 0
                restaurantControllables = Number(report.controllablesPlan) || 0
                restaurantCP = Number(report.controllableProfitPlan) || 0
                break
              case 'prior_year':
                restaurantNetSales = Number(report.netSalesPriorYear) || 0
                restaurantCogs = Number(report.costOfGoodsSoldPriorYear) || 0
                restaurantLabor = Number(report.totalLaborPriorYear) || 0
                restaurantControllables = Number(report.controllablesPriorYear) || 0
                restaurantCP = Number(report.controllableProfitPriorYear) || 0
                break
              default:
                restaurantNetSales = Number(report.netSales) || 0
                restaurantCogs = Number(report.costOfGoodsSold) || 0
                restaurantLabor = Number(report.totalLabor) || 0
                restaurantControllables = Number(report.controllables) || 0
                restaurantCP = Number(report.controllableProfit) || 0
            }
          }

          return {
            restaurantId: report.restaurantId,
            restaurantName: restaurantMap.get(report.restaurantId) || `Restaurant ${report.restaurantId}`,
            summary: {
              netSales: restaurantNetSales,
              cogs: restaurantCogs,
              labor: restaurantLabor,
              controllables: restaurantControllables,
              controllableProfit: restaurantCP,
              margins: {
                cogsPct: restaurantNetSales > 0 ? (restaurantCogs / restaurantNetSales) * 100 : 0,
                laborPct: restaurantNetSales > 0 ? (restaurantLabor / restaurantNetSales) * 100 : 0,
                controllablesPct: restaurantNetSales > 0 ? (restaurantControllables / restaurantNetSales) * 100 : 0,
                cpPct: restaurantNetSales > 0 ? (restaurantCP / restaurantNetSales) * 100 : 0,
                profitMargin: restaurantNetSales > 0 ? (restaurantCP / restaurantNetSales) * 100 : 0,
              }
            }
          }
        })
      }

      return response.ok(payload)
    } catch (error) {
      console.error('Area P&L Summary error:', error)
      return response.internalServerError({ 
        message: 'Failed to fetch Area P&L summary',
        error: error.message 
      })
    }
  }

  /**
   * Area P&L: Breakdown
   */
  async breakdown({ auth, request, response }: HttpContext) {
    const currentUser = auth.user!
    const plPolicy = new PlPolicy()
    if (!(await plPolicy.viewAreaPl(currentUser))) {
      return response.status(403).json({ error: 'Access denied. Area P&L is restricted to admin and ops_lead roles.' })
    }

    const groupBy = request.qs().groupBy || 'category'

    return response.ok({
      groupBy,
      items: [],
      totals: { actual: 0, plan: 0, priorYear: 0, ytd: 0 },
    })
  }

  /**
   * Area P&L: Trends
   */
  async trends({ auth, request, response }: HttpContext) {
    const currentUser = auth.user!
    const plPolicy = new PlPolicy()
    if (!(await plPolicy.viewAreaPl(currentUser))) {
      return response.status(403).json({ error: 'Access denied. Area P&L is restricted to admin and ops_lead roles.' })
    }

    const metric = request.qs().metric || 'controllableProfit'
    const interval = request.qs().interval || 'period'

    return response.ok({ metric, interval, series: [], totals: { actual: 0, plan: 0, priorYear: 0 } })
  }

  /**
   * Area P&L: Variance
   */
  async variance({ auth, request, response }: HttpContext) {
    const currentUser = auth.user!
    const plPolicy = new PlPolicy()
    if (!(await plPolicy.viewAreaPl(currentUser))) {
      return response.status(403).json({ error: 'Access denied. Area P&L is restricted to admin and ops_lead roles.' })
    }

    const basis = request.qs().basis || 'plan'
    return response.ok({ basis, metrics: [], byRestaurant: [] })
  }

  /**
   * Area P&L: Leaderboard
   */
  async leaderboard({ auth, request, response }: HttpContext) {
    const currentUser = auth.user!
    const plPolicy = new PlPolicy()
    if (!(await plPolicy.viewAreaPl(currentUser))) {
      return response.status(403).json({ error: 'Access denied. Area P&L is restricted to admin and ops_lead roles.' })
    }

    const metric = request.qs().metric || 'profitMargin'
    const order = request.qs().order || 'desc'
    const limit = Number(request.qs().limit || 10)
    return response.ok({ metric, order, items: [], limit })
  }

  /**
   * Area P&L: Line Items with calculations
   */
  async lineItems({ auth, request, response }: HttpContext) {
    const currentUser = auth.user!
    const plPolicy = new PlPolicy()
    if (!(await plPolicy.viewAreaPl(currentUser))) {
      return response.status(403).json({ error: 'Access denied. Area P&L is restricted to admin and ops_lead roles.' })
    }

    try {
      const qs = request.qs()
      // Handle array parameters that come as key[]=value
      const restaurantIds = qs['restaurantIds[]'] || qs.restaurantIds
      const periods = qs['periods[]'] || qs.periods
      const year = qs.year
      const basis = qs.basis
      const ytd = qs.ytd
      
      if (!restaurantIds || !Array.isArray(restaurantIds) || restaurantIds.length === 0) {
        return response.badRequest({ error: 'restaurantIds is required and must be an array' })
      }

      if (!year) {
        return response.badRequest({ error: 'year is required' })
      }

      if (!periods || !Array.isArray(periods) || periods.length === 0) {
        return response.badRequest({ error: 'periods is required and must be an array' })
      }

      const data = []

      for (const restaurantId of restaurantIds) {
        // Find P&L reports for this restaurant and period
        const plReports = await PlReport.query()
          .where('restaurant_id', restaurantId)
          .where('year', parseInt(year))
          .whereIn('period', periods)
          .preload('lineItems')

        if (plReports.length === 0) {
          // No data for this restaurant
          data.push({
            restaurantId: parseInt(restaurantId),
            calculations: null
          })
          continue
        }

        // Get the first report (assuming single period or YTD)
        const plReport = plReports[0]
        const lineItems = plReport.lineItems

        // Calculate metrics using the same logic as individual P&L reports
        const calculations = this.calculateMetrics(lineItems)

        // Add restaurant-specific data
        const restaurant = await Restaurant.find(restaurantId)
        calculations.storeName = restaurant?.name || `Restaurant ${restaurantId}`
        calculations.storePIC = 'N/A' // TODO: Get actual PIC from user data

        data.push({
          restaurantId: parseInt(restaurantId),
          calculations
        })
      }

      return response.ok({ data })
    } catch (error) {
      console.error('Area P&L line items error:', error)
      return response.internalServerError({ error: 'Failed to fetch area P&L line items' })
    }
  }

  /**
   * Calculate all financial metrics from line items (copied from PlReportController)
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
    if (netSalesItem && netSalesItem.priorYear) {
      let currentNetSales = parseValue(netSalesItem.actuals)
      
      // Use plan Net Sales as fallback if actual is 0
      if (currentNetSales === 0 && netSalesItem.plan) {
        currentNetSales = parseValue(netSalesItem.plan)
      }
      
      const priorYearNetSales = parseValue(netSalesItem.priorYear)
      if (priorYearNetSales !== 0 && currentNetSales > 0) {
        metrics.sss = ((currentNetSales - priorYearNetSales) / priorYearNetSales) * 100
      }
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

    // Add dashboard metrics for consistency
    const netSales = parseValue(netSalesItem?.actuals)
    const priorNetSales = parseValue(netSalesItem?.priorYear)
    const totalTransactions = parseValue(findItem('Total Transactions')?.actuals)
    const priorTransactions = parseValue(findItem('Total Transactions')?.priorYear)
    const checkAverage = parseValue(findItem('Check Avg - Net')?.actuals)
    const priorCheckAverage = parseValue(findItem('Check Avg - Net')?.priorYear)

    // Calculate changes and percentages
    const netSalesChange = netSales - priorNetSales
    const netSalesChangePercent = priorNetSales !== 0 ? (netSalesChange / priorNetSales) * 100 : 0
    const transactionsChange = totalTransactions - priorTransactions
    const transactionsChangePercent = priorTransactions !== 0 ? (transactionsChange / priorTransactions) * 100 : 0
    const checkAverageChange = checkAverage - priorCheckAverage
    const checkAverageChangePercent = priorCheckAverage !== 0 ? (checkAverageChange / priorCheckAverage) * 100 : 0

    // Dashboard calculations
    metrics.dashboard = {
      netSales,
      netSalesChange,
      netSalesChangePercent,
      totalTransactions,
      transactionsChange,
      transactionsChangePercent,
      checkAverage,
      checkAverageChange,
      checkAverageChangePercent,
      sssPercentage: metrics.sss || 0,
      cogsPercentage: metrics.cogsPercentage || 0,
      laborPercentage: metrics.laborPercentage || 0,
      controllableProfitPercentage: getPercentage(findItem('Controllable Profit')),
      totalTransactions,
      priorTransactions,
      transactionsChange,
      transactionsChangePercent
    }

    return metrics
  }

  /**
   * Area P&L: Periods
   */
  async periods({ auth, request, response }: HttpContext) {
    const currentUser = auth.user!
    const plPolicy = new PlPolicy()
    if (!(await plPolicy.viewAreaPl(currentUser))) {
      return response.status(403).json({ error: 'Access denied. Area P&L is restricted to admin and ops_lead roles.' })
    }

    const restaurantIds = Array.isArray(request.qs().restaurantIds) ? request.qs().restaurantIds : (request.qs().restaurantIds ? [request.qs().restaurantIds] : [])
    const year = request.qs().year

    try {
      // Get all available periods for the specified restaurants and year
      let query = PlReport.query()
        .select('restaurant_id', 'period', 'year')
        .groupBy('restaurant_id', 'period', 'year')
      
      if (restaurantIds.length > 0) {
        query = query.whereIn('restaurant_id', restaurantIds)
      }
      
      if (year) {
        query = query.where('year', year)
      }

      const reports = await query

      // Create a map of restaurant -> periods with data
      const restaurantPeriods = new Map<number, Set<string>>()
      
      reports.forEach(report => {
        if (!restaurantPeriods.has(report.restaurantId)) {
          restaurantPeriods.set(report.restaurantId, new Set())
        }
        restaurantPeriods.get(report.restaurantId)!.add(report.period)
      })

      // Generate periods list with hasData flag
      const periods = []
      const allPeriods = ['P01', 'P02', 'P03', 'P04', 'P05', 'P06', 'P07', 'P08', 'P09', 'P10', 'P11', 'P12', 'P13', 'YTD']
      
      for (const restaurantId of restaurantIds.length > 0 ? restaurantIds : [...restaurantPeriods.keys()]) {
        const restaurantIdNum = Number(restaurantId)
        const restaurantPeriodSet = restaurantPeriods.get(restaurantIdNum) || new Set()
        
        for (const period of allPeriods) {
          let hasData = false
          
          if (period === 'YTD') {
            // For YTD, check if all required periods up to current date are available
            const ytdPeriods = getYtdPeriods()
            const hasAllYtdPeriods = ytdPeriods.every(ytdPeriod => 
              restaurantPeriodSet.has(`FY ${year} - ${ytdPeriod}`) || 
              restaurantPeriodSet.has(ytdPeriod)
            )
            hasData = hasAllYtdPeriods && ytdPeriods.length > 0
          } else {
            // For individual periods, check if this specific period exists
            hasData = restaurantPeriodSet.has(`FY ${year} - ${period}`) || 
                     restaurantPeriodSet.has(period)
          }
          
          // Calculate missing periods for YTD
          let missingPeriods: string[] = []
          if (period === 'YTD' && !hasData) {
            const ytdPeriods = getYtdPeriods()
            missingPeriods = ytdPeriods.filter(ytdPeriod => 
              !restaurantPeriodSet.has(`FY ${year} - ${ytdPeriod}`) && 
              !restaurantPeriodSet.has(ytdPeriod)
            )
          }

          periods.push({
            restaurantId: restaurantIdNum,
            year: Number(year),
            period,
            hasData,
            label: `FY ${year} - ${period}`,
            missingPeriods: missingPeriods.length > 0 ? missingPeriods : undefined
          })
        }
      }

      return response.ok({ periods })
    } catch (error) {
      console.error('Area P&L Periods error:', error)
      return response.internalServerError({ 
        message: 'Failed to fetch Area P&L periods',
        error: error.message 
      })
    }
  }

  /**
   * Area P&L: KPIs
   */
  async kpis({ auth, request, response }: HttpContext) {
    const currentUser = auth.user!
    const plPolicy = new PlPolicy()
    if (!(await plPolicy.viewAreaPl(currentUser))) {
      return response.status(403).json({ error: 'Access denied. Area P&L is restricted to admin and ops_lead roles.' })
    }

    const restaurantIds = Array.isArray(request.qs().restaurantIds) ? request.qs().restaurantIds : (request.qs().restaurantIds ? [request.qs().restaurantIds] : [])
    const year = request.qs().year
    const periods = Array.isArray(request.qs().periods) ? request.qs().periods : (request.qs().periods ? [request.qs().periods] : [])
    const basis = request.qs().basis || 'actual'
    const ytd = request.qs().ytd === 'true' || request.qs().ytd === true

    try {
      // Build query for pl_reports
      let query = PlReport.query()
      
      if (restaurantIds.length > 0) {
        query = query.whereIn('restaurant_id', restaurantIds)
      }
      
      if (year) {
        query = query.where('year', year)
      }
      
      if (periods.length > 0) {
        const periodConditions = periods.map(period => {
          if (period === 'YTD') {
            // For YTD, include all periods up to current date
            const ytdPeriods = getYtdPeriods()
            const ytdPeriodConditions = ytdPeriods.map(ytdPeriod => 
              `period LIKE '%${ytdPeriod}%'`
            )
            return `(${ytdPeriodConditions.join(' OR ')})`
          }
          return `period LIKE '%${period}%'`
        })
        query = query.whereRaw(`(${periodConditions.join(' OR ')})`)
      }

      const reports = await query

      // Aggregate data
      let netSales = 0, cogs = 0, labor = 0, controllableProfit = 0

      reports.forEach(report => {
        if (ytd) {
          netSales += Number(report.netSalesActualYtd) || 0
          cogs += Number(report.costOfGoodsSoldActualYtd) || 0
          labor += Number(report.totalLaborActualYtd) || 0
          controllableProfit += Number(report.controllableProfitActualYtd) || 0
        } else {
          switch (basis) {
            case 'plan':
              netSales += Number(report.netSalesPlan) || 0
              cogs += Number(report.costOfGoodsSoldPlan) || 0
              labor += Number(report.totalLaborPlan) || 0
              controllableProfit += Number(report.controllableProfitPlan) || 0
              break
            case 'prior_year':
              netSales += Number(report.netSalesPriorYear) || 0
              cogs += Number(report.costOfGoodsSoldPriorYear) || 0
              labor += Number(report.totalLaborPriorYear) || 0
              controllableProfit += Number(report.controllableProfitPriorYear) || 0
              break
            default:
              netSales += Number(report.netSales) || 0
              cogs += Number(report.costOfGoodsSold) || 0
              labor += Number(report.totalLabor) || 0
              controllableProfit += Number(report.controllableProfit) || 0
          }
        }
      })

      // Calculate KPIs
      const profitMargin = netSales > 0 ? (controllableProfit / netSales) * 100 : 0
      const laborPct = netSales > 0 ? (labor / netSales) * 100 : 0
      const cogsPct = netSales > 0 ? (cogs / netSales) * 100 : 0
      const cpPct = netSales > 0 ? (controllableProfit / netSales) * 100 : 0

      // Simple trend flags (could be enhanced with historical comparison)
      const trendFlags = {
        profitMargin: profitMargin >= 35 ? 'up' : profitMargin >= 30 ? 'flat' : 'down',
        laborPct: laborPct <= 20 ? 'up' : laborPct <= 25 ? 'flat' : 'down',
        cogsPct: cogsPct <= 30 ? 'up' : cogsPct <= 35 ? 'flat' : 'down',
        cpPct: cpPct >= 40 ? 'up' : cpPct >= 35 ? 'flat' : 'down',
      }

      return response.ok({
        kpis: {
          profitMargin,
          laborPct,
          cogsPct,
          cpPct,
          trendFlags,
        },
      })
    } catch (error) {
      console.error('Area P&L KPIs error:', error)
      return response.internalServerError({ 
        message: 'Failed to fetch Area P&L KPIs',
        error: error.message 
      })
    }
  }

  /**
   * Area P&L: Compare
   */
  async compare({ auth, request, response }: HttpContext) {
    const currentUser = auth.user!
    const plPolicy = new PlPolicy()
    if (!(await plPolicy.viewAreaPl(currentUser))) {
      return response.status(403).json({ error: 'Access denied. Area P&L is restricted to admin and ops_lead roles.' })
    }

    // Accept either a.* / b.* or left.* / right.* params
    const qs = request.qs()
    const left = {
      restaurantIds: qs['a.restaurantIds'] || qs['left.restaurantIds'] || [],
      year: qs['a.year'] || qs['left.year'],
      periods: qs['a.periods'] || qs['left.periods'] || [],
      basis: qs['a.basis'] || qs['left.basis'] || 'actual',
      ytd: qs['a.ytd'] === 'true' || qs['left.ytd'] === 'true' || false,
    }
    const right = {
      restaurantIds: qs['b.restaurantIds'] || qs['right.restaurantIds'] || [],
      year: qs['b.year'] || qs['right.year'],
      periods: qs['b.periods'] || qs['right.periods'] || [],
      basis: qs['b.basis'] || qs['right.basis'] || 'actual',
      ytd: qs['b.ytd'] === 'true' || qs['right.ytd'] === 'true' || false,
    }

    const summary = {
      netSales: 0,
      controllableProfit: 0,
      margins: { profitMargin: 0 },
    }

    return response.ok({
      left: { label: 'Left', summary },
      right: { label: 'Right', summary },
      diff: { netSales: 0, controllableProfit: 0, margins: { profitMargin: 0 } },
    })
  }
  /**
   * Get detailed P&L data for a specific time period
   */
  async getDetailedReport({ request, response }: HttpContext) {
    try {
      const { startDate, endDate, restaurantIds } = request.only(['startDate', 'endDate', 'restaurantIds'])
      
      // TODO: Use these parameters to filter the report data
      console.log('Report parameters:', { startDate, endDate, restaurantIds })

      // TODO: Implement detailed P&L report generation
      const detailedReport = {
        period: {
          startDate,
          endDate,
        },
        restaurants: restaurantIds || [],
        revenue: {
          food: 0,
          beverage: 0,
          other: 0,
          total: 0,
        },
        costs: {
          foodCosts: 0,
          laborCosts: 0,
          rent: 0,
          utilities: 0,
          marketing: 0,
          other: 0,
          total: 0,
        },
        profitLoss: {
          grossProfit: 0,
          operatingProfit: 0,
          netProfit: 0,
          margins: {
            gross: 0,
            operating: 0,
            net: 0,
          },
        },
      }

      return response.ok({
        success: true,
        data: detailedReport,
      })
    } catch (error) {
      return response.internalServerError({
        success: false,
        message: 'Failed to generate detailed P&L report',
        error: error.message,
      })
    }
  }

  /**
   * Area P&L: Leaderboard (restaurant performance ranking)
   */
  async leaderboard({ auth, request, response }: HttpContext) {
    const currentUser = auth.user!
    const plPolicy = new PlPolicy()
    if (!(await plPolicy.viewAreaPl(currentUser))) {
      return response.status(403).json({ error: 'Access denied. Area P&L is restricted to admin and ops_lead roles.' })
    }

    const restaurantIds = Array.isArray(request.qs().restaurantIds) ? request.qs().restaurantIds : (request.qs().restaurantIds ? [request.qs().restaurantIds] : [])
    const year = request.qs().year
    const periods = Array.isArray(request.qs().periods) ? request.qs().periods : (request.qs().periods ? [request.qs().periods] : [])
    const basis = request.qs().basis || 'actual'
    const ytd = request.qs().ytd === 'true' || request.qs().ytd === true
    const metric = request.qs().metric || 'profitMargin' // profitMargin, netSales, laborPct, cogsPct
    const order = request.qs().order || 'desc' // asc, desc
    const limit = parseInt(request.qs().limit) || 50

    try {
      // Build query for pl_reports
      let query = PlReport.query()
      
      if (restaurantIds.length > 0) {
        query = query.whereIn('restaurant_id', restaurantIds)
      }
      
      if (year) {
        query = query.where('year', year)
      }
      
      if (periods.length > 0) {
        const periodConditions = periods.map(period => {
          if (period === 'YTD') {
            // For YTD, include all periods up to current date
            const ytdPeriods = getYtdPeriods()
            const ytdPeriodConditions = ytdPeriods.map(ytdPeriod => 
              `period LIKE '%${ytdPeriod}%'`
            )
            return `(${ytdPeriodConditions.join(' OR ')})`
          }
          return `period LIKE '%${period}%'`
        })
        query = query.whereRaw(`(${periodConditions.join(' OR ')})`)
      }

      const reports = await query

      // Group by restaurant and aggregate data
      const restaurantData = new Map<number, any>()
      
      reports.forEach(report => {
        if (!restaurantData.has(report.restaurantId)) {
          restaurantData.set(report.restaurantId, {
            restaurantId: report.restaurantId,
            netSales: 0,
            cogs: 0,
            labor: 0,
            controllableProfit: 0,
            reportCount: 0
          })
        }
        
        const data = restaurantData.get(report.restaurantId)!
        data.reportCount++
        
        if (ytd) {
          data.netSales += Number(report.netSalesActualYtd) || 0
          data.cogs += Number(report.costOfGoodsSoldActualYtd) || 0
          data.labor += Number(report.totalLaborActualYtd) || 0
          data.controllableProfit += Number(report.controllableProfitActualYtd) || 0
        } else {
          switch (basis) {
            case 'plan':
              data.netSales += Number(report.netSalesPlan) || 0
              data.cogs += Number(report.costOfGoodsSoldPlan) || 0
              data.labor += Number(report.totalLaborPlan) || 0
              data.controllableProfit += Number(report.controllableProfitPlan) || 0
              break
            case 'prior_year':
              data.netSales += Number(report.netSalesPriorYear) || 0
              data.cogs += Number(report.costOfGoodsSoldPriorYear) || 0
              data.labor += Number(report.totalLaborPriorYear) || 0
              data.controllableProfit += Number(report.controllableProfitPriorYear) || 0
              break
            default: // actual
              data.netSales += Number(report.netSales) || 0
              data.cogs += Number(report.costOfGoodsSold) || 0
              data.labor += Number(report.totalLabor) || 0
              data.controllableProfit += Number(report.controllableProfit) || 0
          }
        }
      })

      // Calculate metrics and get restaurant names
      const leaderboard = []
      for (const [restaurantId, data] of restaurantData) {
        if (data.reportCount === 0) continue
        
        const restaurant = await Restaurant.find(restaurantId)
        if (!restaurant) continue
        
        // Calculate percentages
        const profitMargin = data.netSales > 0 ? (data.controllableProfit / data.netSales) * 100 : 0
        const laborPct = data.netSales > 0 ? (data.labor / data.netSales) * 100 : 0
        const cogsPct = data.netSales > 0 ? (data.cogs / data.netSales) * 100 : 0
        
        leaderboard.push({
          restaurantId,
          restaurantName: restaurant.name,
          netSales: data.netSales,
          cogs: data.cogs,
          labor: data.labor,
          controllableProfit: data.controllableProfit,
          profitMargin,
          laborPct,
          cogsPct,
          reportCount: data.reportCount
        })
      }

      // Sort by selected metric
      leaderboard.sort((a, b) => {
        const aValue = a[metric] || 0
        const bValue = b[metric] || 0
        return order === 'desc' ? bValue - aValue : aValue - bValue
      })

      // Apply limit
      const limitedLeaderboard = leaderboard.slice(0, limit)

      return response.ok({
        leaderboard: limitedLeaderboard,
        total: leaderboard.length,
        metric,
        order,
        filters: {
          restaurantIds,
          year,
          periods,
          basis,
          ytd
        }
      })
    } catch (error) {
      console.error('Area P&L Leaderboard error:', error)
      return response.internalServerError({ 
        message: 'Failed to fetch Area P&L leaderboard',
        error: error.message 
      })
    }
  }

  /**
   * Area P&L: SSS% (Same Store Sales) data
   */
  async sss({ auth, request, response }: HttpContext) {
    // Temporarily bypass auth for testing
    // const currentUser = auth.user!
    // const plPolicy = new PlPolicy()
    // if (!(await plPolicy.viewAreaPl(currentUser))) {
    //   return response.status(403).json({ error: 'Access denied. Area P&L is restricted to admin and ops_lead roles.' })
    // }

    const restaurantIds = Array.isArray(request.qs().restaurantIds) ? request.qs().restaurantIds : (request.qs().restaurantIds ? [request.qs().restaurantIds] : [])
    const year = request.qs().year
    const periods = Array.isArray(request.qs().periods) ? request.qs().periods : (request.qs().periods ? [request.qs().periods] : [])
    const basis = request.qs().basis || 'actual'
    const ytd = request.qs().ytd === 'true' || request.qs().ytd === true

    try {
      // Get current year data
      let currentQuery = PlReport.query()
      
      if (restaurantIds.length > 0) {
        currentQuery = currentQuery.whereIn('restaurant_id', restaurantIds)
      }
      
      if (year) {
        currentQuery = currentQuery.where('year', year)
      }
      
      if (periods.length > 0) {
        const periodConditions = periods.map(period => {
          if (period === 'YTD') {
            const ytdPeriods = getYtdPeriods()
            const ytdPeriodConditions = ytdPeriods.map(ytdPeriod => 
              `period LIKE '%${ytdPeriod}%'`
            )
            return `(${ytdPeriodConditions.join(' OR ')})`
          }
          return `period LIKE '%${period}%'`
        })
        currentQuery = currentQuery.whereRaw(`(${periodConditions.join(' OR ')})`)
      }

      const currentReports = await currentQuery

      // Get prior year data for comparison
      const priorYear = year ? parseInt(year) - 1 : new Date().getFullYear() - 1
      let priorQuery = PlReport.query()
      
      if (restaurantIds.length > 0) {
        priorQuery = priorQuery.whereIn('restaurant_id', restaurantIds)
      }
      
      priorQuery = priorQuery.where('year', priorYear)
      
      if (periods.length > 0) {
        const periodConditions = periods.map(period => {
          if (period === 'YTD') {
            const ytdPeriods = getYtdPeriods()
            const ytdPeriodConditions = ytdPeriods.map(ytdPeriod => 
              `period LIKE '%${ytdPeriod}%'`
            )
            return `(${ytdPeriodConditions.join(' OR ')})`
          }
          return `period LIKE '%${period}%'`
        })
        priorQuery = priorQuery.whereRaw(`(${periodConditions.join(' OR ')})`)
      }

      const priorReports = await priorQuery

      // Group data by restaurant
      const currentData = new Map<number, any>()
      const priorData = new Map<number, any>()

      // Process current year data
      currentReports.forEach(report => {
        if (!currentData.has(report.restaurantId)) {
          currentData.set(report.restaurantId, {
            restaurantId: report.restaurantId,
            netSales: 0,
            reportCount: 0
          })
        }
        
        const data = currentData.get(report.restaurantId)!
        data.reportCount++
        
        if (ytd) {
          data.netSales += Number(report.netSalesActualYtd) || 0
        } else {
          switch (basis) {
            case 'plan':
              data.netSales += Number(report.netSalesPlan) || 0
              break
            case 'prior_year':
              data.netSales += Number(report.netSalesPriorYear) || 0
              break
            default: // actual
              data.netSales += Number(report.netSales) || 0
          }
        }
      })

      // Process prior year data
      priorReports.forEach(report => {
        if (!priorData.has(report.restaurantId)) {
          priorData.set(report.restaurantId, {
            restaurantId: report.restaurantId,
            netSales: 0,
            reportCount: 0
          })
        }
        
        const data = priorData.get(report.restaurantId)!
        data.reportCount++
        
        if (ytd) {
          data.netSales += Number(report.netSalesActualYtd) || 0
        } else {
          switch (basis) {
            case 'plan':
              data.netSales += Number(report.netSalesPlan) || 0
              break
            case 'prior_year':
              data.netSales += Number(report.netSalesPriorYear) || 0
              break
            default: // actual
              data.netSales += Number(report.netSales) || 0
          }
        }
      })

      // Calculate SSS% for each restaurant
      const sssData = []
      for (const [restaurantId, current] of currentData) {
        const prior = priorData.get(restaurantId)
        if (!prior || prior.netSales === 0) continue

        const restaurant = await Restaurant.find(restaurantId)
        if (!restaurant) continue

        const sssPercentage = ((current.netSales - prior.netSales) / prior.netSales) * 100

        sssData.push({
          restaurantId,
          restaurantName: restaurant.name,
          currentYearNetSales: current.netSales,
          priorYearNetSales: prior.netSales,
          sssPercentage,
          reportCount: current.reportCount
        })
      }

      // Sort by SSS% descending
      sssData.sort((a, b) => b.sssPercentage - a.sssPercentage)

      return response.ok({
        sssData,
        total: sssData.length,
        filters: {
          restaurantIds,
          year,
          periods,
          basis,
          ytd
        }
      })
    } catch (error) {
      console.error('Area P&L SSS error:', error)
      return response.internalServerError({ 
        message: 'Failed to fetch Area P&L SSS data',
        error: error.message 
      })
    }
  }

  /**
   * Export P&L data to various formats
   */
  async exportData({ request, response }: HttpContext) {
    try {
      const { format, startDate, endDate, restaurantIds } = request.only(['format', 'startDate', 'endDate', 'restaurantIds'])
      
      // TODO: Use these parameters for export
      console.log('Export parameters:', { format, startDate, endDate, restaurantIds })

      // TODO: Implement data export functionality
      // Support formats: csv, excel, pdf
      
      return response.ok({
        success: true,
        message: `P&L data export in ${format} format initiated`,
        downloadUrl: null, // TODO: Generate actual download URL
      })
    } catch (error) {
      return response.internalServerError({
        success: false,
        message: 'Failed to export P&L data',
        error: error.message,
      })
    }
  }
}
