import type { Metadata } from "next";
import MobileNav from "@/components/MobileNav";

export const metadata: Metadata = {
  title: "隐私政策",
  description:
    "全球祖庭旅行平台隐私政策，了解我们如何收集、使用和保护您的个人信息。",
  alternates: {
    canonical: "https://zuting.fszyl.top/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-gradient-gold mb-4">
          隐私政策
        </h1>
        <p className="text-temple-400 text-lg">Privacy Policy</p>
        <p className="text-temple-500 text-sm mt-2">
          生效日期：2026年3月25日
        </p>
      </div>

      <div className="card-glow rounded-2xl bg-temple-800/60 border border-gold/10 p-8 md:p-12 space-y-10 text-temple-300 leading-relaxed">
        {/* 引言 */}
        <section>
          <p>
            全球祖庭旅行平台（以下简称&ldquo;本平台&rdquo;或&ldquo;我们&rdquo;）深知个人信息对您的重要性，并会尽全力保护您的个人信息安全可靠。我们致力于维持您对我们的信任，恪守以下原则保护您的个人信息：权责一致原则、目的明确原则、选择同意原则、最少够用原则、确保安全原则、主体参与原则、公开透明原则等。
          </p>
          <p className="mt-3">
            本隐私政策适用于您通过本平台的网站、移动应用程序、微信小程序等渠道使用我们的服务。请您在使用我们的服务前，仔细阅读并了解本隐私政策。
          </p>
        </section>

        {/* 一、信息收集 */}
        <section id="collection">
          <h2 className="text-xl font-serif font-bold text-gold mb-4">
            一、信息收集
          </h2>
          <p className="mb-3">
            为向您提供服务，我们可能会收集以下信息：
          </p>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li>
              <strong className="text-temple-200">手机号码：</strong>
              用于账号注册、登录验证和安全通知。
            </li>
            <li>
              <strong className="text-temple-200">电子邮箱：</strong>
              用于接收行程确认、订单通知和平台公告（选填）。
            </li>
            <li>
              <strong className="text-temple-200">位置信息：</strong>
              用于推荐附近圣地、行程导航和地图功能。仅在您授权后收集，您可以随时关闭。
            </li>
            <li>
              <strong className="text-temple-200">设备信息：</strong>
              包括设备型号、操作系统版本、唯一设备标识符等，用于保障服务安全和优化体验。
            </li>
            <li>
              <strong className="text-temple-200">行程数据：</strong>
              您创建的行程信息、朝圣日志、浏览记录等，用于提供个性化服务。
            </li>
            <li>
              <strong className="text-temple-200">支付信息：</strong>
              订单金额、支付方式、交易记录等，用于完成支付处理。我们不会存储您的完整银行卡号或支付密码。
            </li>
            <li>
              <strong className="text-temple-200">AI对话记录：</strong>
              您与小鸿AI助手的对话内容，用于提供智能问答服务和改善AI体验。
            </li>
          </ul>
        </section>

        {/* 二、信息使用 */}
        <section id="usage">
          <h2 className="text-xl font-serif font-bold text-gold mb-4">
            二、信息使用
          </h2>
          <p className="mb-3">我们收集的信息将用于以下目的：</p>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li>
              <strong className="text-temple-200">提供核心服务：</strong>
              宗教文化内容浏览、圣地查询、祖庭信息展示。
            </li>
            <li>
              <strong className="text-temple-200">行程管理：</strong>
              创建、管理和跟踪您的朝圣行程，提供行程状态更新。
            </li>
            <li>
              <strong className="text-temple-200">支付处理：</strong>
              处理订单支付、退款及相关财务记录。
            </li>
            <li>
              <strong className="text-temple-200">AI助手服务：</strong>
              基于您的提问提供宗教文化知识问答和行程建议。
            </li>
            <li>
              <strong className="text-temple-200">数据分析：</strong>
              分析用户使用趋势以改善平台服务质量（数据经匿名化处理）。
            </li>
            <li>
              <strong className="text-temple-200">安全保障：</strong>
              防范欺诈、保护账号安全、处理投诉和纠纷。
            </li>
          </ul>
        </section>

        {/* 三、信息共享 */}
        <section id="sharing">
          <h2 className="text-xl font-serif font-bold text-gold mb-4">
            三、信息共享
          </h2>
          <p className="mb-3">
            我们不会将您的个人信息出售给任何第三方。仅在以下情况下，我们可能会共享您的信息：
          </p>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li>
              <strong className="text-temple-200">支付服务商：</strong>
              为完成支付交易，我们需要与支付宝、微信支付等支付服务商共享必要的订单和交易信息。
            </li>
            <li>
              <strong className="text-temple-200">导游及服务方：</strong>
              在您确认行程后，我们将向导游提供必要的行程信息（不包括您的支付信息和完整手机号）。
            </li>
            <li>
              <strong className="text-temple-200">法律要求：</strong>
              根据适用的法律法规、法律程序、政府主管部门的强制性要求，我们可能需要披露您的个人信息。
            </li>
            <li>
              <strong className="text-temple-200">征得您的同意：</strong>
              在获得您明确同意的其他情况下。
            </li>
          </ul>
        </section>

        {/* 四、信息存储 */}
        <section id="storage">
          <h2 className="text-xl font-serif font-bold text-gold mb-4">
            四、信息存储
          </h2>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li>
              <strong className="text-temple-200">存储地点：</strong>
              您的个人信息存储在中华人民共和国境内的服务器上。如需跨境传输，我们将依照法律法规要求征得您的单独同意。
            </li>
            <li>
              <strong className="text-temple-200">加密存储：</strong>
              我们采用业界标准的加密技术（如AES-256、TLS 1.3）对您的个人信息进行加密存储和传输。
            </li>
            <li>
              <strong className="text-temple-200">保留期限：</strong>
              我们仅在为实现目的所必需的期限内保留您的个人信息。账号注销后，我们将在30个工作日内删除或匿名化处理您的个人信息，法律法规另有规定的除外。
            </li>
            <li>
              <strong className="text-temple-200">交易记录：</strong>
              根据《电子商务法》要求，交易信息保存期限不少于三年。
            </li>
          </ul>
        </section>

        {/* 五、用户权利 */}
        <section id="rights">
          <h2 className="text-xl font-serif font-bold text-gold mb-4">
            五、用户权利
          </h2>
          <p className="mb-3">
            根据《中华人民共和国个人信息保护法》（PIPL）第四十五条及相关规定，您享有以下权利：
          </p>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li>
              <strong className="text-temple-200">查看权：</strong>
              您有权查看我们收集的您的个人信息，可通过&ldquo;个人中心&rdquo;页面查看。
            </li>
            <li>
              <strong className="text-temple-200">更正权：</strong>
              当您发现我们处理的个人信息有误时，您有权要求我们更正。
            </li>
            <li>
              <strong className="text-temple-200">删除权：</strong>
              在法律规定的情形下，您有权要求我们删除您的个人信息。
            </li>
            <li>
              <strong className="text-temple-200">数据可携带权：</strong>
              您有权请求我们将您的个人信息以结构化、通用格式导出。
            </li>
            <li>
              <strong className="text-temple-200">账号注销：</strong>
              您有权随时注销您的账号。注销后我们将停止提供服务并依法删除您的个人信息。您可通过&ldquo;个人中心 &gt; 账号设置 &gt; 注销账号&rdquo;进行操作。
            </li>
            <li>
              <strong className="text-temple-200">撤回同意：</strong>
              您有权撤回此前给予的同意，撤回同意不影响撤回前基于同意的处理活动的效力。
            </li>
          </ul>
        </section>

        {/* 六、Cookie政策 */}
        <section id="cookies">
          <h2 className="text-xl font-serif font-bold text-gold mb-4">
            六、Cookie政策
          </h2>
          <p className="mb-3">
            我们使用Cookie及类似技术来提供、保护和改善我们的服务：
          </p>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li>
              <strong className="text-temple-200">必要Cookie：</strong>
              用于维持登录状态和保障安全，不可关闭。
            </li>
            <li>
              <strong className="text-temple-200">功能Cookie：</strong>
              用于记住您的偏好设置（如语言选择）。
            </li>
            <li>
              <strong className="text-temple-200">分析Cookie：</strong>
              用于了解用户如何使用本平台，以改善服务体验。您可以通过浏览器设置拒绝此类Cookie。
            </li>
          </ul>
        </section>

        {/* 七、未成年人保护 */}
        <section id="minors">
          <h2 className="text-xl font-serif font-bold text-gold mb-4">
            七、未成年人保护
          </h2>
          <p>
            本平台不面向16周岁以下的未成年人提供服务。如果您是16周岁以下的未成年人，请勿注册或使用本平台。若我们发现在未获得可证实的监护人同意的情况下收集了未成年人的个人信息，我们将尽快删除相关数据。如果您是未成年人的监护人，当您对您所监护的未成年人的个人信息处理有疑问时，请通过以下联系方式与我们联系。
          </p>
        </section>

        {/* 八、隐私政策的变更 */}
        <section id="changes">
          <h2 className="text-xl font-serif font-bold text-gold mb-4">
            八、隐私政策的变更
          </h2>
          <p>
            我们可能会适时修订本隐私政策。当政策发生重大变更时，我们将通过平台公告、推送通知或电子邮件等方式通知您。若您在隐私政策修订后继续使用我们的服务，即表示您同意受修订后的隐私政策约束。
          </p>
        </section>

        {/* 九、联系我们 */}
        <section id="contact">
          <h2 className="text-xl font-serif font-bold text-gold mb-4">
            九、联系我们
          </h2>
          <p className="mb-3">
            如果您对本隐私政策有任何疑问、意见或建议，或者您需要行使您的个人信息权利，请通过以下方式联系我们：
          </p>
          <div className="bg-temple-900/60 rounded-xl p-6 border border-gold/10 space-y-2">
            <p>
              <strong className="text-temple-200">平台名称：</strong>
              全球祖庭旅行平台
            </p>
            <p>
              <strong className="text-temple-200">电子邮箱：</strong>
              privacy@zuting.com
            </p>
            <p>
              <strong className="text-temple-200">联系邮箱：</strong>
              privacy@zuting.com
            </p>
            <p>
              <strong className="text-temple-200">办公地址：</strong>
              广东省深圳市南山区
            </p>
            <p>
              <strong className="text-temple-200">响应时间：</strong>
              我们将在收到您的请求后15个工作日内予以答复。
            </p>
          </div>
        </section>

        {/* 生效日期 */}
        <div className="divider-gold my-6" />
        <p className="text-temple-500 text-sm text-center">
          本隐私政策自2026年3月25日起生效。
        </p>
      </div>
      <MobileNav />
    </div>
  );
}
