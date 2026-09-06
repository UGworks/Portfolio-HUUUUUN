import { Project, Info } from './types';

/**
 * public/ 에 그대로 놓인 파일의 URL.
 *
 * 영상 107개(583MB)를 import로 번들에 통과시키면 Rollup이 렌더 단계에서
 * 죽는다. public/ 에 두면 Vite가 손대지 않고 dist로 복사만 하므로
 * 빌드가 통과하고, 브라우저도 필요한 영상만 스트리밍으로 받는다.
 *
 * BASE_URL은 배포 시 '/Portfolio-HUUUUUN/'. 파일명에 공백과 한글이 있어
 * encodeURI로 인코딩한다.
 */
const asset = (path: string) => `${import.meta.env.BASE_URL}${encodeURI(path)}`;

export const info: Info = {
  name: "Seonghun.Lee",
  title: "Creative Director · Media Artist",
  description: "13년차 현업 크리에이터입니다. TVCF·브랜드·미디어파사드·IR 콘텐츠를 만들어 왔고, 지금은 생성형 AI를 제작 파이프라인에 연결하는 작업을 이어가고 있습니다.",
  location: "Seoul, Korea",
  email: "huuuuun.88@gmail.com",
  clients: [
    "LG전자",
    "현대자동차",
    "밀레",
    "네파",
    "이마트",
    "BC카드",
    "NC소프트",
  ],
  superpower: "추상적인 아이디어를 사람들이 실제로 사용하고 싶은 구체적이고 확장 가능한 제품으로 전환하는 것.",
  beyondCode: "실제 개발자 행사에서 발표하고, 기술 블로그를 작성하며, 실습 워크샵을 운영하고, DevRel Guild를 운영합니다. 기술적 깊이, 창의적 문제 해결, 커뮤니티 구축의 교차점에서 번성합니다.",
  education: {
    school: "대학교",
    degree: "디자인 엔지니어링",
    awards: [
      "Andromeda — Creative Conscience Gold",
      "AxoWear — Design Museum London"
    ]
  },
  experience: [
    {
      period: "Now",
      role: "Freelance Engineer & DevRel",
      company: "Independent",
      description: "소프트웨어 엔지니어링과 DevRel 분야에서 독립적으로 작업합니다. Myosin에서 DevRel Guild를 이끌고, WalletConnect와 같은 팀과 협업하며, 5명의 팀과 함께 개발자 및 마케팅 워크플로우를 확장하는 AI 제품인 HiveMind를 구축하고 있습니다."
    },
    {
      period: "2025",
      role: "Head of Engineering & Developer Relations",
      company: "Partisia Blockchain",
      description: "프라이버시 우선 인프라 및 다자간 계산을 위한 엔지니어링과 DevRel을 이끌었습니다. 프로덕션 스마트 컨트랙트를 출시하고, 개발자 문서를 개편하며, 워크샵, 해커톤, 오픈소스를 통해 개발자 퍼널을 구축했습니다."
    },
    {
      period: "2024",
      role: "AI & Trading Systems",
      company: "Catapult Labs",
      description: "OpenAI 모델을 사용하여 채팅 클라이언트 간의 클라이언트 대화를 통합하는 디지털 자산 거래용 AI 코파일럿을 구축했습니다."
    },
    {
      period: "2022",
      role: "DeFi Protocols & Smart Contracts",
      company: "Catapult Labs",
      description: "담보 관리 및 마진 거래를 포함한 OTC 암호화폐 시장을 위한 탈중앙화 금융 프리미티브를 개발했습니다."
    },
    {
      period: "2021",
      role: "Founding Full-Stack Engineer",
      company: "Sojo",
      description: "제품 디자인부터 배포까지 의류 수리 및 커스터마이징을 위한 핵심 플랫폼을 출시했습니다."
    }
  ],
  tools: [
    "React",
    "Next.js",
    "TypeScript",
    "Tailwind CSS",
    "GSAP",
    "Framer Motion",
    "Node.js",
    "PostgreSQL",
    "GraphQL",
    "Solidity",
    "Web3.js",
    "DeFi",
    "Figma",
    "Product Design",
    "AI/ML",
    "OpenAI",
    "DevRel",
    "Public Speaking"
  ],
  socials: {
    twitter: "https://twitter.com",
    github: "https://github.com",
    linkedin: "https://www.linkedin.com/in/seonghun-lee-27637a286/",
    website: "https://star.tvcf.co.kr/HUUUUU.N/shots"
  }
};

// 비디오 파일 import
const video0129 = asset('video/0129_코웨이PR_tvcf용.webm');
const video0229 = asset('video/0229_LG_ALICE_GLOBAL_TEXT.webm');
const video0518 = asset('video/0518_SOJE_A_1280x720.webm');
const video1002 = asset('video/1002_krafko_v150_en.webm');
const video1111 = asset('video/1111_PRE_A.webm');
const video1130 = asset('video/1130_INDIVIDUAL_TANKER.webm');
const video15A = asset('video/15A.webm');
const video20 = asset('video/20.webm');
const video30 = asset('video/30.webm');
const video45A = asset('video/45A.webm');
const videoA_B_X = asset('video/A_B_X.webm');
const videoCAFE_30 = asset('video/CAFE_30.webm');
const videocellapy = asset('video/cellapy.webm');
const videoDROPTOP_60 = asset('video/DROPTOP_60.webm');
const videoDXGOLF_DRIVER_15 = asset('video/DXGOLF_DRIVER_15.webm');
const videoEMART_MAIN = asset('video/EMART_MAIN.webm');
const videoFinal_comp = asset('video/Final comp.webm');
const videoGENESIS = asset('video/GENESIS_2DAY_IMAGE+TECH_ENG_MENT_H264.webm');
const videoGROUP_FULL_A = asset('video/GROUP_FULL_A.webm');
const videoK40S = asset('video/K40S.webm');
const videoK50 = asset('video/K50.webm');
const videoKELLOG = asset('video/KELLOG.webm');
const videoNC_SOFT_20th = asset('video/NC SOFT 20th.webm');
const videoKGM_MV = asset('video/KGM_MV.webm');
const videokim_johan = asset('video/kim johan.webm');
const videoLG = asset('video/LG.webm');
const videoLG_COM = asset('video/LG .COM.webm');
const videoLibratum_A = asset('video/Libratum_A.webm');
const videoLibratum_Web = asset('video/Libratum Web.webm');
const videoLOOKAS = asset('video/LOOKAS.webm');
const videoMANGO = asset('video/MANGO.webm');
const videoMILLET_30 = asset('video/MILLET_30.webm');
const videoNEXEN_A = asset('video/NEXEN_A.webm');
const videoOFFICE_30 = asset('video/OFFICE_30.webm');
const videoOOH_15 = asset('video/OOH_15.webm');
const videopizza_Full_A = asset('video/pizza_Full_A.webm');
const videoPIZZAHUT_SOJAE = asset('video/PIZZAHUT_SOJAE.webm');
const videoQ6 = asset('video/Q6.webm');
const videosajo = asset('video/sajo.webm');
const videoSNS = asset('video/SNS.webm');
const videoSTEPS_A_EVENT = asset('video/STEPS_A_EVENT.webm');
const videoTASTYSAGA_COOK_A = asset('video/TASTYSAGA_COOK_A.webm');
const videoTEASER = asset('video/TEASER.webm');
const videoVAP_60 = asset('video/VAP_60.webm');
const videoVERNA = asset('video/VERNA.webm');
const video경기도_20A = asset('video/경기도_20A.webm');
const video농부 = asset('video/농부.webm');
const video바슈롬_40 = asset('video/바슈롬_40.webm');
const video불가리스_ASMR_30A = asset('video/불가리스_ASMR_30A.webm');
const video시안배경_1_1 = asset('video/시안배경_1_1.webm');
const video장병A_FINAL = asset('video/장병A_FINAL_저해상.webm');
const video젠틀피버_FULL_B = asset('video/젠틀피버_FULL_B.webm');
const video카와 = asset('video/카와.webm');
const video프렌치카페 = asset('video/프렌치카페 카페믹스.webm');
const video하나금융그룹 = asset('video/하나금융그룹 실적발표.webm');
const video현대자동차 = asset('video/현대자동차 월드컵.webm');
const video광명동굴 = asset('video/광명동굴.webm');
const img가야테마파크 = asset('video/가야테마파크.jpg');

