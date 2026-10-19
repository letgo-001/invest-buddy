const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const state = { running: true, progress: 3, approved: false, mode: 'demo', goal: '宁德时代估值与景气验证' };
const tools = [
  ['fuyao.market', '行情、K 线与交易日历', '只读 · 5s · 重试 2 次'],
  ['fuyao.financials', '财务报表与衍生指标', '只读 · 8s · 重试 2 次'],
  ['fuyao.valuation', 'PE / PB / 历史估值分位', '只读 · 8s · 缓存 1h'],
  ['ifind.industry', '产业链、资金与宏观数据', '只读 · 10s · 备用源'],
  ['web.search', '公开信息检索', '只读 · 8s · 域名白名单'],
  ['memory.read_write', '线程与长期研究偏好', '工作区 · 可撤销'],
  ['artifact.write', '生成研究报告与证据包', '写入 · 每次需审批'],
  ['trade.execute', '交易执行（未启用）', '禁用 · 超出研究范围']
];

function toast(message) {
  const el = $('#toast');
  el.textContent = message;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2300);
}

function checkpoint() {
  localStorage.setItem('investBuddyCheckpoint', JSON.stringify({ step: state.progress, mode: state.mode, goal: state.goal, time: new Date().toISOString() }));
}

function setProgress(percent) {
  $('.health-ring strong').textContent = `${percent}%`;
  $('.health-ring .progress').style.strokeDashoffset = `${201 - (201 * percent / 100)}`;
}

function openApproval() {
  if (state.approved) return finishRun();
  $('#modalBackdrop').classList.add('open');
}

function finishRun() {
  state.progress = 6;
  $$('.step').forEach((el, index) => {
    el.classList.remove('running', 'queued', 'approval');
    el.classList.add('done');
    el.querySelector('.status-icon').className = 'status-icon';
    el.querySelector('.status-icon').textContent = '✓';
    if (index === 5) el.querySelector('.step-line small').textContent = '7.8s';
  });
  $('#runStatus').textContent = 'AGENT 已完成';
  setProgress(100);
  checkpoint();
  toast('研究报告与证据包已生成');
}

function advance() {
  if (!state.running || state.progress >= 6) return;
  const current = $(`.step[data-step="${state.progress}"]`);
  current.classList.remove('running');
  current.classList.add('done');
  current.querySelector('.status-icon').className = 'status-icon';
  current.querySelector('.status-icon').textContent = '✓';
  current.querySelector('.step-line small').textContent = '3.1s';
  state.progress += 1;
  setProgress(Math.min(92, 12 + state.progress * 14));
  checkpoint();
  if (state.progress === 6) return openApproval();
  const next = $(`.step[data-step="${state.progress}"]`);
  next.classList.remove('queued');
  next.classList.add('running');
  next.querySelector('.status-icon').className = 'status-icon spinner';
  next.querySelector('.status-icon').textContent = '';
  next.querySelector('.step-line small').textContent = '运行中';
  toast(`已完成步骤 ${state.progress - 1}，检查点已保存`);
}

function resetPlan() {
  const tasks = [
    ['澄清目标与研究边界', '识别对象、时间窗、比较口径与成功标准', ['planner', 'memory']],
    ['选择并校验数据工具', '匹配行情、财务、估值与公开信息能力', ['registry', 'policy']],
    ['收集一手证据', '按来源、时点、单位和字段保存证据锚点', ['扶摇 · 待连接', 'iFinD · 待连接']],
    ['交叉验证与冲突检查', '识别缺失、过期、冲突数据并触发降级', ['validator', 'web.search']],
    ['合成结论与关键反证', '区分事实、推断、不确定性与反例', ['reasoner']],
    ['审批并生成研究产物', '确认后生成报告、证据索引与运行记录', ['artifact.write']]
  ];
  $$('.step').forEach((el, index) => {
    const [title, description, chips] = tasks[index];
    el.className = `step ${index === 0 ? 'running' : index === 5 ? 'approval' : 'queued'}`;
    el.querySelector('h3').textContent = title;
    el.querySelector('p').textContent = description;
    el.querySelector('.chips').innerHTML = chips.map((chip) => `<span>${chip}</span>`).join('');
    const icon = el.querySelector('.status-icon');
    if (index === 0) {
      icon.className = 'status-icon spinner';
      icon.textContent = '';
      el.querySelector('.step-line small').textContent = '规划中';
    } else if (index === 5) {
      icon.className = 'status-icon';
      icon.textContent = '!';
      el.querySelector('.step-line small').textContent = '需确认';
    } else {
      icon.className = 'status-icon';
      icon.textContent = String(index + 1);
      el.querySelector('.step-line small').textContent = '等待';
    }
  });
}

