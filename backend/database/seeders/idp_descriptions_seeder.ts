import { BaseSeeder } from '@adonisjs/lucid/seeders'
import IdpCompetency from '#models/idp_competency'
import IdpDescription from '#models/idp_description'

export default class extends BaseSeeder {
  async run() {
    console.log('🔄 Seeding IDP competency descriptions...')

    // Check dependencies first
    const competencies = await IdpCompetency.query().where('isActive', true)
    if (competencies.length === 0) {
      console.log('⚠️ No IDP competencies found. Please run idp_competency_seeder first.')
      return
    }

    // Clear existing descriptions
    await IdpDescription.query().delete()
    const competencyDescriptions = this.getCompetencyDescriptions()

    for (const competency of competencies) {
      const descriptions = competencyDescriptions[competency.competencyId]
      if (!descriptions) {
        console.log(`  ⚠️  No descriptions found for: ${competency.competencyId}`)
        continue
      }

      console.log(`  📝 Adding descriptions for: ${competency.label}`)

      for (let i = 0; i < descriptions.length; i++) {
        const desc = descriptions[i]
        await IdpDescription.create({
          competencyId: competency.id,
          type: desc.type,
          title: desc.title,
          content: desc.content,
          sortOrder: i + 1,
          isActive: true,
        })
      }

      console.log(`    ✅ Added ${descriptions.length} descriptions`)
    }

    const totalDescriptions = await IdpDescription.query().count('* as total')
    console.log(`✅ IDP Descriptions seeded successfully: ${totalDescriptions[0].$extras.total} descriptions`)
  }

  private getCompetencyDescriptions() {
    return {
      strategicMindset: [
        {
          type: 'overview' as const,
          title: 'Overview',
          content: 'Strategic Mindset involves the ability to think long-term, understand the big picture, and make decisions that align with organizational goals and vision.'
        },
        {
          type: 'definition' as const,
          title: 'Definition',
          content: 'The capacity to analyze complex situations, anticipate future trends, and develop comprehensive plans that drive sustainable business success.'
        },
        {
          type: 'behaviors' as const,
          title: 'Key Behaviors',
          content: '• Allocates time for long-range planning\n• Articulates project alignment with company vision\n• Prioritizes initiatives effectively with limited resources\n• Scans external factors influencing strategy\n• Communicates strategic priorities clearly to teams'
        },
        {
          type: 'examples' as const,
          title: 'Examples',
          content: '• Developing quarterly business plans that align with annual goals\n• Analyzing market trends to inform strategic decisions\n• Creating resource allocation frameworks for multiple projects\n• Facilitating strategic planning sessions with leadership teams'
        }
      ],

      businessInsight: [
        {
          type: 'overview' as const,
          title: 'Overview',
          content: 'Business Insight is the ability to understand how the business operates, analyze financial data, and make informed decisions that drive profitability and growth.'
        },
        {
          type: 'definition' as const,
          title: 'Definition',
          content: 'The skill to interpret business metrics, understand market dynamics, and translate data into actionable strategies that improve operational performance.'
        },
        {
          type: 'behaviors' as const,
          title: 'Key Behaviors',
          content: '• Teaches others to understand COGS, Labor, and Sales building\n• Stays knowledgeable about food industry trends\n• Builds relationships with local businesses and organizations\n• Uses data and reports for decision making\n• Maintains accurate sales forecasting within 5%'
        },
        {
          type: 'examples' as const,
          title: 'Examples',
          content: '• Conducting P&L training sessions for team members\n• Sharing industry trend updates and their business impact\n• Building local business partnerships for catering opportunities\n• Using operational reports to improve key metrics'
        }
      ],

      actionOriented: [
        {
          type: 'overview' as const,
          title: 'Overview',
          content: 'Action Oriented means taking initiative, driving results, and maintaining momentum through decisive action and follow-through on commitments.'
        },
        {
          type: 'definition' as const,
          title: 'Definition',
          content: 'The tendency to act quickly and decisively, break down complex tasks into manageable steps, and consistently deliver on promises and deadlines.'
        },
        {
          type: 'behaviors' as const,
          title: 'Key Behaviors',
          content: '• Breaks tasks into quick wins to maintain momentum\n• Consistently completes supervisor requests on time\n• Avoids analysis paralysis when data is incomplete\n• Empowers direct reports and peers to take initiative\n• Completes administrative routines promptly'
        },
        {
          type: 'examples' as const,
          title: 'Examples',
          content: '• Identifying and completing daily quick wins\n• Meeting all supervisor deadlines consistently\n• Delegating projects with clear expectations\n• Maintaining organized administrative schedules'
        }
      ],

      communicatesEffectively: [
        {
          type: 'overview' as const,
          title: 'Overview',
          content: 'Communicates Effectively involves clear, concise, and impactful communication that ensures understanding and drives action across all levels of the organization.'
        },
        {
          type: 'definition' as const,
          title: 'Definition',
          content: 'The ability to adapt communication style to different audiences, listen actively, and ensure messages are understood and acted upon appropriately.'
        },
        {
          type: 'behaviors' as const,
          title: 'Key Behaviors',
          content: '• Adjusts messages for clarity based on audience feedback\n• Verifies understanding after giving instructions\n• Makes people feel heard when they share concerns\n• Balances listening with speaking in conversations\n• Provides clear instructions that are understood the first time'
        },
        {
          type: 'examples' as const,
          title: 'Examples',
          content: '• Using teach-back method to confirm understanding\n• Revising communications based on feedback\n• Paraphrasing before responding in conversations\n• Providing written confirmation of verbal instructions'
        }
      ],

      customerFocus: [
        {
          type: 'overview' as const,
          title: 'Overview',
          content: 'Customer Focus means putting the customer at the center of all decisions, actively seeking feedback, and continuously improving the customer experience.'
        },
        {
          type: 'definition' as const,
          title: 'Definition',
          content: 'The commitment to understanding customer needs, exceeding expectations, and creating positive experiences that build loyalty and drive business success.'
        },
        {
          type: 'behaviors' as const,
          title: 'Key Behaviors',
          content: '• Actively gathers guest feedback through direct interaction\n• Takes concrete actions based on customer feedback\n• Understands and teaches SMG reports to the team\n• Empowers front-of-house staff to resolve complaints\n• Anticipates customer needs before they arise'
        },
        {
          type: 'examples' as const,
          title: 'Examples',
          content: '• Speaking with guests regularly to gather feedback\n• Implementing service improvements based on guest suggestions\n• Conducting weekly SMG review meetings\n• Training staff on complaint resolution techniques'
        }
      ],

      integrityTrust: [
        {
          type: 'overview' as const,
          title: 'Overview',
          content: 'Integrity and Trust involves consistently acting ethically, being transparent in decisions, and building confidence through reliable follow-through on commitments.'
        },
        {
          type: 'definition' as const,
          title: 'Definition',
          content: 'The foundation of leadership that combines moral principles, honesty, and reliability to create an environment where others feel secure and confident.'
        },
        {
          type: 'behaviors' as const,
          title: 'Key Behaviors',
          content: '• Consistently follows through on promises and commitments\n• Maintains transparency about decision-making criteria\n• Accepts mistakes and corrects them quickly\n• Acts ethically under pressure\n• Protects confidential information appropriately'
        },
        {
          type: 'examples' as const,
          title: 'Examples',
          content: '• Tracking and confirming completion of all promises\n• Explaining decision factors openly in meetings\n• Admitting and correcting mistakes promptly\n• Sharing examples of ethical choices in challenging situations'
        }
      ]
    }
  }
}