// 썸네일 이미지 import
import thumb0129 from './IMG/0129_코웨이PR_tvcf용.webm_20260121_230857.612.webp';
import thumb0229 from './IMG/0229_LG_ALICE_GLOBAL_TEXT.webm_20260121_230923.972.webp';
import thumb0518 from './IMG/0518_SOJE_A_1280x720.webm_20260121_230939.710.webp';
import thumb1002 from './IMG/1002_krafko_v150_en.webm_20260121_232016.396.jpg';
import thumb1111 from './IMG/1111_PRE_A.webm_20260121_230953.707.webp';
import thumb1130 from './IMG/1130_INDIVIDUAL_TANKER.webm_20260121_231011.330.webp';
import thumb15A from './IMG/15A.webm_20260121_230608.348.webp';
import thumb20 from './IMG/20.webm_20260121_230757.276.webp';
import thumb30 from './IMG/30.webm_20260121_230821.739.webp';
import thumb45A from './IMG/45A.webm_20260121_230852.980.webp';
import thumbA_B_X from './IMG/A_B_X.webm_20260121_231021.697.webp';
import thumbCAFE_30 from './IMG/CAFE_30.webm_20260121_231042.010.webp';
import thumbcellapy from './IMG/cellapy.webm_20260121_231053.090.webp';
import thumbDROPTOP_60 from './IMG/DROPTOP_60.webm_20260121_231103.979.webp';
import thumbDXGOLF_DRIVER_15 from './IMG/DXGOLF_DRIVER_15.webm_20260121_231110.057.webp';
import thumbEMART_MAIN from './IMG/EMART_MAIN.webm_20260121_231115.387.webp';
import thumbFinal_comp from './IMG/Final comp.webm_20260121_231120.858.webp';
import thumbGENESIS from './IMG/GENESIS_2DAY_IMAGE+TECH_ENG_MENT_H264.webm_20260121_231145.146.webp';
import thumbGROUP_FULL_A from './IMG/GROUP_FULL_A.webm_20260121_231153.401.webp';
import thumbK40S from './IMG/K40S.webm_20260121_231227.873.webp';
import thumbK50 from './IMG/K50.webm_20260121_231242.369.webp';
import thumbKELLOG from './IMG/KELLOG.webm_20260121_231247.649.webp';
import thumbKGM_MV_1 from './IMG/KGM_MV_1.webm_20260121_231306.273.webp';
import thumbKGM_MV from './IMG/KGM_MV.webm_20260121_231252.617.webp';
import thumbkim_johan from './IMG/kim johan.webm_20260121_231318.785.webp';
import thumbLG_COM from './IMG/LG .COM.png';
import thumbLG_SNS from './IMG/LG_SNS.webp';
import thumbLibratum_A from './IMG/Libratum_A.webm_20260121_231336.216.webp';
import thumbLibratum_Web from './IMG/Libratum Web.png';
import thumbLOOKAS from './IMG/LOOKAS.webm_20260121_231345.040.webp';
import thumbMANGO from './IMG/MANGO.webm_20260121_231411.056.webp';
import thumbMILLET_30 from './IMG/MILLET_30.webm_20260121_231415.945.webp';
import thumbNEXEN_A from './IMG/NEXEN_A.webm_20260121_231428.888.webp';
import thumbOFFICE_30 from './IMG/OFFICE_30.webm_20260121_231438.112.webp';
import thumbOOH_15 from './IMG/OOH_15.webm_20260121_231447.888.webp';
import thumbpizza_Full_A from './IMG/pizza_Full_A.webm_20260121_231459.487.webp';
import thumbPIZZAHUT_SOJAE from './IMG/PIZZAHUT_SOJAE.webm_20260121_231501.576.webp';
import thumbQ6 from './IMG/Q6.webm_20260121_231508.704.webp';
import thumbsajo from './IMG/sajo.webm_20260121_231523.297.webp';
import thumbSNS from './IMG/SNS.webm_20260121_231530.008.webp';
import thumbSTEPS_A_EVENT from './IMG/STEPS_A_EVENT.webm_20260121_231538.328.webp';
import thumbTASTYSAGA_COOK_A from './IMG/TASTYSAGA_COOK_A.webm_20260121_231541.823.webp';
import thumbTEASER from './IMG/TEASER.webm_20260121_231547.303.webp';
import thumbVAP_60 from './IMG/VAP_60.webm_20260121_231553.727.webp';
import thumb경기도_20A from './IMG/경기도_20A.webm_20260121_231556.911.webp';
import thumb농부 from './IMG/농부.webm_20260121_231613.056.webp';
import thumb바슈롬_40 from './IMG/바슈롬_40.webm_20260121_231618.599.webp';
import thumb불가리스_ASMR_30A from './IMG/불가리스_ASMR_30A.webm_20260121_231645.239.webp';
import thumb시안배경_1_1 from './IMG/시안배경_1_1.webm_20260121_231720.438.webp';
import thumb장병A_FINAL from './IMG/장병A_FINAL_저해상.webm_20260121_230730.196.webp';
import thumb젠틀피버_FULL_B from './IMG/젠틀피버_FULL_B.webm_20260121_230747.436.webp';
import thumb프렌치카페 from './IMG/프렌치카페 카페믹스.png';
import thumb하나금융그룹 from './IMG/하나금융그룹 실적발표.png';
import thumb현대자동차 from './IMG/현대자동차 월드컵.png';
import thumbVERNA from './IMG/VERNA.png';
import thumb카와 from './IMG/카와.png';

