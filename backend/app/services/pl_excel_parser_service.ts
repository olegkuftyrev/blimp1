import XLSX from 'xlsx'

export interface PlLineItemData {
  category: string
  subcategory: string
  ledgerAccount: string
  actuals: number
  actualsPercentage: number
  plan: number
  planPercentage: number
  vfp: number
  priorYear: number
  priorYearPercentage: number
  actualYtd: number
  actualYtdPercentage: number
  planYtd: number
  planYtdPercentage: number
  vfpYtd: number
  priorYearYtd: number
  priorYearYtdPercentage: number
  sortOrder: number
}

export interface PlReportData {
  storeName: string
  company: string
  period: string
  translationCurrency: string
  lineItems: PlLineItemData[]
  summaryData: {
    // Financial metrics with all columns
    netSales: number
    netSalesPlan: number
    netSalesVfp: number
    netSalesPriorYear: number
    netSalesActualYtd: number
    netSalesPlanYtd: number
    netSalesVfpYtd: number
    netSalesPriorYearYtd: number
    
    grossSales: number
    grossSalesPlan: number
    grossSalesVfp: number
    grossSalesPriorYear: number
    grossSalesActualYtd: number
    grossSalesPlanYtd: number
    grossSalesVfpYtd: number
    grossSalesPriorYearYtd: number
    
    costOfGoodsSold: number
    costOfGoodsSoldPlan: number
    costOfGoodsSoldVfp: number
    costOfGoodsSoldPriorYear: number
    costOfGoodsSoldActualYtd: number
    costOfGoodsSoldPlanYtd: number
    costOfGoodsSoldVfpYtd: number
    costOfGoodsSoldPriorYearYtd: number
    
    totalLabor: number
    totalLaborPlan: number
    totalLaborVfp: number
    totalLaborPriorYear: number
    totalLaborActualYtd: number
    totalLaborPlanYtd: number
    totalLaborVfpYtd: number
    totalLaborPriorYearYtd: number
    
    controllables: number
    controllablesPlan: number
    controllablesVfp: number
    controllablesPriorYear: number
    controllablesActualYtd: number
    controllablesPlanYtd: number
    controllablesVfpYtd: number
    controllablesPriorYearYtd: number
    
    controllableProfit: number
    controllableProfitPlan: number
    controllableProfitVfp: number
    controllableProfitPriorYear: number
    controllableProfitActualYtd: number
    controllableProfitPlanYtd: number
    controllableProfitVfpYtd: number
    controllableProfitPriorYearYtd: number
    
    advertising: number
    advertisingPlan: number
    advertisingVfp: number
    advertisingPriorYear: number
    advertisingActualYtd: number
    advertisingPlanYtd: number
    advertisingVfpYtd: number
    advertisingPriorYearYtd: number
    
    fixedCosts: number
    fixedCostsPlan: number
    fixedCostsVfp: number
    fixedCostsPriorYear: number
    fixedCostsActualYtd: number
    fixedCostsPlanYtd: number
    fixedCostsVfpYtd: number
    fixedCostsPriorYearYtd: number
    
    restaurantContribution: number
    restaurantContributionPlan: number
    restaurantContributionVfp: number
    restaurantContributionPriorYear: number
    restaurantContributionActualYtd: number
    restaurantContributionPlanYtd: number
    restaurantContributionVfpYtd: number
    restaurantContributionPriorYearYtd: number
    
    cashflow: number
    cashflowPlan: number
    cashflowVfp: number
    cashflowPriorYear: number
    cashflowActualYtd: number
    cashflowPlanYtd: number
    cashflowVfpYtd: number
    cashflowPriorYearYtd: number
    
    // Performance metrics (keeping as single values for now)
    totalTransactions: number
    checkAverage: number
    directLaborHours: number
    averageHourlyWage: number
    directHoursProductivity: number
    totalHoursProductivity: number
    managementHeadcount: number
    assistantManagerHeadcount: number
    chefHeadcount: number
    breakfastPercentage: number
    lunchPercentage: number
    afternoonPercentage: number
    eveningPercentage: number
    dinnerPercentage: number
    dineInPercentage: number
    takeOutPercentage: number
    driveThruPercentage: number
    thirdPartyDigitalPercentage: number
    pandaDigitalPercentage: number
    inStoreCateringPercentage: number
    cateringSales: number
    pandaDigitalSales: number
    thirdPartyDigitalSales: number
    rewardRedemptions: number
    fundraisingEventsSales: number
    virtualFundraisingSales: number
  }
}

