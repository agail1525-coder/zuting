import type { Metadata } from "next";
import MobileNav from "@/components/MobileNav";

export const metadata: Metadata = {
  title: "用户协议",
  description:
    "佳绩之旅用户服务协议，了解使用本平台的条款和条件。",
  alternates: {
    canonical: "https://zuting.fszyl.top/terms",
  },
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-gradient-gold mb-4">
          用户协议
        </h1>
        <p className="text-temple-400 text-lg">Terms of Service</p>
        <p className="text-temple-500 text-sm mt-2">
          生效日期：2026年3月25日
        </p>
      </div>

      <div className="card-glow rounded-2xl bg-temple-800/60 border border-gold/10 p-8 md:p-12 space-y-10 text-temple-300 leading-relaxed">
        {/* 引言 */}
        <section>
          <p>
            欢迎使用佳绩之旅（以下简称&ldquo;本平台&rdquo;）。本用户协议（以下简称&ldquo;本协议&rdquo;）是您与本平台运营方之间关于使用本平台各项服务的法律协议。请您在注册或使用本平台服务前，仔细阅读本协议的全部内容。如果您不同意本协议的任何条款，请勿注册或使用本平台。
          </p>
        </section>

        {/* 一、服务说明 */}
        <section id="service">
          <h2 className="text-xl font-serif font-bold text-gold mb-4">
            一、服务说明
          </h2>
          <p className="mb-3">
            本平台致力于为用户提供全球文化圣地旅行服务，包括但不限于：
          </p>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li>十二大文化传统的文化知识展示与教育。</li>
            <li>全球300+文化圣地的信息查询与导览。</li>
            <li>27个祖庭、28位祖师、39条祖训的详细介绍。</li>
            <li>曹溪愿命三十印的修行内容。</li>
            <li>小鸿AI智能助手，提供文化知识问答。</li>
            <li>文化之旅行程的创建、预订和管理。</li>
            <li>旅行日志的记录与分享。</li>
            <li>订单管理与在线支付。</li>
          </ul>
        </section>

        {/* 二、用户注册 */}
        <section id="registration">
          <h2 className="text-xl font-serif font-bold text-gold mb-4">
            二、用户注册
          </h2>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li>
              <strong className="text-temple-200">真实信息：</strong>
              您在注册时应提供真实、准确、完整的个人信息，并在信息变更时及时更新。
            </li>
            <li>
              <strong className="text-temple-200">账号安全：</strong>
              您应妥善保管您的账号和密码，因您保管不善导致的损失由您自行承担。如发现账号被盗用，请立即联系我们。
            </li>
            <li>
              <strong className="text-temple-200">年龄限制：</strong>
              您确认在注册时已年满16周岁。16周岁以下的未成年人不得注册或使用本平台。
            </li>
            <li>
              <strong className="text-temple-200">一人一号：</strong>
              每个用户仅可注册一个账号，不得将账号转让、出借给他人使用。
            </li>
          </ul>
        </section>

        {/* 三、用户行为规范 */}
        <section id="conduct">
          <h2 className="text-xl font-serif font-bold text-gold mb-4">
            三、用户行为规范
          </h2>
          <p className="mb-3">使用本平台时，您应遵守以下规范：</p>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li>
              <strong className="text-temple-200">尊重文化传统：</strong>
              本平台涵盖多种文化传统，请尊重各文化传统，不得发布侮辱、歧视、攻击任何文化传统的内容。
            </li>
            <li>
              <strong className="text-temple-200">禁止不当内容：</strong>
              不得发布违法、淫秽、暴力、恐怖、虚假信息或侵犯他人合法权益的内容。
            </li>
            <li>
              <strong className="text-temple-200">文明交流：</strong>
              在使用AI助手和社区功能时，请保持文明、友善的交流态度，促进跨宗教对话与理解。
            </li>
            <li>
              <strong className="text-temple-200">合法使用：</strong>
              不得利用本平台从事任何违反中华人民共和国法律法规的活动。
            </li>
            <li>
              <strong className="text-temple-200">禁止滥用：</strong>
              不得使用自动化工具、爬虫等方式批量访问平台，不得干扰平台正常运营。
            </li>
          </ul>
        </section>

        {/* 四、行程服务 */}
        <section id="trips">
          <h2 className="text-xl font-serif font-bold text-gold mb-4">
            四、行程服务
          </h2>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li>
              <strong className="text-temple-200">预订条款：</strong>
              行程预订需经本平台确认后方可生效。我们将在收到预订后24小时内进行确认。
            </li>
            <li>
              <strong className="text-temple-200">取消政策：</strong>
              行程出发前7天（含）以上取消，全额退款；出发前3-6天取消，退还70%费用；出发前1-2天取消，退还50%费用；出发当天取消，不予退款。
            </li>
            <li>
              <strong className="text-temple-200">退款规则：</strong>
              退款将在确认后7-15个工作日内退回原支付账户。
            </li>
            <li>
              <strong className="text-temple-200">行程变更：</strong>
              因不可抗力（如天气、政策变化等）导致的行程变更，本平台将协助您调整行程或办理退款。
            </li>
            <li>
              <strong className="text-temple-200">行程状态：</strong>
              行程经历草稿、规划中、已提交、已确认、已支付、准备中、进行中、已完成、回顾中等状态，您可在行程详情页实时查看。
            </li>
          </ul>
        </section>

        {/* 五、支付条款 */}
        <section id="payment">
          <h2 className="text-xl font-serif font-bold text-gold mb-4">
            五、支付条款
          </h2>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li>
              <strong className="text-temple-200">支付方式：</strong>
              本平台支持支付宝、微信支付等主流支付方式。
            </li>
            <li>
              <strong className="text-temple-200">价格说明：</strong>
              所有价格以人民币（CNY）为单位，均为含税价格。实际支付金额以订单确认页面显示为准。
            </li>
            <li>
              <strong className="text-temple-200">发票：</strong>
              您有权就支付金额申请开具发票。请在支付完成后30天内通过平台提交开票申请。
            </li>
            <li>
              <strong className="text-temple-200">支付安全：</strong>
              支付过程由第三方支付服务商提供安全保障，本平台不会存储您的支付密码。
            </li>
          </ul>
        </section>

        {/* 六、知识产权 */}
        <section id="ip">
          <h2 className="text-xl font-serif font-bold text-gold mb-4">
            六、知识产权
          </h2>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li>
              本平台上展示的文字、图片、音频、视频、软件、数据及其他内容（除用户生成内容外），其知识产权归本平台或相关权利人所有。
            </li>
            <li>
              未经本平台书面许可，您不得以任何方式复制、转载、传播或以其他方式使用平台内容。
            </li>
            <li>
              您在本平台发布的旅行日志等用户生成内容，著作权归您所有。但您同意授予本平台非独占的、免费的许可，用于平台内展示和推广。
            </li>
          </ul>
        </section>

        {/* 七、免责声明 */}
        <section id="disclaimer">
          <h2 className="text-xl font-serif font-bold text-gold mb-4">
            七、免责声明
          </h2>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li>
              <strong className="text-temple-200">旅行风险：</strong>
              文化之旅可能存在固有风险，包括但不限于交通、天气、健康等方面的风险。用户应自行评估旅行风险并采取适当的安全措施。本平台建议您出行前购买旅行保险。
            </li>
            <li>
              <strong className="text-temple-200">信息准确性：</strong>
              本平台尽力确保所提供的文化信息的准确性，但不对其完整性、时效性作出保证。文化内容仅供参考。
            </li>
            <li>
              <strong className="text-temple-200">第三方服务：</strong>
              本平台可能包含第三方服务的链接或接入，我们不对第三方服务的内容、安全性和可用性承担责任。
            </li>
            <li>
              <strong className="text-temple-200">AI助手：</strong>
              小鸿AI助手提供的信息仅供参考，不构成专业的文化、法律或医疗建议。
            </li>
            <li>
              <strong className="text-temple-200">不可抗力：</strong>
              因自然灾害、战争、政策变化、疫情等不可抗力导致的服务中断或损失，本平台不承担责任。
            </li>
          </ul>
        </section>

        {/* 八、争议解决 */}
        <section id="dispute">
          <h2 className="text-xl font-serif font-bold text-gold mb-4">
            八、争议解决
          </h2>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li>
              本协议的签订、履行、解释及争议解决均适用中华人民共和国法律（不含冲突法规则）。
            </li>
            <li>
              如双方就本协议内容或执行发生任何争议，应首先友好协商解决。
            </li>
            <li>
              协商不成的，任何一方均可将争议提交至深圳国际仲裁院按照其当时有效的仲裁规则进行仲裁。仲裁裁决为终局裁决，对双方均有约束力。
            </li>
          </ul>
        </section>

        {/* 九、条款修改 */}
        <section id="modifications">
          <h2 className="text-xl font-serif font-bold text-gold mb-4">
            九、条款修改
          </h2>
          <p>
            本平台有权根据需要不时修改本协议。修改后的协议将通过平台公告、推送通知或站内信等方式通知您。如果您在本协议修改后继续使用本平台服务，即表示您已接受修改后的协议。如您不同意修改后的协议，请停止使用本平台服务并注销账号。
          </p>
        </section>

        {/* 十、其他 */}
        <section id="other">
          <h2 className="text-xl font-serif font-bold text-gold mb-4">
            十、其他
          </h2>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li>
              本协议任何条款被认定为无效或不可执行的，不影响其余条款的效力。
            </li>
            <li>
              本平台未行使或延迟行使本协议项下的任何权利，不构成对该权利的放弃。
            </li>
            <li>
              本协议构成双方就使用本平台服务的完整协议，取代此前的任何口头或书面协议。
            </li>
          </ul>
        </section>

        {/* 联系方式 */}
        <section id="contact">
          <h2 className="text-xl font-serif font-bold text-gold mb-4">
            联系我们
          </h2>
          <div className="bg-temple-900/60 rounded-xl p-6 border border-gold/10 space-y-2">
            <p>
              <strong className="text-temple-200">平台名称：</strong>
              佳绩之旅
            </p>
            <p>
              <strong className="text-temple-200">电子邮箱：</strong>
              service@zuting.com
            </p>
            <p>
              <strong className="text-temple-200">联系邮箱：</strong>
              service@zuting.com
            </p>
            <p>
              <strong className="text-temple-200">办公地址：</strong>
              广东省深圳市南山区
            </p>
          </div>
        </section>

        {/* 生效日期 */}
        <div className="divider-gold my-6" />
        <p className="text-temple-500 text-sm text-center">
          本用户协议自2026年3月25日起生效。
        </p>
      </div>
      <MobileNav />
    </div>
  );
}
