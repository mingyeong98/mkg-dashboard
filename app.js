var DATA=null, TOKEN=null, SEL={}, SELMODE=false, CUR_SPACE='';
try{ TOKEN=sessionStorage.getItem('bkg_tok'); CUR_SPACE=sessionStorage.getItem('mkg_space')||''; }catch(e){}
function isLight(){ return document.body.classList.contains('light'); }
function applyTheme(t){ document.body.classList.toggle('light', t==='light'); var b=document.getElementById('themeBtn'); if(b) b.textContent = t==='light' ? '다크 스타일로 보기' : '라이트 스타일로 보기'; try{ localStorage.setItem('mkg_theme', t); }catch(e){} if(DATA) render(); }
(function(){ var t='dark'; try{ t=localStorage.getItem('mkg_theme')||'dark'; }catch(e){} applyTheme(t); })();
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function toast(m){var t=document.createElement('div');t.className='toast';t.textContent=m;document.body.appendChild(t);setTimeout(function(){t.remove();},2200);}
function run(fn,args,cb){
  fetch(window.MKG_API,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({fn:fn,args:args})})
    .then(function(r){return r.json();})
    .then(function(j){ if(!j.ok) throw new Error(j.error); cb(j.data); })
    .catch(function(e){ toast('오류: '+(e&&e.message||e)); var c=document.getElementById('sConn'); if(c) c.textContent='연결 오류'; var g=document.getElementById('gErr'); if(g && !document.getElementById('gate').classList.contains('hide')) g.textContent='서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.'; });
}
function isMaster(){ return !!(DATA&&DATA.me&&DATA.me.role==='master'); }
function load(){ run('getBoard',[TOKEN,CUR_SPACE],function(d){ if(!d.auth){ showGate(); return; } hideGate(); DATA=d; CUR_SPACE=d.space||''; try{ sessionStorage.setItem('mkg_space',CUR_SPACE); }catch(e){} document.getElementById('who').textContent=d.me.id+' ('+(d.me.role==='master'?'마스터':'관리자 · '+d.me.space)+')';d.members.forEach(function(m,i){m._i=i;});render();document.getElementById('sConn').textContent='시트 연결 완료';}); }
function hx(h){h=String(h||'#888888').replace('#','');if(h.length===3)h=h.split('').map(function(x){return x+x;}).join('');var n=parseInt(h,16);return [(n>>16)&255,(n>>8)&255,n&255];}
function rgba(h,a){var c=hx(h);return 'rgba('+c[0]+','+c[1]+','+c[2]+','+a+')';}
function lite(h,t){var c=hx(h).map(function(x){return Math.round(x+(255-x)*t);});return 'rgb('+c.join(',')+')';}
function tcol(h){ if(!isLight()) return lite(h,.35); var c=hx(h).map(function(x){return Math.round(x*0.55);}); return 'rgb('+c.join(',')+')'; }
function gcol(g){return (DATA.colors&&DATA.colors.groups[g])||'#f5c451';}
function scol(g,s){return (DATA.colors&&DATA.colors.subs[g+'|'+s])||{bg:'#2a2410',fg:'#f5c451'};}
function rate(m){var t=m.w+m.l;return t?m.w/t:0;}
function pct(x){return (x*100).toFixed(1)+'%';}
function shortName(n){return n.length>2?n.slice(0,2):n;}
function isAdmin(){return !!TOKEN;}
var HASMASTER=true;
function showGate(){ run('authStatus',[TOKEN],function(s){ HASMASTER=s.hasMaster; var reg=!s.hasMaster; document.getElementById('gTitle').textContent=reg?'마스터 계정 만들기':'관리자 로그인'; document.getElementById('gDesc').textContent=reg?'처음 등록하는 계정이 마스터 계정이 됩니다 (최초 1회)':'등록된 관리자만 대시보드에 들어갈 수 있습니다'; document.getElementById('gPw2Wrap').classList.toggle('hide',!reg); document.getElementById('gGo').textContent=reg?'마스터 계정 생성':'로그인'; document.getElementById('gate').classList.remove('hide'); document.getElementById('gId').focus(); }); }
function hideGate(){ document.getElementById('gate').classList.add('hide'); }
function gateGo(){ var id=document.getElementById('gId').value, pw=document.getElementById('gPw').value, err=document.getElementById('gErr'); err.textContent='';
  var done=function(r){ if(!r.ok){ err.textContent=r.msg; return; } TOKEN=r.token; try{sessionStorage.setItem('bkg_tok',TOKEN);}catch(e){} document.getElementById('gPw').value=''; document.getElementById('gPw2').value=''; load(); };
  if(!HASMASTER){ if(pw!==document.getElementById('gPw2').value){ err.textContent='비밀번호 확인이 일치하지 않습니다'; return; } run('registerMaster',[id,pw],done); } else run('login',[id,pw],done); }
