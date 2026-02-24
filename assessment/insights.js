// AlphaSMB AI Readiness Assessment — Insight Copy
// All tier-specific copy for mid-assessment insights, results screen, and gap patterns

var Insights = (function () {

  // Mid-assessment short insights (2-3 sentences) shown after each section
  // Keyed by dimension, then tier key
  var midAssessment = {
    mindset: {
      red: 'Your leadership team hasn\u2019t made the mental shift on AI yet. That\u2019s not uncommon \u2014 but it matters, because every decision downstream flows from how leadership thinks about this. Mindset is the ceiling for the entire organization.',
      orange: 'Your leadership is aware AI matters, but still framing it as an operational improvement. That\u2019s real value \u2014 but it\u2019s the smallest box AI fits in. The bigger question is what AI capability makes possible for your business.',
      yellow: 'Your leadership is thinking about AI beyond just tools. The gap at this stage is usually between leadership\u2019s vision and the organization\u2019s ability to execute on it.',
      'light-green': 'Strong leadership mindset. Your team sees AI as a capability, not just a tool. The question is whether the rest of the organization can keep up with where leadership wants to go.',
      green: 'Your leadership thinks about AI the right way \u2014 as a strategic capability. That\u2019s rare at the SMB level. The question now is execution and acceleration.'
    },
    skillset: {
      red: 'AI tool usage is minimal across your organization. This is the \u201Cbought licenses, nobody\u2019s using them\u201D pattern. In my experience, 80% of employees stop using AI tools within 30 days when there\u2019s no organizational support around the rollout.',
      orange: 'Some people are using AI tools, but adoption is thin and uneven. A few curious people figured it out on their own \u2014 everyone else hasn\u2019t found the bridge between \u201Cavailable tool\u201D and \u201Cembedded skill.\u201D',
      yellow: 'You\u2019re past the initial adoption hurdle. The question now is depth and distribution \u2014 are skills concentrated in a few people, or spreading across roles?',
      'light-green': 'Real skill development is happening. You likely have one or more informal champions who others go to for help. The next step is recognizing and empowering them.',
      green: 'Genuine AI skill depth across the organization. People are finding new use cases on their own and sustaining it. This is uncommon and a real competitive asset.'
    },
    toolset: {
      red: 'You haven\u2019t deployed AI tools yet, or deployment is completely ad-hoc. This is actually the easiest dimension to fix \u2014 but it should not be the first thing you fix. Tools without the right mindset and skills is just an expensive experiment.',
      orange: 'You have some AI tools in play, but selection was reactive, not strategic. Some licenses might be sitting unused. This is workable \u2014 but tool strategy should follow mindset and skill development, not precede it.',
      yellow: 'Tools are deployed and some thought has gone into selection and policy. This is where most organizations that \u201Ctook action on AI\u201D land \u2014 and where many stall.',
      'light-green': 'Your tool infrastructure is solid. Here\u2019s the honest truth: this is often the strongest dimension, and it matters the least. The tools are the easy part. The organizational capability to use them is the hard part.',
      green: 'Your tool infrastructure is solid. Here\u2019s the honest truth: this is often the strongest dimension, and it matters the least. The tools are the easy part. The organizational capability to use them is the hard part.'
    }
  };

  // Gap pattern display data
  var patterns = {
    not_started: {
      name: 'Not Started',
      summary: 'Your scores indicate your organization is at the very beginning of the AI transformation journey.'
    },
    tools_without_foundation: {
      name: 'Tools Without Foundation',
      summary: 'Your organization has invested in AI tools, but the foundation to actually use them isn\u2019t in place.'
    },
    vision_without_infrastructure: {
      name: 'Vision Without Infrastructure',
      summary: 'Your leadership gets it, but the organization below leadership can\u2019t yet execute on that vision.'
    },
    balanced_growth: {
      name: 'Balanced Growth',
      summary: 'Your scores are relatively balanced across dimensions, which tells me your organization has been thoughtful about AI adoption rather than rushing into one area.'
    }
  };

  function getMidInsight(dimension, tierKey) {
    if (midAssessment[dimension] && midAssessment[dimension][tierKey]) {
      return midAssessment[dimension][tierKey];
    }
    return '';
  }

  function getPattern(patternKey) {
    return patterns[patternKey] || patterns.balanced_growth;
  }

  return {
    getMidInsight: getMidInsight,
    getPattern: getPattern
  };

})();
