(() => {
  "use strict";

  const STORAGE_KEY = "tongzhu-demo-v1";
  const avatarClasses = ["avatar-green", "avatar-coral", "avatar-blue", "avatar-sun"];
  const members = [
    { id: "m1", name: "阿青", short: "青", avatar: "avatar-green" },
    { id: "m2", name: "小林", short: "林", avatar: "avatar-coral" },
    { id: "m3", name: "可可", short: "可", avatar: "avatar-blue" },
    { id: "m4", name: "大宇", short: "宇", avatar: "avatar-sun" },
  ];

  const seedState = {
    currentMemberId: "m1",
    settlements: [],
    expenses: [
      { id: "e1", title: "九月电费", amount: 268.4, payerId: "m2", memberIds: ["m1", "m2", "m3", "m4"], category: "水电", icon: "⚡", date: "09月13日", note: "8.12—9.11 账期" },
      { id: "e2", title: "厨房清洁用品", amount: 86.8, payerId: "m1", memberIds: ["m1", "m2", "m3", "m4"], category: "日用", icon: "🧽", date: "09月11日", note: "洗洁精、垃圾袋" },
      { id: "e3", title: "周末火锅食材", amount: 196, payerId: "m3", memberIds: ["m1", "m2", "m3"], category: "餐饮", icon: "🍲", date: "09月08日", note: "大宇周末不在家" },
      { id: "e4", title: "宽带月费", amount: 120, payerId: "m4", memberIds: ["m1", "m2", "m3", "m4"], category: "房屋", icon: "⌁", date: "09月01日", note: "九月宽带" },
    ],
    chores: [
      { id: "c1", title: "厨房台面与水槽", area: "厨房", icon: "🍳", due: "今天 20:00 前", dayIndex: 1, assigneeId: "m1", done: false },
      { id: "c2", title: "客厅吸尘与拖地", area: "客厅", icon: "🛋️", due: "周三晚间", dayIndex: 3, assigneeId: "m2", done: false },
      { id: "c3", title: "卫生间深度清洁", area: "卫生间", icon: "🫧", due: "周五晚间", dayIndex: 5, assigneeId: "m3", done: false },
      { id: "c4", title: "阳台整理与浇花", area: "阳台", icon: "🪴", due: "周日白天", dayIndex: 0, assigneeId: "m4", done: true },
    ],
    supplies: [
      { id: "s1", name: "抽纸", icon: "🧻", quantity: 2, unit: "提", threshold: 2, max: 8, buying: false },
      { id: "s2", name: "洗衣液", icon: "🧴", quantity: 1, unit: "瓶", threshold: 1, max: 5, buying: true },
      { id: "s3", name: "垃圾袋", icon: "🗑️", quantity: 4, unit: "卷", threshold: 2, max: 8, buying: false },
      { id: "s4", name: "饮用水", icon: "💧", quantity: 0, unit: "桶", threshold: 1, max: 6, buying: true },
      { id: "s5", name: "洗洁精", icon: "🫧", quantity: 3, unit: "瓶", threshold: 1, max: 5, buying: false },
      { id: "s6", name: "厨房纸", icon: "🧻", quantity: 5, unit: "卷", threshold: 2, max: 8, buying: false },
    ],
    agreements: [
      { id: "a1", category: "作息", title: "安静时间", content: "工作日 23:00 后、周末 00:00 后保持安静；需要开会或打游戏时请佩戴耳机。", acceptedBy: ["m1", "m2", "m3", "m4"], version: 2, updated: "9月2日" },
      { id: "a2", category: "访客", title: "访客提前告知", content: "有朋友到访请至少提前 2 小时在群内说明；过夜访客需征得其他室友同意。", acceptedBy: ["m1", "m2", "m4"], version: 1, updated: "8月26日" },
      { id: "a3", category: "卫生", title: "公共区域随手恢复", content: "使用厨房、客厅和卫生间后恢复整洁；个人物品不长期占用公共台面。", acceptedBy: ["m1", "m3", "m4"], version: 1, updated: "8月26日" },
      { id: "a4", category: "费用", title: "公共账单结算周期", content: "每周日晚统一核对当周公共开销，并在次周二前完成线下转账。", acceptedBy: ["m2", "m3", "m4"], version: 3, updated: "9月10日" },
    ],
    activities: [
      { icon: "✓", text: "大宇完成了阳台值日", time: "昨天 18:42" },
      { icon: "¥", text: "小林记录了九月电费", time: "2 天前" },
      { icon: "□", text: "可可把洗衣液加入采购清单", time: "3 天前" },
      { icon: "§", text: "阿青确认了“安静时间”", time: "4 天前" },
    ],
  };

  let state = loadState();
  let activeView = normalizeView(location.hash.slice(1));
  let expenseFilter = "all";
  let lastFocusedElement = null;

  const byId = (id) => document.getElementById(id);
  const memberById = (id) => members.find((m) => m.id === id) || members[0];
  const money = (value) => `¥${Number(value).toFixed(2)}`;
  const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);

  function cloneSeed() { return JSON.parse(JSON.stringify(seedState)); }
  function loadState() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? { ...cloneSeed(), ...JSON.parse(stored) } : cloneSeed();
    } catch { return cloneSeed(); }
  }
  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
  function normalizeView(view) {
    return ["home", "expenses", "chores", "supplies", "agreements"].includes(view) ? view : "home";
  }
  function avatar(member, extra = "") {
    return `<span class="avatar ${member.avatar} ${extra}" aria-label="${member.name}">${member.short}</span>`;
  }
  function avatarStack(ids) {
    return `<span class="avatar-stack">${ids.map((id) => avatar(memberById(id))).join("")}</span>`;
  }
  function pushActivity(icon, text) {
    state.activities.unshift({ icon, text, time: "刚刚" });
    state.activities = state.activities.slice(0, 8);
  }
  function toast(title, detail = "已同步到快乐合租屋") {
    const item = document.createElement("div");
    item.className = "toast";
    item.innerHTML = `<strong>${escapeHtml(title)}</strong><span>${escapeHtml(detail)}</span>`;
    byId("toastRegion").appendChild(item);
    setTimeout(() => item.remove(), 3200);
  }

  function calculateBalances() {
    const balances = Object.fromEntries(members.map((m) => [m.id, 0]));
    state.expenses.forEach((expense) => {
      balances[expense.payerId] += expense.amount;
      const cents = Math.round(expense.amount * 100);
      const count = expense.memberIds.length;
      const base = Math.floor(cents / count);
      const remainder = cents % count;
      expense.memberIds.forEach((id, index) => {
        balances[id] -= (base + (index < remainder ? 1 : 0)) / 100;
      });
    });
    (state.settlements || []).forEach((settlement) => {
      balances[settlement.fromId] += settlement.amount;
      balances[settlement.toId] -= settlement.amount;
    });
    return balances;
  }

  function calculateSettlements() {
    const balances = calculateBalances();
    const debtors = members.map((m) => ({ ...m, value: balances[m.id] })).filter((m) => m.value < -0.005).sort((a, b) => a.value - b.value);
    const creditors = members.map((m) => ({ ...m, value: balances[m.id] })).filter((m) => m.value > 0.005).sort((a, b) => b.value - a.value);
    const result = [];
    let d = 0;
    let c = 0;
    while (d < debtors.length && c < creditors.length) {
      const amount = Math.min(-debtors[d].value, creditors[c].value);
      result.push({ from: debtors[d], to: creditors[c], amount });
      debtors[d].value += amount;
      creditors[c].value -= amount;
      if (Math.abs(debtors[d].value) < 0.005) d += 1;
      if (Math.abs(creditors[c].value) < 0.005) c += 1;
    }
    return result;
  }

  function renderShell() {
    const current = memberById(state.currentMemberId);
    byId("currentMemberName").textContent = current.name;
    const switchAvatar = byId("memberSwitch").querySelector(".avatar");
    switchAvatar.textContent = current.short;
    switchAvatar.classList.remove(...avatarClasses);
    switchAvatar.classList.add(current.avatar);
    const mobile = byId("mobileMemberSwitch");
    mobile.textContent = current.short;
    mobile.classList.remove(...avatarClasses);
    mobile.classList.add(current.avatar);
    byId("memberMenu").innerHTML = members.map((member) => `
      <button class="member-option ${member.id === current.id ? "selected" : ""}" role="option" aria-selected="${member.id === current.id}" data-member-id="${member.id}">
        ${avatar(member)}<span>${member.name}</span>
      </button>`).join("");

    document.querySelectorAll("[data-nav]").forEach((link) => link.classList.toggle("active", link.dataset.nav === activeView));
    document.querySelectorAll("[data-view]").forEach((view) => view.classList.toggle("active", view.dataset.view === activeView));
  }

  function pageHead(eyebrow, title, subtitle, action = "") {
    return `<div class="page-head"><div><p class="eyebrow">${eyebrow}</p><h1>${title}</h1><p class="page-subtitle">${subtitle}</p></div>${action ? `<div class="head-actions">${action}</div>` : ""}</div>`;
  }

  function renderHome() {
    const current = memberById(state.currentMemberId);
    const balances = calculateBalances();
    const myBalance = balances[current.id];
    const myChores = state.chores.filter((c) => c.assigneeId === current.id && !c.done);
    const lowSupplies = state.supplies.filter((s) => s.quantity <= s.threshold);
    const pendingAgreements = state.agreements.filter((a) => !a.acceptedBy.includes(current.id));
    const doneCount = state.chores.filter((c) => c.done).length;
    const completion = Math.round((doneCount / state.chores.length) * 100);
    const nextTask = myChores[0];

    byId("view-home").innerHTML = `
      <div class="home-hero">
        <div class="hero-copy">
          <p class="eyebrow" id="todayLabel">本周生活台</p>
          <h1>${current.name}，家里有 ${myChores.length + lowSupplies.length + pendingAgreements.length} 件事等你留意。</h1>
          <p>费用、值日和补货都在这里。处理一件小事，让同住轻松一点。</p>
          <div class="quick-actions">
            <button class="button hero-action primary" data-action="open-expense">＋ 记一笔</button>
            <button class="button hero-action" data-go="chores">查看值日</button>
            <button class="button hero-action" data-go="supplies">补货清单</button>
          </div>
        </div>
        <div class="hero-panel">
          <div class="hero-panel-head"><div><span>本周默契值</span><h2>稳稳推进中</h2></div><div class="completion-ring" style="--progress:${completion}%"><strong>${completion}%</strong></div></div>
          <div class="today-task"><span class="task-icon">${nextTask ? nextTask.icon : "✨"}</span><div><small>${nextTask ? "我的下个值日" : "我的值日"}</small><strong>${nextTask ? nextTask.title : "本周已全部完成"}</strong></div></div>
        </div>
      </div>
      <div class="summary-grid">
        <article class="summary-card"><div class="summary-top"><span class="summary-label">我的账务</span><span class="summary-icon coral">¥</span></div><div class="summary-value">${money(Math.abs(myBalance))}</div><div class="summary-foot">${myBalance >= 0 ? "待收回" : "待支付"}</div></article>
        <article class="summary-card"><div class="summary-top"><span class="summary-label">我的值日</span><span class="summary-icon mint">✓</span></div><div class="summary-value">${myChores.length} 项</div><div class="summary-foot">${myChores[0]?.due || "本周已完成"}</div></article>
        <article class="summary-card"><div class="summary-top"><span class="summary-label">待补货</span><span class="summary-icon sun">!</span></div><div class="summary-value">${lowSupplies.length} 种</div><div class="summary-foot">${lowSupplies.some((s) => s.quantity === 0) ? "有物品已经用完" : "库存接近阈值"}</div></article>
      </div>
      <div class="dashboard-grid">
        <article class="panel">
          <div class="panel-head"><h2>需要处理</h2><button class="text-link" data-go="chores">查看全部</button></div>
          <div class="stack-list">
            ${myChores.map((task) => `<div class="list-row"><span class="row-icon">${task.icon}</span><div class="row-main"><strong>${task.title}</strong><small>${task.due} · 由我负责</small></div><button class="button button-quiet" data-complete-chore="${task.id}">完成</button></div>`).join("")}
            ${lowSupplies.slice(0, 2).map((supply) => `<div class="list-row"><span class="row-icon">${supply.icon}</span><div class="row-main"><strong>${supply.name}快用完了</strong><small>剩余 ${supply.quantity} ${supply.unit} · 阈值 ${supply.threshold} ${supply.unit}</small></div><button class="button button-quiet" data-restock="${supply.id}">补货</button></div>`).join("")}
            ${myChores.length + lowSupplies.length === 0 ? `<div class="empty-state"><span>✨</span><h3>当前没有待办</h3><p>享受一下整洁又省心的家吧。</p></div>` : ""}
          </div>
        </article>
        <article class="panel">
          <div class="panel-head"><h2>家里动态</h2><button class="text-link" data-action="reset-demo">重置演示</button></div>
          <div>${state.activities.slice(0, 4).map((activity) => `<div class="activity-line"><span class="activity-dot">${activity.icon}</span><div class="activity-copy">${escapeHtml(activity.text)}<small>${escapeHtml(activity.time)}</small></div></div>`).join("")}</div>
        </article>
      </div>`;
  }

  function renderExpenses() {
    const current = memberById(state.currentMemberId);
    const balances = calculateBalances();
    const settlements = calculateSettlements();
    const filtered = state.expenses.filter((e) => expenseFilter === "all" || e.category === expenseFilter);
    const paid = state.expenses.filter((e) => e.payerId === current.id).reduce((sum, e) => sum + e.amount, 0);
    const involved = state.expenses.filter((e) => e.memberIds.includes(current.id)).reduce((sum, e) => sum + e.amount / e.memberIds.length, 0);
    byId("view-expenses").innerHTML = `
      ${pageHead("费用 AA", "每一笔，都算得明白", "金额以分计算，平均分摊时自动处理尾差。", `<button class="button button-primary" data-action="open-expense">＋ 记一笔</button>`)}
      <div class="metric-strip"><div class="metric"><small>本月我先付</small><strong>${money(paid)}</strong></div><div class="metric"><small>本月我应承担</small><strong>${money(involved)}</strong></div><div class="metric"><small>当前净额</small><strong class="${balances[current.id] >= 0 ? "positive" : "negative"}">${balances[current.id] >= 0 ? "+" : "−"}${money(Math.abs(balances[current.id]))}</strong></div></div>
      <div class="toolbar"><div class="segmented" aria-label="费用分类">${["all", "水电", "日用", "餐饮", "房屋"].map((filter) => `<button class="segment ${expenseFilter === filter ? "active" : ""}" data-expense-filter="${filter}">${filter === "all" ? "全部" : filter}</button>`).join("")}</div><span class="page-subtitle">共 ${filtered.length} 笔</span></div>
      <div class="expense-layout">
        <div>${filtered.length ? filtered.map((expense) => {
          const payer = memberById(expense.payerId);
          const share = Math.round((expense.amount * 100) / expense.memberIds.length) / 100;
          return `<article class="expense-card"><span class="category-icon">${expense.icon}</span><div class="row-main"><strong>${escapeHtml(expense.title)}</strong><div class="expense-meta">${expense.date} · ${payer.name} 先付 · ${expense.memberIds.length} 人参与<br>${escapeHtml(expense.note || expense.category)}</div></div><div class="expense-amount">${money(expense.amount)}<small>人均约 ${money(share)}</small></div></article>`;
        }).join("") : `<div class="panel empty-state"><span>🧾</span><h3>这个分类还没有账单</h3><p>换个分类看看，或者记录一笔新费用。</p></div>`}</div>
        <aside class="panel settlement-card"><div class="panel-head"><h2>怎么结最省事</h2><span class="status-pill status-good">自动净额</span></div><p>把多笔往来合并后，只需完成以下转账。</p>${settlements.length ? settlements.map((item) => `<div class="settlement-item"><div class="settlement-route">${avatar(item.from)}<span>${item.from.name}</span><span class="route-arrow">→</span>${avatar(item.to)}<span>${item.to.name}</span></div><div class="settlement-bottom"><strong>${money(item.amount)}</strong><button class="button settlement-button" data-settle-from="${item.from.id}" data-settle-to="${item.to.id}">记为已结清</button></div></div>`).join("") : `<div class="settlement-item"><strong>账目已结清</strong><span class="settled-copy">目前没有需要转账的款项。</span></div>`}</aside>
      </div>`;
  }

  function weekDays() {
    const now = new Date();
    const currentDay = now.getDay();
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
    const labels = ["一", "二", "三", "四", "五", "六", "日"];
    return labels.map((label, index) => {
      const date = new Date(now);
      date.setDate(now.getDate() + mondayOffset + index);
      return { label, day: date.getDate(), today: date.toDateString() === now.toDateString() };
    });
  }

  function renderChores() {
    const done = state.chores.filter((c) => c.done).length;
    byId("view-chores").innerHTML = `
      ${pageHead("清洁排班", "这周，轮到谁？", "各管一块、做完打勾，公共区域不再靠猜。", `<button class="button button-secondary" data-action="reset-chores">重开本周</button>`)}
      <div class="metric-strip"><div class="metric"><small>本周完成</small><strong class="positive">${done} / ${state.chores.length}</strong></div><div class="metric"><small>今日任务</small><strong>${state.chores.filter((c) => c.dayIndex === new Date().getDay()).length || 1} 项</strong></div><div class="metric"><small>连续整洁</small><strong>3 周</strong></div></div>
      <div class="week-bar">${weekDays().map((day) => `<div class="day-chip ${day.today ? "today" : ""}"><small>周${day.label}</small><strong>${day.day}</strong></div>`).join("")}</div>
      <div class="chore-grid">${state.chores.map((task) => {
        const assignee = memberById(task.assigneeId);
        const own = task.assigneeId === state.currentMemberId;
        return `<article class="panel chore-card ${task.done ? "done" : ""}"><div class="chore-top"><span class="chore-emoji">${task.icon}</span><div class="chore-info"><h3>${task.title}</h3><small>${task.area} · ${task.due}</small></div></div><div class="assignee-line">${avatar(assignee)}<span><strong>${assignee.name}</strong> 负责本次清洁</span></div><button class="button ${task.done ? "button-secondary" : own ? "button-primary" : "button-quiet"}" data-complete-chore="${task.id}" ${!own ? "disabled" : ""}>${own ? (task.done ? "撤销完成" : "标记完成") : (task.done ? "室友已完成" : "等待室友完成")}</button></article>`;
      }).join("")}</div>`;
  }

  function supplyStatus(supply) {
    if (supply.quantity <= 0) return { text: "已用完", cls: "status-out" };
    if (supply.quantity <= supply.threshold) return { text: supply.buying ? "采购中" : "库存偏低", cls: "status-low" };
    return { text: "库存充足", cls: "status-good" };
  }

  function renderSupplies() {
    const low = state.supplies.filter((s) => s.quantity <= s.threshold).length;
    const buying = state.supplies.filter((s) => s.buying).length;
    byId("view-supplies").innerHTML = `
      ${pageHead("公共物品", "家里缺什么，一眼就知道", "随手登记消耗，低库存会自动进入补货提醒。", `<button class="button button-primary" data-action="open-supply">＋ 登记物品</button>`)}
      <div class="metric-strip"><div class="metric"><small>登记物品</small><strong>${state.supplies.length} 种</strong></div><div class="metric"><small>库存偏低</small><strong class="negative">${low} 种</strong></div><div class="metric"><small>采购进行中</small><strong>${buying} 种</strong></div></div>
      <div class="supply-grid">${state.supplies.map((supply) => {
        const status = supplyStatus(supply);
        const width = Math.max(0, Math.min(100, (supply.quantity / supply.max) * 100));
        return `<article class="panel supply-card"><div class="supply-head"><span class="supply-emoji">${supply.icon}</span><span class="status-pill ${status.cls}">${status.text}</span></div><h3>${escapeHtml(supply.name)}</h3><div class="stock-number">${supply.quantity} <span>${escapeHtml(supply.unit)} · 提醒阈值 ${supply.threshold}</span></div><div class="stock-bar"><span style="width:${width}%;background:${supply.quantity <= supply.threshold ? supply.quantity === 0 ? "var(--coral)" : "var(--sun)" : "var(--mint)"}"></span></div><div class="stock-actions"><button class="button button-quiet" data-consume="${supply.id}" ${supply.quantity <= 0 ? "disabled" : ""}>− 用掉 1</button><button class="button ${supply.quantity <= supply.threshold ? "button-primary" : "button-quiet"}" data-restock="${supply.id}">＋ 补 1</button></div></article>`;
      }).join("")}</div>`;
  }

  function renderAgreements() {
    const current = state.currentMemberId;
    const accepted = state.agreements.filter((a) => a.acceptedBy.includes(current)).length;
    const progress = Math.round((accepted / state.agreements.length) * 100);
    byId("view-agreements").innerHTML = `
      ${pageHead("室友公约", "说清楚，住得更自在", "规则不是约束谁，而是让每个人都有稳定预期。")}
      <div class="agreement-grid"><div>${state.agreements.map((agreement, index) => {
        const hasAccepted = agreement.acceptedBy.includes(current);
        return `<article class="panel agreement-card"><div class="agreement-top"><span class="agreement-number">${String(index + 1).padStart(2, "0")}</span><div><p class="eyebrow">${agreement.category} · V${agreement.version}</p><h3>${agreement.title}</h3></div></div><p>${agreement.content}</p><div class="agreement-foot"><div class="acceptance">${avatarStack(agreement.acceptedBy)}<span>${agreement.acceptedBy.length}/${members.length} 人已确认</span></div><button class="button ${hasAccepted ? "button-secondary" : "button-primary"}" data-accept-agreement="${agreement.id}" ${hasAccepted ? "disabled" : ""}>${hasAccepted ? "已确认" : "确认公约"}</button></div></article>`;
      }).join("")}</div><aside class="panel agreement-summary"><p class="eyebrow">我的确认进度</p><h2>${accepted} / ${state.agreements.length} 条</h2><div class="big-progress"><span style="width:${progress}%"></span></div><p class="summary-note">${progress === 100 ? "你已确认全部现行公约。" : `还有 ${state.agreements.length - accepted} 条等待确认。`}</p><ul class="house-rules"><li>修改条款后需要重新确认</li><li>所有历史版本都会保留</li><li>管理员负责发起内容调整</li></ul></aside></div>`;
  }

  function renderAll() {
    renderShell();
    renderHome();
    renderExpenses();
    renderChores();
    renderSupplies();
    renderAgreements();
    document.title = `${({ home: "首页", expenses: "费用", chores: "值日", supplies: "物品", agreements: "公约" })[activeView]}｜同住`;
  }

  function openModal(content) {
    lastFocusedElement = document.activeElement;
    byId("modal").innerHTML = content;
    byId("modalBackdrop").hidden = false;
    document.body.style.overflow = "hidden";
    setTimeout(() => byId("modal").querySelector("input, button, select, textarea")?.focus(), 0);
  }
  function closeModal() {
    byId("modalBackdrop").hidden = true;
    byId("modal").innerHTML = "";
    document.body.style.overflow = "";
    lastFocusedElement?.focus();
  }
  function modalHeader(title, subtitle) {
    return `<div class="modal-head"><div><h2 id="modalTitle">${title}</h2><p>${subtitle}</p></div><button class="icon-button" type="button" data-action="close-modal" aria-label="关闭">×</button></div>`;
  }

  function openExpenseModal() {
    const today = new Date().toISOString().slice(0, 10);
    openModal(`${modalHeader("记录一笔公共费用", "默认平均分摊，提交前可查看每人份额。")}<form class="modal-body" id="expenseForm"><div class="form-grid"><div class="field full"><label for="expenseTitle">费用名称</label><input id="expenseTitle" name="title" maxlength="30" required placeholder="例如：九月燃气费" /></div><div class="field"><label for="expenseAmount">金额（元）</label><input id="expenseAmount" name="amount" type="number" min="0.01" step="0.01" required placeholder="0.00" /></div><div class="field"><label for="expenseCategory">分类</label><select id="expenseCategory" name="category"><option>水电</option><option>日用</option><option>餐饮</option><option>房屋</option></select></div><div class="field"><label for="expensePayer">付款人</label><select id="expensePayer" name="payerId">${members.map((m) => `<option value="${m.id}" ${m.id === state.currentMemberId ? "selected" : ""}>${m.name}</option>`).join("")}</select></div><div class="field"><label for="expenseDate">日期</label><input id="expenseDate" name="date" type="date" value="${today}" required /></div><fieldset class="field full" style="border:0;padding:0;margin:0"><legend>参与分摊</legend><div class="checkbox-grid">${members.map((m) => `<label class="check-card"><input type="checkbox" name="memberIds" value="${m.id}" checked />${avatar(m)}<span>${m.name}</span></label>`).join("")}</div></fieldset><div class="field full"><label for="expenseNote">备注（选填）</label><textarea id="expenseNote" name="note" maxlength="80" placeholder="账期、购买内容等"></textarea></div><div class="field full"><div class="split-preview" id="splitPreview">输入金额后查看分摊预览</div></div></div><div class="modal-actions"><button class="button button-secondary" type="button" data-action="close-modal">取消</button><button class="button button-primary" type="submit">保存账单</button></div></form>`);
    const form = byId("expenseForm");
    const updatePreview = () => {
      const amount = Number(form.elements.amount.value || 0);
      const checked = [...form.querySelectorAll('[name="memberIds"]:checked')];
      byId("splitPreview").innerHTML = amount > 0 && checked.length ? `共 <strong>${checked.length} 人</strong>参与，每人约 <strong>${money(amount / checked.length)}</strong>` : "请填写金额并至少选择一位参与人";
    };
    form.addEventListener("input", updatePreview);
  }

  function openSupplyModal() {
    openModal(`${modalHeader("登记公共物品", "设置库存和提醒阈值，消耗时随手更新。")}<form class="modal-body" id="supplyForm"><div class="form-grid"><div class="field full"><label for="supplyName">物品名称</label><input id="supplyName" name="name" required maxlength="20" placeholder="例如：洗手液" /></div><div class="field"><label for="supplyQuantity">当前数量</label><input id="supplyQuantity" name="quantity" type="number" min="0" step="1" value="1" required /></div><div class="field"><label for="supplyUnit">单位</label><input id="supplyUnit" name="unit" required maxlength="6" value="瓶" /></div><div class="field"><label for="supplyThreshold">提醒阈值</label><input id="supplyThreshold" name="threshold" type="number" min="0" step="1" value="1" required /></div><div class="field"><label for="supplyIcon">图标</label><select id="supplyIcon" name="icon"><option>🧴</option><option>🧻</option><option>🫧</option><option>🗑️</option><option>💧</option><option>📦</option></select></div></div><div class="modal-actions"><button class="button button-secondary" type="button" data-action="close-modal">取消</button><button class="button button-primary" type="submit">保存物品</button></div></form>`);
  }

  function handleAction(target) {
    if (target.closest("[data-go]")) {
      location.hash = target.closest("[data-go]").dataset.go;
      return;
    }
    const actionElement = target.closest("[data-action]");
    const action = actionElement?.dataset.action;
    if (action === "open-expense") openExpenseModal();
    if (action === "open-supply") openSupplyModal();
    if (action === "close-modal") closeModal();
    if (action === "reset-demo") {
      state = cloneSeed(); saveState(); renderAll(); toast("演示数据已恢复", "现在可以重新体验全部功能");
    }
    if (action === "reset-chores") {
      state.chores.forEach((c) => { c.done = false; }); saveState(); renderAll(); toast("本周值日已重新开始");
    }

    const choreButton = target.closest("[data-complete-chore]");
    if (choreButton) {
      const chore = state.chores.find((c) => c.id === choreButton.dataset.completeChore);
      if (!chore) return;
      if (chore.assigneeId !== state.currentMemberId) { toast("这是室友的任务", "切换到对应成员视角后可以更新"); return; }
      chore.done = !chore.done;
      if (chore.done) pushActivity("✓", `${memberById(state.currentMemberId).name}完成了${chore.area}值日`);
      saveState(); renderAll(); toast(chore.done ? "值日完成，辛苦啦" : "已撤销完成状态");
    }

    const consumeButton = target.closest("[data-consume]");
    if (consumeButton) {
      const supply = state.supplies.find((s) => s.id === consumeButton.dataset.consume);
      if (!supply || supply.quantity <= 0) return;
      supply.quantity -= 1;
      if (supply.quantity <= supply.threshold) pushActivity("□", `${supply.name}库存偏低，需要补货`);
      saveState(); renderAll(); toast(`已登记使用 1 ${supply.unit}${supply.name}`);
    }

    const restockButton = target.closest("[data-restock]");
    if (restockButton) {
      const supply = state.supplies.find((s) => s.id === restockButton.dataset.restock);
      if (!supply) return;
      supply.quantity += 1; supply.buying = false;
      pushActivity("□", `${memberById(state.currentMemberId).name}补充了${supply.name}`);
      saveState(); renderAll(); toast(`${supply.name}已补货`);
    }

    const acceptButton = target.closest("[data-accept-agreement]");
    if (acceptButton) {
      const agreement = state.agreements.find((a) => a.id === acceptButton.dataset.acceptAgreement);
      if (!agreement || agreement.acceptedBy.includes(state.currentMemberId)) return;
      agreement.acceptedBy.push(state.currentMemberId);
      pushActivity("§", `${memberById(state.currentMemberId).name}确认了“${agreement.title}”`);
      saveState(); renderAll(); toast("公约已确认", agreement.title);
    }

    const settleButton = target.closest("[data-settle-from]");
    if (settleButton) {
      const fromId = settleButton.dataset.settleFrom;
      const toId = settleButton.dataset.settleTo;
      const suggestion = calculateSettlements().find((item) => item.from.id === fromId && item.to.id === toId);
      if (!suggestion) { toast("这笔账已经更新", "请查看最新结算建议"); return; }
      const amount = Math.round(suggestion.amount * 100) / 100;
      state.settlements = state.settlements || [];
      state.settlements.push({ id: `st${Date.now()}`, fromId, toId, amount, settledAt: new Date().toISOString() });
      pushActivity("¥", `${memberById(fromId).name}向${memberById(toId).name}结清了${money(amount)}`);
      saveState(); renderAll(); toast("已记为结清", `${memberById(fromId).name} → ${memberById(toId).name} ${money(amount)}`);
    }

    const filterButton = target.closest("[data-expense-filter]");
    if (filterButton) { expenseFilter = filterButton.dataset.expenseFilter; renderExpenses(); }

    const memberButton = target.closest("[data-member-id]");
    if (memberButton) {
      state.currentMemberId = memberButton.dataset.memberId;
      saveState();
      byId("memberMenu").classList.remove("open");
      renderAll();
      toast(`已切换为${memberById(state.currentMemberId).name}的视角`);
    }
  }

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    handleAction(target);
    if (!target.closest("#memberSwitch") && !target.closest("#memberMenu") && !target.closest("#mobileMemberSwitch")) byId("memberMenu").classList.remove("open");
  });

  byId("memberSwitch").addEventListener("click", () => byId("memberMenu").classList.toggle("open"));
  byId("mobileMemberSwitch").addEventListener("click", () => {
    const currentIndex = members.findIndex((m) => m.id === state.currentMemberId);
    state.currentMemberId = members[(currentIndex + 1) % members.length].id;
    saveState(); renderAll(); toast(`已切换为${memberById(state.currentMemberId).name}的视角`);
  });
  byId("modalBackdrop").addEventListener("click", (event) => { if (event.target === byId("modalBackdrop")) closeModal(); });
  document.addEventListener("keydown", (event) => { if (event.key === "Escape" && !byId("modalBackdrop").hidden) closeModal(); });

  document.addEventListener("submit", (event) => {
    if (event.target.id === "expenseForm") {
      event.preventDefault();
      const form = new FormData(event.target);
      const memberIds = form.getAll("memberIds");
      if (!memberIds.length) { toast("请选择至少一位参与人"); return; }
      const amount = Math.round(Number(form.get("amount")) * 100) / 100;
      if (!Number.isFinite(amount) || amount <= 0) { toast("请输入有效金额"); return; }
      const categoryIcons = { 水电: "⚡", 日用: "🧽", 餐饮: "🍲", 房屋: "⌁" };
      const date = new Date(String(form.get("date")) + "T00:00:00");
      state.expenses.unshift({ id: `e${Date.now()}`, title: String(form.get("title")).trim(), amount, payerId: String(form.get("payerId")), memberIds, category: String(form.get("category")), icon: categoryIcons[form.get("category")] || "🧾", date: `${String(date.getMonth() + 1).padStart(2, "0")}月${String(date.getDate()).padStart(2, "0")}日`, note: String(form.get("note") || "") });
      pushActivity("¥", `${memberById(String(form.get("payerId"))).name}记录了${form.get("title")}`);
      saveState(); closeModal(); renderAll(); toast("账单已保存", `${memberIds.length} 人平均分摊 ${money(amount)}`);
    }
    if (event.target.id === "supplyForm") {
      event.preventDefault();
      const form = new FormData(event.target);
      const quantity = Number(form.get("quantity"));
      const threshold = Number(form.get("threshold"));
      state.supplies.unshift({ id: `s${Date.now()}`, name: String(form.get("name")).trim(), icon: String(form.get("icon")), quantity, unit: String(form.get("unit")).trim(), threshold, max: Math.max(quantity, threshold * 3, 5), buying: false });
      pushActivity("□", `${memberById(state.currentMemberId).name}登记了${form.get("name")}`);
      saveState(); closeModal(); renderAll(); toast("公共物品已登记");
    }
  });

  window.addEventListener("hashchange", () => {
    activeView = normalizeView(location.hash.slice(1));
    renderAll();
    byId("mainContent").focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  function registerWebMCP() {
    const context = document.modelContext;
    if (!context?.registerTool) return;
    const register = (tool) => { try { Promise.resolve(context.registerTool(tool)).catch(() => {}); } catch {} };
    register({
      name: "read_home_dashboard",
      title: "查看合租屋概况",
      description: "读取当前成员、待办、低库存数量和账务净额，不修改任何数据。",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: true, untrustedContentHint: false },
      execute: () => {
        const balances = calculateBalances();
        return { member: memberById(state.currentMemberId).name, pendingChores: state.chores.filter((c) => c.assigneeId === state.currentMemberId && !c.done).length, lowSupplies: state.supplies.filter((s) => s.quantity <= s.threshold).length, balance: Math.round(balances[state.currentMemberId] * 100) / 100 };
      },
    });
    register({
      name: "complete_chore",
      title: "完成值日",
      description: "将当前成员负责的一项值日任务标记为完成，并更新页面。",
      inputSchema: { type: "object", properties: { choreId: { type: "string", description: "值日任务 ID" } }, required: ["choreId"], additionalProperties: false },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute: ({ choreId }) => {
        const chore = state.chores.find((c) => c.id === choreId);
        if (!chore) throw new Error("未找到值日任务");
        if (chore.assigneeId !== state.currentMemberId) throw new Error("当前成员不是任务负责人");
        chore.done = true; pushActivity("✓", `${memberById(state.currentMemberId).name}完成了${chore.area}值日`); saveState(); renderAll();
        return { choreId, status: "done", title: chore.title };
      },
    });
    register({
      name: "update_supply_quantity",
      title: "更新物品数量",
      description: "按增量更新一个公共物品的库存，负数表示消耗，正数表示补货。",
      inputSchema: { type: "object", properties: { supplyId: { type: "string" }, delta: { type: "integer", minimum: -20, maximum: 20 } }, required: ["supplyId", "delta"], additionalProperties: false },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute: ({ supplyId, delta }) => {
        const supply = state.supplies.find((s) => s.id === supplyId);
        if (!supply) throw new Error("未找到公共物品");
        if (!Number.isInteger(delta) || supply.quantity + delta < 0) throw new Error("库存增量无效");
        supply.quantity += delta; if (delta > 0) supply.buying = false; saveState(); renderAll();
        return { supplyId, quantity: supply.quantity, status: supplyStatus(supply).text };
      },
    });
  }

  renderAll();
  registerWebMCP();
})();
