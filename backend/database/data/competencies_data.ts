// IDP Competencies Data
// Based on the original competencies.js structure

export interface CompetencyData {
  id: string
  label: string
  roleLabels: string[] // Which roles this competency belongs to
  questions: {
    id: string
    question: string
  }[]
  actions: {
    id: string
    action: string
    measurement: string
    startDate?: string
    endDate?: string
    responsible?: string[]
    resources?: string[]
  }[]
}

export const competenciesData: CompetencyData[] = [
  // VP/Executive Level Competencies
  {
    id: "strategicMindset",
    label: "Strategic Mindset",
    roleLabels: ["ACO", "Executive"], // For senior leadership and executives
    questions: [
      { id: "strategicMindset-q1", question: "Do you allocate time for long-range (+1 month) planning?" },
      { id: "strategicMindset-q2", question: "Can you articulate how current projects align with the company's vision?" },
      { id: "strategicMindset-q3", question: "How do you prioritize initiatives with limited resources?" },
      { id: "strategicMindset-q4", question: "Do you regularly scan external factors influencing the strategy?" },
      { id: "strategicMindset-q5", question: "How do you communicate strategic priorities to your team?" }
    ],
    actions: [
      {
        id: "strategicMindset-a1",
        action: "I will block one day each month for forward-looking planning.",
        measurement: "Complete 1 full planning day by day 28 with a 30–90 day outline produced.",
        startDate: "7d",
        endDate: "28d",
        responsible: ["GM"],
        resources: ["P&L Report","SMG / OSAT Reports","GEM Survey Data","Meeting Agendas / Huddle Notes"]
      },
      {
        id: "strategicMindset-a2",
        action: "I will prepare a short alignment summary for each active project.",
        measurement: "100% of active projects have a ≤1-page alignment note refreshed within 28 days.",
        startDate: "10d",
        endDate: "28d",
        responsible: ["GM","AM"],
        resources: ["Meeting Agendas / Huddle Notes"]
      },
      {
        id: "strategicMindset-a3",
        action: "I will use a priority ranking system to allocate resources effectively.",
        measurement: "Publish a Top 5 list weekly; allocate time/labor to Top 3 in each of the 4 weeks.",
        startDate: "1d",
        endDate: "28d",
        responsible: ["GM","AM"],
        resources: ["Labor Report / Legion","CrunchTime","Meeting Agendas / Huddle Notes"]
      },
      {
        id: "strategicMindset-a4",
        action: "I will review industry and market updates monthly with the team.",
        measurement: "Hold 1 review by day 28; document 1 store-level adjustment (process/service/scheduling) this period.",
        startDate: "14d",
        endDate: "28d",
        responsible: ["GM","AM","SL"],
        resources: ["Community Portal","SMG / OSAT Reports","Meeting Agendas / Huddle Notes"]
      },
      {
        id: "strategicMindset-a5",
        action: "I will share the top three strategic priorities during monthly meetings.",
        measurement: "Present Top 3 in the monthly agenda this period; spot-check shows ≥80% team recall.",
        startDate: "21d",
        endDate: "28d",
        responsible: ["GM"],
        resources: ["Meeting Agendas / Huddle Notes","WorkJam"]
      }
    ]
  },
  
  // Manager Level Competencies
  {
    id: "businessInsight",
    label: "Business Insight",
    roleLabels: ["Assistant Manager", "ACO", "Executive"], // For management levels
    questions: [
      { id: "businessInsight-q1", question: "Can you teach your direct reports how to understand COGS/Labor and build Sales?" },
      { id: "businessInsight-q2", question: "Are you knowledgeable about trends in the food industry and how they are affecting Panda and your store?" },
      { id: "businessInsight-q3", question: "Are you familiar with the businesses and organizations located around your store?" },
      { id: "businessInsight-q4", question: "Do you regularly use data and reports to make decisions?" },
      { id: "businessInsight-q5", question: "Are your sales forecasts accurate within 5%" }
    ],
    actions: [
      {
        id: "businessInsight-a1",
        action: "I will conduct monthly training sessions with my team on reading and interpreting P&L reports, focusing on COGS, labor, and sales-building strategies.",
        measurement: "AM/Chef scores ≥80% on a P&L quiz within 28 days of the session.",
        startDate: "7d",
        endDate: "28d",
        responsible: ["GM","AM","Chef","SL","Associates"],
        resources: ["P&L Report","CrunchTime","UOP (University of Panda)","Labor Report / Legion"]
      },
      {
        id: "businessInsight-a2",
        action: "I will share quarterly food industry trend updates with my team and lead discussions on potential impacts to our store.",
        measurement: "Within 28 days, GM and AM/Chef explain 1 relevant trend and its impact in a 1:1.",
        startDate: "10d",
        endDate: "28d",
        responsible: ["GM","AM","Chef","SL","Associates"],
        resources: ["Community Portal","SMG / OSAT Reports","Meeting Agendas / Huddle Notes"]
      },
      {
        id: "businessInsight-a3",
        action: "I will create and maintain a contact list of local businesses and meet with at least two neighboring business leaders each month.",
        measurement: "Log ≥1 catering lead/partnership/community contact this period (name + date).",
        startDate: "1d",
        endDate: "21d",
        responsible: ["GM","AM","Chef","SL","Associates"],
        resources: ["Local Business Contact List","Community Portal","Meeting Agendas / Huddle Notes"]
      },
      {
        id: "businessInsight-a4",
        action: "I will review operational reports weekly and document at least one decision that was made using that data.",
        measurement: "Within 28 days, improve ≥1 metric by target: labor% by ≥0.5 pts, or COGS variance by ≥0.5 pts, or OSAT by ≥2 pts vs prior period.",
        startDate: "1d",
        endDate: "28d",
        responsible: ["GM","AM","Chef","SL","Associates"],
        resources: ["P&L Report","Labor Report / Legion","SMG / OSAT Reports","CrunchTime"]
      },
      {
        id: "businessInsight-a5",
        action: "I will compare weekly forecast to actual sales and adjust forecasting methods to maintain accuracy within 5%.",
        measurement: "Forecast variance within ±5% for ≥3 of 4 weeks this period.",
        startDate: "1d",
        endDate: "28d",
        responsible: ["GM","AM","Chef","SL","Associates"],
        resources: ["P&L Report","CrunchTime","Workday"]
      }
    ]
  },

  // Core Competencies (All Levels)
  {
    id: "actionOriented",
    label: "Action Oriented",
    roleLabels: ["Shift Leader", "Assistant Manager", "ACO", "Executive"], // All levels
    questions: [
      { id: "actionOriented-q1", question: "Do you break tasks into quick wins to maintain momentum?" },
      { id: "actionOriented-q2", question: "Do you consistently complete requests from your supervisor?" },
      { id: "actionOriented-q3", question: "Do you avoid analysis paralysis when data is incomplete?" },
      { id: "actionOriented-q4", question: "Do you empower your direct reports & peers to take initiative?" },
      { id: "actionOriented-q5", question: "Do you complete your admin routine (trends/eModules/workJam) on time?" }
    ],
    actions: [
      {
        id: "actionOriented-a1",
        action: "I will identify one quick win to complete at the start of each day.",
        measurement: "Complete ≥5 quick wins per week; log daily (≥20 this period).",
        startDate: "1d",
        endDate: "28d",
        responsible: ["GM"],
        resources: ["Meeting Agendas / Huddle Notes","WorkJam"]
      },
      {
        id: "actionOriented-a2",
        action: "I will complete supervisor requests within agreed timelines.",
        measurement: "Achieve ≥95% on-time completion this period.",
        startDate: "1d",
        endDate: "28d",
        responsible: ["GM"],
        resources: ["Workday","Meeting Agendas / Huddle Notes"]
      },
      {
        id: "actionOriented-a3",
        action: "I will delegate projects to direct reports.",
        measurement: "Delegate ≥2 projects this period; deliver ≥80% by agreed dates.",
        startDate: "1d",
        endDate: "28d",
        responsible: ["GM","AM","SL"],
        resources: ["Meeting Agendas / Huddle Notes","Training Log"]
      },
      {
        id: "actionOriented-a4",
        action: "I will reserve weekly time blocks to finish all admin work.",
        measurement: "Use admin blocks in all 4 weeks; complete trends/eModules/WorkJam by each Friday.",
        startDate: "1d",
        endDate: "28d",
        responsible: ["GM"],
        resources: ["WorkJam","UOP (University of Panda)","Meeting Agendas / Huddle Notes"]
      }
    ]
  },

  {
    id: "communicatesEffectively",
    label: "Communicates Effectively",
    roleLabels: ["Shift Leader", "Assistant Manager", "ACO", "Executive"], // All levels
    questions: [
      { id: "communicatesEffectively-q1", question: "Do you adjust your message for clarity based on audience feedback?" },
      { id: "communicatesEffectively-q2", question: "Do you verify understanding after giving instructions?" },
      { id: "communicatesEffectively-q3", question: "Do people often feel heard after sharing with you?" },
      { id: "communicatesEffectively-q4", question: "Can you balance listening with speaking in conversations?" },
      { id: "communicatesEffectively-q5", question: "Are people often clear with your instructions after your first sharing?" }
    ],
    actions: [
      {
        id: "communicatesEffectively-a1",
        action: "I will revise key communications based on collected feedback.",
        measurement: "Revise each key message once this period; clarity acknowledgment improves next send.",
        startDate: "7d",
        endDate: "21d",
        responsible: ["GM"],
        resources: ["WorkJam","Meeting Agendas / Huddle Notes"]
      },
      {
        id: "communicatesEffectively-a2",
        action: "I will use the \"teach-back\" method to confirm understanding.",
        measurement: "Confirm ≥90% of critical instructions via teach-back this period.",
        startDate: "1d",
        endDate: "28d",
        responsible: ["GM","SL"],
        resources: ["Meeting Agendas / Huddle Notes"]
      },
      {
        id: "communicatesEffectively-a3",
        action: "I will paraphrase what was shared before responding.",
        measurement: "Paraphrase observed in ≥4 conversations this period (spot-check/self-checklist).",
        startDate: "1d",
        endDate: "28d",
        responsible: ["GM"],
        resources: ["Meeting Agendas / Huddle Notes"]
      },
      {
        id: "communicatesEffectively-a4",
        action: "I will keep speaking time balanced with listening in meetings.",
        measurement: "In weekly meeting, GM speaking time ≤50% (timed agenda/observer check) for 4/4 weeks.",
        startDate: "1d",
        endDate: "28d",
        responsible: ["GM"],
        resources: ["Meeting Agendas / Huddle Notes"]
      },
      {
        id: "communicatesEffectively-a5",
        action: "I will provide written confirmation after verbal instructions.",
        measurement: "Send written recap within 24 hours for ≥90% of critical instructions this period.",
        startDate: "1d",
        endDate: "28d",
        responsible: ["GM","SL"],
        resources: ["WorkJam","Meeting Agendas / Huddle Notes"]
      }
    ]
  },

  {
    id: "customerFocus",
    label: "Customer Focus",
    roleLabels: ["Shift Leader", "Assistant Manager", "ACO", "Executive"], // All levels
    questions: [
      { id: "guestFocus-q1", question: "Do you actively gather guest feedback by talking to guests?" },
      { id: "guestFocus-q2", question: "Do you take actions based on guest feedback?" },
      { id: "guestFocus-q3", question: "Can you understand SMG reports and teach back to your team?" },
      { id: "guestFocus-q4", question: "Do front of the house feel empowered to resolve guest complaints?" },
      { id: "guestFocus-q5", question: "Do you anticipate guest needs before they arise?" }
    ],
    actions: [
      {
        id: "guestFocus-a1",
        action: "I will speak to at least five guests per shift for feedback.",
        measurement: "Log ≥5 guest interactions on ≥4 shifts/week (≥16 shifts this period).",
        startDate: "1d",
        endDate: "28d",
        responsible: ["GM","SL","Associates"],
        resources: ["Comments on SMG","SMG / OSAT Reports","Meeting Agendas / Huddle Notes"]
      },
      {
        id: "guestFocus-a2",
        action: "I will implement one guest-driven improvement monthly.",
        measurement: "Implement ≥1 service/process improvement by day 28; note impact (OSAT comments/throughput).",
        startDate: "7d",
        endDate: "28d",
        responsible: ["GM","AM","SL"],
        resources: ["SMG / OSAT Reports","GEM Survey Data","Meeting Agendas / Huddle Notes"]
      },
      {
        id: "guestFocus-a3",
        action: "I will hold a weekly SMG review meeting with the team.",
        measurement: "Complete 4/4 weekly SMG reviews this period; define top 2 focus items.",
        startDate: "1d",
        endDate: "28d",
        responsible: ["GM","AM","SL"],
        resources: ["SMG / OSAT Reports","Comments on SMG","Meeting Agendas / Huddle Notes"]
      },
      {
        id: "guestFocus-a4",
        action: "I will conduct quarterly complaint-resolution training for FOH staff.",
        measurement: "Hold ≥1 refresher this period; unresolved complaints during visit drop by ≥10 pts vs prior 28 days.",
        startDate: "14d",
        endDate: "28d",
        responsible: ["GM","SL"],
        resources: ["UOP (University of Panda)","Meeting Agendas / Huddle Notes","SMG / OSAT Reports"]
      },
      {
        id: "guestFocus-a5",
        action: "I will keep a proactive checklist of common guest needs.",
        measurement: "Review checklist in ≥3 pre-shift huddles per week; random checks show ≥90% items fulfilled this period.",
        startDate: "1d",
        endDate: "28d",
        responsible: ["GM","SL","Associates"],
        resources: ["Meeting Agendas / Huddle Notes","WorkJam"]
      }
    ]
  },

  {
    id: "integrityTrust",
    label: "Integrity and Trust",
    roleLabels: ["Shift Leader", "Assistant Manager", "ACO", "Executive"], // All levels
    questions: [
      { id: "integrityTrust-q1", question: "Do you consistently follow through on promises and commitments?" },
      { id: "integrityTrust-q2", question: "Are you transparent about decision-making criteria?" },
      { id: "integrityTrust-q3", question: "Do you accept mistakes and correct them quickly?" },
      { id: "integrityTrust-q4", question: "Can team members rely on you to act ethically under pressure?" },
      { id: "integrityTrust-q5", question: "Do you protect confidential information?" }
    ],
    actions: [
      {
        id: "integrityTrust-a1",
        action: "I will track promises and confirm completion with stakeholders.",
        measurement: "Achieve ≥95% on-time completion this period; send confirmations within 24 hours.",
        startDate: "1d",
        endDate: "28d",
        responsible: ["GM"],
        resources: ["Meeting Agendas / Huddle Notes","Workday"]
      },
      {
        id: "integrityTrust-a2",
        action: "I will explain decision factors openly in meetings.",
        measurement: "Record stated criteria for 100% of major decisions this period.",
        startDate: "1d",
        endDate: "28d",
        responsible: ["GM"],
        resources: ["Meeting Agendas / Huddle Notes"]
      },
      {
        id: "integrityTrust-a3",
        action: "I will admit and correct mistakes.",
        measurement: "Initiate corrections within 48 hours in ≥90% of cases this period.",
        startDate: "1d",
        endDate: "28d",
        responsible: ["GM"],
        resources: ["Meeting Agendas / Huddle Notes"]
      },
      {
        id: "integrityTrust-a4",
        action: "I will share examples of ethical choices in challenging situations.",
        measurement: "Discuss ≥1 ethics example in a team huddle this period.",
        startDate: "14d",
        endDate: "28d",
        responsible: ["GM","SL"],
        resources: ["WorkJam","Meeting Agendas / Huddle Notes"]
      },
      {
        id: "integrityTrust-a5",
        action: "I will store confidential information in secure systems only.",
        measurement: "0 confidentiality breaches; random monthly check shows no personal-device storage this period.",
        startDate: "1d",
        endDate: "28d",
        responsible: ["GM"],
        resources: ["Workday","Meeting Agendas / Huddle Notes"]
      }
    ]
  }
]