const projectsRaw: Project[] = [
  {
    id: "60",
    title: "대한민국육군",
    category: "DOOH",
    video: video장병A_FINAL,
    thumbnail: thumb장병A_FINAL,
    participation: 100,
    keywords: ["씨네그라픽", "DOOH", "SNS 캠페인", "2D TD", "공공광고"],
    description: "나의영웅 나의육군\n\n대한민국 육군 모병 DOOH 광고. 육군의 정체성과 복무의 가치를 시각화하고, 숏폼 SNS와 다채널 노출을 전제로 구성했다.\n\n2D TD로 기획부터 마무리까지 혼자 맡았다. 공군·육군·특전부대를 상징하는 오브젝트에 씨네그라픽(Cinegraphic) 효과를 입혀 부대마다 다른 성격이 한 화면 안에서 읽히게 했다. 군 복무의 의미와 각 부대의 역할이 자연스럽게 전달되어 모병 홍보에 힘이 되도록 완성도를 끌어올렸다.",
  },
  {
    id: "59",
    title: "계양 아라온",
    category: "Public Art / Media Facade",
    video: video시안배경_1_1,
    thumbnail: thumb시안배경_1_1,
    participation: 100,
    link: "https://www.segyenewsagency.com/news/articleView.html?idxno=625681",
    linkLabel: "관련 뉴스 보기",
    keywords: ["미디어파사드", "아나몰픽", "공공미술", "조명 디자인", "미디어 큐브"],
    description: "아라온 빛의 거리\n\n계양 아라온 '빛의 거리' 미디어파사드. 전체 구간에서 가장 중심이 되는 계양대교의 원형 빛기둥과 미디어큐브, 잉어동상을 맡았다.\n\n2D TD로 그래픽 아트웍과 애니메이션을 만들었다. 빛기둥에 들어갈 조명 패턴과 시퀀스를 설계하고, 미디어큐브와 잉어동상에 투영되는 콘텐츠는 그래픽 합성과 컬러 그레이딩으로 다듬었다. 공공미술이라 화려함보다 세 지점이 한 톤으로 이어지는 일관성을 우선했고, 그 결과 공간을 걷는 경험 자체가 작품이 되도록 했다.",
  },
  {
    id: "66",
    title: "광명동굴",
    category: "Public Art / Media Facade",
    video: video광명동굴,
    participation: 85,
    keywords: ["미디어파사드", "LED", "동굴", "빛의 공간", "터널"],
    description: "2022~2023 광명동굴 빛의 공간\n\n폐광을 되살린 국내 유일의 동굴예술 공간. 긴 터널 벽면을 LED로 채우고 빛, 레이저, 음악을 하나의 쇼로 묶은 미디어파사드다.\n\n2D TD로 터널 안 LED 조명·영상 연출과 미디어 콘텐츠 제작을 맡았다. 쇼를 위한 그래픽 아트웍과 시퀀스를 디자인했는데, 관람객이 걸으면서 보는 영상이라 장면 사이의 이음새와 몰입감을 가장 오래 다듬었다. 어둠 속 벽면을 밝히는 연출로 공간의 규모감과 '빛의 공간'이라는 콘셉트를 전달했다.",
  },
  {
    id: "1",
    title: "COWAY",
    category: "TVCF",
    video: video0129,
    thumbnail: thumb0129,
    participation: 55,
    keywords: ["매트페인팅", "클린업", "그래픽 합성", "기업 PR", "PLEXUS", "MINIAL"],
    description: "생명을 책임지는 기술\n\n코웨이 그룹 PR 영상. 'Best Life Solution Company'라는 비전과 '생명을 책임지는 기술'이라는 핵심 가치를, 업계 1위 아이콘 정수기 같은 제품의 언어로 풀었다.\n\n2D Artist로 매트 페인팅과 클린업을 전담했다. PLEXUS·MINIAL 기법으로 화면의 불필요한 요소를 걷어내 무결점 화면을 만들고, 실사와 그래픽을 합성하면서 브랜드 톤이 흐트러지지 않게 지켰다.",
  },
  {
    id: "2",
    title: "LG Mobile G5",
    category: "Official product video",
    video: video0229,
    thumbnail: thumb0229,
    keywords: ["매트페인팅", "자막 애니메이션", "VFX", "제품 광고", "글로벌 캠페인"],
    description: "World of Play\n\nLG G5 글로벌 캠페인. 제이슨 스타뎀이 모듈형 디자인과 Friends 액세서리를 갖고 노는 'Life's Good when you Play More'.\n\n2D Artist로 자막 효과와 모듈 구조를 강조하는 그래픽을 만들었다. 초현실적인 배경은 매트 페인팅으로 그렸고, 실사와 디지털 그래픽을 합성해 화면의 밀도를 채웠다. 장난스러운 콘셉트일수록 합성의 정교함이 완성도를 좌우한다고 보고 디테일에 시간을 썼다.",
  },
  {
    id: "4",
    title: "프렌치카페 카와",
    category: "TVCF",
    video: video0518,
    thumbnail: thumb0518,
    keywords: ["매트페인팅", "클린업", "그래픽 합성", "식품광고"],
    description: "지민, RM, 아이언 편\n\n프렌치카페 카와 '커피의 탑' 캠페인. 지민·RM·아이언이 만든 힙합 무드를 젊고 감각적인 브랜드 톤으로 옮겼다.\n\n2D Artist로 피부 리터칭과 클린업으로 무결점 비주얼을 잡고, 힙합 비트에 맞춘 자막을 디자인했다. 매트 페인팅으로 공간에 입체감을 더하고 실사와 그래픽을 합성해, 스트릿의 거칠음과 프리미엄의 매끈함이 한 화면에 공존하도록 균형을 잡았다.",
  },
  {
    id: "5",
    title: "KRAFTON",
    category: "IR Event",
    video: video1002,
    thumbnail: thumb1002,
    participation: 85,
    description: "Online IR Event\n\nKRAFTON 온라인 실적발표 이벤트. 게임 회사의 성장과 혁신을 투자자의 언어로 옮기고, 브랜드 아이덴티티가 드러나는 IR 경험을 만드는 프로젝트.\n\nCreative Director로 랜딩페이지 디자인과 현장 감독을 맡았다. 실적발표 이벤트 전반의 품질과 IR 경험의 완성도를 책임졌다.",
    keywords: ["KRAFTON", "IR EVENT", "실적발표", "온라인 이벤트", "Creative Director", "랜딩페이지 디자인", "현장 감독", "브랜드 아이덴티티", "IR"],
  },
  {
    id: "6",
    title: "프렌치카페 카페믹스",
    category: "TVCF",
    video: video1111,
    thumbnail: thumb1111,
    keywords: ["매트페인팅", "클린업", "식품광고", "이미지 리터칭", "피부 리터칭", "톤 보정", "자막 디자인", "제품 레이아웃", "합성"],
    description: "김태희 곽진언 이적 존박편\n\n프렌치카페 카페믹스 통합 캠페인. 무지방과 당 25% 저감이라는 '라이트함'을 김태희·이적·존박·곽진언 네 사람이 각자의 방식으로 보여준다.\n\n2D Artist로 모델별 피부 리터칭과 클린업을 진행했다. 여러 인물이 함께 서는 구도라 배경을 매트 페인팅으로 다시 그리고 톤을 맞췄으며, 당 저감·성분 자막과 제품 레이아웃을 디자인하고 실사와 제품 그래픽을 합성했다. 건강하면서도 세련된 톤이 끝까지 유지되게 하는 것이 목표였다.",
  },
  {
    id: "7",
    title: "Terra M",
    category: "TVCF",
    video: video1130,
    thumbnail: thumb1130,
    keywords: ["게임광고", "추성훈", "남궁민", "자막 애니메이션", "톤 조절", "2D TD", "2D 컴포지팅"],
    description: "넷마블 테라M 런칭 캠페인 · 추성훈, 남궁민\n\n넷마블 MMORPG '테라M' 런칭 TVCF. 추성훈과 남궁민이 게임 캐릭터의 스케일과 액션에 얼마나 겹쳐 보이느냐가 관건이었다.\n\n2D TD로 피부 리터칭과 이미지 클린을 하고, 어둡고 대비가 강한 톤을 조율했다. 로고와 슬로건의 자막 애니메이션, 메탈·에너지 그래픽을 만들고 실사와 게임 이펙트를 2D로 합성했으며 배경 클린업까지 맡았다.",
  },
  {
    id: "8",
    title: "프렌치카페 루카스나인",
    category: "TVCF",
    video: video15A,
    thumbnail: thumb15A,
    participation: 65,
    keywords: ["배경 합성", "피부 보정", "자막 애니메이션", "클린업", "패키지 애니메이션", "VFX", "식품광고"],
    description: "강동원 편\n\n프렌치카페 루카스나인 제품 광고, 강동원 편. 9기압으로 추출한 아메리카노의 프리미엄 풍미를 감성으로 풀었다.\n\n2D Artist로 배경 합성, 인물 피부 정리, 자막 이펙트, 연출 소품 클린업, 패키지 애니메이션, VFX 소스 제작을 맡았다. 강동원의 피부 보정과 배경 합성으로 프리미엄 톤을 세우고, '9기압'이라는 숫자가 기억에 남도록 자막과 패키지 애니메이션에 힘을 실었다.",
  },
  {
    id: "16",
    title: "금호아시아나",
    category: "TVCF",
    video: videoA_B_X,
    thumbnail: thumbA_B_X,
    participation: 85,
    keywords: ["에어서울", "타이포애니메이션", "VFX", "인물 뷰티작업", "촬영본 클린", "저비용항공사", "2D TD"],
    description: "에어서울 런칭 캠페인\n\n아시아나항공이 세운 저비용항공사 에어서울의 첫 광고. '신상유지, 품격유지'라는 콘셉트로, 민트 브랜드 컬러를 앞세워 LCC이면서도 세련된 이미지를 잡는 것이 과제였다.\n\n2D TD로 브랜드명과 슬로건의 타이포 애니메이션을 설계했다. 항공기와 여행지 컷에는 VFX를, 모델에는 뷰티 리터칭을 적용하고 촬영본 클린업을 맡았다.",
  },
  {
    id: "12",
    title: "공익광고협의회",
    category: "TVCF",
    video: video20,
    thumbnail: thumb20,
    keywords: ["공익광고", "바르게 쓰는 한글", "한글 맞춤법", "자막 애니메이션", "타이포그래피", "2D"],
    description: "바르게 쓰는 한글, 산이편\n\n공익광고협의회(KOBACO) '바르게 쓰는 한글' 캠페인, 산이 편. 한글 맞춤법과 바른 표기를 다루는 국민 캠페인.\n\n자막이 곧 메시지인 광고라 2D 작업의 중심을 글자에 두었다. 자막 레이아웃과 타이포그래피, 자막 애니메이션을 설계하고, 실사·그래픽·자막의 톤을 맞춰 합성해 가독성과 전달력을 확보했다.",
  },
  {
    id: "13",
    title: "공익광고협의회",
    category: "TVCF",
    video: video30,
    thumbnail: thumb30,
    keywords: ["공익광고", "2D", "비주얼 이펙트", "합성", "허들", "결혼", "타이포 애니메이션"],
    description: "행복의 시작 편\n\n공익광고협의회의 결혼 공익광고. 신랑과 신부가 함께 허들을 넘는 연출이 핵심이다.\n\n2D TD로 허들 그래픽을 촬영본에 트래킹·매칭 무빙으로 붙여 자연스러운 합성을 만들고, 타이포 애니메이션으로 영상의 리듬과 임팩트를 세웠다. 실사와 그래픽의 색을 보정·그레이딩으로 맞춘 뒤 최종 합성과 마스터링까지 마쳤다.",
  },
  {
    id: "15",
    title: "LG전자",
    category: "TVCF",
    video: video45A,
    thumbnail: thumb45A,
    description: "트롬 건조기 TVCF\n\nLG전자 트롬 건조기 캠페인, 15·20·45초. 인트로 컷의 타이포그래피로 건조 효과를 전하고, 트루스팀·6모션·저온 제습 같은 USP는 픽토그램 애니메이션으로 소구했다.\n\n2D TD로 프로젝트를 진행했다. 배경 합성과 촬영본 클린, 자막 애니메이션, 제품 합성과 엔딩 레이아웃을 맡아 브랜드 메시지와 화면 완성도를 함께 맞췄다.",
    keywords: ["LG전자", "트롬", "건조기", "TVCF", "타이포그래피", "픽토그램 애니메이션", "2D TD", "자막 애니메이션", "촬영본 클린", "배경 합성", "제품 합성", "앤딩 레이아웃"],
  },
  {
    id: "18",
    title: "고려은단 비타민C 1000 유재석편",
    category: "TVCF",
    video: videoCAFE_30,
    thumbnail: thumbCAFE_30,
    keywords: ["고려은단", "비타민C", "유재석", "TVCF", "매트페인팅", "클린업", "그래픽 합성"],
    description: "카페 30초 광고 캠페인\n\n카페 브랜드 30초 TVCF. 짧은 러닝 타임 안에 음료와 공간의 분위기를 전하면서 톤 앤 매너를 한결같이 유지해야 했다.\n\n2D Artist로 매트 페인팅과 클린업, 실사·그래픽 합성을 맡았다. 화면에서 거슬리는 요소를 걷어내 무결점으로 만들고 브랜드 톤을 지키는 데 집중했다.",
  },
  {
    id: "19",
    title: "Cellapy",
    category: "TVCF",
    video: videocellapy,
    thumbnail: thumbcellapy,
    keywords: ["2D TD", "뷰티", "피부 보정", "컬러 그레이딩", "합성", "비주얼 이펙트", "타이포 애니메이션", "미백"],
    description: "진세연편 하얘지고싶니?\n\n셀라피 '하얘지고싶니?' 캠페인, 진세연 편. 미백 효과와 화사한 피부 표현이 곧 메시지인 광고.\n\n2D TD로 후반을 맡았다. 모델의 피부 보정과 미백 효과를 위한 컬러 그레이딩을 진행하고, 캠페인 카피를 살리는 타이포 애니메이션과 미백 효과를 강조하는 비주얼 이펙트를 만들었다. 뷰티 광고답게 피부 톤은 부드럽게, 그러나 흐릿해지지 않게 잡았고 실사와 그래픽의 합성으로 프리미엄 이미지를 지켰다.",
  },
  {
    id: "20",
    title: "DROPTOP 60",
    category: "TVCF",
    video: videoDROPTOP_60,
    thumbnail: thumbDROPTOP_60,
    keywords: ["스톱모션", "셀 애니메이션", "TVCF", "카페 브랜드"],
    description: "드롭탑 60초 TVCF\n\n카페 브랜드 드롭탑의 60초 TVCF. 실사 대신 스톱모션 셀 애니메이션으로 만들었다.\n\n2D Artist로 매트 페인팅과 클린업, 실사·그래픽 합성을 맡았다. 60초라는 긴 호흡에 맞춰 비주얼 밀도가 처지지 않도록 화면을 채우고 무결점으로 정리했다.",
  },
  {
    id: "21",
    title: "DXGOLF DRIVER 15",
    category: "TVCF",
    video: videoDXGOLF_DRIVER_15,
    thumbnail: thumbDXGOLF_DRIVER_15,
    keywords: ["DXGOLF", "골프 드라이버", "15초", "제품 광고", "매트페인팅", "클린업", "그래픽 합성"],
    description: "DXGOLF DRIVER 15초 광고\n\nDXGOLF 드라이버 15초 TVCF. 클럽의 기술과 성능을 짧은 시간 안에 임팩트 있게, 골퍼가 좋아하는 프리미엄 톤으로 전해야 했다.\n\n2D Artist로 매트 페인팅과 클린업, 실사·그래픽 합성을 맡았다. 제품 샷이 주인공이 되도록 그래픽 요소는 한 발 물러서게 배치해 둘의 조화로 완성도를 맞췄다.",
  },
  {
    id: "22",
    title: "E-mart",
    category: "TVCF",
    video: videoEMART_MAIN,
    thumbnail: thumbEMART_MAIN,
    participation: 75,
    keywords: ["이마트", "조세호", "복날", "이마트송", "뮤직비디오", "자막 애니메이션", "매트페인팅", "VFX", "합성", "유통광고"],
    description: "조세호 복날편\n\n이마트 복날 판촉 광고, 이마트송을 활용한 뮤직비디오 버전. 삼복 시즌 수산물 보양식 할인과 유통 브랜드의 친근함을 노래로 전한다.\n\n자막 작업과 매트 페인팅을 활용한 VFX 합성 등 후반 효과 전반을 맡았다. 그래픽·로고·자막을 촬영본에 트래킹·매칭 무빙으로 붙여 자연스럽게 합성하고, 이마트송 박자에 맞춘 자막 애니메이션으로 리듬감을 살렸다. 매트 페인팅과 클린업으로 화면을 정리한 뒤 최종 그레이딩과 합성으로 마무리했다.",
  },
  {
    id: "23",
    title: "포스코홀딩스 IR",
    category: "Online IR",
    video: videoFinal_comp,
    thumbnail: thumbFinal_comp,
    keywords: ["포스코홀딩스", "IR", "유튜브", "마켓 토크", "테크 토크", "아트디렉터", "스토리보드", "시각 템플릿", "외주관리"],
    description: "유튜브 채널 운영\n\n포스코홀딩스 IR 유튜브 채널 운영. 마켓 토크와 테크 토크 같은 정기 콘텐츠로 수소환원제철, 이차전지소재, 기가스틸·고망간강 같은 철강 제품, 글로벌 리튬 시장을 포스코경영연구원 연구진과 함께 투자자에게 쉽게 설명한다. 2024년 한국거래소 공시우수법인.\n\n아트디렉터로 정기 콘텐츠의 스토리보드를 시각화했다. 채널 전반의 주요 시각 템플릿을 만들고 외주 관리를 맡았으며, 시리즈마다 그래픽·자막·인포그래픽이 한 채널처럼 보이도록 일관성을 관리해 투자자 친화적인 완성도를 만들었다.",
  },
  {
    id: "25",
    title: "GENESIS 2DAY",
    category: "TVCF",
    video: videoGENESIS,
    thumbnail: thumbGENESIS,
    keywords: ["제네시스", "현대자동차", "체험 이벤트", "자동차 광고", "매트페인팅", "클린업", "그래픽 합성"],
    description: "제네시스 2일 이벤트 캠페인\n\n현대자동차 제네시스의 2일 고객 체험 이벤트 연계 캠페인. 프리미엄 차량의 가치와 혁신 기술을 시각적으로 전하는 것이 목표였다.\n\n2D Artist로 매트 페인팅과 클린업, 실사·그래픽 합성을 맡았다. 이벤트 무드에 맞는 비주얼 톤을 유지하면서 화면 완성도를 맞췄다.",
  },
  {
    id: "26",
    title: "피자헛",
    category: "TVCF",
    video: videoGROUP_FULL_A,
    thumbnail: thumbGROUP_FULL_A,
    description: "맥콘티 편\n\n피자헛 풀 버전 TVCF. 2018년, 온에어 직전 광고 모델의 사회적 논란으로 촬영분 전면 교체가 불가피해졌고, 해당 구간을 콘셉트 아트와 콘티로 다시 편집해 살려낸 위기 대응 작품이다.\n\n2D Artist로 매트 페인팅과 클린업, 실사·그래픽 합성을 맡았다. 콘티와 콘셉트 아트로 대체된 구간이 실사 구간과 한 편으로 읽히도록 비주얼 완성도와 브랜드 톤을 맞추는 일이 핵심이었다.",
    keywords: ["피자헛", "맥콘티 편", "마이크로닷", "모델 이슈", "콘티 대체", "재편집", "TVCF", "매트 페인팅", "클린업", "실사·그래픽 합성", "컨셉 아트", "위기 대응 광고"],
  },
  {
    id: "28",
    title: "K40S",
    category: "TVCF",
    video: videoK40S,
    thumbnail: thumbK40S,
    keywords: ["K40S", "제품 광고", "TVCF", "매트페인팅", "클린업", "그래픽 합성"],
    description: "K40S 제품 광고\n\nK40S 제품 TVCF. 기술과 성능을 시각적으로 전하면서 타겟에 맞는 메시지와 비주얼 톤을 일관되게 유지해야 했다.\n\n2D Artist로 매트 페인팅과 클린업, 실사·그래픽 합성을 맡았다. 무결점 화면과 브랜드 아이덴티티가 드러나는 완성도에 집중했다.",
  },
  {
    id: "29",
    title: "K50",
    category: "TVCF",
    video: videoK50,
    thumbnail: thumbK50,
    keywords: ["K50", "제품 광고", "TVCF", "매트페인팅", "클린업", "그래픽 합성"],
    description: "K50 제품 광고\n\nK50 제품 TVCF. 핵심 기능과 성능을 전하면서 브랜드 톤과 메시지 전달력을 동시에 잡아야 했다.\n\n2D Artist로 매트 페인팅과 클린업, 실사·그래픽 합성을 맡았다. 제품 비주얼과 그래픽 요소가 서로를 가리지 않도록 조화를 맞춰 완성도를 확보했다.",
  },
  {
    id: "30",
    title: "KELLOGG",
    category: "TVCF",
    video: videoKELLOG,
    thumbnail: thumbKELLOG,
    description: "초코 크런치 차운우 편\n\n농심켈로그 초코 시리얼 TVCF. 허쉬 초코 크런치 등 초코 크런치 라인의 식감과 맛을 전하는 식품 광고로, 푸드 비주얼과 모델 연출의 완성도가 함께 요구됐다.\n\n2D Artist로 제품 리터칭, 모델 2D 스킨 작업, 매트 페인팅과 클린업, 타이포그래피, 실사·그래픽 합성을 맡았다. 식품 광고답게 밝고 신선한 톤과 무결점 화면을 끝까지 유지했다.",
    keywords: ["켈로그", "Kellogg", "농심켈로그", "초코 크런치", "차운우 편", "TVCF", "제품 리터칭", "2D 스킨", "매트 페인팅", "타이포그래피", "식품광고", "푸드 비주얼"],
  },
  {
    id: "31",
    title: "NC Soft 20주년",
    category: "TVCF",
    video: videoNC_SOFT_20th,
    thumbnail: thumbKGM_MV_1,
    keywords: ["엔씨소프트", "20주년", "기념 영상", "게임", "매트페인팅", "클린업", "그래픽 합성"],
    description: "NC Soft 20주년 기념 영상\n\n엔씨소프트 20주년 기념 프로젝트 연계 영상. 리니지, 블레이드&소울 같은 밀리언셀러를 낸 회사의 성장과 혁신을 한 편에 담는 것이 목표였다.\n\n2D Artist로 매트 페인팅과 클린업, 실사·그래픽 합성을 맡았다. 게임 브랜드에 어울리는 비주얼 톤과 완성도를 맞췄다.",
  },
  {
    id: "32",
    title: "김건모",
    category: "M/V",
    video: videoKGM_MV,
    thumbnail: thumbKGM_MV,
    description: "다 당신 덕분이라오\n\n김건모 신규 앨범 수록곡 '다 당신 덕분이라오' 뮤직비디오. 서정적인 가사를 영상으로 풀어내며 곡의 감성과 비주얼 톤을 일치시켜야 했다.\n\n촬영본 위에 VFX를 적용해 분위기를 키우고, 매트 페인팅과 클린업, 실사·그래픽 합성을 맡아 뮤직비디오에 맞는 비주얼 완성도를 맞췄다.",
    keywords: ["김건모", "뮤직비디오", "M/V", "다 당신 덕분이라오", "VFX", "매트 페인팅", "클린업", "그래픽 합성", "발라드"],
  },
  {
    id: "33",
    title: "김조한",
    category: "Music Video",
    video: videokim_johan,
    thumbnail: thumbkim_johan,
    description: "알아 알아 앓아\n\n김조한 정규 6집 수록곡 뮤직비디오. 슬로 알앤비와 호소력 있는 보컬, 애절한 감정선과 서사의 깊이를 서정적인 무드로 시각화했다.\n\n2D TD로 컴포지팅과 매트 페인팅을 총괄했다. 실사와 디지털 요소를 조화시켜 공간의 입체감을 다시 짜고, 가사의 정서를 담은 자막 애니메이션을 만들었다.",
    keywords: ["김조한", "알아 알아 앓아", "뮤직비디오", "M/V", "정규 6집", "2D TD", "컴포지팅", "매트 페인팅", "실사·디지털 합성", "자막 애니메이션", "슬로 알앤비", "서정적"],
  },
  {
    id: "34",
    title: "LG 인스타그램 운영",
    category: "인스타그램 운영",
    video: videoLG,
    thumbnail: thumbLG_SNS,
    description: "LG전자 H&A 채널 인스타그램 운영\n\nLG전자 H&A(Home Appliance) 인스타그램 운영에 필요한 콘텐츠 제작. 브랜드 톤에 맞는 시각 콘텐츠와 SNS 채널의 속도에 맞는 완성도가 함께 필요했다.\n\n웹에이전시 영상팀장으로 콘텐츠 제작을 지원했다. 합성과 3D 컴포지팅으로 비주얼을 만들고, 채널 운영에 필요한 영상·이미지 자산을 맡았다.",
    keywords: ["LG전자", "인스타그램", "SNS 채널 운영", "3D compositing", "합성", "웹에이전시", "영상팀장", "H&A", "콘텐츠 제작"],
  },
  {
    id: "34-1",
    title: "LG전자",
    category: "웹사이트 운영",
    video: videoLG_COM,
    thumbnail: thumbLG_COM,
    participation: 85,
    description: "LG.COM 글로벌 웹사이트 리뉴얼\n\n국내 .COM 페이지를 포함한 글로벌 69개국 동시 리뉴얼 오픈. LG전자 공식 웹사이트의 디지털 서비스 혁신성과 UX 가치를 온라인 채널에 맞는 톤과 일관된 비주얼로 전해야 했다.\n\n영상팀 리더로 LG전자의 모든 상품 페이지에 들어가는 USP 모션그래픽을 제작했다. 영상은 webm·mp4로 산출하고 UI 애니메이션은 JSON으로 만들어 개발 연동에 바로 대응했으며, 2D·3D 합성과 VFX로 상품 비주얼의 완성도를 맞췄다.",
    keywords: ["LG전자", "웹사이트 운영", "UX", "UI", "USP 모션그래픽", "2D 합성", "3D 합성", "VFX", "글로벌 리뉴얼", "영상팀 리더", "webm", "mp4", "JSON"],
  },
  {
    id: "35",
    title: "IR 이벤트",
    category: "이벤트",
    video: videoLibratum_A,
    thumbnail: thumbLibratum_A,
    description: "글로벌 상장 및 투자 전략 세미나\n\n한국엔젤투자협회·LSEG·리브라텀 파트너스가 공동 주관한 스타트업 대상 세미나. 글로벌 상장과 해외 투자 플랫폼(NASDAQ 등), IR 전략을 다루는 온·오프라인 행사로, 세미나 브랜딩과 홍보 시각물부터 현장 연출까지 총괄했다.\n\n크리에이티브 디렉터로 SNS 홍보용 그래픽·영상, 무대 연출과 현장 감독을 맡았다. 온라인과 오프라인의 시각물이 한 행사처럼 보이도록 일관성과 행사 톤을 맞췄다.",
    keywords: ["리브라텀 파트너스", "엔젤투자협회", "LSEG", "TIPS", "글로벌 상장", "투자 전략 세미나", "크리에이티브 디렉터", "SNS 홍보", "무대 연출", "현장 감독", "IR 이벤트", "온오프라인 시각물"],
  },
  {
    id: "35-1",
    title: "Libratum Investment",
    category: "웹사이트구축",
    video: videoLibratum_Web,
    thumbnail: thumbLibratum_Web,
    link: "https://libratuminvestment.com/",
    description: "리브라텀 인베스트먼트 사내 웹사이트\n\nLibratum 사내 웹사이트 구축. 바이브 코딩(Vibe coding)으로 개발 파이프라인을 짜고 Cursor AI로 프론트엔드를 디자인했다. 콘텐츠 요소는 생성형 AI로 만든 모션그래픽으로 구성하고, 마우스 움직임에 반응하는 인터랙션과 생성형 AI로 만든 프로필 인물 사진을 적용해 다른 사이트와 다른 경험을 만들었다.\n\nUX와 비주얼의 일관성을 지키면서, AI 기반 워크플로우로 개발 효율과 창의적 비주얼을 동시에 가져간 사례다.",
    keywords: ["Libratum", "웹사이트 구축", "바이브 코딩", "Cursor AI", "생성형 AI", "모션그래픽", "프론트엔드", "인터랙션", "UX", "사내웹"],
  },
  {
    id: "37",
    title: "LOOKAS",
    category: "TVCF",
    video: videoLOOKAS,
    thumbnail: thumbLOOKAS,
    keywords: ["LOOKAS", "브랜드 캠페인", "TVCF", "매트페인팅", "클린업", "그래픽 합성"],
    description: "LOOKAS 브랜드 캠페인\n\nLOOKAS 브랜드 제품 광고. 브랜드 메시지와 제품 특징을 전하면서 타겟에 맞는 톤과 비주얼 일관성을 유지하는 것이 목표였다.\n\n2D Artist로 매트 페인팅과 클린업, 실사·그래픽 합성을 맡았다. 화면 완성도와 브랜드 아이덴티티가 잘 드러나도록 후반을 마무리했다.",
  },
  {
    id: "40",
    title: "MANGO",
    category: "TVCF",
    video: videoMANGO,
    thumbnail: thumbMANGO,
    keywords: ["MANGO", "패션 브랜드", "글로벌 캠페인", "TVCF", "매트페인팅", "클린업", "그래픽 합성"],
    description: "MANGO 브랜드 캠페인\n\n1984년 바르셀로나에서 시작한 스페인 패션 브랜드 망고(MANGO)의 TVCF. 글로벌 브랜드의 트렌디함과 제품 가치를 시각적으로 전하는 프로젝트.\n\n2D Artist로 매트 페인팅과 클린업, 실사·그래픽 합성을 맡았다. 패션 광고에 맞는 톤과 비주얼 완성도를 유지했다.",
  },
  {
    id: "41",
    title: "밀레",
    category: "TVCF",
    video: videoMILLET_30,
    thumbnail: thumbMILLET_30,
    description: "리첼 벤치파카 서강준 편\n\n프랑스 정통 아웃도어 브랜드 밀레(MILLET) TVCF. 서강준이 리첼 벤치파카를 소구하는 30초 본편과 SNS용 범퍼 영상을 만들었다. 액티브·알파인 브랜드 이미지와 제품의 기능성·내구성을 전하는 것이 목표였다.\n\n2D TD로 프로젝트 리딩을 맡아 본편과 범퍼 영상 제작을 진행했다. 배경 클린업 외에 영상 내 그래픽 작업 전반을 지원하고, 인물 뷰티 워크를 함께 수행해 무결점 화면과 브랜드 톤을 맞췄다.",
    keywords: ["밀레", "MILLET", "리첼 벤치파카", "서강준", "2D TD", "프로젝트 리딩", "TVCF", "SNS 범퍼", "배경 클린업", "그래픽", "인물 뷰티", "아웃도어"],
  },
  {
    id: "42",
    title: "넥센타이어",
    category: "Viral",
    video: videoNEXEN_A,
    thumbnail: thumbNEXEN_A,
    description: "넥센타이어 유럽공장 소개 Viral\n\n체코 우스티주 자테츠에 약 65만 ㎡ 부지로 건립된 넥센타이어 유럽공장 소개 영상. 한국 창녕공장의 경험과 기술 노하우로 완공된 최첨단 친환경 공장을 글로벌 완성차 메이커에게 소개한다.\n\nVFX·2D TD로 전담하며 아트팀과 협업했다. 촬영본 위에 인포그래픽을 포함한 타이포그래픽을 올리고, 합성·자막과 지도 구간 그래픽을 2D로 진행했다. 3D 트래킹이 들어가는 아트웍은 아트팀이 맡았다.",
    keywords: ["넥센타이어", "Nexen Tire", "Viral", "인포그래픽", "타이포그래픽", "VFX", "2D TD", "합성", "자막", "지도 그래픽", "유럽공장", "체코"],
  },
  {
    id: "43",
    title: "고려은단",
    category: "TVCF",
    video: videoOFFICE_30,
    thumbnail: thumbOFFICE_30,
    participation: 90,
    description: "비타민C 1000 유재석 편\n\n고려은단 비타민C 1000 TVCF, 30초. 유재석이라는 이름이 주는 신뢰를 브랜드와 제품 메시지로 잇는 광고.\n\n2D TD로 프로젝트를 진행했다. 합성과 제품 패키지 디자인, 자막 애니메이션을 맡아 브랜드 톤과 시각적 완성도를 맞췄다.",
    keywords: ["고려은단", "비타민C 1000", "유재석", "TVCF", "2D TD", "합성", "제품 패키지 디자인", "자막 애니메이션"],
  },
  {
    id: "44",
    title: "OOH 15",
    category: "TVCF",
    video: videoOOH_15,
    thumbnail: thumbOOH_15,
    keywords: ["OOH", "옥외 매체", "15초", "빌보드", "매트페인팅", "클린업", "그래픽 합성"],
    description: "OOH 15초 광고 캠페인\n\nOOH(Out of Home) 매체용 15초 광고. 빌보드와 옥외 매체의 짧은 노출 시간과 시청 환경을 고려해, 시각적 임팩트와 메시지 전달의 균형이 필요했다.\n\n2D Artist로 매트 페인팅과 클린업, 실사·그래픽 합성을 맡았다. 15초 안에 브랜드가 남도록 완성도를 맞췄다.",
  },
  {
    id: "45",
    title: "피자헛 the 맛있는 피자2",
    category: "TVCF",
    video: videopizza_Full_A,
    thumbnail: thumbpizza_Full_A,
    keywords: ["피자헛", "비교앱 편", "식품광고", "풀 버전", "매트페인팅", "클린업", "그래픽 합성"],
    description: "비교앱편\n\n피자헛 풀 버전 TVCF, 비교앱 편. 제품의 맛과 품질, 이미지를 풀 러닝 타임으로 시각화하며, 푸드 광고 특유의 식욕 자극과 브랜드 톤을 함께 지켜야 했다.\n\n2D Artist로 매트 페인팅과 클린업, 실사·그래픽 합성을 맡았다. 푸드 비주얼과 무결점 화면으로 완성도를 확보했다.",
  },
  {
    id: "46",
    title: "피자헛",
    category: "TVCF",
    video: videoPIZZAHUT_SOJAE,
    thumbnail: thumbPIZZAHUT_SOJAE,
    participation: 85,
    description: "갈릭마블 스테이크 맥콘티 편\n\n피자헛 프리미엄 메뉴 '갈릭마블 스테이크' TVCF, 맥콘티 편. 스테이크를 통째로 올린 프리미엄 라인을 풀 버전 러닝 타임으로 시각화했다.\n\n2D Artist로 매트 페인팅과 클린업, 실사·그래픽 합성을 맡았다. 긴 구성에서도 푸드 비주얼이 처지지 않도록 완성도와 브랜드 톤을 유지했다.",
    keywords: ["피자헛", "Pizza Hut", "갈릭마블 스테이크", "맥콘티", "TVCF", "매트 페인팅", "클린업", "실사·그래픽 합성", "식품광고", "푸드 비주얼", "프리미엄 피자"],
  },
  {
    id: "47",
    title: "Q6",
    category: "TVCF",
    video: videoQ6,
    thumbnail: thumbQ6,
    keywords: ["Q6", "제품 광고", "TVCF", "매트페인팅", "클린업", "그래픽 합성"],
    description: "Q6 제품 광고\n\nQ6 제품 TVCF. 기술과 성능을 시각적으로 전하면서 타겟에 맞는 메시지와 비주얼 임팩트를 동시에 잡아야 했다.\n\n2D Artist로 매트 페인팅과 클린업, 실사·그래픽 합성을 맡았다. 제품 포인트가 먼저 보이도록 완성도를 맞췄다.",
  },
  {
    id: "48",
    title: "사조참치",
    category: "TVCF",
    video: videosajo,
    thumbnail: thumbsajo,
    description: "마동석 요리사, 선장편\n\n사조참치 브랜드 광고, 마동석 요리사 편과 선장 편. 국내 참치캔 대표 브랜드의 신선함·품질·신뢰도를 마동석의 이미지로 프리미엄과 안심 품질로 전한다.\n\n2D Artist로 자막 레이아웃을 설계하고 자막 이펙트를 만들어 핵심 메시지가 또렷이 전달되게 했다. 배경 소스와 합성 소스를 제작해 실사와 그래픽이 자연스럽게 어우러지도록 했고, 요리사 편과 선장 편의 콘셉트에 맞춰 톤을 따로 잡되 제품 패키지와 브랜드 로고는 같은 자리에서 돋보이도록 합성했다.",
    keywords: ["사조참치", "마동석", "자막 레이아웃", "자막 이펙트", "배경소스 제작", "합성소스 제작", "2D", "식품광고"],
    participation: 70,
  },
  {
    id: "49",
    title: "카스",
    category: "TVCF",
    video: videoSNS,
    thumbnail: thumbSNS,
    participation: 80,
    keywords: ["카스", "CASS", "맥주광고", "자막 레이아웃", "UI합성", "자막 애니메이션", "Day to night", "VFX", "2D"],
    description: "혼맥커의 외침\n\n오비맥주 카스(CASS) '혼맥커' 타겟 캠페인. 국내 1위 맥주의 비열처리·신선·시원한 맛과 혼자 즐기는 맥주의 가치, 젊은 세대의 자유로운 음주 문화를 친근한 감성으로 전한다.\n\n2D Artist로 자막 레이아웃과 자막 애니메이션을 맡아 '혼맥커의 외침'이라는 메시지가 임팩트 있게 읽히도록 했다. 모바일 화면과 인터페이스 요소는 UI 합성으로 실사에 자연스럽게 붙였고, Day to Night VFX로 낮 장면을 밤으로 바꿔 시간의 흐름에 따라 분위기가 변하는 연출을 만들었다.",
  },
  {
    id: "50",
    title: "STEPS",
    category: "TVCF",
    video: videoSTEPS_A_EVENT,
    thumbnail: thumbSTEPS_A_EVENT,
    participation: 95,
    keywords: ["한화투자증권", "STEPS", "주식투자", "자막 작업", "촬영본 클린", "인물 피부클린", "UI 3D애니메이션", "2D TD", "금융광고"],
    description: "주식투자 한끗차이 편\n\n한화투자증권 모바일 주식투자 앱 'STEPS' 광고. 2017년 출시, 2021년 전면 업그레이드. 천원 소액매매·즉시출금·달러 RP 같은 기능을 '한끗차이'라는 슬로건으로 직관적이고 스마트한 투자 경험으로 시각화했다.\n\n2D TD로 프로젝트를 진행했다. 자막으로 핵심 메시지와 슬로건을 세우고, 촬영본 클린과 인물 피부 클린으로 모델의 이미지를 정교하게 다듬어 금융 브랜드의 신뢰와 세련미를 살렸다. UI 3D 애니메이션으로 앱의 인터페이스와 주요 기능을 입체적이고 역동적으로 보여줬다.",
  },
  {
    id: "51",
    title: "테이스티사가",
    category: "TVCF",
    video: videoTASTYSAGA_COOK_A,
    thumbnail: thumbTASTYSAGA_COOK_A,
    keywords: ["Toon style", "리터칭", "셀애니메이션", "2D TD", "트레킹", "합성"],
    description: "EXID 하니 편\n\n테이스티사가 브랜드 TVCF, EXID 하니 출연. 실사 영상을 드로잉 리터칭으로 게임 속 2D 이미지 스타일처럼 재구성해 게임과 푸드의 크로스오버 감성을 시각화했다.\n\n2D TD로 전담했다. 테이블 위 오브젝트를 툰(Toon) 스타일로 리터칭하고 트래킹 기반 합성으로 사실감을 더했으며, 실사와 2D 스타일의 톤을 맞추는 일이 핵심이었다.",
  },
  {
    id: "52",
    title: "서든어택",
    category: "TVCF",
    video: videoTEASER,
    thumbnail: thumbTEASER,
    keywords: ["자막 애니메이션", "컴포지팅", "게임 광고", "2D TD"],
    description: "서든마스터즈\n\n넥슨 FPS 게임 서든어택의 서든마스터즈 이벤트 연계 영상. 게임의 역동성과 경쟁의 긴장감을 전하면서 이벤트 무드와 브랜드 아이덴티티를 맞추는 것이 목표였다.\n\n2D TD로 자막·타이틀 영상 제작과 컴포지팅 전반을 맡았다. 실사와 게임 소스, 그래픽 요소를 합성해 시각적 완성도를 맞췄다.",
  },
  {
    id: "53",
    title: "VAP",
    category: "TVCF",
    video: videoVAP_60,
    thumbnail: thumbVAP_60,
    participation: 85,
    keywords: ["자막 애니메이션", "그래픽 패턴", "패키지 리터칭", "식품광고", "색체계획", "마스터링"],
    description: "VAP 젤리쁨\n\nVAP 젤리쁨 5종 건강보조 젤리 광고, 모델 이솜 편. 제품별 특징과 건강 기능을 시각화했다.\n\n2D TD로 시간마다 챙겨 먹는 젤리라는 점을 살리려고 시계 요소를 영상 전반의 모티프로 넣었다. 각 제품을 대표하는 재료를 패턴 그래픽으로 만들어 임팩트를 키우고, 상큼한 맛의 연상과 패키지의 원색을 살린 색채 계획을 세웠다. 자막 외에 합성, 패키지 리터칭, 후반 마스터링 등 포스트 작업을 전담했다.",
  },
  {
    id: "53-1",
    title: "VERNA",
    category: "TVCF",
    video: videoVERNA,
    thumbnail: thumbVERNA,
    keywords: ["현대자동차", "베르나", "자동차 광고", "엔트리카", "매트페인팅", "클린업", "그래픽 합성"],
    description: "현대 베르나 광고 캠페인\n\n현대자동차 소형차 베르나(VERNA) 제품 광고. '내 마음의 첫 번째 차' 같은 가족·엔트리카 타겟 메시지를 전하며 차량의 신뢰성과 디자인을 강조하는 TVCF.\n\n2D Artist로 매트 페인팅과 클린업, 실사·그래픽 합성을 맡았다. 자동차 광고에 맞는 톤과 무결점 화면으로 완성도를 맞췄다.",
  },
  {
    id: "55",
    title: "경기도",
    category: "TVCF",
    video: video경기도_20A,
    thumbnail: thumb경기도_20A,
    participation: 85,
    keywords: ["2D TD", "카툰화 리터칭", "3D 자막", "공공광고"],
    description: "경기도 청년기본소득 꿩먹알먹\n\n경기도 청년기본소득 정책 홍보 영상 '꿩먹알먹'. 정책의 가치와 청년이 받는 혜택을 쉽고 친근하게 전하면서, 공공 캠페인에 맞는 가독성과 몰입감이 필요했다.\n\n2D TD로 참여했다. 실사 촬영본을 카툰화 리터칭으로 스타일링해 몰입 효과를 높이고, 3D 감각의 자막 스타일로 재미 요소를 더해 메시지 전달력을 키웠다.",
  },
  {
    id: "56",
    title: "E-Mart",
    category: "TVCF",
    video: video농부,
    thumbnail: thumb농부,
    participation: 65,
    keywords: ["이마트", "국산의 힘", "자막 애니메이션", "슬로건 애니메이션", "촬영본 클린", "매트페인팅", "2D", "유통광고"],
    description: "국산의 힘 프로젝트 · 농부, 어부편\n\n이마트 '국산의 힘' 캠페인, 농부 편과 어부 편. 2015년부터 이어온 상생 프로젝트로 국산 농수축산물의 판로를 넓힌다. 제주한우, 임자도 갯벌김, 횡성한우, 한라산 건표고, 완도 활전복 같은 특산품과 그것을 기르는 농부·어부의 이야기를 담았다.\n\n2D Artist로 자막 애니메이션과 슬로건 애니메이션을 만들어 '국산의 힘'이라는 메시지가 또렷이 전달되게 했다. 촬영본 클린 작업으로 화면의 불필요한 요소를 정밀하게 걷어내고, 매트 페인팅으로 농부·어부의 작업 현장과 제품 비주얼을 강화했으며, 실사와 그래픽을 자연스럽게 합성해 상생의 가치와 국산 먹거리의 신뢰가 돋보이게 했다.",
  },
  {
    id: "57",
    title: "바슈롬",
    category: "TVCF",
    video: video바슈롬_40,
    thumbnail: thumb바슈롬_40,
    participation: 85,
    keywords: ["VFX", "자막 애니메이션", "픽토그램", "뷰티", "2D TD", "클론이펙트", "마스킹 편집 기술"],
    description: "내 눈을 닮은 바이오트루\n\n바슈롬 콘택트렌즈 '바이오트루' 광고, 모델 김소현 편. '내 눈을 닮은 바이오트루'라는 슬로건으로 자연스러운 착용감과 혁신 기술을 시각화했다.\n\n2D TD로 프로젝트 전반을 맡았다. 김소현을 제외한 등장인물이 멈추는 연출과, 모델이 둘로 보이는 쌍둥이 클론 이펙트를 VFX로 만들어 시각적 임팩트를 키웠다. 자막에는 픽토그램 효과를 적용해 제품 특징이 직관적으로 읽히게 했다.",
  },
  {
    id: "58",
    title: "떠먹는 불가리스",
    category: "TVCF",
    video: video불가리스_ASMR_30A,
    thumbnail: thumb불가리스_ASMR_30A,
    keywords: ["자막 애니메이션", "매트페인팅", "피부 보정", "캐릭터 디자인", "식품광고"],
    description: "불가리스 ASMR\n\n떠먹는 불가리스 ASMR 30초 광고, 악동뮤지션 김수현 편. ASMR의 감각 경험과 제품 특징을 시각화했다.\n\n2D Artist로 영상 전반의 그래픽을 맡았다. 김수현이 직접 작곡한 곡에 맞춰 송 자막을 디자인하고, 캐릭터를 활용해 제품 패키지를 강조했다. 피부 클린과 매트 페인팅으로 완성도를 끌어올리고 영상 효과를 제작했으며, 고화질 화면의 불필요한 요소를 정밀하게 걷어내고 실사와 그래픽을 유기적으로 합성해 브랜드의 신뢰와 제품의 세련미가 드러나게 했다.",
  },
  {
    id: "61",
    title: "젠틀피버",
    category: "TVCF",
    video: video젠틀피버_FULL_B,
    thumbnail: thumb젠틀피버_FULL_B,
    participation: 90,
    keywords: ["타이포애니메이션", "뷰티", "피부클린", "2D", "그래픽 합성", "컬러 그레이딩", "피부 보정"],
    description: "당신의 피부톤은? 편\n\n젠틀피버 피부톤 제품 광고, '당신의 피부톤은?' 캠페인. 저마다 다른 피부톤을 아름답게 표현한다는 메시지로 뷰티 전문성과 제품 혁신을 시각화했다.\n\n2D Artist로 영상 전반의 그래픽을 맡았다. 피부톤을 강조하는 타이포 애니메이션을 만들고, 피부 클린과 보정으로 모델의 자연스러운 피부 표현을 살렸다. 뷰티 광고의 특성에 맞는 컬러 그레이딩과 그래픽 합성으로 제품의 효과와 프리미엄 이미지를 전했다.",
  },
  {
    id: "62",
    title: "카와",
    category: "TVCF",
    video: video카와,
    thumbnail: thumb카와,
    keywords: ["매트페인팅", "클린업", "식품광고", "프리미엄 브랜딩"],
    description: "커피의 탑 카와\n\n프리미엄 RTD 커피 '카와(KAWA)' 브랜드 캠페인. '커피의 탑'이라는 슬로건으로 최고급 브랜드 이미지와 깊은 풍미, 고급스러운 감성을 시각화했다.\n\n2D Artist로 심미적 완성도를 끌어올리는 후반을 맡았다. 고화질 영상의 불필요한 요소를 완전히 걷어내는 클린업과, 공간의 입체감과 깊이를 다시 세우는 매트 페인팅으로 무결점 화면을 구성했다. 실사와 디지털 그래픽을 정교하게 합성해 브랜드의 신뢰를 높이고 제품의 고급스러운 질감이 화면에서 만져지도록 했다.",
  },
  {
    id: "63",
    title: "프렌치카페 카페믹스",
    category: "TVCF",
    video: video프렌치카페,
    thumbnail: thumb프렌치카페,
    participation: 75,
    keywords: ["프렌치카페", "카페믹스", "이보영", "김태희", "화면분할", "캘리그래피 애니메이션", "뷰티", "제품 패키지 애니메이션", "합성", "2D", "식품광고"],
    description: "이보영, 김태희 편\n\n남양유업 프렌치카페 카페믹스 TVCF, 이보영·김태희 편. 무지방우유와 무첨가 포인트를 강조한 광고로, 맛과 건강을 함께 전하는 콘셉트를 화면분할과 캘리그래피로 구성해 프리미엄·건강 브랜드 이미지를 담았다.\n\n2D Artist로 시각 완성도를 맡았다. 이보영·김태희 뷰티 작업으로 피부와 이미지를 보정하고, 캘리그래피 애니메이션으로 캐치프레이즈를 감성적으로 전했다. 제품 패키지 애니메이션과 화면분할 합성으로 두 모델이 한 화면에 어우러지는 구도를 완성했다.",
  },
  {
    id: "64",
    title: "하나금융지주",
    category: "ONLINE IR",
    video: video하나금융그룹,
    thumbnail: thumb하나금융그룹,
    participation: 100,
    keywords: ["웹캐스트", "라이브송출", "현장감독", "디지털 가상배경", "홀딩슬라이드", "랜딩페이지", "실적발표"],
    description: "분기 실적발표 웹캐스트\n\n하나금융지주 분기 실적발표를 웹캐스트로 진행하는 온라인 IR 이벤트. 전화로 하던 실적발표가 영상으로 옮겨가던 2023년 말에 시작해 2년 넘게 이어지고 있으며, 랜딩페이지와 인터랙티브 페이지 제작부터 Zoom을 활용한 양방향 실적발표까지 구현했다.\n\nCreative Director로 사전 준비부터 마감까지 전 과정을 맡았다. 홀딩 슬라이드·웹 랜딩페이지·디지털 가상배경을 디자인하고, 촬영 현장에서 감독으로 라이브 송출을 관리했다. 스피커 소개 사진은 AI 생성 이미지로 톤을 통일했고, 이전 IR에는 없던 고품질 가상배경을 도입했다.",
  },
  {
    id: "65",
    title: "현대자동차",
    category: "TVCF",
    video: video현대자동차,
    thumbnail: thumb현대자동차,
    participation: 45,
    keywords: ["현대자동차", "2014 브라질 월드컵", "카카", "카시야스", "자막 이펙트", "매트페인팅", "플렉서스", "VFX", "2D", "스포츠 마케팅"],
    description: "2014 FIFA 브라질 월드컵 캠페인\n\n현대자동차 2014 FIFA 브라질 월드컵 공식 후원사 캠페인 광고. 카카, 카시야스, 오스카를 홍보대사로 세우고, 56개국 시승회와 16개국 '현대 팬파크'로 이어진 글로벌 마케팅의 광고 촬영과 SNS 캠페인 영상이다.\n\n2D Artist로 시각적 임팩트를 맡았다. 선수들의 메시지와 브랜드 슬로건이 역동적으로 읽히도록 자막 이펙트를 만들고, 매트 페인팅으로 월드컵 경기장과 브라질의 상징적인 배경을 강화해 현장감을 높였다. 플렉서스(Plexus)로 입자와 선이 이어지는 비주얼 이펙트를 구현해 축구의 에너지와 현대자동차의 혁신성을 그래픽으로 표현했다.",
  },
  {
    id: "67",
    title: "김해 가야테마파크",
    category: "Public Art / Media Facade",
    image: img가야테마파크,
    thumbnail: img가야테마파크,
    participation: 100,
    keywords: ["미디어파사드", "프로젝션 매핑", "입체 조형물", "공간 연출"],
    description: "2024 김해 가야테마파크\n\n김해 가야테마파크 미디어파사드 프로젝트. 입체 조형물을 대상으로 한 프로젝션 매핑 콘텐츠와 공간 연출을 맡았다.",
  },
];

