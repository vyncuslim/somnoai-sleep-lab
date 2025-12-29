import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export default function BrandGuidelines() {
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
          <h1 className="text-4xl font-bold mb-2">品牌推广指南</h1>
          <p className="text-gray-400">最后更新：2025年12月29日</p>
        </div>

        {/* 内容 */}
        <div className="space-y-6 text-gray-200">
          {/* 1. 品牌概述 */}
          <section className="bg-black/30 backdrop-blur-md rounded-lg p-6 border border-cyan-500/20">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">1. 品牌概述</h2>
            <p className="mb-4">
              SomnoAI Digital Sleep Lab 是一个专业的睡眠监测和分析应用，致力于帮助用户通过科学的方法改善睡眠质量。我们的品牌代表创新、信任和个性化健康管理。
            </p>
            <p>
              我们的使命是通过人工智能和数据分析，为每个用户提供个性化的睡眠改善建议，帮助他们实现更好的睡眠和生活质量。
            </p>
          </section>

          {/* 2. 品牌价值观 */}
          <section className="bg-black/30 backdrop-blur-md rounded-lg p-6 border border-cyan-500/20">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">2. 品牌价值观</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-cyan-300 mb-2">创新</h3>
                <p>
                  我们不断探索新的技术和方法来改进睡眠监测和分析，为用户提供最先进的解决方案。
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-cyan-300 mb-2">信任</h3>
                <p>
                  我们重视用户隐私，采取最高标准的数据安全措施，确保用户信息得到妥善保护。
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-cyan-300 mb-2">个性化</h3>
                <p>
                  我们理解每个人的睡眠需求都不同，提供量身定制的建议和分析。
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-cyan-300 mb-2">科学性</h3>
                <p>
                  我们的所有建议都基于科学研究和数据分析，确保准确性和有效性。
                </p>
              </div>
            </div>
          </section>

          {/* 3. 品牌标识 */}
          <section className="bg-black/30 backdrop-blur-md rounded-lg p-6 border border-cyan-500/20">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">3. 品牌标识</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-cyan-300 mb-2">Logo</h3>
                <p className="mb-2">
                  SomnoAI 的 Logo 采用云形设计，象征着睡眠的宁静和数据的流动。
                </p>
                <p className="text-sm text-gray-400">
                  Logo 应始终以完整形式使用，不应被拉伸、旋转或改变颜色。
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-cyan-300 mb-2">颜色方案</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-cyan-400 rounded"></div>
                    <div>
                      <p className="font-semibold">主色：电光蓝</p>
                      <p className="text-sm text-gray-400">#00C4FF</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-purple-500 rounded"></div>
                    <div>
                      <p className="font-semibold">辅助色：深紫色</p>
                      <p className="text-sm text-gray-400">#9333EA</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-slate-900 rounded"></div>
                    <div>
                      <p className="font-semibold">背景色：深灰黑</p>
                      <p className="text-sm text-gray-400">#0F172A</p>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-cyan-300 mb-2">字体</h3>
                <p className="mb-2">
                  我们使用现代、易读的字体来确保品牌的专业性和可访问性。
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-400">
                  <li>标题：Exo 2（几何、科技感）</li>
                  <li>正文：Inter（现代、高可读性）</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 4. 品牌声调 */}
          <section className="bg-black/30 backdrop-blur-md rounded-lg p-6 border border-cyan-500/20">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">4. 品牌声调</h2>
            <p className="mb-4">
              SomnoAI 的品牌声调应该是：
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>专业但友好</strong> - 提供专业建议，但以易于理解的方式呈现</li>
              <li><strong>鼓励性</strong> - 激励用户改善睡眠习惯</li>
              <li><strong>可信赖的</strong> - 基于科学和数据，展现透明度</li>
              <li><strong>创新的</strong> - 展现我们对最新技术的承诺</li>
              <li><strong>关怀的</strong> - 表达对用户健康和幸福的关注</li>
            </ul>
          </section>

          {/* 5. 使用指南 */}
          <section className="bg-black/30 backdrop-blur-md rounded-lg p-6 border border-cyan-500/20">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">5. 品牌使用指南</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-cyan-300 mb-2">应该做的事</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>使用官方 Logo 和颜色</li>
                  <li>保持一致的品牌声调和消息</li>
                  <li>强调科学和数据驱动的方法</li>
                  <li>突出用户隐私和数据安全</li>
                  <li>展示真实的用户成功故事</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-cyan-300 mb-2">不应该做的事</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>修改或扭曲 Logo</li>
                  <li>使用未经授权的颜色或字体</li>
                  <li>做出医学诊断或治疗承诺</li>
                  <li>误导用户关于应用的功能</li>
                  <li>与竞争对手进行贬低性比较</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 6. 社交媒体指南 */}
          <section className="bg-black/30 backdrop-blur-md rounded-lg p-6 border border-cyan-500/20">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">6. 社交媒体指南</h2>
            <p className="mb-4">
              在社交媒体上代表 SomnoAI 时，请遵循以下指南：
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>使用官方账号和认证标记</li>
              <li>分享有用的睡眠提示和健康建议</li>
              <li>与用户进行真诚的互动和对话</li>
              <li>及时回应用户的问题和反馈</li>
              <li>避免发布误导性或虚假信息</li>
              <li>尊重用户隐私，不分享个人数据</li>
            </ul>
          </section>

          {/* 7. 联系我们 */}
          <section className="bg-black/30 backdrop-blur-md rounded-lg p-6 border border-cyan-500/20">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">7. 品牌查询</h2>
            <p className="mb-4">
              如果您对我们的品牌指南有任何问题或需要使用我们的品牌资源，请联系我们：
            </p>
            <div className="bg-black/50 rounded p-4 space-y-2">
              <p><strong>电子邮件：</strong> brand@somnoai.com</p>
              <p><strong>网址：</strong> https://somnoai-lab-bvvlgs8k.manus.space</p>
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
