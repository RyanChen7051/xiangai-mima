/* 享爱密码 · PWA 交互原型
   重要：本文件所有咨询师、价格、订单、评价、时段均为演示占位数据。
   真人咨询师、账号体系、支付通道、聊天服务端均未接入；刷新页面后业务数据重置。 */
(function () {
  'use strict';

  /* ---------------- 图标 ---------------- */
  const svg = (d) => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>';
  const ICON = {
    home: svg('<path d="M3 10.6 12 3.2l9 7.4"/><path d="M5.6 9.4V20h12.8V9.4"/><path d="M10 20v-5.4h4V20"/>'),
    explore: svg('<circle cx="10.6" cy="10.6" r="6.6"/><path d="m15.6 15.6 5 5"/>'),
    chat: svg('<path d="M4 5.2h16v11.2H9.4L4 20.4V5.2Z"/><path d="M8 9.4h8M8 12.8h5"/>'),
    mine: svg('<circle cx="12" cy="8.2" r="3.5"/><path d="M4.8 20c1-3.8 3.9-5.8 7.2-5.8s6.2 2 7.2 5.8"/>'),
    shield: svg('<path d="M12 3 4.5 6v6c0 4.4 3 7.7 7.5 9 4.5-1.3 7.5-4.6 7.5-9V6L12 3Z"/>'),
    doc: svg('<path d="M6 3h8l4 4v14H6V3Z"/><path d="M14 3v4h4"/><path d="M9 12h6M9 16h6"/>'),
    phone: svg('<path d="M5 4h4l1.5 4-2 1.6c1 2.2 2.7 3.9 4.9 4.9l1.6-2 4 1.5v4c0 1-.8 1.8-1.8 1.7C9.8 18.9 5.1 14.2 3.3 5.8 3.2 4.8 4 4 5 4Z"/>'),
    order: svg('<path d="M5 4h14v16H5V4Z"/><path d="M8 9h8M8 13h8M8 17h5"/>'),
    lock: svg('<rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>'),
    info: svg('<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>'),
    users: svg('<circle cx="9" cy="8" r="3"/><path d="M3 19c.7-3.4 3-5 6-5s5.3 1.6 6 5"/><path d="M16 5.5a3 3 0 0 1 0 5.5M18 14c2 .7 3 2.4 3 5"/>'),
    check: svg('<path d="m5 12 4.5 4.5L19 7"/>')
  };

  /* ---------------- 演示数据 ---------------- */
  const TOPICS = [
    { id: 'couple', mark: '伴', name: '伴侣沟通', desc: '说不清、说不动、一开口就吵', tint: '#E98A45' },
    { id: 'parent', mark: '亲', name: '亲子沟通', desc: '孩子不听、父母不懂、越说越远', tint: '#D89A55' },
    { id: 'elder',  mark: '长', name: '长辈心理', desc: '退休、孤独、被需要与代际关系', tint: '#C98E6A' },
    { id: 'trust',  mark: '信', name: '关系与信任', desc: '第三者、边界、重建或者告别', tint: '#C56A3C' },
    { id: 'any',    mark: '?', name: '我还说不清', desc: '先做一次梳理，再决定往哪走', tint: '#B99A7E', wide: true }
  ];
  const TOPIC_NAME = Object.fromEntries(TOPICS.map(t => [t.id, t.name]));

  const COUNSELORS = [
    { id: 'c1', name: '示例咨询师 · 林', initial: '林', tint: 'linear-gradient(145deg,#F0A468,#C85E27)',
      topics: ['couple', 'trust'], modes: ['文字', '语音', '视频'], price: 199,
      intro: '演示资料：擅长把卡住的对话拆成可以慢慢说的小段落。', tags: ['伴侣沟通', '关系与信任', '冲突降温'] },
    { id: 'c2', name: '示例咨询师 · 周', initial: '周', tint: 'linear-gradient(145deg,#E9B27E,#B8703C)',
      topics: ['couple', 'parent'], modes: ['文字', '视频'], price: 239,
      intro: '演示资料：关注家庭里的角色分工与情绪传递。', tags: ['伴侣沟通', '亲子沟通', '家庭系统'] },
    { id: 'c3', name: '示例咨询师 · 沈', initial: '沈', tint: 'linear-gradient(145deg,#EDAF86,#A95C3A)',
      topics: ['parent', 'elder'], modes: ['文字', '语音'], price: 179,
      intro: '演示资料：关注代际之间的表达差异与照护压力。', tags: ['亲子沟通', '长辈心理', '照护压力'] },
    { id: 'c4', name: '示例咨询师 · 许', initial: '许', tint: 'linear-gradient(145deg,#F2A97A,#C2522F)',
      topics: ['trust', 'couple'], modes: ['文字', '语音', '视频'], price: 269,
      intro: '演示资料：处理信任破裂后的边界、选择与去留议题。', tags: ['关系与信任', '边界设定', '决策梳理'] },
    { id: 'c5', name: '示例咨询师 · 陈', initial: '陈', tint: 'linear-gradient(145deg,#E7B485,#976A45)',
      topics: ['elder', 'any'], modes: ['语音', '视频'], price: 189,
      intro: '演示资料：关注 aging 相关的失落感、孤独与自我价值。', tags: ['长辈心理', '初次梳理', '情绪陪伴'] },
    { id: 'c6', name: '示例咨询师 · 何', initial: '何', tint: 'linear-gradient(145deg,#EFA377,#B74E2C)',
      topics: ['any', 'trust', 'parent'], modes: ['文字', '语音'], price: 159,
      intro: '演示资料：第一次咨询常用，帮来访者把问题说清楚。', tags: ['初次梳理', '关系与信任', '亲子沟通'] }
  ];

  const PACKAGES = [
    { id: 'single', title: '单次咨询 · 50 分钟', desc: '先聊一次，看看是否合适', price: 199 },
    { id: 'three',  title: '3 次陪伴套餐', desc: '适合需要连续梳理的议题', price: 539, save: '较单次省 58 元' },
    { id: 'six',    title: '6 次深入套餐', desc: '适合关系重建类长期议题', price: 999, save: '较单次省 195 元' }
  ];
  const MODES = ['文字', '语音', '视频'];

  const WEEK = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  function buildSlots() {
    const out = [];
    const now = new Date();
    for (let d = 1; d <= 3; d++) {
      const dt = new Date(now.getFullYear(), now.getMonth(), now.getDate() + d);
      const label = (dt.getMonth() + 1) + '月' + dt.getDate() + '日 ' + WEEK[dt.getDay()];
      ['10:00', '14:30', '19:30'].forEach((hm, i) => {
        out.push({ day: label, time: hm, disabled: (d === 1 && i === 0) });
      });
    }
    return out;
  }
  const SLOTS = buildSlots();

  const REFS = [
    { t: '《中华人民共和国精神卫生法》', d: '心理咨询人员不得从事心理治疗或者精神障碍的诊断、治疗。平台据此设置非医疗声明与转介入口。', u: 'https://www.nhc.gov.cn/wjw/jiany/202309/17babb7829c349b0b05dbb70ec1759a1.shtml' },
    { t: '人社部《关于公布国家职业资格目录的通知》（人社部发〔2017〕68 号）', d: '心理咨询师未列入目录，职业资格鉴定与发证工作已停止。平台不宣称任何「国家认证」资质。', u: 'https://www.mohrss.gov.cn/xxgk2020/fdzdgknr/zhgl/jytabl/jydf/202012/t20201228_406729.html' },
    { t: '《中华人民共和国个人信息保护法》第 28、29 条', d: '医疗健康信息属于敏感个人信息，处理需取得个人的单独同意。平台据此设置独立的同意项与撤回入口。', u: 'https://www.cac.gov.cn/2021-08/20/c_1631050028355286.htm' },
    { t: '国家卫生健康委《关于应用「12356」全国统一心理援助热线电话号码的通知》', d: '12356 为全国统一心理援助热线号码，平台在危机场景中引导来访者优先求助。', u: 'https://www.gov.cn/zhengce/zhengceku/202412/content_6994470.htm' },
    { t: '人民网《「零门槛」「高收入」，心理咨询师几个月就拿证？》', d: '报道提到相关投诉多集中于「情感挽回」类服务，平台据此明确不承诺挽回关系或改变他人。', u: 'https://m.people.cn/n4/2021/0813/c1-15141775.html' }
  ];

  /* ---------------- 状态 ---------------- */
  const state = {
    view: 'home', stack: [], role: 'visitor',
    filterTopic: 'all', filterMode: 'all',
    counselorId: null, topicId: null,
    pkgId: 'single', mode: '文字', slotIndex: -1,
    consent: { service: false, sensitive: false },
    consentDone: false,
    orders: [],
    messages: [
      { from: 'them', text: '你好，我是本场咨询的咨询师。这里只有我们两个人，你可以按自己的节奏说。', time: '演示' },
      { from: 'them', text: '如果现在不方便打字，先不说话也没关系。我们可以从你最想被理解的那件事开始。', time: '演示' }
    ]
  };
  const TAB_VIEWS = ['home', 'explore', 'sessions', 'mine'];
  const TABS = [
    { id: 'home', label: '首页', icon: ICON.home },
    { id: 'explore', label: '找咨询师', icon: ICON.explore },
    { id: 'sessions', label: '我的咨询', icon: ICON.chat },
    { id: 'mine', label: '我的', icon: ICON.mine }
  ];

  const $ = (s) => document.querySelector(s);
  const main = $('#appMain');
  const header = $('#appHeader');
  const tabbar = $('#tabbar');
  const modalRoot = $('#modalRoot');
  const device = $('#device');
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const yuan = (n) => '¥' + n;

  /* ---------------- 通用 ---------------- */
  function toast(msg) {
    const el = $('#toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(state.toastTimer);
    state.toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
  }
  function counselorById(id) { return COUNSELORS.find(c => c.id === id); }
  function pkgById(id) { return PACKAGES.find(p => p.id === id); }
  function avatar(c, cls) {
    return '<span class="avatar ' + (cls || '') + '" style="background:' + c.tint + '">' + esc(c.initial) + '</span>';
  }
  function demoTag() { return '<span class="chip demo">演示资料</span>'; }
  function crisisNotice() {
    return '<div class="notice"><span class="n-icon">!</span><div>' +
      '<b>如果你或身边的人正处在危险中，请优先求助。</b><br>' +
      '全国心理援助热线 <a href="tel:12356">12356</a>；紧急情况请拨打 110 或 120。' +
      '本平台不提供危机干预与精神障碍的诊断、治疗。</div></div>';
  }
  function nonMedicalNotice() {
    return '<div class="notice blue"><span class="n-icon">i</span><div>' +
      '本平台提供的是心理咨询与陪伴式对话，<b>不提供精神障碍的诊断与治疗</b>，' +
      '也不承诺挽回关系、改变他人或达成特定结果。</div></div>';
  }

  /* ---------------- 导航 ---------------- */
  function go(view, patch) {
    if (state.view !== view) state.stack.push(state.view);
    state.view = view;
    if (patch) Object.assign(state, patch);
    render();
    main.scrollTop = 0;
  }
  function switchTab(view) {
    state.stack = [];
    state.view = view;
    if (view === 'explore') { state.filterTopic = 'all'; state.filterMode = 'all'; }
    try { history.replaceState(null, '', '#' + view); } catch (e) { /* file 协议下忽略 */ }
    render();
    main.scrollTop = 0;
  }
  function back() {
    state.view = state.stack.pop() || 'home';
    render();
    main.scrollTop = 0;
  }
  function requireConsent(next) {
    if (state.consentDone) { next(); return; }
    openConsent(next);
  }

  /* ---------------- 顶栏 / 底栏 ---------------- */
  function renderHeader() {
    const v = state.view;
    const isTab = TAB_VIEWS.indexOf(v) >= 0;
    const titles = {
      counselor: '咨询师主页', booking: '预约咨询', orderDone: '预约完成',
      chat: '咨询对话', about: '关于与合规依据', privacy: '隐私与同意',
      desk: '咨询师工作台', topicIntro: '关于这个主题'
    };
    if (isTab) {
      header.innerHTML =
        '<div class="hd-brand"><img src="assets/logo-badge-320.png" alt="享爱密码徽章">' +
        '<div><div class="hd-title">享爱密码</div><div class="hd-sub">爱有其方，享爱所有</div></div></div>' +
        '<span class="hd-spacer"></span>' +
        '<button class="hd-action" data-act="switch-role">' +
        (state.role === 'visitor' ? '咨询师视角' : '来访者视角') + '</button>';
    } else {
      header.innerHTML =
        '<button class="hd-back" data-act="back" aria-label="返回">‹</button>' +
        '<div class="hd-title">' + esc(titles[v] || '享爱密码') + '</div>' +
        '<span class="hd-spacer"></span>' +
        '<button class="hd-action" data-act="go-about">关于</button>';
    }
  }
  function renderTabs() {
    const show = TAB_VIEWS.indexOf(state.view) >= 0 && state.role === 'visitor';
    tabbar.style.display = show ? 'flex' : 'none';
    device.classList.toggle('no-tabs', !show);
    main.style.paddingBottom = show ? '' : '24px';
    if (!show) return;
    tabbar.innerHTML = TABS.map(t =>
      '<button class="tab ' + (state.view === t.id ? 'active' : '') + '" data-act="tab" data-id="' + t.id + '">' +
      '<span class="tab-icon">' + t.icon + '</span><span>' + t.label + '</span></button>'
    ).join('');
  }

  /* ---------------- 视图：首页 ---------------- */
  function viewHome() {
    const topics = TOPICS.map(t =>
      '<button class="topic ' + (t.wide ? 'wide' : '') + '" data-act="open-topic" data-id="' + t.id + '">' +
      '<span class="t-icon" style="background:' + t.tint + '">' + esc(t.mark) + '</span>' +
      '<span class="t-body"><span class="t-name">' + esc(t.name) + '</span>' +
      '<span class="t-desc">' + esc(t.desc) + '</span></span></button>'
    ).join('');

    return '<section class="view">' +
      '<div class="hero">' +
        '<img class="hero-logo" src="assets/logo-badge-320.png" alt="享爱密码圆形徽章：双手捧起心形钥匙">' +
        '<h1>享爱密码</h1><p class="slogan">爱有其方，享爱所有</p>' +
        '<p class="lead">有些话，在家里说不出口。你可以先从这里开始，慢慢说给我们听。</p>' +
      '</div>' +

      '<div class="section-head"><h2>现在，你最想聊的是？</h2></div>' +
      '<div class="topic-grid">' + topics + '</div>' +

      '<div class="section-head"><h2>怎么开始</h2></div>' +
      '<div class="steps">' +
        '<div class="step"><span class="s-num">1</span><span class="s-txt">选一个主题</span></div>' +
        '<div class="step"><span class="s-num">2</span><span class="s-txt">挑一位咨询师</span></div>' +
        '<div class="step"><span class="s-num">3</span><span class="s-txt">付费预约</span></div>' +
        '<div class="step"><span class="s-num">4</span><span class="s-txt">在 App 里聊</span></div>' +
      '</div>' +

      '<div class="section-head"><h2>开始之前</h2></div>' +
      nonMedicalNotice() + crisisNotice() +
      '<div class="card tinted"><div class="row"><span class="li-icon">' + ICON.shield + '</span>' +
        '<div class="li-body"><div class="li-title">你的对话内容按敏感信息对待</div>' +
        '<div class="li-desc">我们会单独征求你的同意；你随时可以撤回。</div></div></div>' +
        '<button class="btn ghost block sm" data-act="go-privacy" style="margin-top:12px">查看隐私与同意设置</button></div>' +
      '<p class="tiny muted center" style="margin:18px 0 4px">产品原型 · 咨询师资料、价格与时段均为演示占位</p>' +
    '</section>';
  }

  /* ---------------- 视图：主题说明 ---------------- */
  function viewTopicIntro() {
    const t = TOPICS.find(x => x.id === state.topicId) || TOPICS[0];
    const extra = t.id === 'trust'
      ? '<div class="notice green"><span class="n-icon">i</span><div>这个主题<b>不预设第三者的性别，也不预设关系的形式</b>。无论发生在异性伴侣、同性伴侣或其他关系结构里，你都可以谈。平台只提供对话与梳理，不做评判，也不替你做决定。</div></div>'
      : '';
    const count = COUNSELORS.filter(c => c.topics.indexOf(t.id) >= 0 || t.id === 'any').length;
    return '<section class="view">' +
      '<div class="card tinted center" style="padding:24px 18px">' +
        '<span class="t-icon" style="background:' + t.tint + ';margin:0 auto 12px">' + esc(t.mark) + '</span>' +
        '<h2 style="margin:0 0 6px;font-size:20px">' + esc(t.name) + '</h2>' +
        '<p class="small muted" style="margin:0">' + esc(t.desc) + '</p></div>' +
      extra +
      '<div class="card"><div class="strong" style="margin-bottom:8px">你可以聊些什么</div>' +
        '<p class="small muted" style="margin:0">你可以讲一件最近发生的事，也可以只讲一种说不清楚的感觉。' +
        '咨询师会陪你把问题拆开，不会要求你立刻给出结论，也不会替你判断谁对谁错。</p></div>' +
      nonMedicalNotice() +
      '<button class="btn block" data-act="to-list">看看可预约的咨询师（演示 ' + count + ' 位）</button>' +
    '</section>';
  }

  /* ---------------- 视图：咨询师列表 ---------------- */
  function counselorCard(c) {
    const tags = c.tags.slice(0, 3).map(t => '<span class="chip ghost">' + esc(t) + '</span>').join('');
    return '<button class="counselor" data-act="open-counselor" data-id="' + c.id + '">' +
      avatar(c) +
      '<div class="c-main"><div class="c-name">' + esc(c.name) + demoTag() + '</div>' +
        '<div class="c-line">' + esc(c.intro) + '</div>' +
        '<div class="c-tags">' + tags + '</div>' +
        '<div class="c-line small muted" style="margin-top:8px">' + c.modes.join(' / ') + ' 可约</div></div>' +
      '<div class="c-price"><div class="p">' + yuan(c.price) + '</div><div class="u">每次起</div></div>' +
    '</button>';
  }
  function viewExplore() {
    const topicChips = [{ id: 'all', name: '全部主题' }].concat(TOPICS.filter(t => t.id !== 'any'))
      .map(t => '<button class="chip selectable ' + (state.filterTopic === t.id ? 'selected' : '') +
        '" data-act="filter-topic" data-id="' + t.id + '">' + esc(t.name) + '</button>').join('');
    const modeChips = [{ id: 'all', name: '不限方式' }].concat(MODES.map(m => ({ id: m, name: m })))
      .map(m => '<button class="chip selectable ' + (state.filterMode === m.id ? 'selected' : '') +
        '" data-act="filter-mode" data-id="' + esc(m.id) + '">' + esc(m.name) + '</button>').join('');

    let list = COUNSELORS.filter(c => {
      const byTopic = state.filterTopic === 'all' || c.topics.indexOf(state.filterTopic) >= 0;
      const byMode = state.filterMode === 'all' || c.modes.indexOf(state.filterMode) >= 0;
      return byTopic && byMode;
    });

    return '<section class="view">' +
      '<div class="section-head" style="margin-top:2px"><h2>找一位合适的人</h2><span class="small muted">演示 ' + list.length + ' 位</span></div>' +
      '<div class="filter-bar">' + topicChips + '</div>' +
      '<div class="filter-bar">' + modeChips + '</div>' +
      '<div class="notice"><span class="n-icon">!</span><div>下面每一位都是<b>示例资料</b>。真人咨询师由运营方招募并人工核验后接入，' +
        '本平台不宣称任何「国家认证」资质。</div></div>' +
      (list.length ? list.map(counselorCard).join('') :
        '<div class="empty"><span class="e-icon">○</span>当前筛选下还没有演示咨询师，换个条件试试。</div>') +
      '<div class="card tinted"><div class="strong" style="margin-bottom:6px">关于咨询师核验（规则占位）</div>' +
        '<p class="small muted" style="margin:0">2017 年起国家已取消心理咨询师职业资格认证。' +
        '平台拟公示每位咨询师的学历、系统受训、督导时数与伦理承诺，由运营方人工核验；具体标准待确认。</p></div>' +
    '</section>';
  }

  /* ---------------- 视图：咨询师详情 ---------------- */
  function viewCounselor() {
    const c = counselorById(state.counselorId) || COUNSELORS[0];
    const topics = c.topics.map(t => '<span class="chip">' + esc(TOPIC_NAME[t] || t) + '</span>').join(' ');
    const slots = SLOTS.slice(0, 6).map((s, i) =>
      '<button class="slot ' + (s.disabled ? 'disabled' : '') + '" ' + (s.disabled ? 'disabled' : '') +
      ' data-act="pick-slot" data-i="' + i + '">' + esc(s.day) + '<br>' + s.time + '</button>').join('');

    return '<section class="view">' +
      '<div class="card"><div class="detail-hero">' + avatar(c) +
        '<div><div class="c-name">' + esc(c.name) + demoTag() + '</div>' +
        '<div class="small muted" style="margin-top:4px">' + esc(c.intro) + '</div></div></div>' +
        '<div class="divider"></div><div class="wrap" style="display:flex;gap:6px">' + topics + '</div>' +
        '<div class="divider"></div>' +
        '<div class="kv"><span class="k">服务方式</span><span class="v">' + c.modes.join(' / ') + '</span></div>' +
        '<div class="kv"><span class="k">单次时长</span><span class="v">50 分钟（演示）</span></div>' +
        '<div class="kv"><span class="k">单次价格</span><span class="v" style="color:var(--brand)">' + yuan(c.price) + '</span></div>' +
      '</div>' +

      '<div class="section-head"><h2>擅长方向</h2></div>' +
      '<div class="card"><p class="small" style="margin:0;line-height:1.8">' +
        c.tags.map(t => esc(t)).join('、') + '。以上为演示标签，真人咨询师的擅长方向以核验后的资料为准。</p></div>' +

      '<div class="section-head"><h2>最近可约（示例）</h2></div>' +
      '<div class="card"><div class="slot-grid">' + slots + '</div></div>' +

      '<div class="section-head"><h2>资质与边界</h2></div>' +
      '<div class="card tinted"><p class="small muted" style="margin:0 0 8px">' +
        '国家已取消心理咨询师职业资格认证，平台不会用「国家认证」作为宣传口径。' +
        '真人咨询师的受训背景与督导时数由运营方人工核验后公示。</p>' +
        nonMedicalNotice() + '</div>' +

      '<div class="cta-bar"><div class="price">' + yuan(c.price) + '<small> / 次起</small></div>' +
        '<button class="btn" data-act="to-booking">预约咨询</button></div>' +
    '</section>';
  }

  /* ---------------- 视图：预约下单 ---------------- */
  function viewBooking() {
    const c = counselorById(state.counselorId) || COUNSELORS[0];
    const topicSel = TOPICS.filter(t => c.topics.indexOf(t.id) >= 0 || t.id === 'any')
      .map(t => '<button class="chip selectable ' + (state.topicId === t.id ? 'selected' : '') +
        '" data-act="pick-topic" data-id="' + t.id + '">' + esc(t.name) + '</button>').join('');
    const modeSel = c.modes.map(m => '<button class="chip selectable ' + (state.mode === m ? 'selected' : '') +
      '" data-act="pick-mode" data-id="' + esc(m) + '">' + esc(m) + '</button>').join('');
    const pkgSel = PACKAGES.map(p =>
      '<button class="option ' + (state.pkgId === p.id ? 'selected' : '') + '" data-act="pick-pkg" data-id="' + p.id + '">' +
        '<span class="radio"></span><span style="flex:1"><span class="o-title">' + esc(p.title) + '</span>' +
        '<span class="o-desc">' + esc(p.desc) + (p.save ? ' · ' + esc(p.save) : '') + '</span></span>' +
        '<span class="o-price">' + yuan(p.price) + '</span></button>').join('');
    const slotSel = SLOTS.map((s, i) =>
      '<button class="slot ' + (state.slotIndex === i ? 'selected' : '') + ' ' + (s.disabled ? 'disabled' : '') + '" ' +
      (s.disabled ? 'disabled' : '') + ' data-act="pick-slot" data-i="' + i + '">' +
      esc(s.day) + '<br>' + s.time + '</button>').join('');
    const p = pkgById(state.pkgId);
    const slot = state.slotIndex >= 0 ? SLOTS[state.slotIndex] : null;

    return '<section class="view">' +
      '<div class="card"><div class="detail-hero">' + avatar(c) +
        '<div><div class="c-name">' + esc(c.name) + demoTag() + '</div>' +
        '<div class="small muted" style="margin-top:4px">' + c.modes.join(' / ') + ' 可约</div></div></div></div>' +

      '<div class="section-head"><h2>1 · 这次想聊的主题</h2></div>' +
      '<div class="wrap" style="display:flex;gap:7px">' + topicSel + '</div>' +

      '<div class="section-head"><h2>2 · 沟通方式</h2></div>' +
      '<div class="wrap" style="display:flex;gap:7px">' + modeSel + '</div>' +

      '<div class="section-head"><h2>3 · 选择服务</h2></div>' +
      '<div class="option-grid">' + pkgSel + '</div>' +

      '<div class="section-head"><h2>4 · 选择时间（示例）</h2></div>' +
      '<div class="card"><div class="slot-grid">' + slotSel + '</div></div>' +

      '<div class="section-head"><h2>费用明细</h2></div>' +
      '<div class="card bill">' +
        '<div class="kv"><span class="k">服务</span><span class="v">' + esc(p.title) + '</span></div>' +
        '<div class="kv"><span class="k">咨询师</span><span class="v">' + esc(c.name) + '</span></div>' +
        '<div class="kv"><span class="k">方式</span><span class="v">' + esc(state.mode) + '</span></div>' +
        '<div class="kv"><span class="k">时间</span><span class="v">' + (slot ? esc(slot.day + ' ' + slot.time) : '未选择') + '</span></div>' +
        '<div class="divider"></div>' +
        '<div class="row-between"><span>合计</span><span class="total">' + yuan(p.price) + '</span></div>' +
      '</div>' +

      '<div class="notice"><span class="n-icon">!</span><div><b>支付通道尚未接入，本按钮不产生真实扣款。</b><br>' +
        '你已说明付费机制要对齐自研的《鬼影追追追》。目前这一层用的是「单次 / 3 次 / 6 次套餐」通用骨架，' +
        '等你给出那边的计费模型（按次解锁、充值、订阅或分账），我再替换。</div></div>' +
      nonMedicalNotice() +

      '<div class="cta-bar"><div class="price">' + yuan(p.price) + '<small> 演示价</small></div>' +
        '<button class="btn" data-act="pay-demo">确认并支付（演示）</button></div>' +
    '</section>';
  }

  /* ---------------- 视图：下单完成 ---------------- */
  function viewOrderDone() {
    const o = state.orders[state.orders.length - 1];
    if (!o) return '<section class="view"><div class="empty">还没有订单。</div></section>';
    return '<section class="view">' +
      '<div class="card center" style="padding:30px 20px">' +
        '<div style="width:64px;height:64px;margin:0 auto 14px;border-radius:50%;background:#EAF5EC;color:var(--ok);display:grid;place-items:center">' + ICON.check + '</div>' +
        '<h2 style="margin:0 0 6px;font-size:20px">预约已完成（演示）</h2>' +
        '<p class="small muted" style="margin:0">这是本地演示订单，没有发生真实扣款，也不会通知真人咨询师。</p></div>' +
      '<div class="card bill">' +
        '<div class="kv"><span class="k">订单号</span><span class="v">' + esc(o.no) + '</span></div>' +
        '<div class="kv"><span class="k">咨询师</span><span class="v">' + esc(o.counselorName) + '</span></div>' +
        '<div class="kv"><span class="k">主题</span><span class="v">' + esc(o.topicName) + '</span></div>' +
        '<div class="kv"><span class="k">方式</span><span class="v">' + esc(o.mode) + '</span></div>' +
        '<div class="kv"><span class="k">时间</span><span class="v">' + esc(o.slot) + '</span></div>' +
        '<div class="kv"><span class="k">金额</span><span class="v" style="color:var(--brand)">' + yuan(o.price) + '</span></div>' +
      '</div>' +
      crisisNotice() +
      '<button class="btn block" data-act="to-chat">进入咨询对话（演示）</button>' +
      '<button class="btn ghost block" data-act="tab" data-id="mine" style="margin-top:10px">查看我的订单</button>' +
    '</section>';
  }

  /* ---------------- 视图：会话列表 ---------------- */
  function viewSessions() {
    const has = state.orders.length > 0;
    const cards = state.orders.slice().reverse().map(o =>
      '<button class="order" data-act="to-chat" data-cid="' + esc(o.counselorId) + '" style="width:100%;text-align:left">' +
        '<div class="row-between"><span class="strong">' + esc(o.counselorName) + '</span>' +
        '<span class="status">演示已预约</span></div>' +
        '<div class="small muted" style="margin-top:6px">' + esc(o.topicName) + ' · ' + esc(o.mode) + ' · ' + esc(o.slot) + '</div>' +
        '<div class="row-between" style="margin-top:10px"><span class="tiny muted">订单 ' + esc(o.no) + '</span>' +
        '<span class="tiny" style="color:var(--brand)">进入对话 ›</span></div></button>').join('');

    return '<section class="view">' +
      '<div class="section-head" style="margin-top:2px"><h2>我的咨询</h2></div>' +
      '<div class="notice blue"><span class="n-icon">i</span><div>订单与聊天记录<b>只在当前页面内存中</b>，刷新即清空。' +
        '正式版需要接入账号、订单与消息服务端。</div></div>' +
      (has ? cards : '<div class="empty"><span class="e-icon">○</span>你还没有预约。<br>可以先选一个主题，找位咨询师试试。<br>' +
        '<button class="btn secondary sm" data-act="tab" data-id="explore" style="margin-top:16px">去找咨询师</button></div>') +
      '<div class="section-head"><h2>需要马上有人接住你？</h2></div>' + crisisNotice() +
    '</section>';
  }

  /* ---------------- 视图：咨询对话 ---------------- */
  function viewChat() {
    const c = counselorById(state.counselorId) || COUNSELORS[0];
    const bubbles = state.messages.map(m =>
      '<div class="bubble-row ' + (m.from === 'me' ? 'me' : '') + '">' +
        (m.from === 'them' ? avatar(c, '') : '') +
        '<div class="bubble">' + esc(m.text) + '<span class="time">' + esc(m.time) + '</span></div></div>').join('');

    return '<section class="view chat-wrap">' +
      '<div class="chat-top">' + avatar(c) +
        '<div style="flex:1"><div class="strong small">' + esc(c.name) + '</div>' +
        '<div class="tiny muted">演示场次 · 50 分钟 · 仅本机可见</div></div>' +
        '<button class="btn ghost sm" data-act="renew">追加时长</button></div>' +
      '<div class="notice blue"><span class="n-icon">i</span><div>这是<b>演示对话</b>。消息没有发送服务器，' +
        '也不会有真人回复；下面的示例回复会明确标注来源。</div></div>' +
      '<div class="chat-time">对话开始 · 演示</div>' +
      '<div class="bubbles" id="bubbles">' + bubbles + '</div>' +
      '<div class="composer"><input id="chatInput" type="text" maxlength="300" placeholder="写下你现在想说的（仅本机演示）" autocomplete="off">' +
        '<button class="send" data-act="send" aria-label="发送">›</button></div>' +
    '</section>';
  }

  /* ---------------- 视图：我的 ---------------- */
  function viewMine() {
    return '<section class="view">' +
      '<div class="profile"><span class="avatar" style="background:linear-gradient(145deg,#E9B98F,#B98257)">访</span>' +
        '<div style="flex:1"><div class="strong">演示访客</div>' +
        '<div class="small muted">账号体系未接入，暂无登录状态</div></div>' +
        '<span class="chip demo">原型</span></div>' +

      '<div class="list-group">' +
        '<button class="list-item" data-act="tab" data-id="sessions"><span class="li-icon">' + ICON.order + '</span>' +
          '<span class="li-body"><span class="li-title">我的订单</span><span class="li-desc">演示订单 ' + state.orders.length + ' 笔</span></span>' +
          (state.orders.length ? '<span class="badge-count">' + state.orders.length + '</span>' : '') + '<span class="li-arrow">›</span></button>' +
        '<button class="list-item" data-act="go-privacy"><span class="li-icon">' + ICON.lock + '</span>' +
          '<span class="li-body"><span class="li-title">隐私与同意</span><span class="li-desc">查看并撤回单独同意</span></span><span class="li-arrow">›</span></button>' +
        '<button class="list-item" data-act="go-about"><span class="li-icon">' + ICON.info + '</span>' +
          '<span class="li-body"><span class="li-title">关于与合规依据</span><span class="li-desc">服务边界与公开资料出处</span></span><span class="li-arrow">›</span></button>' +
      '</div>' +

      '<div class="section-head"><h2>紧急求助</h2></div>' +
      crisisNotice() +
      '<a class="btn secondary block" href="tel:12356">拨打 12356 心理援助热线</a>' +

      '<div class="section-head"><h2>原型说明</h2></div>' +
      '<div class="card tinted"><p class="small muted" style="margin:0;line-height:1.8">' +
        '本版本只包含来访者端的完整交互流程与咨询师端演示视图。' +
        '真人咨询师招募与核验、账号登录、消息服务端、支付通道、订单持久化都还没有接入。' +
        '付费机制将对齐《鬼影追追追》后替换。</p></div>' +
      '<p class="tiny muted center" style="margin:16px 0 2px">享爱密码 · 爱有其方，享爱所有</p>' +
    '</section>';
  }

  /* ---------------- 视图：隐私与同意 ---------------- */
  function viewPrivacy() {
    return '<section class="view">' +
      '<div class="card"><div class="strong" style="margin-bottom:8px">当前同意状态（本机演示）</div>' +
        '<div class="kv"><span class="k">服务条款与非医疗声明</span><span class="v">' + (state.consentDone ? '已同意' : '未同意') + '</span></div>' +
        '<div class="kv"><span class="k">敏感个人信息单独同意</span><span class="v">' + (state.consentDone ? '已同意' : '未同意') + '</span></div>' +
        '<p class="tiny muted" style="margin:10px 0 0">演示状态仅保存在本次浏览器会话，业务数据没有持久化。</p></div>' +

      '<div class="card"><div class="strong" style="margin-bottom:8px">我们计划怎么处理你的信息</div>' +
        '<p class="small muted" style="margin:0;line-height:1.8">咨询内容可能涉及医疗健康等敏感个人信息。' +
        '正式版需要：单独告知处理目的与必要性、取得你的单独同意、按最小范围收集、对聊天记录加密存储、' +
        '提供查询与删除入口，并支持你撤回同意。具体方案需要法务确认。</p></div>' +

      nonMedicalNotice() +
      '<button class="btn ghost block" data-act="withdraw">撤回同意并重新确认</button>' +
      '<div class="section-head"><h2>依据</h2></div>' +
      '<div class="card">' + REFS.slice(2, 3).map(r =>
        '<div class="ref"><span class="ref-t">' + esc(r.t) + '</span>' + esc(r.d) +
        '<a href="' + r.u + '" target="_blank" rel="noopener">查看原文</a></div>').join('') + '</div>' +
    '</section>';
  }

  /* ---------------- 视图：关于与合规依据 ---------------- */
  function viewAbout() {
    return '<section class="view">' +
      '<div class="card tinted center" style="padding:22px">' +
        '<img src="assets/logo-badge-320.png" alt="享爱密码徽章" style="width:96px;height:96px;margin:0 auto 10px;border-radius:50%">' +
        '<div class="strong" style="font-size:18px;letter-spacing:.08em">享爱密码</div>' +
        '<div class="small muted">爱有其方，享爱所有</div></div>' +

      '<div class="section-head"><h2>服务边界</h2></div>' +
      nonMedicalNotice() + crisisNotice() +

      '<div class="section-head"><h2>合规依据（公开资料）</h2></div>' +
      '<div class="card">' + REFS.map(r =>
        '<div class="ref"><span class="ref-t">' + esc(r.t) + '</span>' + esc(r.d) +
        '<a href="' + r.u + '" target="_blank" rel="noopener">查看原文</a></div>').join('') + '</div>' +
      '<p class="tiny muted" style="line-height:1.7">以上为公开资料摘录与产品侧理解，不构成法律意见。' +
        '正式上线前请由法务核对资质宣传、隐私政策、退款规则与危机处置流程。</p>' +

      '<div class="section-head"><h2>产品状态</h2></div>' +
      '<div class="card"><p class="small muted" style="margin:0;line-height:1.8">' +
        '这是交互原型。咨询师、价格、时段、订单与对话均为演示数据；' +
        '支付机制待对齐《鬼影追追追》的既有模型；PWA 已配置清单与离线缓存。</p></div>' +
    '</section>';
  }

  /* ---------------- 视图：咨询师工作台（演示） ---------------- */
  function viewDesk() {
    return '<section class="view">' +
      '<div class="notice"><span class="n-icon">!</span><div><b>这是咨询师端演示视图。</b>' +
        '真人咨询师、排班、结算与分账规则都还没有接入。</div></div>' +
      '<div class="card center" style="padding:22px"><div class="eyebrow">今日概览 · 演示</div>' +
        '<div class="row" style="justify-content:center;gap:26px;margin-top:12px">' +
          '<div><div style="font-size:24px;font-weight:800;color:var(--brand)">0</div><div class="tiny muted">待服务</div></div>' +
          '<div><div style="font-size:24px;font-weight:800;color:var(--brand)">0</div><div class="tiny muted">进行中</div></div>' +
          '<div><div style="font-size:24px;font-weight:800;color:var(--brand)">¥0</div><div class="tiny muted">待结算</div></div>' +
        '</div></div>' +
      '<div class="section-head"><h2>咨询师端要有的能力</h2></div>' +
      '<div class="card"><p class="small" style="margin:0;line-height:1.9">' +
        '1. 资质资料提交与平台人工核验<br>' +
        '2. 可约时段管理与接单开关<br>' +
        '3. 与来访者的一对一消息会话<br>' +
        '4. 咨询记录、续单与来访者备注<br>' +
        '5. 订单结算、分成与提现<br>' +
        '6. 危机识别与转介上报入口</p></div>' +
      '<div class="notice blue"><span class="n-icon">i</span><div>结算与分账需要对齐《鬼影追追追》的付费模型。' +
        '平台侧还需定义咨询师准入、服务规范、投诉与退款处理。</div></div>' +
      '<button class="btn block" data-act="switch-role">返回来访者视角</button>' +
    '</section>';
  }

  /* ---------------- 渲染入口 ---------------- */
  const VIEWS = {
    home: viewHome, topicIntro: viewTopicIntro, explore: viewExplore,
    counselor: viewCounselor, booking: viewBooking, orderDone: viewOrderDone,
    sessions: viewSessions, chat: viewChat, mine: viewMine,
    privacy: viewPrivacy, about: viewAbout, desk: viewDesk
  };
  function render() {
    renderHeader();
    renderTabs();
    main.innerHTML = (VIEWS[state.view] || viewHome)();
    if (state.view === 'chat') {
      const b = $('#bubbles');
      if (b) main.scrollTop = main.scrollHeight;
    }
  }

  /* ---------------- 同意弹层 ---------------- */
  let pendingAction = null;
  function consentSheetHTML() {
    const c = state.consent;
    return '<div class="modal-mask" data-act="consent-mask"><div class="sheet" data-stop="1">' +
      '<h2>开始之前，请先看三件事</h2>' +
      '<p class="sheet-lead">这几条决定了平台能帮你什么、不能帮你什么。</p>' +
      '<div class="consent-item ' + (c.service ? 'checked' : '') + '" data-act="toggle-consent" data-key="service">' +
        '<span class="box">' + (c.service ? '✓' : '') + '</span><div>' +
        '<div class="ci-title">我已了解服务边界与平台规则</div>' +
        '<div class="ci-desc">平台提供心理咨询与陪伴式对话，不提供精神障碍的诊断与治疗，' +
        '不承诺挽回关系、改变他人或达成特定结果。</div></div></div>' +
      '<div class="consent-item ' + (c.sensitive ? 'checked' : '') + '" data-act="toggle-consent" data-key="sensitive">' +
        '<span class="box">' + (c.sensitive ? '✓' : '') + '</span><div>' +
        '<div class="ci-title">我单独同意平台处理咨询相关的敏感信息</div>' +
        '<div class="ci-desc">咨询内容可能涉及医疗健康等敏感个人信息。' +
        '平台仅在提供服务的必要范围内处理，你可以随时撤回同意。' +
        '这一项与上一项分开征求，不捆绑。</div></div></div>' +
      crisisNotice() +
      '<button class="btn block" data-act="consent-confirm" ' +
        (c.service && c.sensitive ? '' : 'disabled') + '>同意并继续</button>' +
      '<button class="btn ghost block sm" data-act="consent-later" style="margin-top:9px">先随便看看</button>' +
      '</div></div>';
  }
  function openConsent(next) {
    pendingAction = next || null;
    modalRoot.innerHTML = consentSheetHTML();
  }
  function closeConsent() { modalRoot.innerHTML = ''; }

  /* ---------------- 事件 ---------------- */
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-act]');
    if (!el) return;
    const act = el.dataset.act;
    const id = el.dataset.id;

    switch (act) {
      case 'tab': switchTab(id); break;
      case 'back': back(); break;
      case 'go-about': go('about'); break;
      case 'go-privacy': go('privacy'); break;

      case 'switch-role':
        if (state.role === 'visitor') { state.role = 'counselor'; state.stack = []; state.view = 'desk'; }
        else { state.role = 'visitor'; state.stack = []; state.view = 'home'; }
        render(); main.scrollTop = 0;
        toast(state.role === 'counselor' ? '已切换到咨询师演示视角' : '已返回来访者视角');
        break;

      case 'open-topic':
        go('topicIntro', { topicId: id, filterTopic: id === 'any' ? 'all' : id });
        break;

      case 'to-list':
        state.stack = [];
        state.view = 'explore';
        render(); main.scrollTop = 0;
        break;

      case 'filter-topic': state.filterTopic = id; render(); break;
      case 'filter-mode': state.filterMode = id; render(); break;
      case 'open-counselor': go('counselor', { counselorId: id }); break;

      case 'pick-topic': state.topicId = id; render(); break;
      case 'pick-mode': state.mode = id; render(); break;
      case 'pick-pkg': state.pkgId = id; render(); break;
      case 'pick-slot': state.slotIndex = Number(el.dataset.i); render(); break;

      case 'to-booking':
        requireConsent(() => {
          const c = counselorById(state.counselorId) || COUNSELORS[0];
          const preferred = (state.topicId && (c.topics.indexOf(state.topicId) >= 0 || state.topicId === 'any'))
            ? state.topicId : (c.topics[0] || 'any');
          go('booking', { topicId: preferred, mode: c.modes[0], pkgId: 'single', slotIndex: -1 });
        });
        break;

      case 'pay-demo': {
        if (state.slotIndex < 0) { toast('请先选择一个可约时间（演示）'); return; }
        const c = counselorById(state.counselorId) || COUNSELORS[0];
        const p = pkgById(state.pkgId);
        const s = SLOTS[state.slotIndex];
        state.orders.push({
          no: 'XA' + String(Date.now()).slice(-8),
          counselorId: c.id,
          counselorName: c.name,
          topicName: TOPIC_NAME[state.topicId] || '初次梳理',
          mode: state.mode,
          slot: s.day + ' ' + s.time,
          price: p.price,
          pkg: p.title
        });
        go('orderDone');
        toast('已生成演示订单，未发生真实扣款');
        break;
      }

      case 'to-chat': {
        const cid = el.dataset.cid;
        requireConsent(() => go('chat', cid ? { counselorId: cid } : {}));
        break;
      }

      case 'send': {
        const input = $('#chatInput');
        if (!input) return;
        const text = input.value.trim();
        if (!text) { toast('先写点什么吧'); return; }
        state.messages.push({ from: 'me', text: text, time: '本机' });
        state.messages.push({ from: 'them', text: '（演示自动回复，非真人）已收到你的消息。正式版这里会由真人咨询师回复。', time: '演示' });
        render();
        toast('消息仅保存在本机内存，未发送服务器');
        break;
      }

      case 'renew': toast('追加时长需要接入支付通道，当前为演示'); break;

      case 'withdraw':
        state.consent = { service: false, sensitive: false };
        state.consentDone = false;
        try { sessionStorage.removeItem('xam_consent'); } catch (err) { /* 忽略 */ }
        toast('已撤回同意，下次预约时会重新征求');
        render();
        break;

      case 'toggle-consent': {
        const k = el.dataset.key;
        state.consent[k] = !state.consent[k];
        modalRoot.innerHTML = consentSheetHTML();
        break;
      }
      case 'consent-confirm':
        if (!state.consent.service || !state.consent.sensitive) return;
        state.consentDone = true;
        try { sessionStorage.setItem('xam_consent', '1'); } catch (err) { /* 忽略 */ }
        closeConsent();
        if (pendingAction) { const fn = pendingAction; pendingAction = null; fn(); }
        else render();
        break;
      case 'consent-later': closeConsent(); pendingAction = null; break;
      case 'consent-mask':
        if (e.target === el) { closeConsent(); pendingAction = null; }
        break;
      default: break;
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && document.activeElement && document.activeElement.id === 'chatInput') {
      const btn = document.querySelector('[data-act="send"]');
      if (btn) btn.click();
    }
  });

  /* ---------------- 启动 ---------------- */
  function boot() {
    let agreed = false;
    try { agreed = sessionStorage.getItem('xam_consent') === '1'; } catch (err) { agreed = false; }
    state.consentDone = agreed;
    if (agreed) { state.consent.service = true; state.consent.sensitive = true; }

    const h = location.hash.replace('#', '');
    if (TAB_VIEWS.indexOf(h) >= 0) state.view = h;
    render();
    if (!agreed) setTimeout(() => openConsent(), 420);

    if ('serviceWorker' in navigator && location.protocol.indexOf('http') === 0) {
      navigator.serviceWorker.register('sw.js').catch(() => { /* 离线能力不可用时静默跳过 */ });
    }
  }

  let deferredPrompt = null;
  const installFab = $('#installFab');
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installFab.hidden = false;
  });
  installFab.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    installFab.hidden = true;
  });
  window.addEventListener('appinstalled', () => { installFab.hidden = true; toast('享爱密码已添加到主屏幕'); });
  window.addEventListener('hashchange', () => {
    const h = location.hash.replace('#', '');
    if (TAB_VIEWS.indexOf(h) >= 0 && state.view !== h) switchTab(h);
  });

  boot();
})();
