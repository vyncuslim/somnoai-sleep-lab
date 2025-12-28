export default function Privacy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">隐私权政策</h1>
        
        <div className="glassmorphism p-8 space-y-6 text-gray-200">
          <section>
            <h2 className="text-2xl font-semibold text-cyan-400 mb-4">1. 信息收集</h2>
            <p className="mb-4">
              SomnoAI Digital Sleep Lab（以下简称"应用"）收集以下信息以提供睡眠监测和健康分析服务：
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>用户账户信息（邮箱、姓名）</li>
              <li>睡眠数据（睡眠时长、睡眠阶段、睡眠质量评分）</li>
              <li>心率数据（平均心率、最低/最高心率）</li>
              <li>来自 Google Fit 的健身数据（如用户授权）</li>
              <li>使用日志和分析数据</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-cyan-400 mb-4">2. 信息使用</h2>
            <p className="mb-4">
              我们使用收集的信息用于以下目的：
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>提供个性化的睡眠分析和健康建议</li>
              <li>改进应用功能和用户体验</li>
              <li>发送相关通知和提醒</li>
              <li>进行数据分析和研究</li>
              <li>遵守法律义务</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-cyan-400 mb-4">3. 数据安全</h2>
            <p>
              我们采取适当的技术和组织措施保护您的个人数据，包括加密、访问控制和定期安全审计。
              所有数据存储在安全的服务器上，仅授权人员可以访问。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-cyan-400 mb-4">4. 数据共享</h2>
            <p className="mb-4">
              我们不会将您的个人数据出售给第三方。我们可能与以下方共享数据：
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>服务提供商（如云存储提供商）</li>
              <li>执法机构（如法律要求）</li>
              <li>经您明确同意的第三方</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-cyan-400 mb-4">5. 用户权利</h2>
            <p className="mb-4">
              您有权：
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>访问您的个人数据</li>
              <li>更正或删除您的数据</li>
              <li>撤销对数据处理的同意</li>
              <li>导出您的数据</li>
              <li>提出隐私投诉</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-cyan-400 mb-4">6. Cookies</h2>
            <p>
              应用使用 Cookies 和类似技术来改进用户体验。您可以通过浏览器设置控制 Cookies。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-cyan-400 mb-4">7. 政策更新</h2>
            <p>
              我们可能不时更新此隐私权政策。更新后的政策将在应用中发布，并标注更新日期。
              继续使用应用即表示您接受更新的政策。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-cyan-400 mb-4">8. 联系我们</h2>
            <p>
              如您对本隐私权政策有任何疑问，请通过以下方式与我们联系：
            </p>
            <p className="mt-4 text-cyan-300">
              电子邮件：privacy@somnoai.com
            </p>
          </section>

          <p className="text-sm text-gray-400 mt-8">
            最后更新日期：2025年12月28日
          </p>
        </div>
      </div>
    </div>
  );
}
