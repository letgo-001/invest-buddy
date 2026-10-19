const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const state={running:true,progress:3,approved:false};
const tools=[
  ['fuyao.market','行情、K 线与交易日历','只读 · 5s · 重试 2 次'],
  ['fuyao.financials','财务报表与衍生指标','只读 · 8s · 重试 2 次'],
  ['fuyao.valuation','PE / PB / 历史估值分位','只读 · 8s · 缓存 1h'],
  ['ifind.industry','产业链、资金与宏观数据','只读 · 10s · 备用源'],
  ['web.search','公开信息检索','只读 · 8s · 域名白名单'],
  ['memory.read_write','线程与长期研究偏好','工作区 · 可撤销'],
  ['artifact.write','生成研究报告与证据包','写入 · 每次需审批'],
  ['trade.execute','交易执行（未启用）','禁用 · 超出研究范围']
];
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2300)}
function checkpoint(){localStorage.setItem('investBuddyCheckpoint',JSON.stringify({step:state.progress,time:new Date().toISOString(),goal:$('#goalInput').value}))}
function openApproval(){if(state.approved)return finishRun();$('#modalBackdrop').classList.add('open')}
function finishRun(){state.progress=6;$$('.step').forEach((el,i)=>{el.classList.remove('running','queued','approval');el.classList.add('done');el.querySelector('.status-icon').textContent='✓';el.querySelector('.step-line small').textContent=i===5?'7.8s':el.querySelector('.step-line small').textContent});$('.eyebrow').innerHTML='<span class="pulse"></span> AGENT 已完成 <span class="run-id">RUN-241018-0912</span>';$('.health-ring strong').textContent='100%';$('.health-ring .progress').style.strokeDashoffset='0';checkpoint();toast('研究报告与证据包已生成')}
function advance(){if(!state.running)return;const current=$(`.step[data-step="${state.progress}"]`);current.classList.remove('running');current.classList.add('done');current.querySelector('.status-icon').className='status-icon';current.querySelector('.status-icon').textContent='✓';current.querySelector('.step-line small').textContent='3.1s';state.progress++;checkpoint();if(state.progress===6){openApproval();return}const next=$(`.step[data-step="${state.progress}"]`);next.classList.remove('queued');next.classList.add('running');next.querySelector('.status-icon').className='status-icon spinner';next.querySelector('.status-icon').textContent='';next.querySelector('.step-line small').textContent='运行中';toast(`已完成步骤 ${state.progress-1}，检查点已保存`)}
$('#toolRegistryBtn').onclick=()=>{$('#drawer').classList.add('open');$('#drawerBackdrop').classList.add('open')};
function closeDrawer(){$('#drawer').classList.remove('open');$('#drawerBackdrop').classList.remove('open')}
$('#closeDrawer').onclick=closeDrawer;$('#drawerBackdrop').onclick=closeDrawer;
$('#toolList').innerHTML=tools.map((t,i)=>`<article class="tool-item ${i===7?'off':''}"><div><i></i><b>${t[0]}</b><em>${i===7?'DISABLED':'READY'}</em></div><p>${t[1]}<br>${t[2]}</p></article>`).join('');
$('#pauseBtn').onclick=()=>{state.running=!state.running;$('#pauseBtn').textContent=state.running?'Ⅱ':'▶';toast(state.running?'Agent 已继续运行':'Agent 已安全暂停，当前状态已保存');checkpoint()};
$('#approveBtn').onclick=()=>{state.approved=$('#rememberApproval').checked;$('#modalBackdrop').classList.remove('open');finishRun()};
$('#denyApproval').onclick=()=>{$('#modalBackdrop').classList.remove('open');toast('已停止在审批点；研究数据与检查点保留')};
$$('.citation').forEach(b=>b.onclick=()=>{$('#sourceText').textContent=b.dataset.source;$('#sourcePopover').classList.add('open')});
$('#closeSource').onclick=()=>$('#sourcePopover').classList.remove('open');
$('#restoreBtn').onclick=()=>{const cp=JSON.parse(localStorage.getItem('investBuddyCheckpoint')||'null');$('#resumeNotice').style.display='none';toast(cp?`已恢复步骤 ${cp.step} 的上下文、记忆与证据`:'已恢复演示检查点')};
$('#dismissResume').onclick=()=>$('#resumeNotice').style.display='none';
$('#sendBtn').onclick=()=>{const v=$('#goalInput').value.trim();if(!v)return toast('请先输入研究目标或补充条件');toast('约束已写入线程记忆，Agent 正在重规划');$('#goalInput').value='';setTimeout(advance,850)};
$('#newThread').onclick=()=>{if(confirm('新建研究线程？当前运行已自动保存为检查点。')){checkpoint();location.reload()}};
$('#exportBtn').onclick=()=>{openApproval()};
$('#logsBtn').onclick=()=>toast('运行日志：8 次调用 · 1 次超时 · 2 次重试 · 0 次越权');
$('#evidenceFilter').onclick=()=>toast('证据库：8 条事实 · 3 条信号 · 1 条待核');
$$('.step').forEach(el=>el.onclick=()=>{if(+el.dataset.step===6)openApproval();else toast(`任务 ${el.dataset.step}：状态与工具调用详情已展开`) });
setTimeout(()=>{if(state.running&&state.progress===3)advance()},5000);
