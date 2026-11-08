/* 享爱密码 · 法务合规模型（框架 + 条款要点草案）
   重要：本文件把「已查证的公开资料」与「平台规则草案」严格分开。
   type = fact  : 可查证的法规或公开报道，附 MLA 出处。
   type = draft : 我为产品起草的规则建议，不是法律意见，上线前必须由法务确认。
   本文件不是法律意见书，也不替代律师审查。 */
(function () {
  'use strict';

  const MLA = {
    mohrss: '人力资源社会保障部. "人力资源社会保障部对十三届全国人大三次会议第9718号建议的答复." 中华人民共和国人力资源和社会保障部, 11 Nov. 2020, www.mohrss.gov.cn/xxgk2020/fdzdgknr/zhgl/jytabl/jydf/202012/t20201228_406729.html.',
    nhc: '国家卫生健康委员会. "对十四届全国人大一次会议第4016号建议的答复." 中华人民共和国国家卫生健康委员会, Sept. 2023, www.nhc.gov.cn/wjw/jiany/202309/17babb7829c349b0b05dbb70ec1759a1.shtml.',
    pipl: '"中华人民共和国个人信息保护法." 中央网络安全和信息化委员会办公室, 20 Aug. 2021, www.cac.gov.cn/2021-08/20/c_1631050028355286.htm.',
    piplGuide: '中央网络安全和信息化委员会办公室. "8章74条，个人信息保护法来了！权威解读十大亮点." 中央网络安全和信息化委员会办公室, 21 Aug. 2021, www.cac.gov.cn/2021-08/21/c_1631141677655320.htm.',
    hotline: '国家卫生健康委. "国家卫生健康委关于应用「12356」全国统一心理援助热线电话号码的通知." 中国政府网, 6 Dec. 2024, www.gov.cn/zhengce/zhengceku/202412/content_6994470.htm.',
    people: '"「零门槛」「高收入」，心理咨询师几个月就拿证？" 人民网, 13 Aug. 2021, m.people.cn/n4/2021/0813/c1-15141775.html.'
  };

  const URLS = {
    mohrss: 'https://www.mohrss.gov.cn/xxgk2020/fdzdgknr/zhgl/jytabl/jydf/202012/t20201228_406729.html',
    nhc: 'https://www.nhc.gov.cn/wjw/jiany/202309/17babb7829c349b0b05dbb70ec1759a1.shtml',
    pipl: 'https://www.cac.gov.cn/2021-08/20/c_1631050028355286.htm',
    piplGuide: 'https://www.cac.gov.cn/2021-08/21/c_1631141677655320.htm',
    hotline: 'https://www.gov.cn/zhengce/zhengceku/202412/content_6994470.htm',
    people: 'https://m.people.cn/n4/2021/0813/c1-15141775.html'
  };

  /* 六层控制模型：每一层都有责任方、控制点、当前状态 */
  const LAYERS = [
    { n: '1', name: '法规层', owner: '法务', control: '服务边界、资质宣传口径、禁止性表述', status: '已查证框架，条款待审', tone: '#C4551F' },
    { n: '2', name: '主体层', owner: '运营', control: '平台主体、咨询师准入与核验、合作协议', status: '草案', tone: '#C97A3A' },
    { n: '3', name: '数据层', owner: '技术 + 法务', control: '敏感信息单独同意、最小收集、加密、留存与删除', status: '部分已落地', tone: '#B98A4E' },
    { n: '4', name: '交易层', owner: '运营 + 财务', control: '计费规则、支付通道、发票、退款与争议', status: '支付通道未接入', tone: '#A97350' },
    { n: '5', name: '交付层', owner: '咨询师 + 运营', control: '付费闸门、会话权限、服务记录、投诉处理', status: '已落地原型', tone: '#9B6A55' },
    { n: '6', name: '应急层', owner: '运营 + 法务', control: '危机识别、转介、上报、留痕', status: '草案', tone: '#8E5C4A' }
  ];

  const MODULES = [
    {
      id: 'boundary', title: '服务边界与资质宣传', type: 'fact',
      summary: '平台只能提供心理咨询与陪伴式对话，不能做诊断与治疗；平台不得用「国家认证」包装咨询师。',
      bases: ['nhc', 'mohrss'],
      points: [
        '《精神卫生法》框架下，心理咨询人员不得从事心理治疗或者精神障碍的诊断、治疗。',
        '2017 年 9 月人社部公布国家职业资格目录，心理咨询师未列入目录，职业资格鉴定与发证工作停止。',
        '国家卫生健康委在 2023 年答复中确认《精神卫生法》自 2013 年 5 月起实施，并对心理咨询、心理治疗、心理援助提出要求。'
      ],
      drafts: [
        '全站禁用「国家认证心理咨询师」「持证上岗」等表述，改为公示学历、系统受训、督导时数与伦理承诺。',
        '服务介绍页固定放置非医疗声明：本平台不提供精神障碍的诊断与治疗。'
      ],
      todos: ['请法务确认服务描述措辞', '请法务确认平台经营主体与所需许可']
    },
    {
      id: 'privacy', title: '敏感个人信息与单独同意', type: 'fact',
      summary: '咨询内容可能落入医疗健康类敏感个人信息，处理需要单独同意、必要性告知与严格保护。',
      bases: ['pipl', 'piplGuide'],
      points: [
        '《个人信息保护法》第 28 条把医疗健康列为敏感个人信息，要求特定目的、充分必要性与严格保护措施。',
        '第 29 条要求处理敏感个人信息取得个人的单独同意；第 30 条要求额外告知必要性与对个人权益的影响。',
        '网信办权威解读明确：处理敏感个人信息、向他人提供或公开个人信息等环节应取得单独同意，并赋予个人撤回同意的权利。',
        '第 31 条要求处理不满十四周岁未成年人个人信息取得监护人同意，并制定专门处理规则。'
      ],
      drafts: [
        '把「服务条款」与「敏感信息单独同意」拆成两个独立勾选项，不捆绑、不预勾选。',
        '咨询记录按最小范围收集，聊天内容加密存储，提供查询、更正、删除与撤回同意入口。',
        '未成年人议题（亲子沟通）不直接向未满十四周岁的儿童收集信息，由监护人发起。'
      ],
      todos: ['请法务核定隐私政策全文', '请技术确认加密与密钥管理方案', '请法务确认监护人同意流程']
    },
    {
      id: 'agreement', title: '服务协议与效果表述', type: 'draft',
      summary: '平台不承诺挽回关系、改变他人或达成任何特定结果；公开报道显示「情感挽回」类服务是投诉集中区。',
      bases: ['people'],
      points: [
        '人民网 2021 年报道提到，第三方投诉平台上以「心理咨询」为关键词的投诉有 2000 多条，很多针对「情感挽回」类服务。'
      ],
      drafts: [
        '服务协议明确：咨询是陪伴与梳理，不承诺结果、不替来访者做决定、不评价第三方对错。',
        '营销文案禁用「挽回」「保证复合」「一定有效」等结果承诺。',
        '咨询师不得对第三者、伴侣或家人做诊断性标签。'
      ],
      todos: ['请法务审定服务协议与禁用词表', '请运营建立文案审核清单']
    },
    {
      id: 'payment', title: '计费、支付与退款', type: 'draft',
      summary: '计费规则由数据库配置；真实扣款通道尚未接入，退款规则属于待审商业条款。',
      bases: [],
      points: [
        '当前托管后端提供数据库、账号、文件存储与大模型调用，不提供收款能力；真实支付需要另行接入具备资质的支付服务商。'
      ],
      drafts: [
        '订单状态机：待支付 → 已支付（服务端确认）→ 生成会话 → 服务中 → 已完成。前端无权改写订单状态。',
        '未开始服务可全额退；已开始按已使用次数折算；咨询师原因取消全额退并另行安排。以上为建议值，需法务与财务确认。',
        '支付回调必须做金额校验与幂等，平台侧保留订单与核销记录。',
        '咨询师分成、结算周期、发票与税务由运营与财务另行定义。'
      ],
      todos: ['请提供《鬼影追追追》的计费模型以替换当前默认假设', '确定支付服务商与商户主体', '请法务审定退款规则', '请财务确认分成与开票']
    },
    {
      id: 'crisis', title: '危机识别与转介 SOP', type: 'fact',
      summary: '12356 是全国统一心理援助热线；平台需要固定的危机提示与转介流程，但不自行做危机干预。',
      bases: ['hotline'],
      points: [
        '国家卫生健康委 2024 年 12 月发文设置 12356 作为全国统一心理援助热线号码，并要求 2025 年 5 月 1 日 0 时前实现接通。',
        '该通知要求热线提供心理健康教育、心理咨询、心理疏导、心理危机干预等服务。'
      ],
      drafts: [
        '首页、下单完成页、会话页与我的页固定展示 12356 与 110 / 120 提示。',
        '咨询师识别到自伤、伤人、家暴等风险时，按草案流程：即时提示来访者联系紧急服务 → 记录事件 → 通知运营 → 不承诺保密例外之外的处置。',
        '平台不对危机个案做诊断，也不以咨询替代医疗救治。'
      ],
      todos: ['请法务与专业督导共同审定 SOP 措辞', '确定运营值班与上报责任人', '确认保密例外条款']
    },
    {
      id: 'counselor', title: '咨询师准入、授权与伦理', type: 'draft',
      summary: '咨询师凭一次性授权码绑定账号；核验标准与伦理承诺属于平台自定规则。',
      bases: ['mohrss', 'people'],
      points: [
        '国家已取消心理咨询师职业资格认证，因此平台不能依赖「国家证书」做准入。',
        '人民网报道提到，市场上存在把培训合格证包装成从业资格证的现象。'
      ],
      drafts: [
        '准入建议：学历或系统受训证明、督导时数、个案时数、伦理承诺、身份核验，由运营人工核验后公示。',
        '授权码一次性、可吊销；一个账号绑定一位咨询师；会话按 RLS 隔离，咨询师只能看到分配给自己的来访者。',
        '咨询师协议需覆盖保密、利益冲突、禁止私下交易、禁止承诺结果、危机上报义务。'
      ],
      todos: ['请运营确定准入门槛', '请法务审定咨询师合作协议', '请技术复核授权码与权限隔离']
    },
    {
      id: 'retention', title: '数据留存、删除与审计', type: 'draft',
      summary: '咨询记录的保存期限、删除机制与访问审计需要形成可执行的制度。',
      bases: ['piplGuide'],
      points: [
        '网信办权威解读把「查询、复制、更正、删除」列为个人权利，并要求对高风险处理活动做事前影响评估、定期合规审计。'
      ],
      drafts: [
        '建议：会话记录默认保存 12 个月，到期匿名化或删除；来访者可主动申请删除。',
        '对敏感个人信息处理做事前影响评估，并留存同意与撤回的时间戳记录。',
        '咨询师访问会话留审计日志，运营定期抽查。'
      ],
      todos: ['请法务确定保存期限与删除流程', '请技术确认审计日志与匿名化实现']
    }
  ];

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function renderLayers() {
    return '<div class="layer-grid">' + LAYERS.map(l =>
      '<div class="layer-card"><span class="layer-n" style="background:' + l.tone + '">' + l.n + '</span>' +
      '<div class="layer-name">' + esc(l.name) + '</div>' +
      '<div class="layer-ctrl">' + esc(l.control) + '</div>' +
      '<div class="layer-meta"><span>责任：' + esc(l.owner) + '</span><span>' + esc(l.status) + '</span></div></div>'
    ).join('') + '</div>';
  }

  function renderModules() {
    return MODULES.map(m => {
      const refs = m.bases.map(k =>
        '<li>' + esc(MLA[k]) + ' <a href="' + URLS[k] + '" target="_blank" rel="noopener">原文</a></li>').join('');
      return '<div class="legal-card" data-legal="' + m.id + '">' +
        '<div class="row-between"><span class="strong">' + esc(m.title) + '</span>' +
        '<span class="chip ' + (m.type === 'fact' ? 'gold' : 'demo') + '">' +
        (m.type === 'fact' ? '已查证事实' : '平台草案 · 待法务确认') + '</span></div>' +
        '<p class="small muted" style="margin:6px 0 10px">' + esc(m.summary) + '</p>' +
        '<div class="legal-sec"><b>依据与事实</b><ul>' +
          m.points.map(p => '<li>' + esc(p) + '</li>').join('') +
          (refs ? '<li class="legal-refs"><b>出处（MLA）</b><ul>' + refs + '</ul></li>' : '') +
        '</ul></div>' +
        (m.drafts.length ? '<div class="legal-sec"><b>平台规则草案（非法律意见）</b><ul>' +
          m.drafts.map(d => '<li>' + esc(d) + '</li>').join('') + '</ul></div>' : '') +
        '<div class="legal-sec"><b>待确认事项</b><ul>' +
          m.todos.map(t => '<li>' + esc(t) + '</li>').join('') + '</ul></div>' +
      '</div>';
    }).join('');
  }

  function asText() {
    const lines = ['享爱密码 · 法务合规模型（框架与条款要点草案）', '生成日期：2026-11-08', '声明：本文件不是法律意见书，草案部分须由执业律师审定。', '', '一、六层控制模型'];
    LAYERS.forEach(l => lines.push('  ' + l.n + '. ' + l.name + ' | 责任方：' + l.owner + ' | 控制点：' + l.control + ' | 状态：' + l.status));
    lines.push('', '二、模块');
    MODULES.forEach(m => {
      lines.push('', '[' + (m.type === 'fact' ? '已查证事实' : '平台草案') + '] ' + m.title);
      lines.push('  摘要：' + m.summary);
      m.points.forEach(p => lines.push('  · 事实/依据：' + p));
      m.bases.forEach(k => lines.push('  · 出处（MLA）：' + MLA[k]));
      m.drafts.forEach(d => lines.push('  · 草案：' + d));
      m.todos.forEach(t => lines.push('  · 待确认：' + t));
    });
    return lines.join('\n');
  }

  window.XAM_LEGAL = { MLA, URLS, LAYERS, MODULES, renderLayers, renderModules, asText };
})();
