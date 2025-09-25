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
    netSales: number
    grossSales: number
    costOfGoodsSold: number
    totalLabor: number
    controllables: number
    controllableProfit: number
    advertising: number
    fixedCosts: number
    restaurantContribution: number
    cashflow: number
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
  static parseExcelFile(filePath: string): PlReportData {
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
    
    return this.parsePlData(jsonData, periodFromFile, metadata)
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
    
    return this.parsePlData(jsonData, periodFromFile, metadata)
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
        priorYearYtdPercentage: this.parsePercentage(row[14]),
        sortOrder: sortOrder++
      }

      lineItems.push(lineItem)
    }

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
      netSales: netSales?.actuals || 0,
      grossSales: grossSales?.actuals || 0,
      costOfGoodsSold: costOfGoodsSold?.actuals || 0,
      totalLabor: totalLabor?.actuals || 0,
      controllables: controllables?.actuals || 0,
      controllableProfit: controllableProfit?.actuals || 0,
      advertising: advertising?.actuals || 0,
      fixedCosts: fixedCosts?.actuals || 0,
      restaurantContribution: restaurantContribution?.actuals || 0,
      cashflow: cashflow?.actuals || 0,
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

  private static extractValue(data: any[][], row: number, col: number): string {
    return data[row] && data[row][col] ? data[row][col].toString().trim() : ''
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
