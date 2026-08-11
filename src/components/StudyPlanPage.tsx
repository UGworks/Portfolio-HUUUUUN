import { motion } from 'framer-motion';
import Header from './Header';

const applicant = '이성훈';
const examineeNumber = 'N120103003';
const program = '첨단영상대학원 예술공학 전공 (석사과정)';

interface StudyPlanPageProps {
  showHeader?: boolean;
}

const researchInterests = [
  {
    title: '파이낸스 데이터 기반 영상 제작 파이프라인 자동화 설계',
    body: '딜소싱(Deal Sourcing), 기업 이벤트, 시장 데이터 등 실무 현장에서 발생하는 비정형 금융 정보를 시각적 속성(형태, 색채, 모션, 시간 구조)으로 변환하는 데이터 매핑 체계를 연구하고자 합니다. 이를 통해 반복적인 영상 제작 공정을 자동화하고, 금융 커뮤니케이션의 제작 속도와 일관성을 높이는 파이프라인을 설계하는 것이 목표입니다.',
  },
  {
    title: '인공지능을 활용한 투자 의사결정 지원용 시각화 시스템 연구',
    body: '방대한 텍스트 리포트와 뉴스, 기업 내러티브 속에서 투자자가 핵심 시그널을 놓치지 않도록 돕는 지능형 시각화 모델을 구축하고자 합니다. AI를 통해 내러티브의 방향성과 리스크 신호를 분석하고, 이를 시각적 균형과 위계에 따라 배치하여 정보 탐색 과정의 인지 부하를 낮추는 인터랙티브 시스템을 탐구하겠습니다.',
  },
  {
    title: '발표자 의존도를 낮춘 데이터 기반 인터랙티브 IR 모델 구축',
    body: '기존 IR 영상이 발표자의 전달력과 촬영 환경에 크게 의존하던 구조에서 벗어나, 실시간 스트리밍 환경에서도 데이터 자체가 유동적으로 변화하며 정보를 전달하는 시스템 디자인을 연구합니다. 이는 공간 기반 미디어 시스템으로의 확장을 포함해, 하이엔드 금융 정보가 대중과 소통하는 방식을 재정립하는 시도가 될 것입니다.',
  },
];

const researchPlan = [
  {
    phase: '1단계',
    title: '이론 정립 및 정보 미학 프레임워크 설계',
    body: '정보 미학 방법론을 파이낸스 데이터에 투영하는 작업을 선행하겠습니다. 기업 재무제표, 거시경제 지표 등 정량 데이터와 뉴스레터, 애널리스트 리포트 등 정성 데이터가 어떤 시각적 상징물로 변환될 때 가장 효과적인지 분석하고, 금융 정보 시각화를 위한 미학적 가이드라인을 수립하겠습니다.',
  },
  {
    phase: '2단계',
    title: 'AI 기반 제너러티브 시각화 시스템 구현',
    body: '수집된 데이터를 시각적 내러티브로 자동 변환하는 프로토타입 시스템을 개발하겠습니다. 데이터의 성격에 따라 화면 구도, 색채, 모션 리듬이 자동 최적화되는 알고리즘을 설계하고, 시각적 균형과 정보 위계를 공학적으로 제어하는 방법을 실험하겠습니다.',
  },
  {
    phase: '3단계',
    title: '실무 그룹 대상의 정량적·정성적 검증',
    body: '개발된 시스템의 실효성을 실제 투자운용인력 및 투자 심사역을 대상으로 검증하겠습니다. 텍스트 리포트와 자동 생성 영상을 비교하는 A/B 테스트를 통해 정보 습득 속도와 정확도를 측정하고, 전문가 인터뷰를 통해 딜소싱 과정에서의 설득력과 신뢰도 향상 여부를 분석하겠습니다.',
  },
];