document.getElementById('gGo').onclick=gateGo; document.getElementById('gPw').onkeydown=function(e){if(e.key==='Enter')gateGo();}; document.getElementById('gPw2').onkeydown=function(e){if(e.key==='Enter')gateGo();};
function render(){
  var d=DATA; if(!d) return;
  document.getElementById('sMem').textContent=d.members.length+'명';
  document.getElementById('sRec').textContent=d.totalRecords+'게임';
  document.getElementById('sUpd').textContent=d.updated;
  document.getElementById('loginBtn').textContent='관리자 로그아웃'; document.getElementById('acctBtn').textContent=(DATA.me&&DATA.me.role==='master')?'계정 관리 (마스터)':'계정 관리';
  document.getElementById('addBtn').classList.toggle('hide',!isAdmin());
  document.getElementById('delBtn').classList.toggle('hide',!isAdmin());
  var sb=document.getElementById('spaceBox');
  if(isMaster()){
    sb.innerHTML='<div class="lbl" style="margin-top:0">카테고리 (마스터)</div><select id="spaceSel" class="ssel"><option value="">전체 보기</option>'+d.spaces.map(function(x){return '<option value="'+esc(x)+'"'+(x===d.space?' selected':'')+'>'+esc(x)+'</option>';}).join('')+'</select>';
    document.getElementById('spaceSel').onchange=function(){ CUR_SPACE=this.value; SEL={}; load(); };
  } else sb.innerHTML='<div class="lbl" style="margin-top:0">내 카테고리</div><div class="stag">'+esc(d.me.space)+'</div>';
  document.getElementById('spaceTitle').textContent = d.space ? ' · '+d.space : (isMaster()?' · 전체':'');
  var bx=document.getElementById('boardBox'); var bl=(d.boards||[]).filter(function(b){ return !d.space || b.space===d.space; });
  var gs=function(id){ return 'https://docs.google.com/spreadsheets/d/'+id+'/edit'; };
  bx.innerHTML = bl.length ? '<div class="lbl" style="margin-top:0">킬내기 시트</div>'+bl.map(function(b){ return '<div class="bset">'+(isMaster()?'<div class="bsn">'+esc(b.space)+'</div>':'')+'<a target="_blank" rel="noopener" href="'+gs(b.tier)+'">티어표</a><a target="_blank" rel="noopener" href="'+gs(b.hell)+'">킬내기</a><a target="_blank" rel="noopener" href="'+gs(b.dk)+'">마이너스없는 킬내기</a><a target="_blank" rel="noopener" href="'+gs(b.bingo)+'">빙고 킬내기</a>'+(b.kanbu?'<a target="_blank" rel="noopener" href="'+gs(b.kanbu)+'">깐부 킬내기</a>':'')+'</div>'; }).join('') : '';
  bx.classList.toggle('hide', !bl.length);
  var pts={}; d.tiers.forEach(function(t){pts[t.key]=t;});
  var nav='';
  d.groups.forEach(function(g){
    nav+='<div class="tgrp" style="border-color:'+(isLight()?rgba(gcol(g.g),.45):'var(--line)')+'"><h4 style="color:'+tcol(gcol(g.g))+';background:'+rgba(gcol(g.g),isLight()?.18:.1)+'">'+esc(g.g)+'</h4><div class="tgrid">';
    g.subs.forEach(function(s){var t=pts[g.g+'|'+s]||{};var p=(t.pts===''||t.pts==null)?'':' ('+t.pts+')';
      var sc=scol(g.g,s);nav+='<div style="box-shadow:inset 3px 0 0 '+sc.bg+'" onclick="jump(\''+esc(g.g+'_'+s)+'\')">'+esc(s)+p+'</div>';});
    nav+='</div></div>';
  });
  document.getElementById('tierNav').innerHTML=nav;
  var q=document.getElementById('q').value.trim();
  var html='';
  d.groups.forEach(function(g){
    var gm=d.members.filter(function(m){return m.g===g.g && (!q||m.name.indexOf(q)>=0);});
    if(q && !gm.length) return;
    html+='<section class="card tier" style="border-color:'+(isLight()?rgba(gcol(g.g),.4):'var(--line)')+'"><div class="th" style="'+(isLight()?'background:linear-gradient(90deg,'+rgba(gcol(g.g),.32)+',rgba(255,255,255,0) 78%)':'background:linear-gradient(90deg,'+rgba(gcol(g.g),.14)+',rgba(26,27,30,0) 55%);box-shadow:inset 3px 0 0 '+gcol(g.g))+'"><h2 style="color:'+tcol(gcol(g.g))+'">'+esc(g.g)+'</h2><span class="cnt">'+gm.length+'명</span></div>';
    g.subs.forEach(function(s){
      var sm=gm.filter(function(m){return m.s===s;});
      if(q && !sm.length) return;
      var t=pts[g.g+'|'+s]||{};
      var scc=scol(g.g,s);html+='<div class="subsec" id="'+esc(g.g+'_'+s)+'"><h3><b style="display:flex;align-items:center;gap:8px"><i style="width:10px;height:10px;border-radius:3px;background:'+scc.bg+';display:inline-block"></i>'+esc(s)+'</b><span>'+sm.length+'명'+(t.pen?' · 패널티 '+(t.pen>0?'+':'')+t.pen:'')+'</span></h3>';
      if(!sm.length) html+='<div class="empty">등록된 멤버가 없습니다</div>';
      sm.forEach(function(m){
        var chips=m.recent.map(function(r){var k=m.space+':'+r.row;return '<div class="chip '+(r.res==='승'?'W':'L')+(SEL[k]?' sel':'')+'" title="'+esc(r.game)+'" onclick="pick('+r.row+','+m._i+',this)">'+esc(r.res)+'</div>';}).join('');
        var ix=m._i;
        html+='<div class="pl" style="border-left:3px solid '+scol(m.g,m.s).bg+'"><div class="nm"><span class="badge" style="background:'+scol(m.g,m.s).bg+';color:'+scol(m.g,m.s).fg+';border-color:transparent">'+esc(shortName(m.name))+'</span><div class="full">'+esc(m.name)+'</div>'+(isMaster()&&!d.space?'<div class="sptag">'+esc(m.space)+'</div>':'')+'</div>'+
          '<div class="chips">'+(chips||'<span class="empty" style="grid-column:1/-1;padding:0">전적 없음</span>')+'</div>'+
          '<div class="nums"><div class="num">'+m.w+'승</div><div class="num">'+m.l+'패</div><div class="num">'+pct(rate(m))+'</div></div>'+
          '<div class="acts'+(isAdmin()?'':' hide')+'">'+
          '<button onclick="pa('+ix+',\'W\')">승</button><button onclick="pa('+ix+',\'L\')">패</button>'+
          '<button onclick="pa('+ix+',\'undo\')">취소</button><button class="y" onclick="pa('+ix+',\'reset\')">초기화</button>'+
          '<button onclick="pa('+ix+',\'rename\')">수정</button><button onclick="pa('+ix+',\'move\')">이동</button>'+(isMaster()?'<button onclick="pa('+ix+',\'space\')">카테고리</button>':'')+
          '<button class="r" onclick="pa('+ix+',\'delete\')">삭제</button></div></div>';
      });
      html+='</div>';
    });
    html+='</section>';
  });
  document.getElementById('board').innerHTML=html||'<div class="card load">검색 결과가 없습니다</div>';
  document.getElementById('board').classList.toggle('selmode',SELMODE);
  var rk=d.members.filter(function(m){return m.w+m.l>0;}).sort(function(a,b){return rate(b)-rate(a)||b.w-a.w||(b.w+b.l)-(a.w+a.l);}).slice(0,10);
  document.getElementById('rankList').innerHTML=rk.map(function(m,i){return '<div class="ri"><div class="n">'+(i+1)+'</div><div><b>'+esc(m.name)+'</b><div class="s" style="color:'+tcol(scol(m.g,m.s).bg)+'">'+esc(m.g==='BABY'||m.g==='미배정'?m.g:m.g+' '+m.s)+'</div></div><div class="p">'+pct(rate(m))+'<span>'+m.w+'승 '+m.l+'패</span></div></div>';}).join('');
}
function pa(i,k){var n=DATA.members[i].name;
  if(k==='W') act('result',{name:n,res:'승'}); else if(k==='L') act('result',{name:n,res:'패'});
  else if(k==='undo') act('undo',{name:n},'마지막 전적 취소');
  else if(k==='reset'){ if(confirm(n+' 전적을 모두 초기화할까요?')) act('reset',{name:n},'초기화 완료'); }
  else if(k==='delete'){ if(confirm(n+' 멤버를 삭제할까요? (전적 기록은 남습니다)')) act('delete',{name:n},'삭제 완료'); }
  else if(k==='rename') renameM(i); else if(k==='move') moveM(i); else if(k==='space') spaceM(i);}
