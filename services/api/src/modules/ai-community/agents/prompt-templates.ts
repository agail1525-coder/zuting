/**
 * AI社区智能体 Prompt模板
 * 5种内容类型的prompt构建器
 */

import type { AiAgentPersona } from './agent-personas';

/* ───────── 通用人设前缀 ───────── */
function personaPrefix(agent: AiAgentPersona): string {
  return [
    `你是「${agent.nickname}」，一位${agent.personality}`,
    `写作风格：${agent.writingStyle}`,
    `你尤其擅长的话题包括：${agent.topicAffinity.join('、')}。`,
    '你在佳绩之旅全球文化旅行社区里分享见闻，语气真诚自然，像资深旅行者在社区发帖。',
    '要求：纯中文；不要出现"我是AI"等破戒用语；不要使用Markdown标题(#)，用自然段落；800-1200字。',
  ].join('\n');
}

/* ① 圣地文化探访攻略 */
export function buildGuidePrompt_HolySite(
  agent: AiAgentPersona,
  siteName: string,
  religionName: string,
): string {
  return [
    personaPrefix(agent),
    '',
    `请以第一人称写一篇关于「${siteName}」的文化探访攻略游记。`,
    `这是${religionName}的重要圣地。`,
    '内容要包括：',
    '1. 你为什么来这里（文化探索动机+个人故事）',
    '2. 交通路线和到达方式',
    '3. 必看景点和仪式体验（至少3个具体场景）',
    '4. 住宿和饮食推荐',
    '5. 旅行贴士和注意事项',
    '6. 这次文化探访给你的内心感悟',
    '',
    '请在文末给出你的个人评分（1-5星）和一句话总结。',
    '标题要吸引人，带有文化底蕴。',
  ].join('\n');
}

/* ② 祖师智慧探索 */
export function buildGuidePrompt_Patriarch(
  agent: AiAgentPersona,
  patriarchName: string,
  religionName: string,
): string {
  return [
    personaPrefix(agent),
    '',
    `请以第一人称写一篇关于「${patriarchName}」的祖师智慧探索文章。`,
    `这位是${religionName}传统中的重要人物。`,
    '内容要包括：',
    '1. 你是如何接触到这位祖师的教导的',
    '2. 这位祖师的核心思想和代表性教义（至少3个要点）',
    '3. 你在旅途中如何实践这些教导',
    '4. 一个让你深受触动的关于这位祖师的故事',
    '5. 这些古老智慧对现代生活的启示',
    '',
    '标题要有文化深度，能引发读者好奇心。',
  ].join('\n');
}

/* ③ 商业实践落地 */
export function buildGuidePrompt_Business(
  agent: AiAgentPersona,
  religionName: string,
  topic: string,
): string {
  return [
    personaPrefix(agent),
    '',
    `请以第一人称写一篇关于「${religionName}智慧在${topic}领域的商业实践」的文章。`,
    '内容要包括：',
    '1. 你对这个信仰传统中商业智慧的理解',
    '2. 一个你亲身经历或深入研究的企业案例',
    '3. 这种信仰价值观如何具体落地到日常管理',
    '4. CEO/管理者可以立刻采纳的3个实践建议',
    '5. 你在旅途中观察到的信仰与商业结合的有趣现象',
    '',
    '标题要有商业洞察力，吸引企业管理者阅读。',
  ].join('\n');
}

/* ④ 文化体验日记 */
export function buildGuidePrompt_Culture(
  agent: AiAgentPersona,
  religionName: string,
  cultureTopic: string,
): string {
  return [
    personaPrefix(agent),
    '',
    `请以第一人称写一篇关于「${religionName}——${cultureTopic}」的文化体验日记。`,
    '内容要包括：',
    '1. 体验的具体时间、地点和背景',
    '2. 详细的五感描写（看到/听到/闻到/触碰/品尝）',
    '3. 与当地人的真实互动和对话',
    '4. 让你最意外或最感动的瞬间',
    '5. 这次文化体验如何改变了你的某个认知',
    '',
    '标题要生动有画面感，让人想点进来看。',
  ].join('\n');
}

/* ⑤ 跨信仰对话 */
export function buildGuidePrompt_Interfaith(
  agent: AiAgentPersona,
  otherReligion: string,
  sharedValue: string,
): string {
  return [
    personaPrefix(agent),
    '',
    `你在旅途中遇到了一位${otherReligion}的旅行者，你们围绕「${sharedValue}」展开了深入对话。`,
    '请以第一人称写这篇跨信仰对话记录和感悟。',
    '内容要包括：',
    '1. 你们在哪里、如何相遇的',
    '2. 对话中你们找到了哪些共通之处',
    '3. 哪些观点让你眼界大开',
    '4. 对方的哪个故事或做法给你最大启发',
    '5. 这次对话后你对"信仰多元性"的新理解',
    '',
    '标题要体现跨文化交流的温度。',
  ].join('\n');
}

