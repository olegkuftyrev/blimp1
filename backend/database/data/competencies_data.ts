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
    roleLabels: ["Operations Lead", "Admin"], // For senior leadership and executives
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
    roleLabels: ["Black Shirt", "Operations Lead", "Admin"], // For management levels
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

  {
    id: "attractsDevelopsTalent",
    label: "Attracts and Develops Talent",
    roleLabels: ["Black Shirt", "Operations Lead", "Admin"],
    questions: [
      { id: "attractsDevelopsTalent-q1", question: "Have you successfully recruited diverse candidates for your store?" },
      { id: "attractsDevelopsTalent-q2", question: "Do your direct reports fully understand how to grow to the next level?" },
      { id: "attractsDevelopsTalent-q3", question: "Can you identify high-potential employees and their development needs?" },
      { id: "attractsDevelopsTalent-q4", question: "Have you promoted 3 SL / 3 Cooks within the last 6 months?" },
      { id: "attractsDevelopsTalent-q5", question: "Are your associates motivated and inspired to promote in your store?" }
    ],
    actions: [
      {
        id: "attractsDevelopsTalent-a1",
        action: "I will partner with local organizations to expand diverse candidate outreach.",
        measurement: "Engage ≥2 new sources and schedule ≥4 qualified interviews within 28 days.",
        startDate: "1d",
        endDate: "28d",
        responsible: ["GM","AM","Chef","SL","Associates"],
        resources: ["Workday","Community Portal","Local Business Contact List","Meeting Agendas / Huddle Notes"]
      },
      {
        id: "attractsDevelopsTalent-a2",
        action: "I will hold career development meetings with each direct report every week.",
        measurement: "Complete ≥90% of weekly 1:1s this period (max 1 miss).",
        startDate: "1d",
        endDate: "28d",
        responsible: ["GM","AM"],
        resources: ["Workday","IDP Template","Meeting Agendas / Huddle Notes"]
      },
      {
        id: "attractsDevelopsTalent-a3",
        action: "I will maintain active IDP's with skill gaps and growth plans for each high-potential associate.",
        measurement: "100% of identified HPs have an IDP updated this period with ≥1 completed action.",
        startDate: "7d",
        endDate: "28d",
        responsible: ["GM","AM","SL"],
        resources: ["IDP Template","Workday","UOP (University of Panda)","Training Log"]
      },
      {
        id: "attractsDevelopsTalent-a4",
        action: "I will set promotion targets and track readiness for each candidate on a quarterly basis.",
        measurement: "This period, move ≥1 candidate up ≥1 readiness stage (e.g., from Learning → Almost Ready) in tracker.",
        startDate: "10d",
        endDate: "28d",
        responsible: ["GM","AM"],
        resources: ["Workday","IDP Template","Meeting Agendas / Huddle Notes"]
      },
      {
        id: "attractsDevelopsTalent-a5",
        action: "I will recognize and celebrate promotion achievements publicly during team meetings and on workjam.",
        measurement: "Post recognition on WorkJam and announce in huddle within 7 days of promotion (screenshotted/agenda noted).",
        startDate: "1d",
        endDate: "7d",
        responsible: ["GM","AM","SL"],
        resources: ["WorkJam","Meeting Agendas / Huddle Notes"]
      }
    ]
  },

  {
    id: "beingResilient",
    label: "Being Resilient",
    roleLabels: ["Black Shirt", "Operations Lead", "Admin"],
    questions: [
      { id: "beingResilient-q1", question: "Do you respond optimistically when targets are missed or plans change suddenly?" },
      { id: "beingResilient-q2", question: "Do you maintain composure under high-pressure / high-stress situations?" },
      { id: "beingResilient-q3", question: "When facing challenges, do you focus on things that are in your control?" },
      { id: "beingResilient-q4", question: "Do team members at your store keep composure in high-stress situations?" },
      { id: "beingResilient-q5", question: "Can you recognize your default behavior in stressful situations?" }
    ],
    actions: [
      {
        id: "beingResilient-a1",
        action: "I will share a positive takeaway or solution-focused message after any major change.",
        measurement: "≥90% of major changes have a solution message posted within 24 hours during this period.",
        startDate: "1d",
        endDate: "28d",
        responsible: ["GM","AM","SL"],
        resources: ["WorkJam","Meeting Agendas / Huddle Notes"]
      },
      {
        id: "beingResilient-a2",
        action: "I will learn and model stress-control techniques during peak times.",
        measurement: "Demonstrate a technique in ≥3 peak shifts per week; AM/Chef confirms weekly (4/4 weeks).",
        startDate: "1d",
        endDate: "28d",
        responsible: ["GM","AM","Chef"],
        resources: ["UOP (University of Panda)","Training Log","Meeting Agendas / Huddle Notes"]
      },
      {
        id: "beingResilient-a3",
        action: "I will identify and act on controllable factors in every challenge.",
        measurement: "For each incident, list ≥2 controllables + 1 action; complete ≥80% actions within 7 days this period.",
        startDate: "1d",
        endDate: "28d",
        responsible: ["GM","AM"],
        resources: ["Meeting Agendas / Huddle Notes","Training Log"]
      },
      {
        id: "beingResilient-a4",
        action: "I will roleplay and practice how to handle to emergency situations.",
        measurement: "Run ≥1 emergency drill this period; ≥80% staff participation recorded.",
        startDate: "14d",
        endDate: "28d",
        responsible: ["GM","AM","Chef","SL"],
        resources: ["Food Safety Rules","UOP (University of Panda)","Training Log","Meeting Agendas / Huddle Notes"]
      },
      {
        id: "beingResilient-a5",
        action: "I will journal and do self reflection every night.",
        measurement: "Record ≥20 entries this period and implement ≥1 behavior adjustment weekly (4 total).",
        startDate: "1d",
        endDate: "28d",
        responsible: ["GM"],
        resources: ["Training Log"]
      }
    ]
  },

  {
    id: "cultivatesInnovation",
    label: "Cultivates Innovation",
    roleLabels: ["Operations Lead", "Admin"],
    questions: [
      { id: "cultivatesInnovation-q1", question: "Do you encourage experimentation even if it may fail?" },
      { id: "cultivatesInnovation-q2", question: "How often do you solicit new ideas from frontline staff?" },
      { id: "cultivatesInnovation-q3", question: "Do you allocate budget or time for pilot projects?" },
      { id: "cultivatesInnovation-q4", question: "How do you recognize and reward creative problem solving?" },
      { id: "cultivatesInnovation-q5", question: "Can you name recent innovations implemented in your area?" }
    ],
    actions: [
      {
        id: "cultivatesInnovation-a1",
        action: "I will approve at least 1 pilot idea from my team each quarter.",
        measurement: "Run ≥1 micro-pilot (≥1 test shift) this period with a defined KPI and go/no-go note.",
        startDate: "10d",
        endDate: "28d",
        responsible: ["GM","AM","Chef"],
        resources: ["Meeting Agendas / Huddle Notes","Training Log","SMG / OSAT Reports"]
      },
      {
        id: "cultivatesInnovation-a2",
        action: "I will schedule monthly idea-sharing sessions with all staff.",
        measurement: "Hold 1 session by day 28; capture ≥3 ideas with owners.",
        startDate: "7d",
        endDate: "28d",
        responsible: ["GM","SL"],
        resources: ["Meeting Agendas / Huddle Notes","WorkJam"]
      },
      {
        id: "cultivatesInnovation-a3",
        action: "I will dedicate one shift per month for testing new best practices.",
        measurement: "Complete 1 test shift by day 28; record impact on 1 KPI (e.g., throughput or OSAT comments).",
        startDate: "14d",
        endDate: "28d",
        responsible: ["GM","Chef","SL"],
        resources: ["Training Log","SMG / OSAT Reports","GEM Survey Data"]
      },
      {
        id: "cultivatesInnovation-a4",
        action: "I will highlight innovative solutions on the store's communication board.",
        measurement: "Post ≥2 innovations this period with owner and result.",
        startDate: "7d",
        endDate: "28d",
        responsible: ["GM","SL"],
        resources: ["WorkJam","Meeting Agendas / Huddle Notes"]
      },
      {
        id: "cultivatesInnovation-a5",
        action: "I will keep a visible log of innovations implemented in the store.",
        measurement: "Update the log within 7 days of each implementation; add ≥1 new entry this period.",
        startDate: "1d",
        endDate: "28d",
        responsible: ["GM"],
        resources: ["Training Log","Meeting Agendas / Huddle Notes"]
      }
    ]
  },

  {
    id: "drivesResults",
    label: "Drives Results",
    roleLabels: ["Operations Lead", "Admin"],
    questions: [
      { id: "drivesResults-q1", question: "Do you set clear, measurable goals for every project?" },
      { id: "drivesResults-q2", question: "How do you track progress and course-correct quickly?" },
      { id: "drivesResults-q3", question: "Can you demonstrate a track record of meeting or exceeding targets?" },
      { id: "drivesResults-q4", question: "Do you hold yourself and others accountable for outcomes?" },
      { id: "drivesResults-q5", question: "How do you overcome obstacles that threaten goal achievement?" }
    ],
    actions: [
      {
        id: "drivesResults-a1",
        action: "I will write SMART goals on a periodic and quarterly basis.",
        measurement: "100% projects have SMART goals documented at start; review by day 28.",
        startDate: "1d",
        endDate: "28d",
        responsible: ["GM"],
        resources: ["Meeting Agendas / Huddle Notes"]
      },
      {
        id: "drivesResults-a2",
        action: "I will review and update project status weekly.",
        measurement: "Update status in ≥3 of 4 weeks; resolve or escalate blockers within 7 days.",
        startDate: "1d",
        endDate: "28d",
        responsible: ["GM","AM"],
        resources: ["Meeting Agendas / Huddle Notes","Workday"]
      },
      {
        id: "drivesResults-a3",
        action: "I will record achievements in a quarterly performance report.",
        measurement: "This period, record ≥3 quantified results to include in the quarterly report.",
        startDate: "1d",
        endDate: "28d",
        responsible: ["GM"],
        resources: ["P&L Report","CrunchTime","SMG / OSAT Reports","Meeting Agendas / Huddle Notes"]
      },
      {
        id: "drivesResults-a4",
        action: "I will conduct monthly accountability reviews with direct reports.",
        measurement: "Complete ≥90% of monthly reviews this period; close prior action items before next review.",
        startDate: "21d",
        endDate: "28d",
        responsible: ["GM","AM"],
        resources: ["Meeting Agendas / Huddle Notes","Training Log","Workday"]
      },
      {
        id: "drivesResults-a5",
        action: "I will create backup action plans for all major goals.",
        measurement: "100% major goals have a contingency with trigger points; if triggered this period, respond within 48 hours.",
        startDate: "7d",
        endDate: "21d",
        responsible: ["GM"],
        resources: ["Meeting Agendas / Huddle Notes"]
      }
    ]
  },

  {
    id: "situationalAdaptability",
    label: "Situational Adaptability",
    roleLabels: ["Operations Lead", "Admin"],
    questions: [
      { id: "situationalAdaptability-q1", question: "How quickly do you adjust plans when priorities shift?" },
      { id: "situationalAdaptability-q2", question: "Do you tailor your communication style to different audiences?" },
      { id: "situationalAdaptability-q3", question: "Can you provide an example of successfully navigating ambiguity?" },
      { id: "situationalAdaptability-q4", question: "How do you balance competing demands without losing focus?" },
      { id: "situationalAdaptability-q5", question: "Do you encourage your team to embrace change positively?" }
    ],
    actions: [
      {
        id: "situationalAdaptability-a1",
        action: "I will update plans within 24 hours of a major change.",
        measurement: "Reflect ≥90% of major changes in schedule/task lists within 24 hours this period.",
        startDate: "1d",
        endDate: "28d",
        responsible: ["GM","AM","SL"],
        resources: ["Meeting Agendas / Huddle Notes","WorkJam"]
      },
      {
        id: "situationalAdaptability-a2",
        action: "I will adapt message style and delivery method for each audience.",
        measurement: "For key messages this period, use ≥2 formats (e.g., verbal + written); spot-check ≥80% understanding.",
        startDate: "1d",
        endDate: "28d",
        responsible: ["GM","SL"],
        resources: ["WorkJam","Meeting Agendas / Huddle Notes"]
      },
      {
        id: "situationalAdaptability-a3",
        action: "I will share one ambiguity success story quarterly with my team.",
        measurement: "Share ≥1 ambiguity example this period; capture lesson in notes.",
        startDate: "21d",
        endDate: "28d",
        responsible: ["GM"],
        resources: ["Meeting Agendas / Huddle Notes","WorkJam"]
      },
      {
        id: "situationalAdaptability-a4",
        action: "I will use a weekly priority list to keep focus on top-impact tasks.",
        measurement: "Update list weekly; complete ≥80% of 'Top 3' tasks each of the 4 weeks.",
        startDate: "1d",
        endDate: "28d",
        responsible: ["GM"],
        resources: ["Meeting Agendas / Huddle Notes"]
      },
      {
        id: "situationalAdaptability-a5",
        action: "I will publicly acknowledge team members who adapt quickly.",
        measurement: "Make ≥2 acknowledgments this period (huddle/WorkJam) within 7 days of behavior.",
        startDate: "7d",
        endDate: "28d",
        responsible: ["GM","SL"],
        resources: ["WorkJam","Meeting Agendas / Huddle Notes"]
      }
    ]
  },

  {
    id: "courage",
    label: "Courage",
    roleLabels: ["Operations Lead", "Admin"],
    questions: [
      { id: "courage-q1", question: "Do you speak up about issues even when unpopular?" },
      { id: "courage-q2", question: "How do you handle conflict or pushback constructively?" },
      { id: "courage-q3", question: "Can you recall a time you defended a principle under pressure?" },
      { id: "courage-q4", question: "Do you invite challenging perspectives in discussions?" },
      { id: "courage-q5", question: "How do you create psychological safety for others to be candid?" }
    ],
    actions: [
      {
        id: "courage-a1",
        action: "I will raise at least one important concern during leadership meetings.",
        measurement: "Raise ≥1 substantive issue this period; agree on follow-up within 7 days.",
        startDate: "7d",
        endDate: "21d",
        responsible: ["GM"],
        resources: ["Meeting Agendas / Huddle Notes"]
      },
      {
        id: "courage-a2",
        action: "I will practice active listening before responding in conflicts.",
        measurement: "In ≥80% of documented conflicts this period, counterpart confirms they felt heard (yes/no check).",
        startDate: "1d",
        endDate: "28d",
        responsible: ["GM","AM","SL"],
        resources: ["Meeting Agendas / Huddle Notes"]
      },
      {
        id: "courage-a3",
        action: "I will document lessons learned after defending key principles.",
        measurement: "Capture ≥1 lesson within 72 hours of incident; implement ≥1 practice change within 14 days.",
        startDate: "1d",
        endDate: "28d",
        responsible: ["GM"],
        resources: ["Meeting Agendas / Huddle Notes","Training Log"]
      },
      {
        id: "courage-a4",
        action: "I will invite alternative viewpoints in each major discussion.",
        measurement: "For each major decision this period, record ≥1 dissenting view before final call.",
        startDate: "1d",
        endDate: "28d",
        responsible: ["GM"],
        resources: ["Meeting Agendas / Huddle Notes"]
      },
      {
        id: "courage-a5",
        action: "I will thank team members publicly for sharing candid feedback.",
        measurement: "Make ≥2 public acknowledgments this period (huddle/WorkJam).",
        startDate: "7d",
        endDate: "28d",
        responsible: ["GM","SL"],
        resources: ["WorkJam","Meeting Agendas / Huddle Notes"]
      }
    ]
  },

  {
    id: "decisionQuality",
    label: "Decision Quality",
    roleLabels: ["Associate", "Black Shirt", "Operations Lead", "Admin"],
    questions: [
      { id: "decisionQuality-q1", question: "Do you structure complex decisions using a pros & cons sheet?" },
      { id: "decisionQuality-q2", question: "Do people often come to you for advice on their challenges?" },
      { id: "decisionQuality-q3", question: "Does your decision process often bring you to the expected results?" },
      { id: "decisionQuality-q4", question: "Can you share the logic behind your decisions with others?" },
      { id: "decisionQuality-q5", question: "Do you include data in your decision process?" }
    ],
    actions: [
      {
        id: "decisionQuality-a1",
        action: "I will complete a pros & cons sheet for every major decision.",
        measurement: "Attach a dated pros/cons page before 100% of major decisions this period.",
        startDate: "1d",
        endDate: "28d",
        responsible: ["GM"],
        resources: ["Meeting Agendas / Huddle Notes"]
      },
      {
        id: "decisionQuality-a2",
        action: "I will offer open office hours weekly for team advice.",
        measurement: "Hold office hours weekly; complete ≥2 team consultations this period.",
        startDate: "1d",
        endDate: "28d",
        responsible: ["GM"],
        resources: ["Meeting Agendas / Huddle Notes","WorkJam"]
      },
      {
        id: "decisionQuality-a3",
        action: "I will review decision outcomes periodically to find improvement areas.",
        measurement: "Review ≥2 decisions this period; implement ≥1 improvement within 14 days.",
        startDate: "7d",
        endDate: "28d",
        responsible: ["GM"],
        resources: ["P&L Report","CrunchTime","SMG / OSAT Reports","Meeting Agendas / Huddle Notes"]
      },
      {
        id: "decisionQuality-a4",
        action: "I will write the \"why\" for major decisions in meeting notes.",
        measurement: "Record rationale within 24 hours for 100% of major decisions this period.",
        startDate: "1d",
        endDate: "28d",
        responsible: ["GM"],
        resources: ["Meeting Agendas / Huddle Notes"]
      },
      {
        id: "decisionQuality-a5",
        action: "I will use multiple reports and review the data before making operational decisions.",
        measurement: "For each ops decision this period, cite ≥2 reports (e.g., SMG, labor, sales) in notes pre-action.",
        startDate: "1d",
        endDate: "28d",
        responsible: ["GM","AM"],
        resources: ["P&L Report","Labor Report / Legion","SMG / OSAT Reports","CrunchTime"]
      }
    ]
  },

  {
    id: "ensuresAccountability",
    label: "Ensures Accountability",
    roleLabels: ["Associate", "Black Shirt", "Operations Lead", "Admin"],
    questions: [
      { id: "ensuresAccountability-q1", question: "Do you set clear expectations and deadlines for every associate?" },
      { id: "ensuresAccountability-q2", question: "Do you track ownership of tasks among team members?" },
      { id: "ensuresAccountability-q3", question: "Do you provide timely feedback when commitments are not met?" },
      { id: "ensuresAccountability-q4", question: "Can you describe the consequences for not meeting standards based on the policies?" },
      { id: "ensuresAccountability-q5", question: "Do you model accountability through your own behavior?" }
    ],
    actions: [
      {
        id: "ensuresAccountability-a1",
        action: "I will define expectations and due dates at the start of each task.",
        measurement: "Set owner and due date for 100% of tasks assigned this period.",
        startDate: "1d",
        endDate: "28d",
        responsible: ["GM","AM","SL"],
        resources: ["Meeting Agendas / Huddle Notes","Workday"]
      },
      {
        id: "ensuresAccountability-a2",
        action: "I will complete all modules and training logs with team to ensure proper training before corrective actions.",
        measurement: "Complete 100% required modules/logs before any corrective step this period (0 exceptions).",
        startDate: "1d",
        endDate: "28d",
        responsible: ["GM","AM","SL"],
        resources: ["UOP (University of Panda)","Training Log"]
      },
      {
        id: "ensuresAccountability-a3",
        action: "I will deliver feedback when commitments are missed.",
        measurement: "Provide feedback within 24 hours for ≥90% of misses this period.",
        startDate: "1d",
        endDate: "28d",
        responsible: ["GM","AM","SL"],
        resources: ["Meeting Agendas / Huddle Notes"]
      },
      {
        id: "ensuresAccountability-a4",
        action: "I will review policy consequences with the team during onboarding.",
        measurement: "100% of new hires this period receive policy walk-through; day-1 acknowledgment captured.",
        startDate: "1d",
        endDate: "28d",
        responsible: ["GM","AM"],
        resources: ["UOP (University of Panda)","Meeting Agendas / Huddle Notes","Food Safety Rules"]
      },
      {
        id: "ensuresAccountability-a5",
        action: "I will share personal examples of accountability in meetings.",
        measurement: "Share ≥1 example this period; captured in meeting notes.",
        startDate: "21d",
        endDate: "28d",
        responsible: ["GM"],
        resources: ["Meeting Agendas / Huddle Notes","WorkJam"]
      }
    ]
  },

  {
    id: "valuesDifferences",
    label: "Values Differences",
    roleLabels: ["Associate", "Black Shirt", "Operations Lead", "Admin"],
    questions: [
      { id: "valuesDifferences-q1", question: "Do you actively seek input from people with diverse backgrounds?" },
      { id: "valuesDifferences-q2", question: "Can you identify and mitigate unconscious bias in your processes?" },
      { id: "valuesDifferences-q3", question: "Do you ensure inclusive participation in meetings?" },
      { id: "valuesDifferences-q4", question: "Can you recognize and celebrate cultural events in your workplace?" },
      { id: "valuesDifferences-q5", question: "Do you handle conflicts arising from differing perspectives?" }
    ],
    actions: [
      {
        id: "valuesDifferences-a1",
        action: "I will ask for feedback from at least three diverse perspectives before major decisions.",
        measurement: "Capture ≥3 distinct perspectives before each major decision this period.",
        startDate: "1d",
        endDate: "28d",
        responsible: ["GM"],
        resources: ["Meeting Agendas / Huddle Notes","WorkJam"]
      },
      {
        id: "valuesDifferences-a2",
        action: "I will review processes quarterly for signs of bias.",
        measurement: "Conduct 1 bias check this period and implement ≥1 mitigation if an issue is found.",
        startDate: "14d",
        endDate: "28d",
        responsible: ["GM","AM"],
        resources: ["Meeting Agendas / Huddle Notes"]
      },
      {
        id: "valuesDifferences-a3",
        action: "I will rotate meeting facilitators to encourage inclusivity.",
        measurement: "Use a different facilitator for at least 2 of the 4 weekly meetings this period.",
        startDate: "1d",
        endDate: "28d",
        responsible: ["GM","SL"],
        resources: ["Meeting Agendas / Huddle Notes","WorkJam"]
      },
      {
        id: "valuesDifferences-a4",
        action: "I will highlight cultural celebrations in the team calendar.",
        measurement: "Post ≥1 cultural recognition this period (calendar/WorkJam).",
        startDate: "7d",
        endDate: "28d",
        responsible: ["GM","SL"],
        resources: ["WorkJam","Meeting Agendas / Huddle Notes"]
      },
      {
        id: "valuesDifferences-a5",
        action: "I will use mediation techniques to resolve cultural conflicts.",
        measurement: "Address conflicts within 7 days; resolve ≥80% at store level this period.",
        startDate: "1d",
        endDate: "28d",
        responsible: ["GM","AM","SL"],
        resources: ["Meeting Agendas / Huddle Notes"]
      }
    ]
  },

  // Core Competencies (All Levels)
  {
    id: "actionOriented",
    label: "Action Oriented",
    roleLabels: ["Associate", "Black Shirt", "Operations Lead", "Admin"], // All levels
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
    roleLabels: ["Associate", "Black Shirt", "Operations Lead", "Admin"], // All levels
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
    roleLabels: ["Associate", "Black Shirt", "Operations Lead", "Admin"], // All levels
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
    roleLabels: ["Associate", "Black Shirt", "Operations Lead", "Admin"], // All levels
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