function spaceOpts(sel){ return DATA.spaces.map(function(x){return '<option value="'+esc(x)+'"'+(x===sel?' selected':'')+'>'+esc(x)+'</option>';}).join(''); }
function spaceM(i){var m=DATA.members[i];modal('<h3>카테고리 이동 · '+esc(m.name)+'</h3><label>옮길 카테고리</label><select id="mS">'+spaceOpts(m.space)+'</select><div class="f"><button class="btn" onclick="closeM()">취소</button><button class="btn" id="mOk">이동</button></div>');
  document.getElementById('mOk').onclick=function(){var v=document.getElementById('mS').value;closeM();act('setSpace',{name:m.name,to:v},'카테고리를 옮겼습니다');};}
function jump(id){var e=document.getElementById(id);if(e)e.scrollIntoView({behavior:'smooth',block:'start'});}
function act(a,args,msg){ if(!TOKEN){toast('관리자 로그인이 필요합니다');return;} args=args||{}; if(args.space==null){ var mm=(args.name&&DATA)?DATA.members.filter(function(x){return x.name===args.name;})[0]:null; args.space=mm?mm.space:CUR_SPACE; }
  run('adminAction',[TOKEN,a,args],function(r){ if(!r.ok){ if(/로그인/.test(r.msg)){TOKEN=null;try{sessionStorage.removeItem('bkg_tok');}catch(e){} showGate();} toast(r.msg); render(); return;} toast(msg||'저장되었습니다'); load(); }); }
