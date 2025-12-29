import { useLocation } from "wouter";

export default function PrivacyPolicy() {
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
          <h1 className="text-4xl font-bold mb-2">隐私政策</h1>
          <p className="text-gray-400">最后更新：2025年12月28日</p>
        </div>

        {/* 内容 */}
        <div className="space-y-6 text-gray-200">
          {/* 1. 简介 */}
          <section className="bg-black/30 backdrop-blur-md rounded-lg p-6 border border-cyan-500/20">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">1. 简介</h2>
            <p className="mb-4">
              欢迎使用 SomnoAI Digital Sleep Lab（以下简称"本应用"）。本隐私政策说明了我们如何收集、使用、披露和保护您的个人信息。请仔细阅读本政策。如果您不同意本政策的任何部分，请不要使用本应用。
            </p>
            <p>
              本应用由 SomnoAI 团队开发，致力于为用户提供专业的睡眠监测和健康分析服务。我们非常重视您的隐私和数据安全。
            </p>
          </section>

          {/* 2. 我们收集的信息 */}
          <section className="bg-black/30 backdrop-blur-md rounded-lg p-6 border border-cyan-500/20">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">2. 我们收集的信息</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gold-400 mb-2">2.1 您直接提供的信息</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>账户信息：姓名、电子邮件地址、密码</li>
                  <li>个人资料：年龄、性别、身高、体重</li>
                  <li>睡眠数据：睡眠时间、睡眠质量评分、睡眠阶段数据</li>
                  <li>健康数据：心率、血压、运动数据</li>
                  <li>偏好设置：通知偏好、显示设置、隐私设置</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gold-400 mb-2">2.2 从第三方收集的信息</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Google Fit 数据：</strong>当您授权连接时，我们会收集您的睡眠段数据、心率数据、活动数据和身体测量数据。这些数据仅用于改进您的睡眠分析和个性化建议。</li>
                  <li><strong>Google 账户：</strong>当您使用 Google 登录时，我们会收集基本的账户信息（如电子邮件和姓名）</li>
                  <li><strong>分析服务：</strong>我们可能收集使用统计和应用性能数据以改进服务</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gold-400 mb-2">2.3 自动收集的信息</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>设备信息：设备类型、操作系统、浏览器类型</li>
                  <li>使用数据：您访问的功能、点击的按钮、花费的时间</li>
                  <li>位置信息：基于 IP 地址的粗略位置（仅用于服务优化）</li>
                  <li>Cookie 和类似技术：用于改进用户体验和安全性</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 3. 信息的使用 */}
          <section className="bg-black/30 backdrop-blur-md rounded-lg p-6 border border-cyan-500/20">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">3. 我们如何使用您的信息</h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>提供和改进服务：分析睡眠数据、生成健康报告、提供个性化建议</li>
              <li>账户管理：创建和维护您的账户、处理登录和身份验证</li>
              <li>通信：发送服务通知、安全警报、更新和营销信息</li>
              <li>分析和研究：改进应用功能、进行用户行为分析</li>
              <li>法律合规：遵守法律要求、保护我们的权利</li>
              <li>AI 分析：使用您的数据（包括来自 Google Fit 的数据）生成个性化的睡眠建议和健康洞察</li>
              <li>Google Fit 同步：自动或手动同步 Google Fit 数据到本应用，以提供更完整的睡眠分析</li>
            </ul>
          </section>

          {/* 4. 信息的共享 */}
          <section className="bg-black/30 backdrop-blur-md rounded-lg p-6 border border-cyan-500/20">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">4. 信息的共享和披露</h2>
            <div className="space-y-4">
              <p>
                我们不会出售、交易或租赁您的个人信息。但在以下情况下，我们可能会共享您的信息：
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>服务提供商：与帮助我们运营应用的第三方合作伙伴共享</li>
                <li>法律要求：当法律、法规或政府部门要求时</li>
                <li>保护权利：为了保护我们的权利、隐私、安全或财产</li>
                <li>业务转移：在合并、收购或资产出售的情况下</li>
                <li>您的同意：在获得您明确同意的情况下</li>
              </ul>
            </div>
          </section>

          {/* 5. 数据安全 */}
          <section className="bg-black/30 backdrop-blur-md rounded-lg p-6 border border-cyan-500/20">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">5. 数据安全</h2>
            <p className="mb-4">
              我们采取适当的技术和组织措施来保护您的个人信息，包括：
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>SSL/TLS 加密：所有数据传输都通过加密连接进行</li>
              <li>数据库加密：敏感信息在数据库中加密存储</li>
              <li>访问控制：只有授权人员才能访问您的信息</li>
              <li>定期安全审计：我们定期进行安全检查和更新</li>
              <li>安全备份：我们定期备份数据以防止丢失</li>
            </ul>
            <p className="mt-4 text-sm text-gray-400">
              但请注意，没有任何传输方法或存储系统是 100% 安全的。虽然我们尽力保护您的信息，但我们无法保证绝对安全。
            </p>
          </section>

          {/* 6. 数据保留 */}
          <section className="bg-black/30 backdrop-blur-md rounded-lg p-6 border border-cyan-500/20">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">6. 数据保留</h2>
            <p>
              我们将保留您的个人信息，只要您的账户处于活跃状态或根据法律要求。您可以随时请求删除您的账户和相关数据。删除后，我们将在合理的时间内从我们的系统中删除您的信息，除非法律要求我们保留。
            </p>
          </section>

          {/* 7. 您的权利 */}
          <section className="bg-black/30 backdrop-blur-md rounded-lg p-6 border border-cyan-500/20">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">7. 您的权利</h2>
            <p className="mb-4">根据适用法律，您可能拥有以下权利：</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>访问权：要求查看我们持有的关于您的信息</li>
              <li>更正权：要求更正不准确的信息</li>
              <li>删除权：要求删除您的个人信息</li>
              <li>限制权：要求限制我们对您信息的使用</li>
              <li>可携带权：以可读格式获取您的数据副本</li>
              <li>反对权：反对某些类型的数据处理</li>
            </ul>
            <p className="mt-4">
              如果您想行使这些权利，请通过本政策底部的联系方式与我们联系。
            </p>
          </section>

          {/* 8. Cookie 和跟踪技术 */}
          <section className="bg-black/30 backdrop-blur-md rounded-lg p-6 border border-cyan-500/20">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">8. Cookie 和跟踪技术</h2>
            <p className="mb-4">
              本应用使用 Cookie 和类似的跟踪技术来增强您的体验。Cookie 是存储在您设备上的小文件，帮助我们：
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>记住您的登录信息和偏好</li>
              <li>分析应用的使用情况</li>
              <li>改进应用的功能和性能</li>
              <li>防止欺诈和提高安全性</li>
            </ul>
            <p className="mt-4">
              您可以通过浏览器设置控制 Cookie。但请注意，禁用 Cookie 可能会影响应用的某些功能。
            </p>
          </section>

          {/* 9. Google Fit 数据处理 */}
          <section className="bg-black/30 backdrop-blur-md rounded-lg p-6 border border-cyan-500/20">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">9. Google Fit 数据处理</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gold-400 mb-2">9.1 数据授权</h3>
                <p className="mb-2">
                  当您选择连接 Google Fit 时，您需要授权本应用访问以下数据：
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>睡眠段数据（睡眠时间、睡眠阶段）</li>
                  <li>心率数据（平均、最低、最高心率）</li>
                  <li>活动数据（步数、贡献活动）</li>
                  <li>身体测量数据（体重、身体成分）</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gold-400 mb-2">9.2 数据使用限制</h3>
                <p className="mb-2">
                  本应用仅将 Google Fit 数据用于：
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>改进睡眠分析和个性化建议</li>
                  <li>提供健康洞察和 AI 帮助</li>
                  <li>改进应用功能和用户体验</li>
                  <li>符合法律要求</li>
                </ul>
                <p className="mt-2">
                  本应用不会将 Google Fit 数据用于广告、数据消林或任何不相关的目的。
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gold-400 mb-2">9.3 数据安全</h3>
                <p>
                  我们会使用工业标准的加密技术来保护 Google Fit 数据。所有数据传输都通过 SSL/TLS 加密进行。
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gold-400 mb-2">9.4 断开连接</h3>
                <p>
                  您可以随时在应用设置中断开 Google Fit 连接。断开后，本应用将不再能访问您的 Google Fit 数据。但您之前同步的数据会保留在本应用中。
                </p>
              </div>
            </div>
          </section>

          {/* 10. 第三方链接 */}
          <section className="bg-black/30 backdrop-blur-md rounded-lg p-6 border border-cyan-500/20">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">10. 第三方链接</h2>
            <p>
              本应用可能包含指向第三方网站的链接。我们对这些网站的隐私政策或实践不负责。我们建议您在访问任何第三方网站时查看其隐私政策。
            </p>
          </section>

          {/* 11. 儿童隐私 */}
          <section className="bg-black/30 backdrop-blur-md rounded-lg p-6 border border-cyan-500/20">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">11. 儿童隐私</h2>
            <p>
              本应用不针对 13 岁以下的儿童。我们不会有意收集 13 岁以下儿童的个人信息。如果我们发现我们收集了儿童的信息，我们将立即删除。
            </p>
          </section>

          {/* 12. 政策变更 */}
          <section className="bg-black/30 backdrop-blur-md rounded-lg p-6 border border-cyan-500/20">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">12. 政策变更</h2>
            <p>
              我们可能不时更新本隐私政策。我们将通过在本页面上发布新政策并更新"最后更新"日期来通知您任何重大变更。您继续使用本应用即表示您接受更新后的政策。
            </p>
          </section>

          {/* 13. 联系我们 */}
          <section className="bg-black/30 backdrop-blur-md rounded-lg p-6 border border-cyan-500/20">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">13. 联系我们</h2>
            <p className="mb-4">
              如果您对本隐私政策有任何问题或疑虑，或想行使您的权利，请通过以下方式与我们联系：
            </p>
            <div className="bg-black/50 rounded p-4 space-y-2">
              <p><strong>电子邮件：</strong> privacy@somnoai.com</p>
              <p><strong>邮件地址：</strong> SomnoAI Team, Sleep Lab Division</p>
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
