// 客户档案类型定义

export interface CustomerProfile {
  // 基础信息
  id: string;
  companyName: string;
  shortName: string;
  registeredName?: string;
  englishName?: string;
  website?: string;
  logo?: string;

  // 企业分类
  industry: string;
  subIndustry?: string;
  scale: string;
  stage: string;
  type: string;

  // 评级与标签
  rating: string;
  tags: string[];
  priority: string;

  // 产品与业务
  products: Product[];
  mainBusiness: string;
  targetCustomers: string[];
  businessModel: string;

  // 技术栈
  techStack: TechStack;

  // 战略态势（数字化诊断）
  strategy: StrategyInfo;

  // 痛点与需求
  painPoints: PainPoint[];
  requirements: Requirement[];
  opportunities: Opportunity[];

  // 销售进攻指南
  salesGuide?: SalesGuide;

  // 联系人
  contacts: Contact[];

  // 预算与决策
  budget: BudgetInfo;
  decision: DecisionInfo;

  // 追踪信息
  tracking: TrackingInfo;

  // 元数据
  metadata: MetadataInfo;
}

export interface Product {
  name: string;
  description: string;
  category: string;
  features: string[];
  targetUsers: string[];
}

export interface TechStack {
  current: string[];
  inferred: string[];
  maturity: string;
  direction: string;
  developmentStack?: string[];
  infrastructure?: string[];
  thirdParty?: string[];
}

export interface StrategyInfo {
  phase: string;
  growthStage: string;
  competitivePosition: string;
  digitalMaturity: string;
  analysisPath: string;
  informationQuality: string;
  expansionSignals?: string[];
  contractionSignals?: string[];
  riskSignals?: string[];
}

export interface PainPoint {
  category: string;
  description: string;
  severity: string;
  source: string;
  solution?: string;
}

export interface Requirement {
  category: string;
  description: string;
  priority: string;
  urgency: string;
}

export interface Opportunity {
  area: string;
  description: string;
  valueProp: string;
  likelihood: string;
}

// ============================================
// 销售进攻指南类型定义
// ============================================

export interface SalesGuide {
  // 基础信息
  customerId: string;
  customerName: string;
  generatedAt: string;
  version: string;

  // 时机判断
  timing: TimingAnalysis;

  // 破冰策略
  iceBreaker: IceBreakerStrategy;

  // 访谈提纲
  interviewGuide: InterviewGuide;

  // 竞对分析
  competitorAnalysis: CompetitorAnalysis[];

  // 异议处理
  objectionHandling: ObjectionHandling;

  // 决策链条
  decisionChain: DecisionChain;

  // 价值主张
  valueProposition: ValueProposition;

  // 电梯演讲
  elevatorPitch: string;

  // 下一步行动
  nextActions: ActionItem[];
}

// 时机分析
export interface TimingAnalysis {
  timingStage: string; // 时机阶段（刚融资/扩张期/转型期/稳定期/危机期）
  analysisBasis: string[]; // 判断依据
  entryStrategy: string; // 切入策略
  urgency: string; // 紧急程度（高/中/低）
}

// 破冰策略
export interface IceBreakerStrategy {
  primaryHooks: Hook[]; // 主要破冰话术（3-5条）
  situationalHooks: {
    // 情景化破冰话术
    firstContact: Hook[];
    followUp: Hook[];
    demo: Hook[];
    negotiation: Hook[];
    closing: Hook[];
  };
  avoidTopics: string[]; // 避免话题
}

export interface Hook {
  type: string; // 类型（恭维/好奇/痛点/借势/竞对等）
  content: string; // 话术内容
  rationale: string; // 话术原理
}

// 访谈提纲
export interface InterviewGuide {
  quickScreening: Question[]; // 快速筛选问题（3-5个）
  deepDive: Question[]; // 深度访谈问题（5-8个）
  closingQuestions: Question[]; // 收尾问题（2-3个）
  customQuestions: Question[]; // 针对性问题（根据客户情况定制）
}

export interface Question {
  id: string;
  category: string; // 类别（需求/预算/决策/竞对/时间等）
  question: string; // 问题内容
  purpose: string; // 问题目的
  followUp: string; // 追问建议
}