function tierOptions(sel){var o='';DATA.groups.forEach(function(g){g.subs.forEach(function(s){var v=g.g+'|'+s;o+='<option value="'+esc(v)+'"'+(v===sel?' selected':'')+'>'+esc(g.g==='BABY'||g.g==='미배정'?g.g:g.g+' '+s)+'</option>';});});return o;}
function modal(h){document.getElementById('modal').innerHTML='<div class="mb" onclick="if(event.target===this)closeM()"><div class="card md">'+h+'</div></div>';}
function closeM(){document.getElementById('modal').innerHTML='';}
function renameM(i){var n=DATA.members[i].name;modal('<h3>이름 수정</h3><label>새 닉네임</label><input id="mNew" value="'+esc(n)+'"><div class="f"><button class="btn" onclick="closeM()">취소</button><button class="btn" id="mOk">저장</button></div>');
  document.getElementById('mOk').onclick=function(){var v=document.getElementById('mNew').value;closeM();act('rename',{name:n,newName:v},'이름 변경 완료');};}
function moveM(i){var m=DATA.members[i];modal('<h3>티어 이동 · '+esc(m.name)+'</h3><label>새 티어</label><select id="mT">'+tierOptions(m.g+'|'+m.s)+'</select><div class="f"><button class="btn" onclick="closeM()">취소</button><button class="btn" id="mOk">이동</button></div>');
  document.getElementById('mOk').onclick=function(){var v=document.getElementById('mT').value.split('|');closeM();act('move',{name:m.name,g:v[0],s:v[1]},'티어 이동 완료');};}
