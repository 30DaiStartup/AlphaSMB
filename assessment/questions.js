// AlphaSMB AI Readiness Assessment — Question Data
// 15 questions across 3 dimensions, 5 per section

var SECTIONS = [
  {
    number: 1,
    name: 'Mindset',
    dimension: 'mindset',
    framing: 'These questions assess how your leadership team thinks about AI \u2014 not as a tool, but as a strategic capability.',
    transitionCta: 'Next: Skillset \u2014 how well your team can actually use AI tools'
  },
  {
    number: 2,
    name: 'Skillset',
    dimension: 'skillset',
    framing: 'These questions assess whether your people can actually use AI tools on real work \u2014 and whether that usage is sticking.',
    transitionCta: 'Next: Toolset \u2014 what you\u2019ve deployed and how intentional the strategy is'
  },
  {
    number: 3,
    name: 'Toolset',
    dimension: 'toolset',
    framing: 'These questions assess your AI tool deployment \u2014 what\u2019s in place, how it was selected, and how intentional the strategy is.',
    transitionCta: 'Get Your Score'
  }
];

var QUESTIONS = [
  // ── Section 1: Mindset (Q1-Q5) ──
  {
    id: 'q1',
    dimension: 'mindset',
    section: 1,
    text: 'When your leadership team discusses AI, which best describes the conversation?',
    options: [
      { text: 'We don\u2019t really discuss AI at the leadership level yet', score: 1 },
      { text: 'We talk about which AI tools to buy or try', score: 2 },
      { text: 'We discuss how AI could improve our current operations', score: 3 },
      { text: 'We discuss how AI capability could change where we compete and what the business could become', score: 4 }
    ]
  },
  {
    id: 'q2',
    dimension: 'mindset',
    section: 1,
    text: 'How does your CEO or top leader personally engage with AI tools?',
    options: [
      { text: 'They don\u2019t use AI tools and haven\u2019t expressed interest', score: 1 },
      { text: 'They\u2019ve tried AI tools and use them occasionally, but not as a regular part of their work', score: 2 },
      { text: 'They use AI tools regularly for their own work', score: 3 },
      { text: 'They use AI tools regularly AND actively push the organization to think differently about AI\u2019s strategic potential', score: 4 }
    ]
  },
  {
    id: 'q3',
    dimension: 'mindset',
    section: 1,
    text: 'When someone on your team proposes a new way of using AI, leadership\u2019s first reaction is usually:',
    options: [
      { text: 'Skepticism \u2014 \u201CIs this really worth the time?\u201D', score: 1 },
      { text: 'Interest, but it gets deprioritized for existing work', score: 2 },
      { text: 'Support, as long as it improves an existing metric or process', score: 3 },
      { text: 'Genuine curiosity about what it might make possible \u2014 even if it doesn\u2019t fit neatly into current priorities', score: 4 }
    ]
  },
  {
    id: 'q4',
    dimension: 'mindset',
    section: 1,
    text: 'Which statement best describes your leadership team\u2019s view of AI\u2019s impact on your industry?',
    options: [
      { text: 'AI is mostly hype for our industry \u2014 it doesn\u2019t really apply to what we do', score: 1 },
      { text: 'AI will affect our industry eventually, but we have time', score: 2 },
      { text: 'AI is already affecting our industry and we need to respond', score: 3 },
      { text: 'AI is actively changing what\u2019s possible in our industry \u2014 and the window to build the capability is closing', score: 4 }
    ]
  },
  {
    id: 'q5',
    dimension: 'mindset',
    section: 1,
    text: 'If a competitor started using AI to enter your market or serve your customers differently, how prepared would your leadership team be to respond?',
    options: [
      { text: 'We haven\u2019t thought about this scenario', score: 1 },
      { text: 'We\u2019ve discussed it but don\u2019t have a plan', score: 2 },
      { text: 'We have a general sense of how we\u2019d respond', score: 3 },
      { text: 'We\u2019ve already mapped how AI changes our competitive landscape and are actively building capability to stay ahead', score: 4 }
    ]
  },

  // ── Section 2: Skillset (Q6-Q10) ──
  {
    id: 'q6',
    dimension: 'skillset',
    section: 2,
    text: 'What percentage of your team uses AI tools (ChatGPT, Claude, Copilot, etc.) on actual work at least weekly?',
    options: [
      { text: 'Less than 10%', score: 1 },
      { text: '10-25%', score: 2 },
      { text: '25-50%', score: 3 },
      { text: 'More than 50%', score: 4 }
    ]
  },
  {
    id: 'q7',
    dimension: 'skillset',
    section: 2,
    text: 'If you have rolled out AI tools, what happened with adoption?',
    options: [
      { text: 'We haven\u2019t rolled out any AI tools yet', score: 1 },
      { text: 'Initial excitement, then usage dropped off within a month or two', score: 2 },
      { text: 'Some people kept using them, but adoption is uneven', score: 3 },
      { text: 'Sustained, growing usage with people finding new use cases on their own', score: 4 }
    ]
  },
  {
    id: 'q8',
    dimension: 'skillset',
    section: 2,
    text: 'Is there someone in your organization who others naturally go to for help with AI tools?',
    options: [
      { text: 'No \u2014 nobody has emerged as a go-to person', score: 1 },
      { text: 'Maybe one person, but it\u2019s informal and not recognized', score: 2 },
      { text: 'Yes \u2014 one or two people who help others, but they have no formal role or support', score: 3 },
      { text: 'Yes \u2014 and leadership has recognized and empowered them to help drive adoption', score: 4 }
    ]
  },
  {
    id: 'q9',
    dimension: 'skillset',
    section: 2,
    text: 'How would you describe the AI skill distribution across your organization?',
    options: [
      { text: 'Almost nobody knows how to use AI tools effectively', score: 1 },
      { text: 'A few technically-minded people use them; everyone else doesn\u2019t', score: 2 },
      { text: 'Multiple people across different roles use them, but at a basic level', score: 3 },
      { text: 'People across roles are building real proficiency, finding use cases specific to their work', score: 4 }
    ]
  },
  {
    id: 'q10',
    dimension: 'skillset',
    section: 2,
    text: 'Has your organization invested in any AI training or skill development?',
    options: [
      { text: 'No training or development', score: 1 },
      { text: 'We shared some articles or videos but nothing structured', score: 2 },
      { text: 'We did a formal training session or online course', score: 3 },
      { text: 'We have ongoing skill development tied to real workflows, not just generic training', score: 4 }
    ]
  },

  // ── Section 3: Toolset (Q11-Q15) ──
  {
    id: 'q11',
    dimension: 'toolset',
    section: 3,
    text: 'Which best describes your organization\u2019s current AI tool situation?',
    options: [
      { text: 'We haven\u2019t purchased or deployed any AI tools', score: 1 },
      { text: 'A few people have personal subscriptions, but nothing organization-wide', score: 2 },
      { text: 'We\u2019ve purchased team licenses and have thought about which tools fit which workflows', score: 3 },
      { text: 'We\u2019ve allocated resources and deployed specific tools to specific workflows', score: 4 }
    ]
  },
  {
    id: 'q12',
    dimension: 'toolset',
    section: 3,
    text: 'How were your AI tools selected?',
    options: [
      { text: 'We haven\u2019t selected any yet', score: 1 },
      { text: 'Someone heard about a tool and we tried it', score: 2 },
      { text: 'We\u2019ve tried several tools and narrowed down to a few that seem useful', score: 3 },
      { text: 'We\u2019ve tested tools against real work and are standardizing on what fits', score: 4 }
    ]
  },
  {
    id: 'q13',
    dimension: 'toolset',
    section: 3,
    text: 'How well do your AI tools integrate with your existing systems and workflows?',
    options: [
      { text: 'We don\u2019t have AI tools deployed', score: 1 },
      { text: 'People use AI chatbots alongside their work \u2014 switching back and forth, copying and pasting between tools', score: 2 },
      { text: 'People have built repeatable processes \u2014 prompt libraries, templates, or saved workflows \u2014 that bring their real work into AI tools', score: 3 },
      { text: 'AI is embedded through agentic tools, automations, or integrations that reduce manual handoff', score: 4 }
    ]
  },
  {
    id: 'q14',
    dimension: 'toolset',
    section: 3,
    text: 'Does your organization have any policies or guidelines around AI tool usage (data security, approved uses, etc.)?',
    options: [
      { text: 'No \u2014 we haven\u2019t addressed this', score: 1 },
      { text: 'Informally \u2014 some verbal guidance but nothing documented', score: 2 },
      { text: 'We have documented policies, but they\u2019re not consistently enforced or part of how we operate', score: 3 },
      { text: 'AI policies are documented, enforced, and built into onboarding and how we operate day-to-day', score: 4 }
    ]
  },
  {
    id: 'q15',
    dimension: 'toolset',
    section: 3,
    text: 'How would you describe your AI tool spending?',
    options: [
      { text: 'We haven\u2019t spent anything on AI tools', score: 1 },
      { text: 'We\u2019ve spent money but aren\u2019t sure we\u2019re getting value from it', score: 2 },
      { text: 'We\u2019re spending and getting some value, but it feels ad-hoc', score: 3 },
      { text: 'Tool spend is intentional, tied to specific use cases, and we\u2019re tracking ROI', score: 4 }
    ]
  }
];
