import { useLocation } from "wouter";

export default function TermsOfService() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* 返回按钮 */}
        <button
          onClick={() => setLocation("/")}
          className="mb-8 text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-2"
        >
          ← 返回首页
        </button>

        {/* 标题 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">服务条款</h1>
          <p className="text-gray-400">最后更新：2025年12月28日</p>
        </div>

        {/* 内容 */}
        <div className="space-y-6 text-gray-200">
          {/* 1. 接受条款 */}
          <section className="bg-black/30 backdrop-blur-md rounded-lg p-6 border border-cyan-500/20">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">1. 接受条款</h2>
            <p className="mb-4">
              通过访问和使用 SomnoAI Digital Sleep Lab（以下简称"本应用"），您同意受本服务条款的约束。如果您不同意本条款的任何部分，请立即停止使用本应用。
            </p>
            <p>
              我们保留随时修改这些条款的权利。您继续使用本应用即表示您接受任何修改。
            </p>
          </section>

          {/* 2. 使用许可 */}
          <section className="bg-black/30 backdrop-blur-md rounded-lg p-6 border border-cyan-500/20">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">2. 使用许可</h2>
            <p className="mb-4">
              我们授予您一份有限的、非独占的、不可转让的许可证，以供个人、非商业用途使用本应用。您同意：
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>不会复制、修改或创建本应用的衍生作品</li>
              <li>不会尝试破坏或绕过本应用的安全功能</li>
              <li>不会使用本应用进行任何非法或有害的目的</li>
              <li>不会尝试获得未授权的访问权限</li>
              <li>不会将本应用用于商业目的，除非获得明确许可</li>
              <li>不会上传或传输恶意代码或有害内容</li>
            </ul>
          </section>

          {/* 3. 用户账户 */}
          <section className="bg-black/30 backdrop-blur-md rounded-lg p-6 border border-cyan-500/20">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">3. 用户账户</h2>
            <div className="space-y-4">
              <p>
                当您创建账户时，您同意提供准确、完整和最新的信息。您负责维护您的密码的机密性，并对您账户下的所有活动负责。
              </p>
              <p>
                您同意立即通知我们任何未授权的使用您账户的情况。我们对您未经授权使用您的账户而导致的任何损失不负责。
              </p>
              <p>
                我们保留随时暂停或终止您的账户的权利，如果我们认为您违反了本条款或进行了任何非法或有害的活动。
              </p>
            </div>
          </section>

          {/* 4. 用户内容 */}
          <section className="bg-black/30 backdrop-blur-md rounded-lg p-6 border border-cyan-500/20">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">4. 用户内容</h2>
            <p className="mb-4">
              您在本应用中输入的任何内容（包括睡眠数据、健康信息、评论等）被视为"用户内容"。您保留对用户内容的所有权利，但您授予我们以下权利：
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>使用、复制、修改和分发用户内容以提供和改进服务</li>
              <li>在必要时与第三方服务提供商共享用户内容</li>
              <li>为了安全和法律目的保留用户内容的副本</li>
            </ul>
            <p className="mt-4">
              您同意不上传任何侵犯他人权利的内容，或违反任何法律或法规的内容。
            </p>
          </section>

          {/* 5. 知识产权 */}
          <section className="bg-black/30 backdrop-blur-md rounded-lg p-6 border border-cyan-500/20">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">5. 知识产权</h2>
            <p className="mb-4">
              本应用及其所有内容（包括文本、图形、徽标、图像、音频、视频、代码）都是我们或我们的许可人的专有财产，受版权和其他知识产权法保护。
            </p>
            <p>
              您不得复制、修改、分发、销售或传输本应用的任何部分，除非获得我们的明确书面许可。
            </p>
          </section>

          {/* 6. 免责声明 */}
          <section className="bg-black/30 backdrop-blur-md rounded-lg p-6 border border-cyan-500/20">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">6. 免责声明</h2>
            <p className="mb-4">
              本应用按"现状"提供，不提供任何明示或暗示的保证。我们不保证：
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>本应用将满足您的所有需求</li>
              <li>本应用将不间断或无错误地运行</li>
              <li>本应用中的任何错误或缺陷将被纠正</li>
              <li>本应用提供的健康建议是医学上准确或充分的</li>
            </ul>
            <p className="mt-4 text-sm text-yellow-400">
              <strong>重要：</strong> 本应用不是医疗设备，不能替代专业医疗建议。如果您有任何健康问题，请咨询医疗专业人士。
            </p>
          </section>

          {/* 7. 责任限制 */}
          <section className="bg-black/30 backdrop-blur-md rounded-lg p-6 border border-cyan-500/20">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">7. 责任限制</h2>
            <p className="mb-4">
              在任何情况下，SomnoAI 及其官员、董事、员工或代理人都不对以下情况负责：
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>任何间接、偶然、特殊或后果性的损害</li>
              <li>数据丢失或损坏</li>
              <li>业务中断或利润损失</li>
              <li>由于使用本应用而导致的任何其他损失或损害</li>
            </ul>
            <p className="mt-4">
              即使我们已被告知这些损害的可能性。
            </p>
          </section>

          {/* 8. 赔偿 */}
          <section className="bg-black/30 backdrop-blur-md rounded-lg p-6 border border-cyan-500/20">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">8. 赔偿</h2>
            <p>
              您同意赔偿并保护 SomnoAI、其官员、董事、员工和代理人免受任何由您使用本应用、违反本条款或侵犯任何第三方权利而引起的任何索赔、损害、费用和费用（包括律师费）。
            </p>
          </section>

          {/* 9. 第三方服务 */}
          <section className="bg-black/30 backdrop-blur-md rounded-lg p-6 border border-cyan-500/20">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">9. 第三方服务</h2>
            <p className="mb-4">
              本应用可能与第三方服务（如 Google Fit、Google 账户等）集成。我们对这些第三方服务的条款、隐私政策或实践不负责。您使用这些服务时应遵守它们的条款。
            </p>
            <p>
              我们不对任何第三方服务的中断、错误或不可用性负责。
            </p>
          </section>

          {/* 10. 终止 */}
          <section className="bg-black/30 backdrop-blur-md rounded-lg p-6 border border-cyan-500/20">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">10. 终止</h2>
            <p className="mb-4">
              我们可以随时以任何原因（包括无原因）终止或暂停您的账户和对本应用的访问权限，恕不另行通知。
            </p>
            <p>
              终止后，您对本应用的所有权利将立即停止。您的用户内容可能会被删除。
            </p>
          </section>

          {/* 11. 可适用法律 */}
          <section className="bg-black/30 backdrop-blur-md rounded-lg p-6 border border-cyan-500/20">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">11. 可适用法律</h2>
            <p>
              本条款受新加坡法律管辖，不考虑其法律冲突条款。任何法律诉讼或争议应在新加坡法院进行。
            </p>
          </section>

          {/* 12. 争议解决 */}
          <section className="bg-black/30 backdrop-blur-md rounded-lg p-6 border border-cyan-500/20">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">12. 争议解决</h2>
            <p className="mb-4">
              在诉诸法律之前，任何争议应首先通过友好协商解决。如果无法通过协商解决，争议应通过具有约束力的仲裁解决。
            </p>
            <p>
              仲裁应在新加坡进行，由新加坡国际仲裁中心（SIAC）根据其规则进行。
            </p>
          </section>

          {/* 13. 分割 */}
          <section className="bg-black/30 backdrop-blur-md rounded-lg p-6 border border-cyan-500/20">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">13. 分割</h2>
            <p>
              如果本条款的任何部分被认为无效或不可执行，该部分应被删除，其余部分应继续有效。
            </p>
          </section>

          {/* 14. 完整协议 */}
          <section className="bg-black/30 backdrop-blur-md rounded-lg p-6 border border-cyan-500/20">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">14. 完整协议</h2>
            <p>
              本条款和我们的隐私政策构成您与我们之间关于本应用的完整协议，并取代所有先前的协议和理解。
            </p>
          </section>

          {/* 15. 联系我们 */}
          <section className="bg-black/30 backdrop-blur-md rounded-lg p-6 border border-cyan-500/20">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">15. 联系我们</h2>
            <p className="mb-4">
              如果您对本服务条款有任何问题或疑虑，请通过以下方式与我们联系：
            </p>
            <div className="bg-black/50 rounded p-4 space-y-2">
              <p><strong>电子邮件：</strong> legal@somnoai.com</p>
              <p><strong>邮件地址：</strong> SomnoAI Team, Legal Department</p>
              <p><strong>应用内反馈：</strong> 通过应用设置中的"联系我们"选项</p>
            </div>
          </section>

          {/* 底部 */}
          <div className="mt-8 pt-6 border-t border-cyan-500/20 text-center text-gray-400">
            <p>© 2025 SomnoAI Digital Sleep Lab. 保留所有权利。</p>
          </div>
        </div>
      </div>
    </div>
  );
}
