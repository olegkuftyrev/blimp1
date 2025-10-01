import { BaseSeeder } from '@adonisjs/lucid/seeders'
import PLQuestion from '#models/pl_question'

export default class extends BaseSeeder {
  async run() {
    console.log('📝 Seeding P&L questions...')
    
    // Clear existing questions
    await PLQuestion.query().delete()
    
    // Create P&L practice questions
    const questions = [
      {
        questionId: 'pl-001',
        label: 'What is the formula for Gross Profit?',
        explanation: 'Gross Profit is calculated by subtracting Cost of Goods Sold (COGS) from Net Sales. This shows how much money remains after direct costs.',
        formula: 'Net Sales - Cost of Goods Sold',
        a1: 'Net Sales - Cost of Goods Sold',
        a2: 'Net Sales - Total Labor',
        a3: 'Net Sales + Cost of Goods Sold',
        a4: 'Gross Sales - Net Sales',
        correctAnswer: 'a1'
      },
      {
        questionId: 'pl-002',
        label: 'What does COGS stand for?',
        explanation: 'COGS stands for Cost of Goods Sold, which includes all direct costs of producing the goods sold by a company.',
        formula: 'N/A',
        a1: 'Cost of General Sales',
        a2: 'Cost of Goods Sold',
        a3: 'Cost of Gross Sales',
        a4: 'Cost of Going Sales',
        correctAnswer: 'a2'
      },
      {
        questionId: 'pl-003',
        label: 'How do you calculate Net Profit Margin %?',
        explanation: 'Net Profit Margin percentage shows what percentage of sales remains as profit after all expenses.',
        formula: '(Net Profit / Net Sales) × 100',
        a1: '(Net Sales / Net Profit) × 100',
        a2: '(Gross Profit / Net Sales) × 100',
        a3: '(Net Profit / Net Sales) × 100',
        a4: '(Net Profit / Total Expenses) × 100',
        correctAnswer: 'a3'
      },
      {
        questionId: 'pl-004',
        label: 'What is the formula for Controllable Profit?',
        explanation: 'Controllable Profit is what remains after subtracting controllable expenses from Gross Profit.',
        formula: 'Gross Profit - Controllables',
        a1: 'Net Sales - Controllables',
        a2: 'Gross Profit - Fixed Costs',
        a3: 'Gross Profit - Controllables',
        a4: 'Net Sales - Total Labor',
        correctAnswer: 'a3'
      },
      {
        questionId: 'pl-005',
        label: 'What components make up Total Labor Cost?',
        explanation: 'Total Labor includes all employee-related costs: wages, salaries, benefits, and payroll taxes.',
        formula: 'Direct Labor + Indirect Labor + Benefits + Taxes',
        a1: 'Wages only',
        a2: 'Wages + Benefits',
        a3: 'Wages + Salaries + Benefits + Payroll Taxes',
        a4: 'Manager Salaries only',
        correctAnswer: 'a3'
      },
      {
        questionId: 'pl-006',
        label: 'How do you calculate Food Cost %?',
        explanation: 'Food Cost % shows what percentage of sales goes to food costs.',
        formula: '(Cost of Goods Sold / Net Sales) × 100',
        a1: '(Net Sales / COGS) × 100',
        a2: '(COGS / Gross Sales) × 100',
        a3: '(COGS / Net Sales) × 100',
        a4: '(COGS - Net Sales) × 100',
        correctAnswer: 'a3'
      },
      {
        questionId: 'pl-007',
        label: 'What is the formula for Restaurant Contribution?',
        explanation: 'Restaurant Contribution is the profit before corporate allocations, calculated by subtracting fixed costs from controllable profit.',
        formula: 'Controllable Profit - Fixed Costs',
        a1: 'Gross Profit - Fixed Costs',
        a2: 'Controllable Profit - Advertising',
        a3: 'Controllable Profit - Fixed Costs',
        a4: 'Net Sales - All Expenses',
        correctAnswer: 'a3'
      },
      {
        questionId: 'pl-008',
        label: 'What does VFP mean in P&L reports?',
        explanation: 'VFP stands for Variance from Plan, showing the difference between actual results and planned targets.',
        formula: 'Actual - Plan',
        a1: 'Value from Performance',
        a2: 'Variance from Plan',
        a3: 'Variable Fixed Profit',
        a4: 'Volume from Production',
        correctAnswer: 'a2'
      },
      {
        questionId: 'pl-009',
        label: 'How do you calculate Labor Cost %?',
        explanation: 'Labor Cost % shows what percentage of sales goes to labor expenses.',
        formula: '(Total Labor / Net Sales) × 100',
        a1: '(Total Labor / Gross Sales) × 100',
        a2: '(Net Sales / Total Labor) × 100',
        a3: '(Total Labor / Net Sales) × 100',
        a4: '(Total Labor + Benefits / Net Sales) × 100',
        correctAnswer: 'a3'
      },
      {
        questionId: 'pl-010',
        label: 'What are considered "Controllables" in a P&L?',
        explanation: 'Controllables are expenses that restaurant management can directly control on a day-to-day basis.',
        formula: 'N/A',
        a1: 'Only food and labor costs',
        a2: 'Supplies, utilities, repairs, and other operating expenses',
        a3: 'Rent and depreciation',
        a4: 'Corporate overhead',
        correctAnswer: 'a2'
      },
      {
        questionId: 'pl-011',
        label: 'What is the formula for Prime Cost?',
        explanation: 'Prime Cost is the sum of your two largest controllable costs: food and labor.',
        formula: 'Cost of Goods Sold + Total Labor',
        a1: 'COGS + Controllables',
        a2: 'COGS + Total Labor',
        a3: 'Net Sales - Gross Profit',
        a4: 'Food Cost + Fixed Costs',
        correctAnswer: 'a2'
      },
      {
        questionId: 'pl-012',
        label: 'How do you calculate Check Average?',
        explanation: 'Check Average shows the average amount spent per customer transaction.',
        formula: 'Net Sales / Total Transactions',
        a1: 'Gross Sales / Total Customers',
        a2: 'Net Sales / Total Transactions',
        a3: 'Total Revenue / Number of Orders',
        a4: 'Sales / Hours Open',
        correctAnswer: 'a2'
      },
      {
        questionId: 'pl-013',
        label: 'What does YTD stand for in financial reports?',
        explanation: 'YTD stands for Year-to-Date, showing cumulative totals from the beginning of the fiscal year to the current date.',
        formula: 'N/A',
        a1: 'Yesterday to Date',
        a2: 'Year to December',
        a3: 'Year-to-Date',
        a4: 'Yearly Total Data',
        correctAnswer: 'a3'
      },
      {
        questionId: 'pl-014',
        label: 'How do you calculate Prime Cost %?',
        explanation: 'Prime Cost % shows what percentage of sales goes to your two largest costs combined.',
        formula: '(Prime Cost / Net Sales) × 100',
        a1: '(COGS + Labor / Gross Sales) × 100',
        a2: '(COGS + Labor / Net Sales) × 100',
        a3: '(Food Cost % + Labor Cost %) / 2',
        a4: '(Total Costs / Net Sales) × 100',
        correctAnswer: 'a2'
      },
      {
        questionId: 'pl-015',
        label: 'What are Fixed Costs in a P&L?',
        explanation: 'Fixed Costs are expenses that remain relatively constant regardless of sales volume.',
        formula: 'N/A',
        a1: 'Rent, insurance, depreciation',
        a2: 'Food and labor',
        a3: 'Supplies and utilities',
        a4: 'Variable costs only',
        correctAnswer: 'a1'
      },
      {
        questionId: 'pl-016',
        label: 'What is the ideal Prime Cost % range for most restaurants?',
        explanation: 'Most successful restaurants aim to keep Prime Cost between 55-65% of sales.',
        formula: 'N/A',
        a1: '30-40%',
        a2: '45-50%',
        a3: '55-65%',
        a4: '70-80%',
        correctAnswer: 'a3'
      },
      {
        questionId: 'pl-017',
        label: 'How is Sales Per Labor Hour calculated?',
        explanation: 'Sales Per Labor Hour (also called Labor Productivity) shows how efficiently labor is being used.',
        formula: 'Net Sales / Total Labor Hours',
        a1: 'Total Labor / Net Sales',
        a2: 'Net Sales / Total Labor Cost',
        a3: 'Net Sales / Total Labor Hours',
        a4: 'Gross Sales / Hours Open',
        correctAnswer: 'a3'
      },
      {
        questionId: 'pl-018',
        label: 'What does Controllable Profit represent?',
        explanation: 'Controllable Profit shows the profit after deducting all expenses that management can control.',
        formula: 'Gross Profit - Controllables',
        a1: 'All profit before taxes',
        a2: 'Profit after controllable expenses',
        a3: 'Net income',
        a4: 'Gross margin',
        correctAnswer: 'a2'
      },
      {
        questionId: 'pl-019',
        label: 'What is Cash Flow in a P&L statement?',
        explanation: 'Cash Flow represents the actual cash generated by the restaurant operations after all expenses.',
        formula: 'Restaurant Contribution - Non-cash expenses adjustments',
        a1: 'Total revenue',
        a2: 'Net profit',
        a3: 'Money in minus money out',
        a4: 'Sales collected',
        correctAnswer: 'c'
      },
      {
        questionId: 'pl-020',
        label: 'How do you calculate Gross Profit Margin %?',
        explanation: 'Gross Profit Margin % shows what percentage of sales remains after direct costs.',
        formula: '(Gross Profit / Net Sales) × 100',
        a1: '(Net Sales / Gross Profit) × 100',
        a2: '(Gross Profit / Total Sales) × 100',
        a3: '(Gross Profit / Net Sales) × 100',
        a4: '(Net Profit / Gross Sales) × 100',
        correctAnswer: 'a3'
      },
      {
        questionId: 'pl-021',
        label: 'What are typical categories in Controllables?',
        explanation: 'Controllables include day-to-day operating expenses that management can influence.',
        formula: 'N/A',
        a1: 'Rent and insurance',
        a2: 'Direct supplies, utilities, repairs, cleaning, marketing',
        a3: 'Food and labor only',
        a4: 'Corporate allocations',
        correctAnswer: 'a2'
      },
      {
        questionId: 'pl-022',
        label: 'What is the purpose of comparing Actual vs Plan?',
        explanation: 'Comparing Actual vs Plan (VFP) helps identify where performance differs from expectations so corrective action can be taken.',
        formula: 'Actual - Plan = Variance',
        a1: 'To calculate taxes',
        a2: 'To identify performance gaps and opportunities',
        a3: 'To set next year\'s budget',
        a4: 'To calculate bonuses',
        correctAnswer: 'a2'
      },
      {
        questionId: 'pl-023',
        label: 'What does a positive VFP in sales indicate?',
        explanation: 'A positive Variance from Plan in sales means actual sales exceeded planned sales, which is favorable.',
        formula: 'N/A',
        a1: 'Sales were below plan',
        a2: 'Sales matched the plan',
        a3: 'Sales exceeded the plan',
        a4: 'Sales data is missing',
        correctAnswer: 'a3'
      },
      {
        questionId: 'pl-024',
        label: 'How do restaurants typically reduce Food Cost %?',
        explanation: 'Food cost can be reduced through better inventory management, portion control, waste reduction, and strategic pricing.',
        formula: 'N/A',
        a1: 'Raise prices or reduce portion sizes',
        a2: 'Better inventory control and waste reduction',
        a3: 'Negotiate with suppliers',
        a4: 'All of the above',
        correctAnswer: 'a4'
      },
      {
        questionId: 'pl-025',
        label: 'What is the formula for Average Hourly Wage?',
        explanation: 'Average Hourly Wage shows the average cost per hour for all labor.',
        formula: 'Total Labor Cost / Total Labor Hours',
        a1: 'Total Labor Hours / Total Labor Cost',
        a2: 'Total Labor Cost / Total Employees',
        a3: 'Total Labor Cost / Total Labor Hours',
        a4: 'Wages / Number of Shifts',
        correctAnswer: 'a3'
      }
    ]
    
    // Insert questions
    for (const question of questions) {
      await PLQuestion.create(question)
    }
    
    console.log(`✅ Successfully seeded ${questions.length} P&L questions!`)
  }
}

