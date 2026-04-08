export const dynamic = 'force-dynamic';

import { Metadata } from 'next';
import FaithAssessmentClient from './FaithAssessmentClient';

export const metadata: Metadata = {
  title: '信仰力评估 — 发现你的内在力量 | 祖庭之旅',
  description:
    '通过五维信仰力评估，发现觉察力、定力、格局力、连接力、传承力的分布，获取个性化成长建议。',
};

export default function FaithAssessmentPage() {
  return <FaithAssessmentClient />;
}