export class PlExcelParserService {
  static parseExcelFile(filePath: string, periodOverride?: string): PlReportData {
    const workbook = XLSX.readFile(filePath)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    
    // Fix !ref if broken
    const fixedRef = this.getActualRangeFromSheet(worksheet)
    if (!fixedRef) {
      throw new Error('Unable to determine data range.')
    }
    worksheet['!ref'] = fixedRef

    // Find header row
    const headerRowIndex = this.findHeaderRow(worksheet, 'Ledger Account')
    if (headerRowIndex === null) {
      throw new Error('Header row with "Ledger Account" not found.')
    }

    // First, get all data to extract metadata
    const allData = XLSX.utils.sheet_to_json(worksheet, { 
      header: 1,
      blankrows: false,
      defval: ''
    }) as any[][]
    
    // Extract metadata from the full data
    const metadata = this.extractMetadata(allData, headerRowIndex)
    
    // Then get data starting from header row
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
      range: headerRowIndex,
      header: 1,
      blankrows: false,
      defval: ''
    }) as any[][]
    
    // Extract period from filename if possible
    const fileName = filePath.split('/').pop() || ''
    const periodFromFile = this.extractPeriodFromFileName(fileName)
    
    // Use period override if provided, otherwise use metadata period, otherwise use filename period
    const finalPeriod = periodOverride || metadata?.period || periodFromFile
    
    return this.parsePlData(jsonData, finalPeriod, metadata)
  }

  static parseExcelBuffer(buffer: Buffer, fileName?: string): PlReportData {
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    
    // Fix !ref if broken
    const fixedRef = this.getActualRangeFromSheet(worksheet)
    if (!fixedRef) {
      throw new Error('Unable to determine data range.')
    }
    worksheet['!ref'] = fixedRef

    // Find header row
    const headerRowIndex = this.findHeaderRow(worksheet, 'Ledger Account')
    if (headerRowIndex === null) {
      throw new Error('Header row with "Ledger Account" not found.')
    }

    // First, get all data to extract metadata
    const allData = XLSX.utils.sheet_to_json(worksheet, { 
      header: 1,
      blankrows: false,
      defval: ''
    }) as any[][]
    
    // Extract metadata from the full data
    const metadata = this.extractMetadata(allData, headerRowIndex)
    
    // Then get data starting from header row
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
      range: headerRowIndex,
      header: 1,
      blankrows: false,
      defval: ''
    }) as any[][]
    
    // Extract period from filename if possible
    const periodFromFile = fileName ? this.extractPeriodFromFileName(fileName) : undefined
    
    // Use metadata period if available, otherwise use filename period
    const finalPeriod = metadata?.period || periodFromFile
    
    return this.parsePlData(jsonData, finalPeriod, metadata)
  }

  // --- UTIL: Normalize text ---
  private static normalizeCellValue(value: any): string {
    if (typeof value !== 'string') return ''
    return value
      .replace(/<[^>]*>/g, '') // Remove HTML tags like <t>
      .replace(/&[^;\s]+;/g, '') // Remove HTML entities like &amp;
      .replace(/\s+/g, ' ') // Collapse whitespace
      .trim()
      .toLowerCase()
  }

  // --- UTIL: Fix broken !ref by scanning cell addresses ---
  private static getActualRangeFromSheet(sheet: any): string | null {
    const cellAddresses = Object.keys(sheet).filter((key) =>
      /^[A-Z]+\d+$/.test(key)
    )

    let minRow = Infinity
    let maxRow = -1
    let minCol = Infinity
    let maxCol = -1

    cellAddresses.forEach((address) => {
      const { r, c } = XLSX.utils.decode_cell(address)
      minRow = Math.min(minRow, r)
      maxRow = Math.max(maxRow, r)
      minCol = Math.min(minCol, c)
      maxCol = Math.max(maxCol, c)
    })

    if (cellAddresses.length === 0) return null

    const start = XLSX.utils.encode_cell({ r: minRow, c: minCol })
    const end = XLSX.utils.encode_cell({ r: maxRow, c: maxCol })

    return `${start}:${end}`
  }

  // --- HEADER ROW DETECTOR: based on keyword like "Ledger Account" ---
  private static findHeaderRow(sheet: any, keyword: string = 'Ledger Account'): number | null {
    const range = XLSX.utils.decode_range(sheet['!ref'])

    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C })
        const cell = sheet[cellAddress]

        if (cell && typeof cell.v === 'string') {
          const cleaned = this.normalizeCellValue(cell.v)
          if (cleaned.includes(keyword.toLowerCase())) {
            console.log(`Matched keyword "${keyword}" at row ${R + 1}`)
            return R
          }
        }
      }
    }

    return null
  }

  private static extractMetadata(allData: any[][], headerRowIndex: number): { storeName: string; company: string; period: string; translationCurrency: string } {
    let storeName = 'Unknown Store'
    let company = 'Unknown Company' 
    let period = 'Unknown Period'
    let translationCurrency = 'USD'
    
    // Look for metadata in the rows before the header
    for (let i = 0; i < headerRowIndex; i++) {
      const row = allData[i]
      if (!row || !row[0]) continue
      
      const cellValue = this.cleanString(row[0])
      
      // Look for store name patterns (usually contains "Cost Center" or store info)
      if (cellValue.toLowerCase().includes('cost center') || cellValue.toLowerCase().includes('store')) {
        // Extract store name from the second column if available
        if (row[1]) {
          storeName = this.cleanString(row[1])
        } else {
          storeName = cellValue
        }
      }
      // Look for company patterns
      else if (cellValue.toLowerCase().includes('company')) {
        // Extract company from the second column if available
        if (row[1]) {
          company = this.cleanString(row[1])
        } else {
          company = cellValue
        }
      }
      // Look for period patterns
      else if (cellValue.toLowerCase().includes('period')) {
        // Extract period from the second column if available
        if (row[1]) {
          period = this.cleanString(row[1])
        } else {
          period = cellValue
        }
      }
      // Look for currency patterns
      else if (cellValue.toLowerCase().includes('currency')) {
        // Extract currency from the second column if available
        if (row[1]) {
          translationCurrency = this.cleanString(row[1])
        } else {
          translationCurrency = cellValue
        }
      }
    }
    
    return { storeName, company, period, translationCurrency }
  }

  private static parsePlData(data: any[][], periodFromFile?: string, metadata?: { storeName: string; company: string; period: string; translationCurrency: string }): PlReportData {
    // Use metadata if provided, otherwise use defaults
    const storeName = metadata?.storeName || 'Unknown Store'
    const company = metadata?.company || 'Unknown Company' 
    const period = periodFromFile || metadata?.period || 'Unknown Period'
    const translationCurrency = metadata?.translationCurrency || 'USD'
    
    console.log('Extracted metadata:', {
      storeName,
      company,
      period,
      translationCurrency
    })

    console.log('Data array length:', data.length)

    // The header row is now data[0] since we used range: headerRowIndex
    const headerRowIndex = 0

    const lineItems: PlLineItemData[] = []
    let currentCategory = ''
    let sortOrder = 0

    // Parse line items starting from the row after headers
    for (let i = headerRowIndex + 2; i < data.length; i++) {
      const row = data[i]
      if (!row || !row[0]) continue

      const ledgerAccount = this.cleanString(row[0])
      
      // Skip empty rows and section headers
      if (!ledgerAccount || ledgerAccount === '') continue

      // Check if this is a category header (no data in actuals column)
      if (!row[1] || row[1] === '') {
        currentCategory = ledgerAccount
        continue
      }

      // Parse the line item data
      const lineItem: PlLineItemData = {
        category: currentCategory,
        subcategory: ledgerAccount,
        ledgerAccount: ledgerAccount,
        actuals: this.parseNumber(row[1]),
        actualsPercentage: this.parsePercentage(row[2]),
        plan: this.parseNumber(row[3]),
        planPercentage: this.parsePercentage(row[4]),
        vfp: this.parseNumber(row[5]),
        priorYear: this.parseNumber(row[6]),
        priorYearPercentage: this.parsePercentage(row[7]),
        actualYtd: this.parseNumber(row[8]),
        actualYtdPercentage: this.parsePercentage(row[9]),
        planYtd: this.parseNumber(row[10]),
        planYtdPercentage: this.parsePercentage(row[11]),
        vfpYtd: this.parseNumber(row[12]),
        priorYearYtd: this.parseNumber(row[13]),
        priorYearYtdPercentage: this.parsePercentage(row[14]), // This is "Prior Year %" for YTD in the Excel
        sortOrder: sortOrder++
      }

      lineItems.push(lineItem)
    }

    console.log(`Total line items parsed: ${lineItems.length}`)

    // Extract summary data from specific line items
    const summaryData = this.extractSummaryData(lineItems)

    return {
      storeName,
      company,
      period,
      translationCurrency,
      lineItems,
      summaryData
    }
  }

  private static extractSummaryData(lineItems: PlLineItemData[]) {
    // Find key line items by ledger account name
    const findLineItem = (accountName: string) => 
      lineItems.find(item => 
        item.ledgerAccount.toLowerCase().includes(accountName.toLowerCase())
      )

    // Extract main financial metrics
    const netSales = findLineItem('Net Sales')
    const grossSales = findLineItem('Gross Sales')
    const costOfGoodsSold = findLineItem('Cost of Goods Sold')
    const totalLabor = findLineItem('Total Labor')
    const controllables = findLineItem('Total Controllables')
    const controllableProfit = findLineItem('Controllable Profit')
    const advertising = findLineItem('Advertising')
    const fixedCosts = findLineItem('Total Fixed Cost')
    const restaurantContribution = findLineItem('Restaurant Contribution')
    const cashflow = findLineItem('Cashflow')

    // Extract performance metrics
    const totalTransactions = findLineItem('Total Transactions')
    const checkAverage = findLineItem('Check Avg - Net')
    const directLaborHours = findLineItem('Direct Labor Hours')
    const averageHourlyWage = findLineItem('Average Hourly Wage')
    const directHoursProductivity = findLineItem('Direct Hours Productivity')
    const totalHoursProductivity = findLineItem('Total Hours Productivity')
    const managementHeadcount = findLineItem('Management Headcount')
    const assistantManagerHeadcount = findLineItem('Assistant Manager Headcount')
    const chefHeadcount = findLineItem('Chef Headcount')

    // Extract daypart percentages
    const breakfastPercentage = findLineItem('Breakfast %')
    const lunchPercentage = findLineItem('Lunch %')
    const afternoonPercentage = findLineItem('Afternoon %')
    const eveningPercentage = findLineItem('Evening %')
    const dinnerPercentage = findLineItem('Dinner %')
    const dineInPercentage = findLineItem('Dine In %')
    const takeOutPercentage = findLineItem('Take Out %')
    const driveThruPercentage = findLineItem('Drive Thru %')
    const thirdPartyDigitalPercentage = findLineItem('3rd Party Digital %')
    const pandaDigitalPercentage = findLineItem('Panda Digital %')
    const inStoreCateringPercentage = findLineItem('In Store Catering %')

    // Extract sales data
    const cateringSales = findLineItem('Catering Sales')
    const pandaDigitalSales = findLineItem('Panda Digital Sales')
    const thirdPartyDigitalSales = findLineItem('3rd Party Digital Sales')
    const rewardRedemptions = findLineItem('Reward Redemptions')
    const fundraisingEventsSales = findLineItem('Fundraising Events Sales')
    const virtualFundraisingSales = findLineItem('Virtual Fundraising Sales')

    return {
      // Net Sales with all columns
      netSales: netSales?.actuals || 0,
      netSalesPlan: netSales?.plan || 0,
      netSalesVfp: netSales?.vfp || 0,
      netSalesPriorYear: netSales?.priorYear || 0,
      netSalesActualYtd: netSales?.actualYtd || 0,
      netSalesPlanYtd: netSales?.planYtd || 0,
      netSalesVfpYtd: netSales?.vfpYtd || 0,
      netSalesPriorYearYtd: netSales?.priorYearYtd || 0,
      
      // Gross Sales with all columns
      grossSales: grossSales?.actuals || 0,
      grossSalesPlan: grossSales?.plan || 0,
      grossSalesVfp: grossSales?.vfp || 0,
      grossSalesPriorYear: grossSales?.priorYear || 0,
      grossSalesActualYtd: grossSales?.actualYtd || 0,
      grossSalesPlanYtd: grossSales?.planYtd || 0,
      grossSalesVfpYtd: grossSales?.vfpYtd || 0,
      grossSalesPriorYearYtd: grossSales?.priorYearYtd || 0,
      
      // Cost of Goods Sold with all columns
      costOfGoodsSold: costOfGoodsSold?.actuals || 0,
      costOfGoodsSoldPlan: costOfGoodsSold?.plan || 0,
      costOfGoodsSoldVfp: costOfGoodsSold?.vfp || 0,
      costOfGoodsSoldPriorYear: costOfGoodsSold?.priorYear || 0,
      costOfGoodsSoldActualYtd: costOfGoodsSold?.actualYtd || 0,
      costOfGoodsSoldPlanYtd: costOfGoodsSold?.planYtd || 0,
      costOfGoodsSoldVfpYtd: costOfGoodsSold?.vfpYtd || 0,
      costOfGoodsSoldPriorYearYtd: costOfGoodsSold?.priorYearYtd || 0,
      
      // Total Labor with all columns
      totalLabor: totalLabor?.actuals || 0,
      totalLaborPlan: totalLabor?.plan || 0,
      totalLaborVfp: totalLabor?.vfp || 0,
      totalLaborPriorYear: totalLabor?.priorYear || 0,
      totalLaborActualYtd: totalLabor?.actualYtd || 0,
      totalLaborPlanYtd: totalLabor?.planYtd || 0,
      totalLaborVfpYtd: totalLabor?.vfpYtd || 0,
      totalLaborPriorYearYtd: totalLabor?.priorYearYtd || 0,
      
      // Controllables with all columns
      controllables: controllables?.actuals || 0,
      controllablesPlan: controllables?.plan || 0,
      controllablesVfp: controllables?.vfp || 0,
      controllablesPriorYear: controllables?.priorYear || 0,
      controllablesActualYtd: controllables?.actualYtd || 0,
      controllablesPlanYtd: controllables?.planYtd || 0,
      controllablesVfpYtd: controllables?.vfpYtd || 0,
      controllablesPriorYearYtd: controllables?.priorYearYtd || 0,
      
      // Controllable Profit with all columns
      controllableProfit: controllableProfit?.actuals || 0,
      controllableProfitPlan: controllableProfit?.plan || 0,
      controllableProfitVfp: controllableProfit?.vfp || 0,
      controllableProfitPriorYear: controllableProfit?.priorYear || 0,
      controllableProfitActualYtd: controllableProfit?.actualYtd || 0,
      controllableProfitPlanYtd: controllableProfit?.planYtd || 0,
      controllableProfitVfpYtd: controllableProfit?.vfpYtd || 0,
      controllableProfitPriorYearYtd: controllableProfit?.priorYearYtd || 0,
      
      // Advertising with all columns
      advertising: advertising?.actuals || 0,
      advertisingPlan: advertising?.plan || 0,
      advertisingVfp: advertising?.vfp || 0,
      advertisingPriorYear: advertising?.priorYear || 0,
      advertisingActualYtd: advertising?.actualYtd || 0,
      advertisingPlanYtd: advertising?.planYtd || 0,
      advertisingVfpYtd: advertising?.vfpYtd || 0,
      advertisingPriorYearYtd: advertising?.priorYearYtd || 0,
      
      // Fixed Costs with all columns
      fixedCosts: fixedCosts?.actuals || 0,
      fixedCostsPlan: fixedCosts?.plan || 0,
      fixedCostsVfp: fixedCosts?.vfp || 0,
      fixedCostsPriorYear: fixedCosts?.priorYear || 0,
      fixedCostsActualYtd: fixedCosts?.actualYtd || 0,
      fixedCostsPlanYtd: fixedCosts?.planYtd || 0,
      fixedCostsVfpYtd: fixedCosts?.vfpYtd || 0,
      fixedCostsPriorYearYtd: fixedCosts?.priorYearYtd || 0,
      
      // Restaurant Contribution with all columns
      restaurantContribution: restaurantContribution?.actuals || 0,
      restaurantContributionPlan: restaurantContribution?.plan || 0,
      restaurantContributionVfp: restaurantContribution?.vfp || 0,
      restaurantContributionPriorYear: restaurantContribution?.priorYear || 0,
      restaurantContributionActualYtd: restaurantContribution?.actualYtd || 0,
      restaurantContributionPlanYtd: restaurantContribution?.planYtd || 0,
      restaurantContributionVfpYtd: restaurantContribution?.vfpYtd || 0,
      restaurantContributionPriorYearYtd: restaurantContribution?.priorYearYtd || 0,
      
      // Cashflow with all columns
      cashflow: cashflow?.actuals || 0,
      cashflowPlan: cashflow?.plan || 0,
      cashflowVfp: cashflow?.vfp || 0,
      cashflowPriorYear: cashflow?.priorYear || 0,
      cashflowActualYtd: cashflow?.actualYtd || 0,
      cashflowPlanYtd: cashflow?.planYtd || 0,
      cashflowVfpYtd: cashflow?.vfpYtd || 0,
      cashflowPriorYearYtd: cashflow?.priorYearYtd || 0,
      
      // Performance metrics (keeping as single values for now)
      totalTransactions: totalTransactions?.actuals || 0,
      checkAverage: checkAverage?.actuals || 0,
      directLaborHours: directLaborHours?.actuals || 0,
      averageHourlyWage: averageHourlyWage?.actuals || 0,
      directHoursProductivity: directHoursProductivity?.actuals || 0,
      totalHoursProductivity: totalHoursProductivity?.actuals || 0,
      managementHeadcount: managementHeadcount?.actuals || 0,
      assistantManagerHeadcount: assistantManagerHeadcount?.actuals || 0,
      chefHeadcount: chefHeadcount?.actuals || 0,
      breakfastPercentage: breakfastPercentage?.actuals || 0,
      lunchPercentage: lunchPercentage?.actuals || 0,
      afternoonPercentage: afternoonPercentage?.actuals || 0,
      eveningPercentage: eveningPercentage?.actuals || 0,
      dinnerPercentage: dinnerPercentage?.actuals || 0,
      dineInPercentage: dineInPercentage?.actuals || 0,
      takeOutPercentage: takeOutPercentage?.actuals || 0,
      driveThruPercentage: driveThruPercentage?.actuals || 0,
      thirdPartyDigitalPercentage: thirdPartyDigitalPercentage?.actuals || 0,
      pandaDigitalPercentage: pandaDigitalPercentage?.actuals || 0,
      inStoreCateringPercentage: inStoreCateringPercentage?.actuals || 0,
      cateringSales: cateringSales?.actuals || 0,
      pandaDigitalSales: pandaDigitalSales?.actuals || 0,
      thirdPartyDigitalSales: thirdPartyDigitalSales?.actuals || 0,
      rewardRedemptions: rewardRedemptions?.actuals || 0,
      fundraisingEventsSales: fundraisingEventsSales?.actuals || 0,
      virtualFundraisingSales: virtualFundraisingSales?.actuals || 0
    }
  }


  private static extractPeriodFromFileName(fileName: string): string | undefined {
    // Look for patterns like P01, P10, P1, etc.
    const periodMatch = fileName.match(/P(\d+)/i)
    if (periodMatch) {
      return `P${periodMatch[1].padStart(2, '0')}`
    }
    return undefined
  }

  private static cleanString(value: any): string {
    if (!value) return ''
    return value.toString().trim()
  }

  private static parseNumber(value: any): number {
    if (!value) return 0
    if (typeof value === 'number') return value
    
    const str = value.toString().trim()
    if (str === '' || str === '-') return 0
    
    // Remove currency symbols, commas, and parentheses
    const cleaned = str.replace(/[$,\s]/g, '').replace(/[()]/g, '-')
    
    const num = parseFloat(cleaned)
    return isNaN(num) ? 0 : num
  }

  private static parsePercentage(value: any): number {
    if (!value) return 0
    if (typeof value === 'number') return value
    
    const str = value.toString().trim()
    if (str === '' || str === '-') return 0
    
    // Remove percentage sign and parentheses
    const cleaned = str.replace(/[%\s]/g, '').replace(/[()]/g, '-')
    
    const num = parseFloat(cleaned)
    return isNaN(num) ? 0 : num
  }
}
