import { BaseSeeder } from '@adonisjs/lucid/seeders'
import PLQuestion from '#models/pl_question'

export default class extends BaseSeeder {
  async run() {
    const plQuestions = [
      {
        questionId: "1",
        label: "If the net sales were $100,000 this year and the SSS was -5.5%, what were the net sales last year?",
        explanation: "Since SSS = -5.5% (–0.055), calculate 100,000 ÷ 0.945 ≈ 105,820.",
        formula: "Last Year Net Sales = This Year Net Sales ÷ (1 + SSS)",
        a1: "$94,500",
        a2: "$100,000",
        a3: "$105,820",
        a4: "$112,000",
        correctAnswer: "a3"
      },
      {
        questionId: "2",
        label: "If there were 10,500 transactions and $110,000 net sales, what was the check average?",
        explanation: "Calculate 110,000 ÷ 10,500 ≈ 10.48.",
        formula: "Check Average = Net Sales ÷ Number of Transactions",
        a1: "$10.00",
        a2: "$10.48",
        a3: "$10.58",
        a4: "$11.00",
        correctAnswer: "a2"
      },
      {
        questionId: "3",
        label: "If there were 11,000 transactions and the check average was $10.58, what would the net sales be?",
        explanation: "Calculate 11,000 × 10.58 = 116,380.",
        formula: "Net Sales = Number of Transactions × Check Average",
        a1: "$116,380",
        a2: "$115,800",
        a3: "$107,150",
        a4: "$120,000",
        correctAnswer: "a1"
      },
      {
        questionId: "4",
        label: "This week: Beginning Inventory: $5,000, Purchases: $9,400, Transfer Out: $250, Ending Inventory: $4,750, Net Sales: $25,500. What is the COGS% this week?",
        explanation: "First calculate COGS: Beginning Inventory + Purchases = 5,000 + 9,400 = 14,400; subtract Transfer Out: 14,400 – 250 = 14,150; subtract Ending Inventory: 14,150 – 4,750 = 9,400. Then calculate 9,400 ÷ 25,500 ≈ 0.3686, or 36.9%.",
        formula: "COGS% = COGS$ ÷ Net Sales",
        a1: "36.9%",
        a2: "38.9%",
        a3: "33.9%",
        a4: "34.6%",
        correctAnswer: "a1"
      },
      {
        questionId: "5",
        label: "If COGS% = 31.5% and COGS$ = $9,850, then what are the Net Sales?",
        explanation: "Calculate 9,850 ÷ 0.315 ≈ 31,269.84 (rounded to $31,270).",
        formula: "Net Sales = COGS$ ÷ COGS%",
        a1: "$31,270",
        a2: "$33,500",
        a3: "$29,000",
        a4: "$35,000",
        correctAnswer: "a1"
      },
      {
        questionId: "6",
        label: "Direct Labor: $16,000; GM Salary: $4,600; AM & Chef Salary: $3,000; Tax & Benefits: $6,800. What is the Total Labor Cost?",
        explanation: "Calculate 16,000 + 4,600 + 3,000 + 6,800 = 30,400.",
        formula: "Total Labor Cost = Direct Labor + GM Salary + AM & Chef Salary + Tax & Benefits",
        a1: "$27,400",
        a2: "$30,400",
        a3: "$20,900",
        a4: "$27,410",
        correctAnswer: "a2"
      },
      {
        questionId: "7",
        label: "Your Total Labor Cost was $28,750. Management Labor was $4,575, and Tax & Benefits were $8,250. You used 1,485 Direct Labor Hours. What is your Direct Labor Average Wage?",
        explanation: "Direct Labor Cost = Total Labor Cost – Management Labor – Tax & Benefits = 28,750 – 4,575 – 8,250 = 15,925. Average Wage = Direct Labor Cost ÷ Direct Labor Hours = 15,925 ÷ 1,485 ≈ 10.72.",
        formula: "Direct Labor Average Wage = Direct Labor Cost ÷ Direct Labor Hours",
        a1: "$10.25",
        a2: "$10.72",
        a3: "$11.00",
        a4: "$10.50",
        correctAnswer: "a2"
      },
      {
        questionId: "8",
        label: "If your Total Labor Percentage was 26.0% and your Total Labor Cost was $29,500, then what were your Net Sales?",
        explanation: "Calculate 29,500 ÷ 0.26 ≈ 113,461.54 (rounded to $113,462).",
        formula: "Net Sales = Total Labor Cost ÷ Total Labor %",
        a1: "$113,462",
        a2: "$110,000",
        a3: "$115,000",
        a4: "$120,000",
        correctAnswer: "a1"
      },
      {
        questionId: "9",
        label: "COGS%: 33.6%, Total Labor: 25.5%, Controllables: 7.8%, Advertising: 0.3%, Fixed Costs: 5%. Controllable Profit: $42,000. What are your Net Sales?",
        explanation: "First sum the cost percentages: 33.6% + 25.5% + 7.8% + 0.3% + 5% = 72.2%. Controllable Profit% = 100% – 72.2% = 27.8%. Calculate 42,000 ÷ 0.278 ≈ 151,079.",
        formula: "Net Sales = Controllable Profit ÷ Controllable Profit%",
        a1: "$150,000",
        a2: "$151,079",
        a3: "$155,000",
        a4: "$145,000",
        correctAnswer: "a2"
      },
      {
        questionId: "10",
        label: "COGS$: $36,250; Total Labor: $27,000; Controllables: $8,750; Advertising: $750; Net Sales: $110,000. What is your Controllable Profit%?",
        explanation: "First calculate the controllable profit: 110,000 – (36,250 + 27,000 + 8,750 + 750) = 37,250. Percentage = 37,250 ÷ 110,000 ≈ 0.3386, or 33.9%.",
        formula: "Controllable Profit% = Controllable Profit$ ÷ Net Sales",
        a1: "30.5%",
        a2: "32.7%",
        a3: "31.1%",
        a4: "33.9%",
        correctAnswer: "a4"
      },
      {
        questionId: "11",
        label: "The price of a 2-Item Combo is $6.59. Combo portion costs: ½ Chow Mein + ½ Fried Rice $0.33; Orange Chicken $0.67; Broccoli Beef $0.65; Shanghai Angus Steak $1.48. A 22 oz. Drink is priced at $1.59 with a cost of $0.34. Which option yields the highest gross profit?\na) 2-Item Combo (½ Chow Mein & ½ Fried Rice, Orange Chicken, Broccoli Beef)\nb) 3-Item Combo (½ Chow Mein & ½ Fried Rice, Orange Chicken, Broccoli Beef, Shanghai Angus Steak)\nc) 3-Item Combo (½ Chow Mein & ½ Fried Rice, Orange Chicken, Broccoli Beef, Shanghai Angus Steak) + 22 oz. Drink\nd) 2-Item Combo (½ Chow Mein & ½ Fried Rice, Orange Chicken, Broccoli Beef) + 22 oz. Drink\n*Note: Adding Shanghai Angus Steak to the combo increases the combo price by $1.25.*",
        explanation: "Option a: Revenue $6.59 – Cost (0.33 + 0.67 + 0.65) = $1.65 → Profit = $4.94.\nOption b: Combo price $6.59 + $1.25 = $7.84 – Cost (0.33 + 0.67 + 0.65 + 1.48) = $3.13 → Profit = $4.71.\nOption c: Price ($7.84 + $1.59) = $9.43 – Cost (3.13 + 0.34) = $3.47 → Profit = $5.96.\nOption d: Price ($6.59 + $1.59) = $8.18 – Cost (1.65 + 0.34) = $1.99 → Profit = $6.19.\nThe highest gross profit is Option d ($6.19).",
        formula: "Gross Profit = Revenue – Total Cost",
        a1: "2-Item Combo (½ Chow Mein & ½ Fried Rice, Orange Chicken, Broccoli Beef)",
        a2: "3-Item Combo (½ Chow Mein & ½ Fried Rice, Orange Chicken, Broccoli Beef, Shanghai Angus Steak)",
        a3: "3-Item Combo (½ Chow Mein & ½ Fried Rice, Orange Chicken, Broccoli Beef, Shanghai Angus Steak) + 22 oz. Drink",
        a4: "2-Item Combo (½ Chow Mein & ½ Fried Rice, Orange Chicken, Broccoli Beef) + 22 oz. Drink",
        correctAnswer: "a4"
      },
      {
        questionId: "12",
        label: "If the net sales were $100,000 this year and the SSS was 7.5%, what were the net sales last year?",
        explanation: "Since SSS = 7.5% (0.075), calculate 100,000 ÷ 1.075 ≈ 93,023.",
        formula: "Last Year Net Sales = This Year Net Sales ÷ (1 + SSS)",
        a1: "$93,023",
        a2: "$100,000",
        a3: "$107,500",
        a4: "$92,500",
        correctAnswer: "a1"
      },
      {
        questionId: "13",
        label: "If there were 12,500 transactions and the check average was $10.88, what would be the Net Sales?",
        explanation: "Calculate 12,500 × 10.88 = 136,000.",
        formula: "Net Sales = Number of Transactions × Check Average",
        a1: "$136,000",
        a2: "$135,000",
        a3: "$140,000",
        a4: "$130,000",
        correctAnswer: "a1"
      },
      {
        questionId: "14",
        label: "This week: Beginning Inventory: $5,000; Purchases: $9,600; Transfer In: $150; Ending Inventory: $4,750; Net Sales: $29,500. What is the COGS% this week?",
        explanation: "Calculate COGS: 5,000 + 9,600 + 150 – 4,750 = 10,000. Then calculate 10,000 ÷ 29,500 ≈ 0.33898, or 33.9%.",
        formula: "COGS% = COGS$ ÷ Net Sales",
        a1: "36.8%",
        a2: "33.9%",
        a3: "31.8%",
        a4: "None of the above",
        correctAnswer: "a2"
      },
      {
        questionId: "15",
        label: "If the net sales last year were $110,000 and net sales this year were $99,500, what is the SSS?",
        explanation: "Calculate (99,500 – 110,000) ÷ 110,000 = –10,500 ÷ 110,000 ≈ –0.0955, or –9.55%, rounded to –9.5%.",
        formula: "SSS = (This Year Net Sales – Last Year Net Sales) ÷ Last Year Net Sales",
        a1: "-9.5%",
        a2: "-10.0%",
        a3: "-9.0%",
        a4: "-8.5%",
        correctAnswer: "a1"
      },
      {
        questionId: "16",
        label: "If COGS% = 32.8% and COGS$ = $9,250, then what are the Net Sales?",
        explanation: "Calculate 9,250 ÷ 0.328 ≈ 28,231.71 (rounded to $28,232).",
        formula: "Net Sales = COGS$ ÷ COGS%",
        a1: "$28,232",
        a2: "$30,000",
        a3: "$26,500",
        a4: "$29,000",
        correctAnswer: "a1"
      },
      {
        questionId: "17",
        label: "Your Total Labor Cost was $27,750. Management Labor was $4,575 and Tax & Benefits were $8,150. Your average Direct Labor Hourly Wage was $10.25. How many Direct Labor Hours did you use?",
        explanation: " 27,750 – 4,575 – 8,150 = 15,025. Direct Labor Hours = Direct Labor Cost ÷ Average Wage = 15,025 ÷ 10.25 ≈ 1,465.85, rounded to 1,466.",
        formula: "Direct Labor Hours = Direct Labor Cost ÷ Average Hourly Wage",
        a1: "1,466",
        a2: "1,685",
        a3: "1,568",
        a4: "1,644",
        correctAnswer: "a1"
      }
    ]

    // Clear existing questions
    await PLQuestion.query().delete()
    
    // Insert new questions
    await PLQuestion.createMany(plQuestions)
  }
}