// 竞对分析
export interface CompetitorAnalysis {
  competitor: string; // 竞对名称
  position: string; // 竞对定位
  strengths: string[]; // 竞对优势
  weaknesses: string[]; // 竞对弱点
  ourAdvantage: string; // 我方优势
  differentiation: string; // 差异化策略
  defenseStrategy: string; // 防御策略
}

// 异议处理
export interface ObjectionHandling {
  commonObjections: Objection[]; // 常见异议及应对
  objectionPrevention: string[]; // 异议预防策略
  handlingFramework: string; // 处理框架（如L.A.R.C.）
}

export interface Objection {
  type: string; // 异议类型（价格/时间/功能/竞对等）
  objection: string; // 客户异议
  underlyingConcern: string; // 潜在关切
  response: string; // 应对话术
  pivot: string; // 转向技巧
}

// 决策链条
export interface DecisionChain {
  decisionMakers: Person[]; // 决策者
  influencers: Person[]; // 影响者
  blockers: Person[]; // 阻碍者
  decisionProcess: string; // 决策流程描述
  approvalPath: string[]; // 审批路径
  timeline: string; // 决策时间线
}

export interface Person {
  role: string; // 职位/角色
  name?: string; // 姓名（如有）
  concerns: string[]; // 关注点
  motivations: string[]; // 动机
  approach: string; // 接触策略
}

// 价值主张
export interface ValueProposition {
  coreValue: string; // 核心价值
  benefitPoints: string[]; // 利益点（3-5个）
  proofPoints: string[]; // 证明点（案例/数据/资质等）
  riskMitigation: string[]; // 风险缓解
  roi: string; // ROI 说明
}

// 行动项
export interface ActionItem {
  id: string;
  action: string; // 行动描述
  priority: string; // 优先级（高/中/低）
  deadline: string; // 截止时间
  owner: string; // 责任人
  status: string; // 状态（待开始/进行中/已完成）
}

// ============================================
// 兼容旧版本（profile.json 内嵌 salesGuide）
// ============================================

export interface SalesGuideInline {
  iceBreaker: string[];
  elevatorPitch: string;
  keyQuestions: string[];
  objectionHandling: string[];
  competitorAnalysis: {
    competitor: string;
    position: string;
    weakness: string;
    ourAdvantage: string;
  }[];
  interviewGuide: string[];
}

// ============================================
// AI 洞察类型定义
// ============================================

export interface Insights {
  risks: RiskItem[];
  probability: ProbabilityAnalysis;
  actions: ActionSuggestion[];
  opportunities: OpportunityItem[];
}

export interface RiskItem {
  type: string;
  description: string;
  severity?: string;
  mitigation?: string;
}

export interface ProbabilityAnalysis {
  value: number;
  level: string;
  factors: ProbabilityFactor[];
}

export interface ProbabilityFactor {
  description: string;
  impact: "positive" | "negative" | "neutral";
}

export interface ActionSuggestion {
  title: string;
  description: string;
  timeEstimate: string;
  priority: string;
}

export interface OpportunityItem {
  title: string;
  potentialValue: string;
  description: string;
}

// ============================================
// 原有类型（保持兼容）
// ============================================

export interface Contact {
  name: string;
  role: string;
  department?: string;
  phone?: string;
  email?: string;
  wechat?: string;
  influence: string;
  relationship?: string;
  lastContact?: string;
}

export interface BudgetInfo {
  range: string;
  estimatedAmount?: number;
  currency?: string;
  deliveryTime: string;
  paymentCycle: string;
  decisionCycle: string;
  intentionLevel: number;
  stage: string;
}

export interface DecisionInfo {
  makers: string[];
  influencers: string[];
  blockers?: string[];
  criteria: string[];
  timeline: string;
}

export interface TrackingInfo {
  status: string;
  stage: string;
  nextAction: string;
  nextActionDate?: string;
  lastUpdate: string;
  touchpoints: Touchpoint[];
}

export interface Touchpoint {
  date: string;
  type: string;
  summary: string;
  outcome: string;
  nextStep?: string;
}

export interface MetadataInfo {
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  version: string;
  sources: string[];
  confidence: number;
  notes?: string;
}

// ============================================
// 客户索引类型
// ============================================

export interface CustomerIndex {
  customers: CustomerIndexEntry[];
  updatedAt: string;
}

export interface CustomerIndexEntry {
  id: string;
  companyName: string;
  shortName: string;
  industry: string;
  scale: string;
  rating: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}