function startResearch(goal) {
  state.mode = 'custom';
  state.goal = goal;
  state.progress = 1;
  state.running = true;
  const shortGoal = goal.length > 22 ? `${goal.slice(0, 22)}…` : goal;
  $('#activeThreadTitle').textContent = shortGoal;
  $('#activeThreadMeta').textContent = '规划中 · 刚刚';
  $('#crumbTitle').textContent = '新研究线程';
  $('#modePill').textContent = '新建线程';
  $('#modePill').classList.add('custom');
  $('#runStatus').textContent = 'AGENT 正在规划';
  $('#runId').textContent = `RUN-${Date.now().toString().slice(-10)}`;
  $('#heroTitle').textContent = goal;
  $('#heroDescription').textContent = 'Agent 正在解析目标、确定研究边界并选择可用工具。当前为静态演示模式：未连接真实金融接口时，只展示计划与 Harness 状态，不生成未经验证的市场结论。';
  $('#demoDisclosure').innerHTML = '<b>演示模式</b> 当前线程展示目标解析、任务规划、工具选择、检查点和审批机制；真实数据接口尚未连接。';
  $('#evidenceList').innerHTML = `
    <article class="evidence empty-evidence"><div class="source-icon fy">01</div><div><div class="ev-top"><span class="signal">准备中</span><time>刚刚</time><b>等待工具</b></div><h3>尚未形成可验证证据</h3><p>Agent 将在工具返回来源、时点、单位和字段后创建证据卡；调用失败时不会静默补值。</p></div></article>
    <article class="evidence empty-evidence"><div class="source-icon if">02</div><div><div class="ev-top"><span class="uncertain">边界</span><time>演示模式</time><b>未纳入结论</b></div><h3>真实金融连接器未启用</h3><p>请配置扶摇 / iFinD 服务端凭据后再运行真实研究；本页面不会把模拟数据冒充实时事实。</p></div></article>`;
  $('#thesisGrid').innerHTML = '<article class="pending-thesis"><span class="index">—</span><div><b>等待证据覆盖达到阈值</b><p>在核心字段完成交叉验证前，Agent 不生成方向性判断或买卖建议。</p></div></article>';
  $('#resumeNotice').style.display = 'none';
  $('#pauseBtn').textContent = 'Ⅱ';
  setProgress(8);
  resetPlan();
  checkpoint();
  $('#researchModalBackdrop').classList.remove('open');
  toast('研究线程已创建，Agent 正在规划任务');
  setTimeout(advance, 1800);
}

$('#toolRegistryBtn').onclick = () => { $('#drawer').classList.add('open'); $('#drawerBackdrop').classList.add('open'); };
function closeDrawer() { $('#drawer').classList.remove('open'); $('#drawerBackdrop').classList.remove('open'); }
$('#closeDrawer').onclick = closeDrawer;
$('#drawerBackdrop').onclick = closeDrawer;
$('#toolList').innerHTML = tools.map((tool, index) => `<article class="tool-item ${index === 7 ? 'off' : ''}"><div><i></i><b>${tool[0]}</b><em>${index === 7 ? 'DISABLED' : 'READY'}</em></div><p>${tool[1]}<br>${tool[2]}</p></article>`).join('');

$('#pauseBtn').onclick = () => {
  state.running = !state.running;
  $('#pauseBtn').textContent = state.running ? 'Ⅱ' : '▶';
  toast(state.running ? 'Agent 已继续运行' : 'Agent 已安全暂停，当前状态已保存');
  checkpoint();
};
$('#approveBtn').onclick = () => { state.approved = $('#rememberApproval').checked; $('#modalBackdrop').classList.remove('open'); finishRun(); };
$('#denyApproval').onclick = () => { $('#modalBackdrop').classList.remove('open'); toast('已停止在审批点；研究数据与检查点保留'); };

$$('.citation').forEach((button) => button.onclick = () => { $('#sourceText').textContent = button.dataset.source; $('#sourcePopover').classList.add('open'); });
$('#closeSource').onclick = () => $('#sourcePopover').classList.remove('open');
$('#restoreBtn').onclick = () => {
  const saved = JSON.parse(localStorage.getItem('investBuddyCheckpoint') || 'null');
  $('#resumeNotice').style.display = 'none';
  toast(saved ? `已恢复步骤 ${saved.step} 的上下文、记忆与证据` : '已恢复演示检查点');
};
$('#dismissResume').onclick = () => $('#resumeNotice').style.display = 'none';

$('#sendBtn').onclick = () => {
  const constraint = $('#goalInput').value.trim();
  if (!constraint) return toast('请先输入补充条件或研究约束');
  $('#heroDescription').textContent += ` 新增约束：${constraint}`;
  $('#goalInput').value = '';
  checkpoint();
  toast('约束已写入线程记忆，Agent 正在重规划');
};

$('#newThread').onclick = () => {
  checkpoint();
  $('#newGoalInput').value = '';
  $('#researchModalBackdrop').classList.add('open');
  setTimeout(() => $('#newGoalInput').focus(), 80);
};
$('#cancelNewResearch').onclick = () => $('#researchModalBackdrop').classList.remove('open');
$('#startResearchBtn').onclick = () => {
  const goal = $('#newGoalInput').value.trim();
  if (!goal) return toast('请先输入一个具体研究目标');
  startResearch(goal);
};
$$('.quick-goals button').forEach((button) => button.onclick = () => { $('#newGoalInput').value = button.dataset.goal; $('#newGoalInput').focus(); });

$('#exportBtn').onclick = openApproval;
$('#logsBtn').onclick = () => toast('运行日志：8 次调用 · 1 次超时 · 2 次重试 · 0 次越权');
$('#evidenceFilter').onclick = () => toast(state.mode === 'demo' ? '示例证据：8 条事实 · 3 条信号 · 1 条待核' : '新线程尚无已验证证据');
$$('.step').forEach((el) => el.onclick = () => { if (+el.dataset.step === 6) openApproval(); else toast(`任务 ${el.dataset.step}：状态与工具调用摘要`); });

setTimeout(() => { if (state.running && state.mode === 'demo' && state.progress === 3) advance(); }, 5000);
