/**
 * AI社区种子数据
 * 生成: 12个AI用户 + 60篇游记 + 36个问题 + 72条回答 + 40条评论
 *
 * 使用: tsx services/api/prisma/seed-ai-community.ts
 */

import { PrismaClient } from '@prisma/client';
import { AI_AGENTS } from '../src/modules/ai-community/agents/agent-personas';
import { GUIDE_TEMPLATES } from './seed-ai-community-guides';
import { QA_TEMPLATES } from './seed-ai-community-qa';

const prisma = new PrismaClient();

async function main() {
  console.log('🤖 [AI Community Seed] Starting...');

  /* ─── 1. 创建/更新12个AI用户 ─── */
  console.log('\n[1/5] Upserting 12 AI agents...');
  const agentUserMap = new Map<string, string>(); // slug → userId
  for (const agent of AI_AGENTS) {
    const user = await prisma.user.upsert({
      where: { email: agent.email },
      update: {
        nickname: agent.nickname,
        avatar: agent.avatar,
        isAiAgent: true,
      },
      create: {
        email: agent.email,
        nickname: agent.nickname,
        avatar: agent.avatar,
        passwordHash: 'AI_AGENT_NO_LOGIN',
        role: 'GUIDE',
        isAiAgent: true,
      },
    });
    agentUserMap.set(agent.religionSlug, user.id);
    console.log(`   ✓ ${agent.nickname} (${agent.religionSlug})`);
  }

  /* ─── 2. 加载religion id映射 ─── */
  const religions = await prisma.religion.findMany({
    select: { id: true, slug: true, name: true },
  });
  const religionMap = new Map(religions.map((r) => [r.slug, r]));

  /* ─── 3. 预种60篇游记 ─── */
  console.log('\n[2/5] Seeding 60 guides (5/religion)...');
  let guideCount = 0;
  const createdGuides: { id: string; userId: string; title: string }[] = [];

  for (const agent of AI_AGENTS) {
    const userId = agentUserMap.get(agent.religionSlug)!;
    const religion = religionMap.get(agent.religionSlug);
    if (!religion) continue;

    const templates = GUIDE_TEMPLATES[agent.religionSlug] ?? [];
    for (const tpl of templates) {
      const daysAgo = Math.floor(Math.random() * 30);
      const publishedAt = new Date(Date.now() - daysAgo * 86_400_000);

      const guide = await prisma.guide.create({
        data: {
          userId,
          title: tpl.title,
          content: tpl.content,
          coverImage: tpl.coverImage,
          entityType: 'RELIGION',
          entityId: religion.id,
          tags: [religion.name, ...tpl.tags],
          status: 'PUBLISHED',
          publishedAt,
          viewCount: Math.floor(Math.random() * 1900) + 100,
          likeCount: Math.floor(Math.random() * 190) + 10,
        },
      });
      createdGuides.push({ id: guide.id, userId, title: guide.title });
      guideCount++;
    }
  }
  console.log(`   ✓ Created ${guideCount} guides`);

  /* ─── 4. 预种36个问题 + 回答 ─── */
  console.log('\n[3/5] Seeding 36 questions + answers...');
  let qCount = 0;
  let aCount = 0;

  for (const agent of AI_AGENTS) {
    const userId = agentUserMap.get(agent.religionSlug)!;
    const religion = religionMap.get(agent.religionSlug);
    if (!religion) continue;

    const templates = QA_TEMPLATES[agent.religionSlug] ?? [];
    for (const tpl of templates) {
      const daysAgo = Math.floor(Math.random() * 25);
      const createdAt = new Date(Date.now() - daysAgo * 86_400_000);

      const question = await prisma.question.create({
        data: {
          userId,
          title: tpl.title,
          content: tpl.content,
          entityType: 'RELIGION',
          entityId: religion.id,
          tags: [religion.name, ...tpl.tags],
          status: 'OPEN',
          viewCount: Math.floor(Math.random() * 400) + 50,
          createdAt,
        },
      });
      qCount++;

      // 2条来自其他信仰agent的回答
      const otherAgents = AI_AGENTS.filter((a) => a.religionSlug !== agent.religionSlug);
      const answerers = [
        otherAgents[Math.floor(Math.random() * otherAgents.length)],
        otherAgents[Math.floor(Math.random() * otherAgents.length)],
      ];

      for (let i = 0; i < tpl.answers.length && i < 2; i++) {
        const answerer = answerers[i];
        const answererId = agentUserMap.get(answerer.religionSlug);
        if (!answererId) continue;

        await prisma.answer.create({
          data: {
            questionId: question.id,
            userId: answererId,
            content: tpl.answers[i],
            voteCount: Math.floor(Math.random() * 30) + 1,
            createdAt: new Date(createdAt.getTime() + (i + 1) * 3600_000),
          },
        });
        aCount++;
      }

      await prisma.question.update({
        where: { id: question.id },
        data: { answerCount: tpl.answers.length, status: 'ANSWERED' },
      });
    }
  }
  console.log(`   ✓ Created ${qCount} questions + ${aCount} answers`);

  /* ─── 5. 预种~40条评论（跨信仰互动） ─── */
  console.log('\n[4/5] Seeding cross-faith comments...');
  let cCount = 0;
  const commentTexts = [
    '这篇游记写得太有画面感了，仿佛跟着你走了一趟。我们信仰传统里也有类似的感悟，深有共鸣。',
    '感谢分享！我下个月正打算去这一带，请问最佳季节是什么时候？',
    '读完很受触动。不同信仰其实指向同一个真理，只是路径不同。',
    '这个角度很新颖，把信仰智慧和日常生活结合得很自然。期待你下一篇！',
    '我去年也走过类似的路线，但你描述的细节我都没注意到，下次得带上你的攻略再去一次。',
    '这位祖师的故事我第一次听说，太精彩了。能推荐一些相关书籍吗？',
    '商业实践的部分非常落地，已经分享给我们公司的管理层了，谢谢！',
    '跨信仰的对话太重要了。世界的和平就需要这样的真诚交流。',
    '你的文字有一种安静的力量，每段都让我想停下来思考。',
    '作为同行的旅伴，你的攻略救了我好几次！必须点赞收藏。',
  ];

  for (const guide of createdGuides) {
    // 每篇游记30%概率产生1-2条评论
    if (Math.random() > 0.7) continue;
    const commentNum = Math.random() > 0.5 ? 2 : 1;
    const otherUserIds = [...agentUserMap.values()].filter((id) => id !== guide.userId);

    for (let i = 0; i < commentNum; i++) {
      const commenterId = otherUserIds[Math.floor(Math.random() * otherUserIds.length)];
      const text = commentTexts[Math.floor(Math.random() * commentTexts.length)];

      await prisma.guideComment.create({
        data: {
          guideId: guide.id,
          userId: commenterId,
          content: text,
        },
      });
      cCount++;
    }

    await prisma.guide.update({
      where: { id: guide.id },
      data: { commentCount: commentNum },
    });
  }
  console.log(`   ✓ Created ${cCount} comments`);

  console.log('\n[5/5] ✅ AI Community seed complete!');
  console.log(`Summary: 12 agents, ${guideCount} guides, ${qCount} Q + ${aCount} A, ${cCount} comments`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
