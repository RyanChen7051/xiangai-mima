/* 享爱密码 · 云端版应用
   账号、订单、会话、消息、咨询师授权码全部走托管云服务，RLS 负责权限隔离。
   真实收款通道尚未接入：订单只有服务端确认支付后才会生成会话，前端无权改写订单状态。 */
(function () {
  'use strict';

  if (!window.WorkBuddyCloud || !window.XAM_PUBLIC_CONFIG) {
    document.getElementById('appMain').innerHTML =
      '<div class="card"><h2>云服务组件未能加载</h2><p class="small muted">请检查网络后刷新。本版本需要加载 WorkBuddy 云服务 SDK，离线时无法读取订单与会话。</p></div>';
    return;
  }

  const cfg = window.XAM_PUBLIC_CONFIG;
  const cloud = WorkBuddyCloud.createWorkBuddyCloud({
    endpoint: cfg.endpoint,
    oauthRelayBaseUrl: cfg.oauthRelayBaseUrl,
    publishableKey: cfg.publishableKey
  });

  /* ---- 镜像站（GitHub Pages）----
     云端服务按 Origin 精确匹配：只有官方发布域名与本地开发能调用账号/数据库。
     镜像站保留完整浏览体验（演示目录 + 合规中心），涉及账号与交易的动作统一引导到官方网址。 */
  const OFFICIAL_URL = 'https://xiangai-mima.app.workbuddy.host/?sharecode=TLF2EWSPYX';
  const CLOUD_ORIGIN = new URL(cfg.endpoint).origin;
  const IS_LOCAL = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  const IS_MIRROR = !IS_LOCAL && location.origin !== CLOUD_ORIGIN;
  const MIRROR_BLOCKED = ['go-login', 'go-desk', 'go-ops', 'to-booking', 'create-order',
    'enter-chat', 'open-conv', 'refresh', 'refresh-chat', 'send', 'send-otp',
    'verify-otp', 'redeem-code', 'confirm-payment', 'signout', 'withdraw'];
  const MIRROR_COUNSELORS = [
    { id: 1, slug: 'c1', display_name: '示例咨询师 · 林', initials: '林', tint: 'linear-gradient(145deg,#F0A468,#C85E27)', topics: ['couple','trust'], modes: ['文字','语音','视频'], price_cents: 19900, intro: '演示资料：擅长把卡住的对话拆成可以慢慢说的小段落。', tags: ['伴侣沟通','关系与信任','冲突降温'], verified: false },
    { id: 2, slug: 'c2', display_name: '示例咨询师 · 周', initials: '周', tint: 'linear-gradient(145deg,#E9B27E,#B8703C)', topics: ['couple','parent'], modes: ['文字','视频'], price_cents: 23900, intro: '演示资料：关注家庭里的角色分工与情绪传递。', tags: ['伴侣沟通','亲子沟通','家庭系统'], verified: false },
    { id: 3, slug: 'c3', display_name: '示例咨询师 · 沈', initials: '沈', tint: 'linear-gradient(145deg,#EDAF86,#A95C3A)', topics: ['parent','elder'], modes: ['文字','语音'], price_cents: 17900, intro: '演示资料：关注代际之间的表达差异与照护压力。', tags: ['亲子沟通','长辈心理','照护压力'], verified: false },
    { id: 4, slug: 'c4', display_name: '示例咨询师 · 许', initials: '许', tint: 'linear-gradient(145deg,#F2A97A,#C2522F)', topics: ['trust','couple'], modes: ['文字','语音','视频'], price_cents: 26900, intro: '演示资料：处理信任破裂后的边界、选择与去留议题。', tags: ['关系与信任','边界设定','决策梳理'], verified: false },
    { id: 5, slug: 'c5', display_name: '示例咨询师 · 陈', initials: '陈', tint: 'linear-gradient(145deg,#E7B485,#976A45)', topics: ['elder','any'], modes: ['语音','视频'], price_cents: 18900, intro: '演示资料：关注失落感、孤独与自我价值。', tags: ['长辈心理','初次梳理','情绪陪伴'], verified: false },
    { id: 6, slug: 'c6', display_name: '示例咨询师 · 何', initials: '何', tint: 'linear-gradient(145deg,#EFA377,#B74E2C)', topics: ['any','trust','parent'], modes: ['文字','语音'], price_cents: 15900, intro: '演示资料：第一次咨询常用，帮来访者把问题说清楚。', tags: ['初次梳理','关系与信任','亲子沟通'], verified: false }
  ];
  const MIRROR_PLANS = [
    { plan_id: 'single', model: 'per_session', title: '单次咨询 · 50 分钟', description: '先聊一次，看看是否合适', sessions: 1, amount_cents: 19900, currency: 'CNY', active: true, source_note: '默认假设：按次付费解锁一次对话，待与《鬼影追追追》计费模型对齐' },
    { plan_id: 'three', model: 'package', title: '3 次陪伴套餐', description: '适合需要连续梳理的议题', sessions: 3, amount_cents: 53900, currency: 'CNY', active: true, source_note: '默认假设：套餐，待与《鬼影追追追》计费模型对齐' },
    { plan_id: 'six', model: 'package', title: '6 次深入套餐', description: '适合关系重建类长期议题', sessions: 6, amount_cents: 99900, currency: 'CNY', active: true, source_note: '默认假设：套餐，待与《鬼影追追追》计费模型对齐' }
  ];

  const svg = (d) => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>';
  const ICON = {
    home: svg('<path d="M3 10.6 12 3.2l9 7.4"/><path d="M5.6 9.4V20h12.8V9.4"/><path d="M10 20v-5.4h4V20"/>'),
    explore: svg('<circle cx="10.6" cy="10.6" r="6.6"/><path d="m15.6 15.6 5 5"/>'),
    chat: svg('<path d="M4 5.2h16v11.2H9.4L4 20.4V5.2Z"/><path d="M8 9.4h8M8 12.8h5"/>'),
    mine: svg('<circle cx="12" cy="8.2" r="3.5"/><path d="M4.8 20c1-3.8 3.9-5.8 7.2-5.8s6.2 2 7.2 5.8"/>'),
    shield: svg('<path d="M12 3 4.5 6v6c0 4.4 3 7.7 7.5 9 4.5-1.3 7.5-4.6 7.5-9V6L12 3Z"/>'),
    doc: svg('<path d="M6 3h8l4 4v14H6V3Z"/><path d="M14 3v4h4"/><path d="M9 12h6M9 16h6"/>'),
    lock: svg('<rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>'),
    users: svg('<circle cx="9" cy="8" r="3"/><path d="M3 19c.7-3.4 3-5 6-5s5.3 1.6 6 5"/><path d="M16 5.5a3 3 0 0 1 0 5.5M18 14c2 .7 3 2.4 3 5"/>'),
    check: svg('<path d="m5 12 4.5 4.5L19 7"/>')
  };

  const TOPICS = [
    { id: 'couple', mark: '伴', name: '伴侣沟通', desc: '说不清、说不动、一开口就吵', tint: '#E98A45' },
    { id: 'parent', mark: '亲', name: '亲子沟通', desc: '孩子不听、父母不懂、越说越远', tint: '#D89A55' },
    { id: 'elder', mark: '长', name: '长辈心理', desc: '退休、孤独、被需要与代际关系', tint: '#C98E6A' },
    { id: 'trust', mark: '信', name: '关系与信任', desc: '第三者、边界、重建或者告别', tint: '#C56A3C' },
    { id: 'any', mark: '?', name: '我还说不清', desc: '先做一次梳理，再决定往哪走', tint: '#B99A7E', wide: true }
  ];
  const TOPIC_NAME = Object.fromEntries(TOPICS.map(t => [t.id, t.name]));
  const MODES = ['文字', '语音', '视频'];
  const WEEK = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

  function buildSlots() {
    const out = [];
    const now = new Date();
    for (let d = 1; d <= 3; d++) {
      const dt = new Date(now.getFullYear(), now.getMonth(), now.getDate() + d);
      const label = (dt.getMonth() + 1) + '月' + dt.getDate() + '日 ' + WEEK[dt.getDay()];
      ['10:00', '14:30', '19:30'].forEach((hm, i) => out.push({ day: label, time: hm, disabled: d === 1 && i === 0 }));
    }
    return out;
  }
  const SLOTS = buildSlots();

  const TAB_VIEWS = ['home', 'explore', 'sessions', 'mine'];
  const DEEP_VIEWS = ['compliance', 'privacy', 'about', 'desk', 'ops', 'login'];
  const TABS = [
    { id: 'home', label: '首页', icon: ICON.home },
    { id: 'explore', label: '找咨询师', icon: ICON.explore },
    { id: 'sessions', label: '我的咨询', icon: ICON.chat },
    { id: 'mine', label: '我的', icon: ICON.mine }
  ];

  const S = {
    view: 'home', stack: [], session: null, user: null, uid: '',
    loading: false, error: '', notice: '',
    counselors: [], plans: [], orders: [], conversations: [], staff: [],
    messages: [], activeConv: null,
    filterTopic: 'all', filterMode: 'all',
    topicId: null, counselorId: null, planId: 'single', mode: '文字', slotIndex: -1,
    consent: { service: false, sensitive: false }, consentDone: false,
    loginTab: 'phone', pendingOtp: null, form: {}, pendingAction: null,
    lastOrderNo: '', catalogLoaded: false
  };

  const $ = (s) => document.querySelector(s);
  const main = $('#appMain');
  const header = $('#appHeader');
  const tabbar = $('#tabbar');
  const modalRoot = $('#modalRoot');
  const device = $('#device');
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = (cents) => '¥' + (Number(cents || 0) / 100).toFixed(0);
  const counselorById = (id) => S.counselors.find(c => String(c.id) === String(id));
  const planById = (id) => S.plans.find(p => p.plan_id === id);
  const myCounselorIds = () => S.staff.map(s => String(s.counselor_id));
  const isCounselor = () => S.staff.length > 0;
  const roleFor = (conv) => {
    if (S.uid && conv.visitor_id === S.uid) return 'visitor';
    return myCounselorIds().indexOf(String(conv.counselor_id)) >= 0 ? 'counselor' : 'visitor';
  };

  function officialSheet() {
    modalRoot.innerHTML =
      '<div class="modal-mask" data-act="official-close"><div class="sheet official-sheet" data-stop="1">' +
      '<h2>这项功能请在官方网址使用</h2>' +
      '<p class="sheet-lead">当前打开的是 GitHub Pages 镜像站。</p>' +
      '<p class="small muted">云端账号、订单和咨询对话按来源域名做精确校验，因此只在官方网址开放。镜像站可以完整浏览主题、咨询师资料与合规中心。</p>' +
      crisisNotice() +
      '<a class="btn block" href="' + OFFICIAL_URL + '">打开完整版</a>' +
      '<button class="btn ghost block sm" data-act="official-close">继续浏览镜像站</button>' +
      '</div></div>';
  }
  function showMirrorBanner() {
    const r = $('#demoRibbon');
    if (!r) return;
    r.innerHTML = '<span class="demo-dot"></span>' +
      '<span>镜像站 · 账号与咨询请用官方网址</span>' +
      '<a class="mirror-link" href="' + OFFICIAL_URL + '">完整版 →</a>';
  }

  function toast(msg) {
    const el = $('#toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(S.toastTimer);
    S.toastTimer = setTimeout(() => el.classList.remove('show'), 3000);
  }
  function setError(msg) { S.error = msg || ''; render(); }
  function avatar(c, cls) {
    const tint = c && c.tint ? c.tint : 'linear-gradient(145deg,#E9B98F,#B98257)';
    const initial = c && c.initials ? c.initials : '访';
    return '<span class="avatar ' + (cls || '') + '" style="background:' + esc(tint) + '">' + esc(initial) + '</span>';
  }
  function demoTag() { return '<span class="chip demo">演示资料</span>'; }
  function crisisNotice() {
    return '<div class="notice"><span class="n-icon">!</span><div><b>如果你或身边的人正处在危险中，请优先求助。</b><br>' +
      '全国心理援助热线 <a href="tel:12356">12356</a>；紧急情况请拨打 110 或 120。本平台不提供危机干预与精神障碍的诊断、治疗。</div></div>';
  }
  function nonMedicalNotice() {
    return '<div class="notice blue"><span class="n-icon">i</span><div>本平台提供的是心理咨询与陪伴式对话，' +
      '<b>不提供精神障碍的诊断与治疗</b>，也不承诺挽回关系、改变他人或达成特定结果。</div></div>';
  }
  function paymentNotice() {
    return '<div class="notice"><span class="n-icon">!</span><div><b>真实收款通道尚未接入。</b><br>' +
      '托管后端提供数据库、账号与消息能力，但不提供支付。订单创建后处于「待支付」，' +
      '需由运营用核销码确认（模拟支付回调）；确认后系统才生成会话并解锁聊天。前端无权改写订单状态。</div></div>';
  }

  /* ---------------- 导航 ---------------- */
  function go(view, patch) {
    if (S.view !== view) S.stack.push(S.view);
    S.view = view;
    if (patch) Object.assign(S, patch);
    render();
    main.scrollTop = 0;
  }
  function switchTab(view) {
    S.stack = []; S.view = view;
    if (view === 'explore') { S.filterTopic = 'all'; S.filterMode = 'all'; }
    try { history.replaceState(null, '', '#' + view); } catch (e) { /* 忽略 */ }
    render(); main.scrollTop = 0;
  }
  function back() { S.view = S.stack.pop() || 'home'; render(); main.scrollTop = 0; }

  async function requireLogin(next) {
    const { data: session } = await cloud.auth.getSession();
    if (!session) { S.pendingAction = next || null; go('login'); return false; }
    S.session = session; S.user = session.user || {}; S.uid = S.user.id || S.user.sub || '';
    if (next) next();
    return true;
  }
  function requireConsent(next) {
    if (S.consentDone) { next(); return; }
    S.pendingAction = next;
    modalRoot.innerHTML = consentSheetHTML();
  }

  /* ---------------- 数据 ---------------- */
  async function loadCatalog() {
    const a = await cloud.database.from('counselors').select('*').eq('active', true).order('id', { ascending: true });
    const b = await cloud.database.from('billing_plans').select('*').eq('active', true).order('amount_cents', { ascending: true });
    if (a.error) throw new Error('咨询师目录读取失败：' + a.error.message);
    if (b.error) throw new Error('计费方案读取失败：' + b.error.message);
    S.counselors = a.data || [];
    S.plans = b.data || [];
    if (!planById(S.planId) && S.plans.length) S.planId = S.plans[0].plan_id;
    S.catalogLoaded = true;
  }
  async function loadMyData() {
    if (!S.session) { S.orders = []; S.conversations = []; S.staff = []; return; }
    const [o, c, s] = await Promise.all([
      cloud.database.from('orders').select('*').order('created_at', { ascending: false }).limit(50),
      cloud.database.from('conversations').select('*').order('created_at', { ascending: false }).limit(50),
      cloud.database.from('counselor_staff').select('*')
    ]);
    S.orders = o.error ? [] : (o.data || []);
    S.conversations = c.error ? [] : (c.data || []);
    S.staff = s.error ? [] : (s.data || []);
  }
  async function loadMessages(convId) {
    const { data, error } = await cloud.database.from('messages')
      .select('*').eq('conversation_id', convId).order('created_at', { ascending: true }).limit(200);
    if (!error) S.messages = data || [];
  }

  /* ---------------- 顶栏 / 底栏 ---------------- */
  function renderHeader() {
    const v = S.view;
    const isTab = TAB_VIEWS.indexOf(v) >= 0;
    const titles = {
      login: '登录 / 注册', counselor: '咨询师主页', booking: '预约咨询', orderDone: '订单状态',
      chat: '咨询对话', about: '关于', privacy: '隐私与同意', desk: '咨询师后台',
      ops: '运营核销', compliance: '合规中心', topicIntro: '关于这个主题'
    };
    if (isTab) {
      header.innerHTML =
        '<div class="hd-brand"><img src="assets/logo-badge-640.png" alt="享爱密码徽章">' +
        '<div><div class="hd-title">享爱密码</div><div class="hd-sub">爱有其方，享爱所有</div></div></div>' +
        '<span class="hd-spacer"></span>' +
        '<button class="hd-action" data-act="go-desk">' + (isCounselor() ? '咨询师后台' : '咨询师入口') + '</button>';
    } else {
      header.innerHTML =
        '<button class="hd-back" data-act="back" aria-label="返回">‹</button>' +
        '<div class="hd-title">' + esc(titles[v] || '享爱密码') + '</div>' +
        '<span class="hd-spacer"></span>' +
        '<button class="hd-action" data-act="go-compliance">合规中心</button>';
    }
  }
  function renderTabs() {
    const show = TAB_VIEWS.indexOf(S.view) >= 0;
    tabbar.style.display = show ? 'flex' : 'none';
    device.classList.toggle('no-tabs', !show);
    main.style.paddingBottom = show ? '' : '24px';
    if (!show) return;
    tabbar.innerHTML = TABS.map(t =>
      '<button class="tab ' + (S.view === t.id ? 'active' : '') + '" data-act="tab" data-id="' + t.id + '">' +
      '<span class="tab-icon">' + t.icon + '</span><span>' + t.label + '</span></button>').join('');
  }

  /* ---------------- 视图 ---------------- */
  function viewHome() {
    const topics = TOPICS.map(t =>
      '<button class="topic ' + (t.wide ? 'wide' : '') + '" data-act="open-topic" data-id="' + t.id + '">' +
      '<span class="t-icon" style="background:' + t.tint + '">' + esc(t.mark) + '</span>' +
      '<span class="t-body"><span class="t-name">' + esc(t.name) + '</span>' +
      '<span class="t-desc">' + esc(t.desc) + '</span></span></button>').join('');
    return '<section class="view">' +
      '<div class="hero"><img class="hero-logo" src="assets/logo-badge-640.png" alt="享爱密码圆形徽章">' +
      '<h1>享爱密码</h1><p class="slogan">爱有其方，享爱所有</p>' +
      '<p class="lead">有些话，在家里说不出口。你可以先从这里开始，慢慢说给我们听。</p></div>' +
      '<div class="section-head"><h2>现在，你最想聊的是？</h2></div><div class="topic-grid">' + topics + '</div>' +
      '<div class="section-head"><h2>怎么开始</h2></div><div class="steps">' +
      '<div class="step"><span class="s-num">1</span><span class="s-txt">选主题与咨询师</span></div>' +
      '<div class="step"><span class="s-num">2</span><span class="s-txt">登录并下单</span></div>' +
      '<div class="step"><span class="s-num">3</span><span class="s-txt">支付确认解锁</span></div>' +
      '<div class="step"><span class="s-num">4</span><span class="s-txt">与咨询师对话</span></div></div>' +
      '<div class="section-head"><h2>开始之前</h2></div>' + nonMedicalNotice() + crisisNotice() +
      '<div class="card tinted"><div class="row"><span class="li-icon">' + ICON.shield + '</span>' +
      '<div class="li-body"><div class="li-title">咨询内容按敏感信息对待</div>' +
      '<div class="li-desc">平台单独征求同意，你随时可以撤回。</div></div></div>' +
      '<button class="btn ghost block sm" data-act="go-privacy" style="margin-top:12px">查看隐私与同意设置</button></div>' +
      '<p class="tiny muted center" style="margin:18px 0 4px">云端版 · 咨询师资料为演示数据，真人待接入</p></section>';
  }

  function viewTopicIntro() {
    const t = TOPICS.find(x => x.id === S.topicId) || TOPICS[0];
    const extra = t.id === 'trust'
      ? '<div class="notice green"><span class="n-icon">i</span><div>这个主题<b>不预设第三者的性别，也不预设关系的形式</b>。无论发生在异性伴侣、同性伴侣或其他关系结构里，你都可以谈。平台只提供对话与梳理，不做评判，也不替你做决定。</div></div>' : '';
    return '<section class="view"><div class="card tinted center" style="padding:24px 18px">' +
      '<span class="t-icon" style="background:' + t.tint + ';margin:0 auto 12px">' + esc(t.mark) + '</span>' +
      '<h2 style="margin:0 0 6px;font-size:20px">' + esc(t.name) + '</h2>' +
      '<p class="small muted" style="margin:0">' + esc(t.desc) + '</p></div>' + extra +
      '<div class="card"><div class="strong" style="margin-bottom:8px">你可以聊些什么</div>' +
      '<p class="small muted" style="margin:0">你可以讲一件最近发生的事，也可以只讲一种说不清楚的感觉。咨询师会陪你把问题拆开，不会要求你立刻给出结论，也不会替你判断谁对谁错。</p></div>' +
      nonMedicalNotice() + '<button class="btn block" data-act="to-list">看看可预约的咨询师</button></section>';
  }

  function counselorCard(c) {
    const tags = (c.tags || []).slice(0, 3).map(t => '<span class="chip ghost">' + esc(t) + '</span>').join('');
    return '<button class="counselor" data-act="open-counselor" data-id="' + c.id + '">' + avatar(c) +
      '<div class="c-main"><div class="c-name">' + esc(c.display_name) + demoTag() + '</div>' +
      '<div class="c-line">' + esc(c.intro || '') + '</div><div class="c-tags">' + tags + '</div>' +
      '<div class="c-line small muted" style="margin-top:8px">' + (c.modes || []).join(' / ') + ' 可约</div></div>' +
      '<div class="c-price"><div class="p">' + money(c.price_cents) + '</div><div class="u">每次起</div></div></button>';
  }
  function viewExplore() {
    const topicChips = [{ id: 'all', name: '全部主题' }].concat(TOPICS.filter(t => t.id !== 'any'))
      .map(t => '<button class="chip selectable ' + (S.filterTopic === t.id ? 'selected' : '') +
        '" data-act="filter-topic" data-id="' + t.id + '">' + esc(t.name) + '</button>').join('');
    const modeChips = [{ id: 'all', name: '不限方式' }].concat(MODES.map(m => ({ id: m, name: m })))
      .map(m => '<button class="chip selectable ' + (S.filterMode === m.id ? 'selected' : '') +
        '" data-act="filter-mode" data-id="' + esc(m.id) + '">' + esc(m.name) + '</button>').join('');
    const list = S.counselors.filter(c => {
      const byTopic = S.filterTopic === 'all' || (c.topics || []).indexOf(S.filterTopic) >= 0;
      const byMode = S.filterMode === 'all' || (c.modes || []).indexOf(S.filterMode) >= 0;
      return byTopic && byMode;
    });
    return '<section class="view"><div class="section-head" style="margin-top:2px"><h2>找一位合适的人</h2>' +
      '<span class="small muted">' + list.length + ' 位</span></div>' +
      '<div class="filter-bar">' + topicChips + '</div><div class="filter-bar">' + modeChips + '</div>' +
      '<div class="notice"><span class="n-icon">!</span><div>下面每一位都是<b>示例资料</b>。真人咨询师由运营方招募并人工核验后接入，本平台不宣称任何「国家认证」资质。</div></div>' +
      (list.length ? list.map(counselorCard).join('') : '<div class="empty"><span class="e-icon">○</span>当前筛选下没有咨询师，换个条件试试。</div>') +
      '<div class="card tinted"><div class="strong" style="margin-bottom:6px">关于咨询师核验（规则占位）</div>' +
      '<p class="small muted" style="margin:0">2017 年起国家已取消心理咨询师职业资格认证。平台拟公示每位咨询师的学历、系统受训、督导时数与伦理承诺，由运营方人工核验；具体标准待确认。</p></div></section>';
  }

  function viewCounselor() {
    const c = counselorById(S.counselorId) || S.counselors[0];
    if (!c) return '<section class="view"><div class="empty">目录尚未加载，请下拉刷新或稍后重试。</div></section>';
    const topics = (c.topics || []).map(t => '<span class="chip">' + esc(TOPIC_NAME[t] || t) + '</span>').join(' ');
    return '<section class="view"><div class="card"><div class="detail-hero">' + avatar(c) +
      '<div><div class="c-name">' + esc(c.display_name) + demoTag() + '</div>' +
      '<div class="small muted" style="margin-top:4px">' + esc(c.intro || '') + '</div></div></div>' +
      '<div class="divider"></div><div class="wrap" style="display:flex;gap:6px">' + topics + '</div><div class="divider"></div>' +
      '<div class="kv"><span class="k">服务方式</span><span class="v">' + (c.modes || []).join(' / ') + '</span></div>' +
      '<div class="kv"><span class="k">单次时长</span><span class="v">50 分钟（演示）</span></div>' +
      '<div class="kv"><span class="k">单次价格</span><span class="v" style="color:var(--brand)">' + money(c.price_cents) + '</span></div></div>' +
      '<div class="section-head"><h2>擅长方向</h2></div><div class="card"><p class="small" style="margin:0;line-height:1.8">' +
      (c.tags || []).map(esc).join('、') + '。以上为演示标签，真人咨询师的擅长方向以核验后的资料为准。</p></div>' +
      '<div class="section-head"><h2>资质与边界</h2></div><div class="card tinted">' +
      '<p class="small muted" style="margin:0 0 8px">国家已取消心理咨询师职业资格认证，平台不会用「国家认证」作为宣传口径。真人咨询师的受训背景与督导时数由运营方人工核验后公示。</p>' +
      nonMedicalNotice() + '</div>' +
      '<div class="cta-bar"><div class="price">' + money(c.price_cents) + '<small> / 次起</small></div>' +
      '<button class="btn" data-act="to-booking">预约咨询</button></div></section>';
  }

  function viewBooking() {
    const c = counselorById(S.counselorId) || S.counselors[0];
    if (!c || !S.plans.length) return '<section class="view"><div class="empty">目录或计费方案尚未加载。</div></section>';
    const topicSel = TOPICS.filter(t => (c.topics || []).indexOf(t.id) >= 0 || t.id === 'any')
      .map(t => '<button class="chip selectable ' + (S.topicId === t.id ? 'selected' : '') +
        '" data-act="pick-topic" data-id="' + t.id + '">' + esc(t.name) + '</button>').join('');
    const modeSel = (c.modes || []).map(m => '<button class="chip selectable ' + (S.mode === m ? 'selected' : '') +
      '" data-act="pick-mode" data-id="' + esc(m) + '">' + esc(m) + '</button>').join('');
    const pkgSel = S.plans.map(p =>
      '<button class="option ' + (S.planId === p.plan_id ? 'selected' : '') + '" data-act="pick-pkg" data-id="' + esc(p.plan_id) + '">' +
      '<span class="radio"></span><span style="flex:1"><span class="o-title">' + esc(p.title) + '</span>' +
      '<span class="o-desc">' + esc(p.description || '') + ' · ' + p.sessions + ' 次 · 规则来源：' + esc(p.source_note || '未标注') + '</span></span>' +
      '<span class="o-price">' + money(p.amount_cents) + '</span></button>').join('');
    const slotSel = SLOTS.map((s, i) =>
      '<button class="slot ' + (S.slotIndex === i ? 'selected' : '') + ' ' + (s.disabled ? 'disabled' : '') + '" ' +
      (s.disabled ? 'disabled' : '') + ' data-act="pick-slot" data-i="' + i + '">' + esc(s.day) + '<br>' + s.time + '</button>').join('');
    const p = planById(S.planId) || S.plans[0];
    const slot = S.slotIndex >= 0 ? SLOTS[S.slotIndex] : null;
    return '<section class="view"><div class="card"><div class="detail-hero">' + avatar(c) +
      '<div><div class="c-name">' + esc(c.display_name) + demoTag() + '</div>' +
      '<div class="small muted" style="margin-top:4px">' + (c.modes || []).join(' / ') + ' 可约</div></div></div></div>' +
      '<div class="section-head"><h2>1 · 这次想聊的主题</h2></div><div class="wrap" style="display:flex;gap:7px">' + topicSel + '</div>' +
      '<div class="section-head"><h2>2 · 沟通方式</h2></div><div class="wrap" style="display:flex;gap:7px">' + modeSel + '</div>' +
      '<div class="section-head"><h2>3 · 选择服务</h2></div><div class="option-grid">' + pkgSel + '</div>' +
      '<div class="notice blue"><span class="n-icon">i</span><div>计费规则由数据库配置，目前是<b>默认假设（按次 / 套餐）</b>。你说明要对齐自研的《鬼影追追追》，具体规则给我后只需改数据，不用改代码。</div></div>' +
      '<div class="section-head"><h2>4 · 选择时间</h2></div><div class="card"><div class="slot-grid">' + slotSel + '</div></div>' +
      '<div class="section-head"><h2>费用明细</h2></div><div class="card bill">' +
      '<div class="kv"><span class="k">服务</span><span class="v">' + esc(p.title) + '</span></div>' +
      '<div class="kv"><span class="k">咨询师</span><span class="v">' + esc(c.display_name) + '</span></div>' +
      '<div class="kv"><span class="k">方式</span><span class="v">' + esc(S.mode) + '</span></div>' +
      '<div class="kv"><span class="k">时间</span><span class="v">' + (slot ? esc(slot.day + ' ' + slot.time) : '未选择') + '</span></div>' +
      '<div class="divider"></div><div class="row-between"><span>合计</span><span class="total">' + money(p.amount_cents) + '</span></div></div>' +
      paymentNotice() + nonMedicalNotice() +
      '<div class="cta-bar"><div class="price">' + money(p.amount_cents) + '<small> 待支付</small></div>' +
      '<button class="btn" data-act="create-order">登录并创建订单</button></div></section>';
  }

  function viewOrderDone() {
    const o = S.orders.find(x => x.order_no === S.lastOrderNo) || S.orders[S.orders.length - 1];
    if (!o) return '<section class="view"><div class="empty">没有找到订单。</div></section>';
    const paid = o.status === 'paid';
    return '<section class="view"><div class="card center" style="padding:30px 20px">' +
      '<div style="width:64px;height:64px;margin:0 auto 14px;border-radius:50%;background:' + (paid ? '#EAF5EC' : '#FFF1E3') + ';color:' + (paid ? 'var(--ok)' : 'var(--warn-ink)') + ';display:grid;place-items:center">' + ICON.check + '</div>' +
      '<h2 style="margin:0 0 6px;font-size:20px">' + (paid ? '支付已确认' : '订单已创建，等待支付确认') + '</h2>' +
      '<p class="small muted" style="margin:0">' + (paid ? '会话已生成，你现在可以进入对话。' : '订单保存在云端。支付确认后系统才会生成咨询会话。') + '</p></div>' +
      '<div class="card bill">' +
      '<div class="kv"><span class="k">订单号</span><span class="v">' + esc(o.order_no) + '</span></div>' +
      '<div class="kv"><span class="k">咨询师</span><span class="v">ID ' + esc(o.counselor_id) + '</span></div>' +
      '<div class="kv"><span class="k">主题</span><span class="v">' + esc(o.topic_name || '') + '</span></div>' +
      '<div class="kv"><span class="k">方式</span><span class="v">' + esc(o.mode || '') + '</span></div>' +
      '<div class="kv"><span class="k">时间</span><span class="v">' + esc(o.slot_label || '') + '</span></div>' +
      '<div class="kv"><span class="k">金额</span><span class="v" style="color:var(--brand)">' + money(o.amount_cents) + '</span></div>' +
      '<div class="kv"><span class="k">状态</span><span class="v">' + (paid ? '已支付' : '待支付') + '</span></div></div>' +
      paymentNotice() + crisisNotice() +
      (paid ? '<button class="btn block" data-act="enter-chat" data-no="' + esc(o.order_no) + '">进入咨询对话</button>' :
        '<button class="btn secondary block" data-act="go-ops" data-no="' + esc(o.order_no) + '">前往运营核销（演示）</button>') +
      '<button class="btn ghost block" data-act="tab" data-id="sessions" style="margin-top:10px">查看我的订单</button></section>';
  }

  function viewSessions() {
    if (!S.session) return '<section class="view"><div class="empty"><span class="e-icon">○</span>登录后才能查看你的订单与咨询记录。<br>' +
      '<button class="btn secondary sm" data-act="go-login" style="margin-top:16px">去登录</button></div></section>';
    const cards = S.orders.map(o => {
      const conv = S.conversations.find(c => c.order_no === o.order_no);
      const paid = o.status === 'paid';
      return '<div class="order"><div class="row-between"><span class="strong">' + esc(o.plan_title || '咨询服务') + '</span>' +
        '<span class="status ' + (paid ? '' : 'pending') + '">' + (paid ? '已支付' : '待支付') + '</span></div>' +
        '<div class="small muted" style="margin-top:6px">' + esc(o.topic_name || '') + ' · ' + esc(o.mode || '') + ' · ' + esc(o.slot_label || '') + '</div>' +
        '<div class="row-between" style="margin-top:10px"><span class="tiny muted">' + esc(o.order_no) + ' · ' + money(o.amount_cents) + '</span>' +
        (conv ? '<button class="btn sm" data-act="enter-chat" data-no="' + esc(o.order_no) + '">进入对话</button>' :
          '<span class="tiny muted">支付确认后解锁</span>') + '</div></div>';
    }).join('');
    return '<section class="view"><div class="section-head" style="margin-top:2px"><h2>我的咨询</h2>' +
      '<button class="btn ghost sm" data-act="refresh">刷新</button></div>' +
      '<div class="notice blue"><span class="n-icon">i</span><div>订单、会话与消息保存在云端，按账号隔离。咨询师只能看到分配给自己的会话。</div></div>' +
      (cards || '<div class="empty"><span class="e-icon">○</span>你还没有订单。<br><button class="btn secondary sm" data-act="tab" data-id="explore" style="margin-top:16px">去找咨询师</button></div>') +
      '<div class="section-head"><h2>需要马上有人接住你？</h2></div>' + crisisNotice() + '</section>';
  }

  function bubblesHTML() {
    const conv = S.activeConv;
    const role = roleFor(conv);
    const initials = (counselorById(conv.counselor_id) || {}).initials || '师';
    const rows = S.messages.map(m => {
      const mine = (m.sender_role === role);
      return '<div class="bubble-row ' + (mine ? 'me' : '') + '">' +
        (mine ? '' : '<span class="avatar" style="background:linear-gradient(145deg,#E9B98F,#B98257);width:32px;height:32px;font-size:14px;border-radius:10px">' + (role === 'visitor' ? esc(initials) : '访') + '</span>') +
        '<div class="bubble">' + esc(m.body) + '<span class="time">' + esc(new Date(m.created_at).toLocaleString('zh-CN', { hour: '2-digit', minute: '2-digit' })) + '</span></div></div>';
    }).join('');
    return rows || '<div class="chat-time">还没有消息，先打个招呼吧。</div>';
  }
  function viewChat() {
    const conv = S.activeConv;
    if (!conv) return '<section class="view"><div class="empty">会话不可用。</div></section>';
    const role = roleFor(conv);
    const other = role === 'visitor' ? (counselorById(conv.counselor_id) || {}) : { initials: '访', display_name: '来访者' };
    return '<section class="view chat-wrap">' +
      '<div class="chat-top">' + avatar(other) + '<div style="flex:1"><div class="strong small">' +
      (role === 'visitor' ? esc(other.display_name || '咨询师') : '来访者 · ' + esc(conv.topic_name || '咨询')) + '</div>' +
      '<div class="tiny muted">' + (role === 'visitor' ? '来访者视角' : '咨询师视角') + ' · 会话 ' + esc(conv.order_no) + '</div></div>' +
      '<button class="btn ghost sm" data-act="refresh-chat">刷新</button></div>' +
      nonMedicalNotice() +
      '<div class="chat-time">对话开始 · 已支付订单解锁</div>' +
      '<div class="bubbles" id="bubbles">' + bubblesHTML() + '</div>' +
      '<div class="composer"><input id="chatInput" type="text" maxlength="1000" placeholder="写下你现在想说的" autocomplete="off">' +
      '<button class="send" data-act="send" aria-label="发送">›</button></div></section>';
  }

  function viewMine() {
    const logged = !!S.session;
    return '<section class="view"><div class="profile">' +
      '<span class="avatar" style="background:linear-gradient(145deg,#E9B98F,#B98257)">' + (logged ? '访' : '?') + '</span>' +
      '<div style="flex:1"><div class="strong">' + (logged ? esc(S.user.name || S.user.email || S.user.phone || '已登录用户') : '尚未登录') + '</div>' +
      '<div class="small muted">' + (logged ? '账号已连接云端，数据按账号隔离' : '登录后才能下单与进入会话') + '</div></div>' +
      '<span class="chip ' + (logged ? 'gold' : 'demo') + '">' + (logged ? '已登录' : '未登录') + '</span></div>' +
      '<div class="list-group">' +
      '<button class="list-item" data-act="tab" data-id="sessions"><span class="li-icon">' + ICON.chat + '</span>' +
      '<span class="li-body"><span class="li-title">我的订单与咨询</span><span class="li-desc">' + S.orders.length + ' 笔订单 · ' + S.conversations.length + ' 个会话</span></span><span class="li-arrow">›</span></button>' +
      '<button class="list-item" data-act="go-desk"><span class="li-icon">' + ICON.users + '</span>' +
      '<span class="li-body"><span class="li-title">咨询师后台</span><span class="li-desc">' + (isCounselor() ? '已绑定 ' + S.staff.length + ' 个咨询师身份' : '凭授权码进入') + '</span></span><span class="li-arrow">›</span></button>' +
      '<button class="list-item" data-act="go-ops"><span class="li-icon">' + ICON.check + '</span>' +
      '<span class="li-body"><span class="li-title">运营核销（演示）</span><span class="li-desc">模拟支付回调，确认后解锁会话</span></span><span class="li-arrow">›</span></button>' +
      '<button class="list-item" data-act="go-compliance"><span class="li-icon">' + ICON.doc + '</span>' +
      '<span class="li-body"><span class="li-title">合规中心</span><span class="li-desc">法务模型：六层控制与条款草案</span></span><span class="li-arrow">›</span></button>' +
      '<button class="list-item" data-act="go-privacy"><span class="li-icon">' + ICON.lock + '</span>' +
      '<span class="li-body"><span class="li-title">隐私与同意</span><span class="li-desc">查看并撤回单独同意</span></span><span class="li-arrow">›</span></button>' +
      '</div>' +
      (logged ? '<button class="btn ghost block" data-act="signout">退出登录</button>' : '<button class="btn block" data-act="go-login">登录 / 注册</button>') +
      '<div class="section-head"><h2>紧急求助</h2></div>' + crisisNotice() +
      '<a class="btn secondary block" href="tel:12356">拨打 12356 心理援助热线</a>' +
      '<p class="tiny muted center" style="margin:16px 0 2px">享爱密码 · 爱有其方，享爱所有</p></section>';
  }

  function viewLogin() {
    const kind = S.loginTab;
    const sent = !!S.pendingOtp;
    return '<section class="view"><div class="card center" style="padding:22px">' +
      '<img src="assets/logo-badge-640.png" alt="享爱密码徽章" style="width:80px;height:80px;margin:0 auto 10px;border-radius:50%">' +
      '<div class="strong" style="font-size:17px">登录 / 注册</div>' +
      '<p class="small muted" style="margin:4px 0 0">验证码登录，新用户自动创建账号</p></div>' +
      '<div class="card"><div class="row" style="gap:8px;margin-bottom:12px">' +
      '<button class="chip selectable ' + (kind === 'phone' ? 'selected' : '') + '" data-act="login-tab" data-id="phone">手机号</button>' +
      '<button class="chip selectable ' + (kind === 'email' ? 'selected' : '') + '" data-act="login-tab" data-id="email">邮箱</button></div>' +
      '<label class="field-label">' + (kind === 'phone' ? '手机号（中国大陆 11 位）' : '邮箱地址') + '</label>' +
      '<input class="field" data-field="recipient" type="' + (kind === 'phone' ? 'tel' : 'email') + '" ' +
      'placeholder="' + (kind === 'phone' ? '请输入 11 位手机号' : 'name@example.com') + '" value="' + esc(S.form.recipient || '') + '" ' + (sent ? 'readonly' : '') + '>' +
      '<button class="btn secondary block sm" data-act="send-otp" style="margin-top:10px">' + (sent ? '重新获取验证码' : '获取验证码') + '</button>' +
      (sent ? '<label class="field-label" style="margin-top:14px">验证码</label>' +
        '<input class="field" data-field="otp" type="text" inputmode="numeric" maxlength="8" placeholder="输入收到的验证码" value="' + esc(S.form.otp || '') + '">' +
        '<button class="btn block" data-act="verify-otp" style="margin-top:10px">验证并登录</button>' : '') +
      (S.error ? '<div class="notice" style="margin-top:12px"><span class="n-icon">!</span><div>' + esc(S.error) + '</div></div>' : '') +
      '</div>' +
      '<div class="notice blue"><span class="n-icon">i</span><div>手机号与邮箱仅用于身份校验。咨询内容按敏感个人信息单独征求同意，两者不捆绑。</div></div>' +
      nonMedicalNotice() + '</section>';
  }

  function viewDesk() {
    if (!S.session) return '<section class="view"><div class="empty">请先登录，再使用咨询师授权码。<br>' +
      '<button class="btn secondary sm" data-act="go-login" style="margin-top:16px">去登录</button></div></section>';
    if (!isCounselor()) {
      return '<section class="view"><div class="card tinted"><div class="strong" style="margin-bottom:6px">咨询师后台</div>' +
        '<p class="small muted" style="margin:0">咨询师需要先登录账号，再输入运营方发放的一次性授权码完成绑定。授权码不能替代登录，绑定后本账号只能看到分配给自己的来访者与会话。</p></div>' +
        '<div class="card"><label class="field-label">授权咨询师代码</label>' +
        '<input class="field" data-field="counselorCode" placeholder="例如 XAM-C1-7F3K" value="' + esc(S.form.counselorCode || '') + '">' +
        '<button class="btn block" data-act="redeem-code" style="margin-top:10px">兑换并绑定</button></div>' +
        '<div class="notice"><span class="n-icon">!</span><div>授权码为一次性，兑换后即失效。真人咨询师的授权码由运营方线下发放，不应在公开页面展示。</div></div>' +
        (S.error ? '<div class="notice"><span class="n-icon">!</span><div>' + esc(S.error) + '</div></div>' : '') + '</section>';
    }
    const ids = myCounselorIds();
    const list = S.conversations.filter(c => ids.indexOf(String(c.counselor_id)) >= 0);
    const cards = list.map(c =>
      '<button class="order" data-act="open-conv" data-id="' + c.id + '" style="width:100%;text-align:left">' +
      '<div class="row-between"><span class="strong">来访者会话</span><span class="status">已解锁</span></div>' +
      '<div class="small muted" style="margin-top:6px">' + esc(c.topic_name || '咨询') + ' · 订单 ' + esc(c.order_no) + '</div>' +
      '<div class="tiny" style="color:var(--brand);margin-top:8px">进入沟通 ›</div></button>').join('');
    return '<section class="view"><div class="card tinted"><div class="row-between"><div>' +
      '<div class="strong">已绑定咨询师身份</div><div class="small muted">' + S.staff.map(s => 'ID ' + esc(s.counselor_id) + ' · ' + esc(s.display_name || '')).join('；') + '</div></div>' +
      '<span class="chip gold">已授权</span></div></div>' +
      '<div class="section-head"><h2>分配给我的会话</h2><button class="btn ghost sm" data-act="refresh">刷新</button></div>' +
      (cards || '<div class="empty"><span class="e-icon">○</span>目前还没有已支付的来访者会话。</div>') +
      '<div class="notice blue"><span class="n-icon">i</span><div>权限由数据库行级安全控制：你只能读取与回复分配给自己的会话，看不到其他咨询师的来访者。</div></div>' +
      crisisNotice() + '</section>';
  }

  function viewOps() {
    return '<section class="view"><div class="notice"><span class="n-icon">!</span><div><b>这是支付回调的占位流程，不是真实收款。</b><br>' +
      '正式上线需要接入具备资质的支付服务商；此处由运营凭核销码把订单标记为已支付，用于验证付费闸门。</div></div>' +
      '<div class="card"><label class="field-label">订单号</label>' +
      '<input class="field" data-field="opsOrderNo" placeholder="XA..." value="' + esc(S.form.opsOrderNo || '') + '">' +
      '<label class="field-label" style="margin-top:12px">运营核销码</label>' +
      '<input class="field" data-field="opsCode" placeholder="运营方持有" value="' + esc(S.form.opsCode || '') + '">' +
      '<button class="btn block" data-act="confirm-payment" style="margin-top:14px">确认支付并解锁会话</button></div>' +
      (S.error ? '<div class="notice"><span class="n-icon">!</span><div>' + esc(S.error) + '</div></div>' : '') +
      '<div class="card tinted"><p class="small muted" style="margin:0">核销成功后，数据库触发器会把订单状态改为已支付并生成会话。前端没有更新订单状态的权限，这条边界由 RLS 保证。</p></div></section>';
  }

  function viewCompliance() {
    const L = window.XAM_LEGAL;
    if (!L) return '<section class="view"><div class="empty">合规模型未加载。</div></section>';
    return '<section class="view"><div class="card tinted"><div class="eyebrow">法务合规模型</div>' +
      '<h2 style="margin:6px 0 6px;font-size:19px">六层控制框架</h2>' +
      '<p class="small muted" style="margin:0">模型把「已查证的公开资料」与「平台规则草案」分开标注。草案不是法律意见，上线前须由执业律师审定。</p></div>' +
      '<div class="section-head"><h2>控制层</h2></div>' + L.renderLayers() +
      '<div class="section-head"><h2>模块与条款要点</h2></div>' + L.renderModules() +
      '<button class="btn secondary block" data-act="copy-legal" style="margin-top:6px">复制全文给法务</button>' +
      '<p class="tiny muted" style="line-height:1.7;margin-top:14px">出处采用 MLA 格式。本页内容不构成法律意见，也不替代律师审查。</p></section>';
  }

  function viewPrivacy() {
    return '<section class="view"><div class="card"><div class="strong" style="margin-bottom:8px">当前同意状态（本机）</div>' +
      '<div class="kv"><span class="k">服务条款与非医疗声明</span><span class="v">' + (S.consentDone ? '已同意' : '未同意') + '</span></div>' +
      '<div class="kv"><span class="k">敏感个人信息单独同意</span><span class="v">' + (S.consentDone ? '已同意' : '未同意') + '</span></div>' +
      '<p class="tiny muted" style="margin:10px 0 0">同意状态仅保存在本次浏览器会话；业务数据保存在云端并按账号隔离。</p></div>' +
      '<div class="card"><div class="strong" style="margin-bottom:8px">平台计划怎么处理你的信息</div>' +
      '<p class="small muted" style="margin:0;line-height:1.8">咨询内容可能涉及医疗健康等敏感个人信息。正式版需要：单独告知处理目的与必要性、取得单独同意、按最小范围收集、对聊天记录加密存储、提供查询与删除入口，并支持撤回同意。具体方案需要法务确认。</p></div>' +
      nonMedicalNotice() + '<button class="btn ghost block" data-act="withdraw">撤回同意并重新确认</button>' +
      '<button class="btn secondary block" data-act="go-compliance" style="margin-top:10px">查看完整合规模型</button></section>';
  }

  function viewAbout() {
    return '<section class="view"><div class="card tinted center" style="padding:22px">' +
      '<img src="assets/logo-badge-640.png" alt="享爱密码徽章" style="width:96px;height:96px;margin:0 auto 10px;border-radius:50%">' +
      '<div class="strong" style="font-size:18px;letter-spacing:.08em">享爱密码</div><div class="small muted">爱有其方，享爱所有</div></div>' +
      nonMedicalNotice() + crisisNotice() +
      '<div class="section-head"><h2>系统状态</h2></div><div class="card"><p class="small muted" style="margin:0;line-height:1.8">' +
      '账号、订单、会话与消息已接入托管云服务，权限由数据库行级安全隔离。真人咨询师资料仍为演示数据。' +
      '真实收款通道未接入，当前由运营核销模拟支付回调。计费规则为默认假设，待对齐《鬼影追追追》。</p></div>' +
      '<button class="btn secondary block" data-act="go-compliance" style="margin-top:12px">查看合规依据与出处</button></section>';
  }

  const VIEWS = {
    home: viewHome, topicIntro: viewTopicIntro, explore: viewExplore, counselor: viewCounselor,
    booking: viewBooking, orderDone: viewOrderDone, sessions: viewSessions, chat: viewChat,
    mine: viewMine, login: viewLogin, desk: viewDesk, ops: viewOps,
    compliance: viewCompliance, privacy: viewPrivacy, about: viewAbout
  };
  function render() {
    renderHeader(); renderTabs();
    main.innerHTML = (VIEWS[S.view] || viewHome)();
    if (S.view === 'chat') main.scrollTop = main.scrollHeight;
    if (S.error && ['login', 'desk', 'ops'].indexOf(S.view) < 0) {
      main.insertAdjacentHTML('afterbegin', '<div class="notice"><span class="n-icon">!</span><div>' + esc(S.error) + '</div></div>');
      S.error = '';
    }
  }

  /* ---------------- 同意弹层 ---------------- */
  function consentSheetHTML() {
    const c = S.consent;
    return '<div class="modal-mask" data-act="consent-mask"><div class="sheet" data-stop="1">' +
      '<h2>开始之前，请先看三件事</h2><p class="sheet-lead">这几条决定了平台能帮你什么、不能帮你什么。</p>' +
      '<div class="consent-item ' + (c.service ? 'checked' : '') + '" data-act="toggle-consent" data-key="service">' +
      '<span class="box">' + (c.service ? '✓' : '') + '</span><div><div class="ci-title">我已了解服务边界与平台规则</div>' +
      '<div class="ci-desc">平台提供心理咨询与陪伴式对话，不提供精神障碍的诊断与治疗，不承诺挽回关系、改变他人或达成特定结果。</div></div></div>' +
      '<div class="consent-item ' + (c.sensitive ? 'checked' : '') + '" data-act="toggle-consent" data-key="sensitive">' +
      '<span class="box">' + (c.sensitive ? '✓' : '') + '</span><div><div class="ci-title">我单独同意平台处理咨询相关的敏感信息</div>' +
      '<div class="ci-desc">咨询内容可能涉及医疗健康等敏感个人信息。平台仅在提供服务的必要范围内处理，你可以随时撤回同意。这一项与上一项分开征求，不捆绑。</div></div></div>' +
      crisisNotice() +
      '<button class="btn block" data-act="consent-confirm" ' + (c.service && c.sensitive ? '' : 'disabled') + '>同意并继续</button>' +
      '<button class="btn ghost block sm" data-act="consent-later" style="margin-top:9px">先随便看看</button></div></div>';
  }

  /* ---------------- 动作 ---------------- */
  async function createOrder() {
    const c = counselorById(S.counselorId) || S.counselors[0];
    const p = planById(S.planId) || S.plans[0];
    if (!c || !p) { toast('目录尚未加载'); return; }
    if (S.slotIndex < 0) { toast('请先选择时间'); return; }
    const slot = SLOTS[S.slotIndex];
    const orderNo = 'XA' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase();
    const { data, error } = await cloud.database.from('orders').insert({
      order_no: orderNo, counselor_id: c.id,
      topic_id: S.topicId, topic_name: TOPIC_NAME[S.topicId] || '初次梳理',
      mode: S.mode, slot_label: slot.day + ' ' + slot.time,
      plan_id: p.plan_id, plan_title: p.title,
      amount_cents: p.amount_cents, currency: 'CNY', status: 'awaiting_payment'
    }).select();
    if (error) { setError('订单创建失败：' + error.message); return; }
    if (!data || !data.length) { setError('订单创建被权限策略拒绝，请重新登录。'); return; }
    S.lastOrderNo = orderNo;
    S.form.opsOrderNo = orderNo;
    await loadMyData();
    go('orderDone');
    toast('订单已保存到云端，等待支付确认');
  }

  async function redeemCode() {
    const code = (S.form.counselorCode || '').trim();
    if (!code) { setError('请输入授权码'); return; }
    const { data, error } = await cloud.database.rpc('redeem_counselor_code', { p_code: code });
    if (error) { setError('兑换失败：' + error.message); return; }
    if (!data || !data.ok) { setError('授权码无效或已被使用。'); return; }
    S.error = ''; S.form.counselorCode = '';
    await loadMyData();
    render();
    toast('授权成功，已进入咨询师后台');
  }

  async function confirmPayment() {
    const no = (S.form.opsOrderNo || '').trim();
    const code = (S.form.opsCode || '').trim();
    if (!no || !code) { setError('请填写订单号与核销码'); return; }
    const { data, error } = await cloud.database.rpc('confirm_payment_by_operator', { p_order_no: no, p_ops_code: code });
    if (error) { setError('核销失败：' + error.message); return; }
    if (!data || !data.ok) { setError('核销未成功：' + (data && data.reason === 'invalid_ops_code' ? '核销码无效' : '订单不存在或状态不是待支付')); return; }
    S.error = '';
    await loadMyData();
    const conv = S.conversations.find(c => c.order_no === no);
    if (conv) {
      S.activeConv = conv; S.lastOrderNo = no;
      await loadMessages(conv.id);
      go('chat');
      toast('支付已确认，会话已解锁');
    } else {
      S.lastOrderNo = no;
      go('orderDone');
      toast('支付已确认，请刷新查看会话');
    }
  }

  async function enterChat(orderNo) {
    const conv = S.conversations.find(c => c.order_no === orderNo);
    if (!conv) { toast('会话尚未生成，请先完成支付确认'); return; }
    S.activeConv = conv;
    await loadMessages(conv.id);
    go('chat');
  }

  async function openConv(id) {
    const conv = S.conversations.find(c => String(c.id) === String(id));
    if (!conv) { toast('会话不存在'); return; }
    S.activeConv = conv;
    await loadMessages(conv.id);
    go('chat');
  }

  async function sendMessage() {
    const input = $('#chatInput');
    if (!input || !S.activeConv) return;
    const text = input.value.trim();
    if (!text) { toast('先写点什么吧'); return; }
    const role = roleFor(S.activeConv);
    const { error } = await cloud.database.from('messages').insert({
      conversation_id: S.activeConv.id, sender_role: role, body: text
    });
    if (error) { toast('发送失败：' + error.message); return; }
    await loadMessages(S.activeConv.id);
    render();
  }

  async function sendOtp() {
    const recipient = (S.form.recipient || '').trim();
    const kind = S.loginTab;
    S.error = '';
    if (kind === 'phone' && !/^1\d{10}$/.test(recipient)) { setError('请输入正确的 11 位手机号'); return; }
    if (kind === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) { setError('请输入正确的邮箱地址'); return; }
    const sent = await cloud.auth.sendOtp(kind === 'phone' ? { phone: recipient } : { email: recipient });
    if (sent.error) { setError('验证码发送失败：' + sent.error.message); return; }
    S.pendingOtp = {
      kind: kind, recipient: recipient,
      verificationId: sent.data.verificationId,
      isExistingUser: sent.data.isExistingUser
    };
    S.form.otp = '';
    render();
    toast('验证码已发送');
  }

  async function verifyOtp() {
    const p = S.pendingOtp;
    const token = (S.form.otp || '').trim();
    if (!p) { setError('请先获取验证码'); return; }
    if (!token) { setError('请输入验证码'); return; }
    const arg = p.kind === 'phone'
      ? { phone: p.recipient, verificationId: p.verificationId, isExistingUser: p.isExistingUser, token: token }
      : { email: p.recipient, verificationId: p.verificationId, isExistingUser: p.isExistingUser, token: token };
    const done = await cloud.auth.verifyOtp(arg);
    if (done.error) { setError('验证失败：' + done.error.message); return; }
    S.pendingOtp = null; S.error = '';
    const { data: session } = await cloud.auth.getSession();
    S.session = session; S.user = (session && session.user) || {}; S.uid = S.user.id || S.user.sub || '';
    await loadMyData();
    const next = S.pendingAction; S.pendingAction = null;
    if (typeof next === 'function') { next(); } else { switchTab('mine'); }
    toast('登录成功');
  }

  async function handle(act, el, target) {
    const id = el.dataset.id;
    if (IS_MIRROR && MIRROR_BLOCKED.indexOf(act) >= 0) { officialSheet(); return; }
    switch (act) {
      case 'tab': switchTab(id); break;
      case 'back': back(); break;
      case 'go-about': go('about'); break;
      case 'go-privacy': go('privacy'); break;
      case 'go-compliance': go('compliance'); break;
      case 'go-login': go('login'); break;
      case 'go-desk': await requireLogin(() => go('desk')); break;
      case 'go-ops': go('ops', { form: Object.assign({}, S.form, { opsOrderNo: el.dataset.no || S.form.opsOrderNo || '' }) }); break;
      case 'open-topic': go('topicIntro', { topicId: id, filterTopic: id === 'any' ? 'all' : id }); break;
      case 'to-list': S.stack = []; S.view = 'explore'; render(); break;
      case 'filter-topic': S.filterTopic = id; render(); break;
      case 'filter-mode': S.filterMode = id; render(); break;
      case 'open-counselor': go('counselor', { counselorId: id }); break;
      case 'pick-topic': S.topicId = id; render(); break;
      case 'pick-mode': S.mode = id; render(); break;
      case 'pick-pkg': S.planId = id; render(); break;
      case 'pick-slot': S.slotIndex = Number(el.dataset.i); render(); break;
      case 'to-booking': requireConsent(() => requireLogin(async () => {
        const c = counselorById(S.counselorId) || S.counselors[0];
        const preferred = (S.topicId && ((c.topics || []).indexOf(S.topicId) >= 0 || S.topicId === 'any')) ? S.topicId : (c.topics || ['any'])[0];
        go('booking', { topicId: preferred, mode: (c.modes || ['文字'])[0], planId: S.plans.length ? S.plans[0].plan_id : 'single', slotIndex: -1 });
      })); break;
      case 'create-order': await createOrder(); break;
      case 'enter-chat': requireConsent(() => enterChat(el.dataset.no)); break;
      case 'open-conv': await openConv(id); break;
      case 'refresh': await loadMyData(); render(); toast('已刷新'); break;
      case 'refresh-chat': if (S.activeConv) { await loadMessages(S.activeConv.id); render(); } break;
      case 'send': await sendMessage(); break;
      case 'login-tab': S.loginTab = id; S.pendingOtp = null; S.error = ''; S.form.recipient = ''; S.form.otp = ''; render(); break;
      case 'send-otp': await sendOtp(); break;
      case 'verify-otp': await verifyOtp(); break;
      case 'redeem-code': await redeemCode(); break;
      case 'confirm-payment': await confirmPayment(); break;
      case 'signout':
        await cloud.auth.signOut();
        S.session = null; S.user = null; S.uid = ''; S.orders = []; S.conversations = []; S.staff = [];
        switchTab('home'); toast('已退出登录'); break;
      case 'withdraw':
        S.consent = { service: false, sensitive: false }; S.consentDone = false;
        try { sessionStorage.removeItem('xam_consent'); } catch (e) { /* 忽略 */ }
        toast('已撤回同意，下次操作时重新征求'); render(); break;
      case 'copy-legal': {
        const text = window.XAM_LEGAL ? window.XAM_LEGAL.asText() : '';
        try { await navigator.clipboard.writeText(text); toast('合规模型全文已复制'); }
        catch (e) { toast('复制失败，请手动选择文本'); }
        break;
      }
      case 'toggle-consent': {
        const k = el.dataset.key; S.consent[k] = !S.consent[k];
        modalRoot.innerHTML = consentSheetHTML(); break;
      }
      case 'consent-confirm':
        if (!S.consent.service || !S.consent.sensitive) return;
        S.consentDone = true;
        try { sessionStorage.setItem('xam_consent', '1'); } catch (e) { /* 忽略 */ }
        modalRoot.innerHTML = '';
        if (typeof S.pendingAction === 'function') { const fn = S.pendingAction; S.pendingAction = null; fn(); }
        else render();
        break;
      case 'consent-later': modalRoot.innerHTML = ''; S.pendingAction = null; break;
      case 'consent-mask': if (target === el) { modalRoot.innerHTML = ''; S.pendingAction = null; } break;
      case 'official-close': modalRoot.innerHTML = ''; break;
      default: break;
    }
  }

  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-act]');
    if (!el) return;
    handle(el.dataset.act, el, e.target).catch((err) => {
      S.error = '操作失败：' + (err && err.message ? err.message : '未知错误');
      render();
    });
  });
  document.addEventListener('input', (e) => {
    const el = e.target;
    if (el.dataset && el.dataset.field) S.form[el.dataset.field] = el.value;
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && document.activeElement && document.activeElement.id === 'chatInput') {
      const btn = document.querySelector('[data-act="send"]');
      if (btn) btn.click();
    }
  });

  /* ---------------- 启动 ---------------- */
  async function boot() {
    let agreed = false;
    try { agreed = sessionStorage.getItem('xam_consent') === '1'; } catch (e) { agreed = false; }
    S.consentDone = agreed;
    if (agreed) { S.consent.service = true; S.consent.sensitive = true; }

    const h = location.hash.replace('#', '');
    if (TAB_VIEWS.indexOf(h) >= 0 || DEEP_VIEWS.indexOf(h) >= 0) S.view = h;
    render();

    if (IS_MIRROR) {
      S.mirror = true;
      S.counselors = MIRROR_COUNSELORS.slice();
      S.plans = MIRROR_PLANS.slice();
      S.catalogLoaded = true;
      showMirrorBanner();
      render();
    } else {
      try {
        const { data: session } = await cloud.auth.getSession();
        S.session = session || null;
        S.user = (session && session.user) || null;
        S.uid = S.user ? (S.user.id || S.user.sub || '') : '';
        await loadCatalog();
        if (S.session) await loadMyData();
        render();
      } catch (err) {
        S.error = '云端初始化失败：' + (err && err.message ? err.message : '请检查网络与应用域名');
        render();
      }
    }

    if (!agreed && !IS_MIRROR) setTimeout(() => { modalRoot.innerHTML = consentSheetHTML(); }, 420);

    if ('serviceWorker' in navigator && location.protocol.indexOf('http') === 0) {
      navigator.serviceWorker.register('sw.js').catch(() => { /* 忽略 */ });
    }
    setInterval(async () => {
      if (S.view !== 'chat' || !S.activeConv || !S.session) return;
      await loadMessages(S.activeConv.id);
      if (S.view === 'chat') {
        const b = $('#bubbles');
        if (b) {
          b.innerHTML = bubblesHTML();
          main.scrollTop = main.scrollHeight;
        }
      }
    }, 6000);
  }

  let deferredPrompt = null;
  const installFab = $('#installFab');
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredPrompt = e; installFab.hidden = false; });
  installFab.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt(); await deferredPrompt.userChoice;
    deferredPrompt = null; installFab.hidden = true;
  });
  window.addEventListener('appinstalled', () => { installFab.hidden = true; toast('享爱密码已添加到主屏幕'); });
  window.addEventListener('hashchange', () => {
    const h = location.hash.replace('#', '');
    if ((TAB_VIEWS.indexOf(h) >= 0 || DEEP_VIEWS.indexOf(h) >= 0) && S.view !== h) {
      S.stack = []; S.view = h; render();
    }
  });

  boot();
})();