type PortfolioSection = 'tvcf' | 'webui' | 'ir' | 'facade' | 'other';

function getPortfolioSection(project: Project): PortfolioSection {
  const category = project.category.toLowerCase();
  const title = project.title.toLowerCase();
  const keywordStr = (project.keywords ?? []).join(' ').toLowerCase();

  // DOOH(옥외 스크린)도 공공 공간 작업이라 미디어파사드 그룹에 함께 둔다
  if (project.category === 'Public Art / Media Facade' || project.category === 'DOOH') {
    return 'facade';
  }

  const isWebUi =
    category.includes('인스타그램') ||
    category.includes('웹사이트 운영') ||
    (category.includes('웹사이트') && title.includes('lg'));

  if (isWebUi) {
    return 'webui';
  }

  const isIr =
    category.includes('ir') ||
    title.includes('ir') ||
    keywordStr.includes('ir event') ||
    keywordStr.includes('ir ') ||
    category.includes('웹사이트구축');

  if (isIr) {
    return 'ir';
  }

  if (category.includes('website')) {
    return 'other';
  }

  return 'tvcf';
}

function isViralProject(project: Project): boolean {
  const category = project.category.toLowerCase();
  const keywordStr = (project.keywords ?? []).join(' ').toLowerCase();
  return category.includes('viral') || keywordStr.includes('viral');
}

