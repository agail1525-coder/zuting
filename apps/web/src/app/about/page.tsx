import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "关于我们 - 平台愿景与团队",
  description:
    "了解全球祖庭旅行平台的愿景、核心理念与团队。帮助100万人走祖庭，建立全球宗教文化和平使者网络。About our mission to help 1 million people walk the ancestral temples.",
  openGraph: {
    title: "关于我们 - 祖庭之旅平台愿景与团队",
    description:
      "帮助100万人走祖庭，建立全球宗教文化和平使者网络。了解我们的愿景、理念与团队。",
    url: "https://zuting.fszyl.top/about",
  },
  alternates: {
    canonical: "https://zuting.fszyl.top/about",
  },
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-gradient-gold mb-4">
          关于我们
        </h1>
        <p className="text-temple-400 text-lg">About Us</p>
      </div>

      <div className="space-y-8">
        {/* 平台愿景 */}
        <div className="card-glow rounded-2xl bg-temple-800/60 border border-gold/10 p-8">
          <h2 className="text-2xl font-serif font-bold text-gold mb-4">
            平台愿景
          </h2>
          <p className="text-temple-300 leading-relaxed text-lg">
            帮助<span className="text-gold font-bold">100万人</span>走祖庭，建立全球宗教文化和平使者网络。
          </p>
          <p className="text-temple-400 leading-relaxed mt-4">
            全球祖庭旅行平台致力于成为连接世界各大宗教文化的桥梁。我们相信，通过亲身走访各信仰的发源地与圣地，人们能够更深刻地理解不同文化传统，促进文明间的对话与和平。
          </p>
        </div>

        {/* 核心理念 */}
        <div className="card-glow rounded-2xl bg-temple-800/60 border border-gold/10 p-8">
          <h2 className="text-2xl font-serif font-bold text-gold mb-4">
            核心理念
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-temple-900/60 rounded-xl p-6 border border-gold/10">
              <h3 className="text-lg font-semibold text-temple-200 mb-2">
                跨宗教对话
              </h3>
              <p className="text-temple-400 text-sm leading-relaxed">
                涵盖佛教、道教、基督教、伊斯兰教等十二大信仰，尊重每一种信仰传统，促进不同宗教之间的理解与交流。
              </p>
            </div>
            <div className="bg-temple-900/60 rounded-xl p-6 border border-gold/10">
              <h3 className="text-lg font-semibold text-temple-200 mb-2">
                文化和平
              </h3>
              <p className="text-temple-400 text-sm leading-relaxed">
                以旅行为纽带，以文化为桥梁，推动全球宗教文化和平，构建人类命运共同体的精神家园。
              </p>
            </div>
            <div className="bg-temple-900/60 rounded-xl p-6 border border-gold/10">
              <h3 className="text-lg font-semibold text-temple-200 mb-2">
                数字化传承
              </h3>
              <p className="text-temple-400 text-sm leading-relaxed">
                运用现代科技手段，将珍贵的宗教文化遗产数字化保存与传播，让更多人能够了解和学习。
              </p>
            </div>
            <div className="bg-temple-900/60 rounded-xl p-6 border border-gold/10">
              <h3 className="text-lg font-semibold text-temple-200 mb-2">
                沉浸式体验
              </h3>
              <p className="text-temple-400 text-sm leading-relaxed">
                结合AI智能助手、互动地图和朝圣日志，为用户提供深度沉浸的宗教文化旅行体验。
              </p>
            </div>
          </div>
        </div>

        {/* 团队介绍 */}
        <div className="card-glow rounded-2xl bg-temple-800/60 border border-gold/10 p-8">
          <h2 className="text-2xl font-serif font-bold text-gold mb-4">
            团队介绍
          </h2>
          <p className="text-temple-300 leading-relaxed">
            我们的团队由热爱宗教文化研究、旅行服务和技术创新的伙伴组成。团队成员来自不同的文化背景，拥有丰富的宗教学研究、旅游行业和互联网技术经验。我们致力于将专业知识与现代科技相结合，为用户打造最优质的朝圣旅行体验。
          </p>
        </div>

        {/* 联系方式 */}
        <div className="card-glow rounded-2xl bg-temple-800/60 border border-gold/10 p-8">
          <h2 className="text-2xl font-serif font-bold text-gold mb-4">
            联系我们
          </h2>
          <div className="bg-temple-900/60 rounded-xl p-6 border border-gold/10 space-y-3">
            <p className="text-temple-300">
              <strong className="text-temple-200">电子邮箱：</strong>
              contact@zuting.com
            </p>
            <p className="text-temple-300">
              <strong className="text-temple-200">联系电话：</strong>
              400-XXX-XXXX
            </p>
            <p className="text-temple-300">
              <strong className="text-temple-200">办公地址：</strong>
              广东省深圳市南山区
            </p>
            <p className="text-temple-300">
              <strong className="text-temple-200">工作时间：</strong>
              周一至周五 9:00 - 18:00
            </p>
          </div>
        </div>

        {/* ICP备案 */}
        <div className="text-center py-4">
          <p className="text-temple-500 text-sm">
            粤ICP备XXXXXXXX号
          </p>
        </div>
      </div>
    </div>
  );
}