function pick(row,i,el){ if(!SELMODE) return; var name=DATA.members[i].name; var sp=DATA.members[i].space; var k=sp+':'+row; if(SEL[k]) delete SEL[k]; else SEL[k]={row:row,name:name,space:sp}; el.classList.toggle('sel'); document.getElementById('selCnt').textContent=Object.keys(SEL).length; }
document.getElementById('q').addEventListener('input',render);
document.getElementById('allBtn').onclick=function(){document.getElementById('q').value='';render();};
document.getElementById('loginBtn').onclick=function(){ run('logout',[TOKEN],function(){}); TOKEN=null; CUR_SPACE=''; try{sessionStorage.removeItem('bkg_tok');sessionStorage.removeItem('mkg_space');}catch(e){} DATA=null; SELMODE=false; SEL={}; document.getElementById('selBar').classList.add('hide'); showGate(); };
document.getElementById('acctBtn').onclick=function(){
  var master=DATA&&DATA.me&&DATA.me.role==='master';
  var h='<h3>계정 관리</h3><label>내 비밀번호 변경</label><input id="cOld" type="password" placeholder="현재 비밀번호"><input id="cNew" type="password" placeholder="새 비밀번호 (6자 이상)" style="margin-top:6px"><div class="f" style="margin-top:8px"><button class="btn" id="cPw">비밀번호 변경</button></div>';
  if(master) h+='<label style="margin-top:18px;color:var(--gold)">관리자 계정 (마스터 전용)</label><div class="hint">관리자를 추가하면 아이디 이름으로 카테고리와 킬내기 티어표·점수판 3종(킬내기·마이너스없는 킬내기·빙고 킬내기)이 새로 만들어지고, 팀뽑기 사이트 계정도 같은 아이디/비밀번호로 생성됩니다.</div><div id="cList" style="font-size:12px;color:var(--mut)">불러오는 중…</div>'+
    '<input id="aId" placeholder="새 관리자 아이디 (= 카테고리 이름)" style="margin-top:8px"><input id="aPw" type="password" placeholder="비밀번호 (6자 이상)" style="margin-top:6px"><input id="aEm" placeholder="시트를 공유할 구글 이메일 (선택)" style="margin-top:6px">'+
    '<div class="optbox"><div class="lbl" style="margin-top:0">킬내기 시트 점수 규칙 (킬내기·마이너스없는 킬내기)</div>'+
    '<div class="og"><label>순위 방식</label><select id="oMode"><option>순위 입력</option><option>체크박스</option></select></div>'+
    '<div class="og"><label>TOP N 기준</label><input id="oN" type="number" value="10" min="1"></div>'+
    '<div class="og"><label>킬내기 TOP N 밖 점수</label><input id="oHell" type="number" value="-4"></div>'+
    '<div class="og"><label>마이너스없는 킬내기 TOP N 밖 점수</label><input id="oDk" type="number" value="0"></div>'+
    '<div class="og"><label>🍗 치킨 점수 방식</label><select id="oCm"><option>모든 맵 동일</option><option>맵별</option></select></div>'+
    '<div class="og"><label>🍗 치킨 점수</label><input id="oCp" type="number" value="7"></div>'+
    '<div class="hint" style="margin-top:6px">순위 입력: 순위 1 = 치킨, N보다 큰 순위 = TOP N 밖 점수 · 체크박스: 순위 칸 없이 🍗/TOP 체크로 합산 · TOP N 밖 점수를 0으로 두면 TOP 칸은 점수 없는 기록용 체크박스 · 맵별 점수는 시트 [종합 순위] ⚙ 점수 설정에서 맵마다 바꿀 수 있어요</div></div>'+
    '<div class="f" style="margin-top:8px"><button class="btn" id="cAdd">관리자 추가 + 시트 생성</button></div>';
  h+='<div class="f"><button class="btn" onclick="closeM()">닫기</button></div>';
  modal(h);
  document.getElementById('cPw').onclick=function(){ run('accountAction',[TOKEN,'changePw',{oldPw:document.getElementById('cOld').value,newPw:document.getElementById('cNew').value}],function(r){ toast(r.ok?'비밀번호가 변경되었습니다':r.msg); if(r.ok) closeM(); }); };
  if(master){
    var refresh=function(){ run('accountAction',[TOKEN,'list',{}],function(r){ if(!r.ok){toast(r.msg);return;}
      document.getElementById('cList').innerHTML=r.list.map(function(u){ return '<div class="row lrow"><span>'+esc(u.id)+' · '+(u.role==='master'?'마스터 (전체 보기)':'관리자 · 카테고리 '+esc(u.space))+'</span>'+(u.role==='master'?'':'<button class="btn sbtn" data-rm="'+esc(u.id)+'">삭제</button>')+'</div>'; }).join('');
      Array.prototype.forEach.call(document.querySelectorAll('#cList [data-rm]'),function(b){ b.onclick=function(){ var id=b.getAttribute('data-rm'); if(confirm(id+' 계정을 삭제할까요? (킬내기 시트와 기록은 남습니다)')) run('accountAction',[TOKEN,'remove',{id:id}],function(r){ toast(r.ok?'삭제되었습니다':r.msg); refresh(); }); }; });
    }); };
    refresh();
    document.getElementById('cAdd').onclick=function(){ var btn=this; var g=function(i){ return document.getElementById(i).value; };
      var opts={rankMode:g('oMode'),topN:g('oN'),hellOut:g('oHell'),dkOut:g('oDk'),chickenMode:g('oCm'),chicken:g('oCp')};
      btn.disabled=true; btn.textContent='시트 만드는 중… (최대 1분)';
      run('accountAction',[TOKEN,'add',{id:g('aId'),pw:g('aPw'),email:g('aEm'),opts:opts}],function(r){ btn.disabled=false; btn.textContent='관리자 추가 + 시트 생성';
        if(!r.ok){ toast(r.msg); return; } toast('관리자 추가 완료 · 티어표·점수판 생성 · '+(r.draft||'')); document.getElementById('aId').value=''; document.getElementById('aPw').value=''; document.getElementById('aEm').value=''; refresh(); load(); }); };
  }
};
document.getElementById('addBtn').onclick=function(){
  modal('<h3>전적 추가</h3><label>경기명 (비우면 오늘 날짜)</label><input id="aG" placeholder="예: 9.30 21:00 연도">'+
    '<label>승리 멤버 (쉼표로 구분)</label><textarea id="aW" placeholder="꼬마만두"></textarea>'+
    '<label>패배 멤버 (쉼표로 구분)</label><textarea id="aL"></textarea>'+
    '<label style="margin-top:14px;color:var(--gold)">＋ 새 멤버 등록 (선택)</label><input id="aN" placeholder="닉네임"><select id="aT" style="margin-top:6px">'+tierOptions('미배정|미배정')+'</select>'+
    '<div class="f"><button class="btn" onclick="closeM()">취소</button><button class="btn" id="aGo">저장</button></div>');
  document.getElementById('aGo').onclick=function(){var g=document.getElementById('aG').value; var sp=function(id){return document.getElementById(id).value.split(/[,\n]/).map(function(x){return x.trim();}).filter(String);}; var nn=document.getElementById('aN').value.trim(), v=document.getElementById('aT').value.split('|'), w=sp('aW'), l=sp('aL'); closeM();
    var after=function(){ if(w.length||l.length) act('addGame',{game:g,winners:w,losers:l},'전적이 추가되었습니다'); else load(); };
    if(nn) run('adminAction',[TOKEN,'addMember',{name:nn,g:v[0],s:v[1],space:CUR_SPACE}],function(r){ if(!r.ok) toast(r.msg); else toast('멤버 등록 완료'); after(); }); else after(); };
};
document.getElementById('themeBtn').onclick=function(){ applyTheme(isLight()?'dark':'light'); };
document.getElementById('delBtn').onclick=function(){ SELMODE=true; SEL={}; document.getElementById('selCnt').textContent='0'; document.getElementById('selBar').classList.remove('hide'); render(); toast('삭제할 전적 칸을 클릭하세요'); };
document.getElementById('selCancel').onclick=function(){ SELMODE=false; SEL={}; document.getElementById('selBar').classList.add('hide'); render(); };
document.getElementById('selDo').onclick=function(){ var items=Object.keys(SEL).map(function(k){return SEL[k];}); if(!items.length){toast('선택된 전적이 없습니다');return;} if(!confirm(items.length+'개 전적을 삭제할까요?')) return; SELMODE=false; SEL={}; document.getElementById('selBar').classList.add('hide'); act('deleteRecords',{items:items},items.length+'개 전적 삭제'); };
load();
