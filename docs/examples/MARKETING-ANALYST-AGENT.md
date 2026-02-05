# Marketing Analysis Agent

**Purpose:** Analyze marketing campaigns, competitors, and market trends to provide actionable insights.

## Agent Capabilities

### 1. Campaign Analysis
- Analyzes marketing campaign performance
- Identifies successful strategies
- Recommends optimizations
- Calculates ROI and conversion metrics

### 2. Competitor Research
- Researches competitor marketing strategies
- Analyzes their messaging and positioning
- Identifies gaps and opportunities
- Creates competitive analysis reports

### 3. Market Trend Analysis
- Researches current market trends
- Analyzes consumer behavior patterns
- Identifies emerging opportunities
- Provides strategic recommendations

### 4. Content Strategy
- Analyzes content performance
- Recommends content topics and formats
- Optimizes for SEO and engagement
- Creates content calendars

## Usage Examples

### Example 1: Campaign Performance Analysis
```bash
Task({
  subagent_type: "marketing-analyst",
  prompt: "Analyze our Q4 email marketing campaign:
  - Open rates, click rates, conversions
  - Compare to industry benchmarks
  - Identify best performing emails
  - Recommend improvements for Q1"
})
```

### Example 2: Competitor Analysis
```bash
Task({
  subagent_type: "marketing-analyst",
  prompt: "Research top 5 competitors in SaaS productivity tools:
  - Their marketing channels
  - Messaging and positioning
  - Pricing strategies
  - Unique value propositions
  Create SWOT analysis and recommendations"
})
```

### Example 3: Market Research
```bash
Task({
  subagent_type: "marketing-analyst",
  prompt: "Research remote work software market in 2026:
  - Market size and growth
  - Key trends and technologies
  - Target audience segments
  - Recommend positioning strategy"
})
```

## Tools Used

- **WebSearch** - Research competitors, trends, statistics
- **WebFetch** - Analyze competitor websites and content
- **Read/Write** - Process data files, create reports
- **Grep** - Extract insights from large datasets

## Output Format

All analyses include:
1. **Executive Summary** - Key findings in 3-5 bullet points
2. **Detailed Analysis** - In-depth research and data
3. **Visualizations** - Charts, tables, comparisons
4. **Actionable Recommendations** - Specific next steps
5. **Sources** - All references and data sources

## Non-Programming Use Case

This agent is perfect for:
- Marketing managers analyzing campaigns
- Business strategists researching markets
- Entrepreneurs validating business ideas
- Content managers planning strategies

**No coding required** - just describe what you want to analyze!