const StudyPlanPage = ({ showHeader = false }: StudyPlanPageProps) => {
  const handleDownloadPdf = () => {
    window.print();
  };

  return (
    <>
      {showHeader && (
        <Header
          onSectionChange={(section) => {
            if (section === 'studyPlan') return;
            const hash = section === 'works' ? 'works' : section === 'contact' ? 'contact' : 'study-plan';
            window.location.href = `/#${hash}`;
          }}
        />
      )}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="min-h-screen bg-white pt-16"
      >
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 14mm;
          }

          html,
          body {
            background: #ffffff !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          body * {
            visibility: hidden;
          }

          .study-print-area,
          .study-print-area * {
            visibility: visible;
          }

          .study-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
            color: #1f2937;
          }

          .study-no-print {
            display: none !important;
          }

          .study-print-block,
          .study-print-item {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>
      <div className="flex min-h-[calc(100vh-4rem)]">
        <div className="w-80 flex-shrink-0 border-r border-gray-200 hidden md:block" />

        <aside className="study-no-print hidden md:block fixed top-16 right-0 w-96 h-[calc(100vh-4rem)] border-l border-gray-200 bg-white z-30 overflow-y-auto p-6 md:p-8" style={{ scrollbarWidth: 'none' }}>
          <h2 className="text-xl font-medium mb-6">Study Plan</h2>
          <div className="space-y-6 text-sm font-light leading-relaxed">
            <div>
              <p className="font-normal mb-2">문서</p>
              <p className="text-gray-700">학업 및 연구 계획서</p>
            </div>
            <div>
              <p className="font-normal mb-2">지원자</p>
              <p className="text-gray-700">{applicant}</p>
            </div>
            <div>
              <p className="font-normal mb-2">수험번호</p>
              <p className="text-gray-700">{examineeNumber}</p>
            </div>
            <div>
              <p className="font-normal mb-2">지원과정</p>
              <p className="text-gray-700">{program}</p>
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto overflow-x-hidden md:mr-96" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <div className="study-no-print max-w-[850px] mx-auto px-5 pt-10 md:px-10 md:pt-10 mb-5 flex justify-end">
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="rounded-full border border-gray-300 px-4 py-2 text-sm text-gray-800 transition-opacity hover:opacity-70"
            >
              학업계획서 PDF 저장
            </button>
          </div>

          <article className="study-print-area max-w-[850px] mx-auto px-5 pb-10 md:px-10 md:pb-10 text-gray-800 leading-relaxed">
            <header className="study-print-block border-b-2 border-black pb-5 mb-8">
              <p className="text-sm text-gray-500 mb-2">Statement of Purpose & Research Plan</p>
              <h1 className="text-2xl md:text-3xl font-bold mb-4">학업 및 연구 계획서</h1>
              <div className="grid gap-y-1 text-[14.5px] text-gray-700">
                <p><span className="font-semibold text-gray-900">지원자:</span> {applicant}</p>
                <p><span className="font-semibold text-gray-900">수험번호:</span> {examineeNumber}</p>
                <p><span className="font-semibold text-gray-900">지원과정:</span> {program}</p>
              </div>
            </header>

            <section className="study-print-block mb-8">
              <h2 className="text-lg font-bold border-b border-gray-300 pb-1 mb-4 uppercase tracking-wide">
                1. 진학 동기 및 배경
              </h2>
              <div className="space-y-4 text-[14.5px] text-gray-700 leading-[1.85]">
                <p>
                  저는 지난 13년간 포스트프로덕션과 웹 에이전시를 거쳐, 현재 사모펀드(PEF) 운용사인 리브라텀 파트너스(Libratum Partners)에서 크리에이티브 디렉터로 재직하며 기업 커뮤니케이션의 최전선에서 활동해 왔습니다. 특히 오픈익스체인지(OpenExchange) 등에서 글로벌 IR 콘텐츠의 시각 시스템을 총괄하며, 전통적인 촬영 중심의 영상 제작 방식이 가장 보수적인 파이낸스 생태계의 정보 전달 속도를 따라가지 못하는 한계를 체감했습니다.
                </p>
                <p>
                  현재 대다수의 기업 IR은 여전히 텍스트 기반 보고서나 음성 중심 컨퍼런스 콜에 의존하고 있습니다. 그러나 급변하는 시장 데이터와 복잡한 기업 내러티브를 투자자가 직관적으로 파악하기 위해서는, 정보의 구조를 빠르게 이해시키는 시각적 언어의 혁신이 필수적입니다. 저는 박진완 교수님의 조선왕조실록 시각화 연구를 접하며, 방대한 데이터를 유기적 관계로 재구성하여 관찰자에게 즉각적인 통찰을 제공하는 정보 미학적 접근이 제가 현장에서 마주한 문제의 중요한 해법이 될 수 있음을 확인했습니다.
                </p>
                <p>
                  단순히 보기 좋은 영상을 제작하는 단계를 넘어, 데이터 기반의 자동화된 시각 체계를 구축하고 자본 시장의 의사결정 효율을 높이는 연구를 수행하고자 본 과정에 지원하게 되었습니다.
                </p>
              </div>
            </section>

            <section className="study-print-block mb-8">
              <h2 className="text-lg font-bold border-b border-gray-300 pb-1 mb-4 uppercase tracking-wide">
                2. 주요 연구 관심 분야
              </h2>
              <div className="space-y-5">
                {researchInterests.map((item, index) => (
                  <div key={item.title} className="study-print-item">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {index + 1}. {item.title}
                    </h3>
                    <p className="text-[14.5px] text-gray-700 leading-[1.85]">{item.body}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="study-print-block mb-8">
              <h2 className="text-lg font-bold border-b border-gray-300 pb-1 mb-4 uppercase tracking-wide">
                3. 연구 계획 및 방법론
              </h2>
              <div className="space-y-5">
                {researchPlan.map((item) => (
                  <div key={item.phase} className="study-print-item border-b border-gray-100 pb-5 last:border-0 last:pb-0">
                    <div className="flex flex-wrap gap-x-3 gap-y-1 items-baseline mb-1">
                      <span className="text-sm font-semibold text-gray-500">{item.phase}</span>
                      <h3 className="font-semibold text-gray-900">{item.title}</h3>
                    </div>
                    <p className="text-[14.5px] text-gray-700 leading-[1.85]">{item.body}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="study-print-block">
              <h2 className="text-lg font-bold border-b border-gray-300 pb-1 mb-4 uppercase tracking-wide">
                4. 기대 효과 및 졸업 후 계획
              </h2>
              <div className="space-y-4 text-[14.5px] text-gray-700 leading-[1.85]">
                <p>
                  예술공학적 접근을 통해 구축된 차세대 IR 시스템은 단순히 미적 완성도를 높이는 데 그치지 않고, 자본 시장의 정보 불균형을 완화하고 투자 생태계의 투명성을 높이는 사회적 가치를 창출할 수 있습니다. 데이터 시각화가 금융 커뮤니케이션의 보조 수단이 아니라 의사결정의 핵심 인터페이스로 기능하도록 만드는 것이 제 연구의 궁극적 지향점입니다.
                </p>
                <p>
                  학위 과정 동안 정립한 연구 성과를 바탕으로, 현재 재직 중인 사모펀드 환경에 최적화된 B2B 시각화 솔루션을 상용화하고자 합니다. 졸업 후에는 보수적인 파이낸스 생태계와 예술공학의 접점을 넓히는 융합 전문가로서, 데이터 시각화의 학문적 지평을 실물 경제 현장으로 확장하는 가교 역할을 수행하겠습니다.
                </p>
              </div>
            </section>
          </article>
        </main>
      </div>
      </motion.div>
    </>
  );
};

export default StudyPlanPage;
