export default function Terms() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">服务条款</h1>
        
        <div className="glassmorphism p-8 space-y-6 text-gray-200">
          <section>
            <h2 className="text-2xl font-semibold text-cyan-400 mb-4">1. 服务概述</h2>
            <p>
              SomnoAI Digital Sleep Lab（以下简称"应用"）是一个数字化睡眠监测和健康分析平台。
              通过使用本应用，您同意受本服务条款的约束。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-cyan-400 mb-4">2. 用户账户</h2>
            <p className="mb-4">
              您需要创建账户才能使用应用的大部分功能。您同意：
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>提供准确、完整的账户信息</li>
              <li>维护账户密码的保密性</li>
              <li>对账户下的所有活动负责</li>
              <li>立即通知我们任何未授权的账户使用</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-cyan-400 mb-4">3. 使用许可</h2>
            <p className="mb-4">
              我们授予您个人的、非商业的、不可转让的许可，以使用本应用。您不得：
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>复制、修改或创建应用的衍生作品</li>
              <li>尝试获得未授权的应用访问权限</li>
              <li>使用应用进行任何非法目的</li>
              <li>骚扰或伤害他人</li>
              <li>传输恶意代码或病毒</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-cyan-400 mb-4">4. 用户内容</h2>
            <p className="mb-4">
              您对上传到应用的所有内容（包括睡眠数据和健康信息）保留所有权。
              通过上传内容，您授予我们使用该内容以提供服务的许可。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-cyan-400 mb-4">5. 免责声明</h2>
            <p className="mb-4">
              应用按"现状"提供。我们不保证：
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>应用的准确性或完整性</li>
              <li>应用的持续可用性</li>
              <li>应用不存在错误或中断</li>
              <li>健康建议的有效性</li>
            </ul>
            <p className="mt-4">
              应用提供的信息不能替代专业医疗建议。如有健康问题，请咨询医疗专业人士。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-cyan-400 mb-4">6. 责任限制</h2>
            <p>
              在任何情况下，我们对因使用或无法使用应用而产生的任何间接、附带、特殊或后果性损害不承担责任。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-cyan-400 mb-4">7. 第三方服务</h2>
            <p className="mb-4">
              应用可能集成第三方服务（如 Google Fit）。使用这些服务受其各自的条款和隐私政策约束。
              我们不对第三方服务的内容或功能负责。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-cyan-400 mb-4">8. 服务终止</h2>
            <p className="mb-4">
              我们保留以下权利：
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>随时修改或终止应用</li>
              <li>因违反本条款而终止您的账户</li>
              <li>删除您的数据</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-cyan-400 mb-4">9. 修改条款</h2>
            <p>
              我们可能不时修改这些条款。修改后的条款将在应用中发布。
              继续使用应用即表示您接受修改后的条款。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-cyan-400 mb-4">10. 准据法</h2>
            <p>
              本条款受适用法律管辖。任何争议应通过友好协商解决。
              如无法解决，应提交至有管辖权的法院。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-cyan-400 mb-4">11. 联系我们</h2>
            <p>
              如您对本服务条款有任何疑问，请通过以下方式与我们联系：
            </p>
            <p className="mt-4 text-cyan-300">
              电子邮件：support@somnoai.com
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