/** TVCF 내 Viral 작품을 중간 지점에 삽입 */
function orderTvcfWithViralInMiddle(
  items: { project: Project; index: number }[],
): { project: Project; index: number }[] {
  const viral = items.filter(({ project }) => isViralProject(project));
  const nonViral = items.filter(({ project }) => !isViralProject(project));

  if (viral.length === 0) return items;

  const mid = Math.floor(nonViral.length / 2);
  return [...nonViral.slice(0, mid), ...viral, ...nonViral.slice(mid)];
}

/** 자동 정렬 뒤에 특정 작품을 고정 순번(1부터)으로 옮긴다. 발표 동선용 */
const PINNED_ORDER: Record<string, number> = {
  '42': 4, // 넥센타이어
};

/** 포트폴리오 노출 순서: TVCF(Viral 중간) → Web UI/UX → IR → 미디어파사드 → 기타 → 고정 순번 적용 */
export const projects: Project[] = (() => {
  const withMeta = projectsRaw.map((project, index) => ({
    project,
    index,
    section: getPortfolioSection(project),
  }));

  const sections: PortfolioSection[] = ['tvcf', 'webui', 'ir', 'facade', 'other'];
  const ordered: Project[] = [];

  for (const section of sections) {
    const sectionItems = withMeta.filter(({ section: s }) => s === section);
    const sorted =
      section === 'tvcf'
        ? orderTvcfWithViralInMiddle(sectionItems)
        : sectionItems;

    ordered.push(...sorted.map(({ project }) => project));
  }

  for (const [id, position] of Object.entries(PINNED_ORDER)) {
    const from = ordered.findIndex((project) => project.id === id);
    if (from < 0) continue;
    const [moved] = ordered.splice(from, 1);
    ordered.splice(Math.min(Math.max(position - 1, 0), ordered.length), 0, moved);
  }

  return ordered;
})();
