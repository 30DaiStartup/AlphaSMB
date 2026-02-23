// AlphaSMB AI Readiness Assessment — Question Data
// 20 questions across 4 dimensions, 5 per section

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
    transitionPrelude: 'One section left. This is the one most leaders haven\u2019t thought about \u2014 and the one that changes how you see everything else.',
    transitionCta: 'Next: Organizational Operating System'
  },
  {
    number: 4,
    name: 'Organizational Operating System',
    dimension: 'org_os',
    framing: 'These questions assess whether your organization can actually support new ways of working \u2014 or whether everything gets forced back into how you\u2019ve always measured success.'
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
      { text: 'They\u2019ve tried ChatGPT or similar tools a few times', score: 2 },
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
    text: 'When you rolled out AI tools (or if you were to roll them out), what happened (or what would you expect)?',
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
      { text: 'We\u2019ve purchased licenses (ChatGPT, Copilot, etc.) for the team', score: 3 },
      { text: 'We have licensed tools AND have thought about which tools fit which workflows', score: 4 }
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
      { text: 'We evaluated a few options based on features and price', score: 3 },
      { text: 'We mapped our workflows first, then selected tools based on where AI could have the most impact', score: 4 }
    ]
  },
  {
    id: 'q13',
    dimension: 'toolset',
    section: 3,
    text: 'How well do your AI tools integrate with your existing systems and workflows?',
    options: [
      { text: 'We don\u2019t have AI tools deployed', score: 1 },
      { text: 'Tools are standalone \u2014 people switch between AI tools and their regular work', score: 2 },
      { text: 'Some integration, but mostly manual copy-paste between systems', score: 3 },
      { text: 'AI tools are embedded into the workflows where people already work', score: 4 }
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
      { text: 'We have basic guidelines but they\u2019re not enforced consistently', score: 3 },
      { text: 'Clear, documented policies that balance security with encouraging productive use', score: 4 }
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
  },

  // ── Section 4: Organizational Operating System (Q16-Q20) ──
  {
    id: 'q16',
    dimension: 'org_os',
    section: 4,
    text: 'When someone on your team tries a new AI-driven approach to their work, how is that effort typically evaluated?',
    options: [
      { text: 'It isn\u2019t \u2014 there\u2019s no process for evaluating new approaches', score: 1 },
      { text: 'Against existing KPIs and metrics, same as everything else', score: 2 },
      { text: 'With some flexibility, but leadership still wants to see impact on existing metrics quickly', score: 3 },
      { text: 'New approaches get evaluated on their own terms \u2014 proof that the approach works, not immediate ROI', score: 4 }
    ]
  },
  {
    id: 'q17',
    dimension: 'org_os',
    section: 4,
    text: 'Think about the last time an AI initiative (or any new initiative) started with excitement at your company. What happened?',
    options: [
      { text: 'We haven\u2019t really had any AI initiatives', score: 1 },
      { text: 'It started strong but got quietly reshaped into something safe and familiar', score: 2 },
      { text: 'It kept some of its original ambition but was scaled back significantly', score: 3 },
      { text: 'It was given real room to prove itself before being judged by standard metrics', score: 4 }
    ]
  },
  {
    id: 'q18',
    dimension: 'org_os',
    section: 4,
    text: 'When your organization evaluates whether to invest time or resources in something new, what\u2019s the first question that gets asked?',
    options: [
      { text: '\u201CWhat\u2019s the ROI?\u201D or \u201CWhat metric does this move?\u201D', score: 1 },
      { text: '\u201CHow does this fit into what we\u2019re already doing?\u201D', score: 2 },
      { text: '\u201CWhat\u2019s the risk if it doesn\u2019t work?\u201D', score: 2 },
      { text: '\u201CWhat does this make possible that wasn\u2019t possible before?\u201D', score: 4 }
    ]
  },
  {
    id: 'q19',
    dimension: 'org_os',
    section: 4,
    text: 'Does your organization have different definitions of \u201Cprogress\u201D for different types of work \u2014 or one definition applied to everything?',
    options: [
      { text: 'One definition \u2014 everything is measured the same way', score: 1 },
      { text: 'Mostly one definition, with some informal flexibility for special projects', score: 2 },
      { text: 'We\u2019ve started to recognize that different work needs different measures, but it\u2019s not formalized', score: 3 },
      { text: 'We explicitly match how we measure progress to the type of work being done', score: 4 }
    ]
  },
  {
    id: 'q20',
    dimension: 'org_os',
    section: 4,
    text: 'If a team member came to leadership and said, \u201CI need 30 days to test a new AI-driven approach \u2014 I can\u2019t promise ROI yet, but I\u2019ll bring back proof of whether it works,\u201D what would happen?',
    options: [
      { text: 'That request would be denied or ignored', score: 1 },
      { text: 'It would be met with skepticism and heavy conditions', score: 2 },
      { text: 'Leadership might allow it, but would check in frequently and expect metric-based updates', score: 3 },
      { text: 'Leadership would support it \u2014 with a clear proof window and a go/kill decision at the end', score: 4 }
    ]
  }
];