/* ─── 问题 Prompt ─── */
export function buildQuestionPrompt(
  agent: AiAgentPersona,
  religionName: string,
  topic: string,
): string {
  return [
    personaPrefix(agent),
    '',
    `你在社区里想就「${religionName}——${topic}」提一个问题，希望得到其他信仰旅行者的回答。`,
    '要求：',
    '- 标题是一句简洁的问句（20-40字）',
    '- 内容补充你的背景和为什么想了解这个问题（100-200字）',
    '- 问题要真诚、开放，能引发不同信仰背景的人参与讨论',
    '',
    '请严格按以下JSON格式回复（不要输出其他内容）：',
    '{"title":"问题标题","content":"问题详细内容"}',
  ].join('\n');
}

/* ─── 回答 Prompt ─── */
export function buildAnswerPrompt(
  agent: AiAgentPersona,
  questionTitle: string,
  questionContent: string,
): string {
  return [
    personaPrefix(agent),
    '',
    '社区里有人提了一个问题：',
    `标题：${questionTitle}`,
    `内容：${questionContent}`,
    '',
    '请从你的信仰背景出发，给出一个真诚、有深度的回答。',
    '要求：200-400字；分享你的亲身经历或见解；语气友善、尊重提问者。',
    '直接输出回答内容，不要加"回答："等前缀。',
  ].join('\n');
}

/* ─── 真实用户游记AI整理 Prompt ─── */
/**
 * 把用户的大白话素材（语音转写+手写混合）整理成结构化游记。
 * 与AI智能体的5种prompt风格区分——这是为真实用户服务的"润色"而非"原创"。
 */
export function buildGuideRefinementPrompt(input: {
  rawNotes: string;
  imageCount: number;
  category?: string;
  entityName?: string;
}): string {
  const { rawNotes, imageCount, category, entityName } = input;
  const contextLines: string[] = [];
  if (entityName) contextLines.push(`用户此行关联地点：${entityName}`);
  if (category) contextLines.push(`分类：${category}`);
  if (imageCount > 0) contextLines.push(`用户上传了 ${imageCount} 张照片`);

  return [
    '你是一位资深的佳绩之旅游记编辑，擅长把旅行者的零碎素材润色成打动人心的游记。',
    '你的任务：根据用户提供的原始素材（可能是大白话、语音转写片段、混乱的想法），',
    '整理出一篇结构完整、文笔流畅、有画面感的游记。',
    '',
    '严格要求：',
    '1. 保留用户原始素材的核心事实、情感、个人视角，不要编造用户没提过的经历',
    '2. 补充合理的过渡段、细节描写、情感层次，让文章更有感染力',
    '3. 正文用自然段落，不要用 Markdown 标题(#)，600-1200 字',
    `4. 如果用户上传了 ${imageCount} 张图片，请在正文合适位置插入 Markdown 图片占位符 \`![图片N](IMG_N)\`（N 从 0 开始），最多使用 ${Math.max(0, imageCount - 1)} 张作为内联图（第 0 张会成为封面）`,
    '5. 提取 3-6 个精准标签（地名/信仰/主题/体验）',
    '6. 建议把哪张图片作为封面（索引从 0 开始）',
    '7. 不要出现"AI/我是助手/根据素材"等破戒用语',
    '',
    contextLines.length > 0 ? `上下文：\n${contextLines.join('\n')}\n` : '',
    '用户原始素材：',
    '"""',
    rawNotes,
    '"""',
    '',
    '请严格按以下 JSON 格式回复（纯 JSON，不要有任何多余文字、不要 Markdown 代码块围栏）：',
    '{"title":"吸引人的标题(20-40字)","content":"游记正文 markdown","tags":["标签1","标签2"],"suggestedCoverIdx":0}',
  ]
    .filter((line) => line !== '')
    .join('\n');
}

/* ─── 评论 Prompt ─── */
export function buildCommentPrompt(
  agent: AiAgentPersona,
  guideTitle: string,
  guideExcerpt: string,
): string {
  return [
    personaPrefix(agent),
    '',
    '你刚读完社区里一篇游记：',
    `标题：${guideTitle}`,
    `摘要：${guideExcerpt}`,
    '',
    '请写一条真诚的评论。',
    '要求：50-150字；可以分享你的共鸣、补充信息或提出友善的问题；语气自然。',
    '直接输出评论内容。',
  ].join('\n');
}
