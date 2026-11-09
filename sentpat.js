/* 句子練習：問句 → 答句 句型產生器（純資料＋純函式，可在 Node 測試）
   要加新句型：在 PATS 加一個 {id,zh,rule,gen}；要加新字：在 NOUNS／PLACES／COLORS 加一筆。
   名詞只用這份精選對照表（單複數、a/an、類別都寫好），不會把單字表裡的字直接塞進句子。 */
(function(root){
'use strict';
var NUM='zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty'.split(' ');
/* 類別 c：f 食物、s 小東西／玩具、cl 衣物、a 小動物、b 大東西、bd 身體（只用在 my toes 這種句子）
   p:null＝沒有單數（scissors、feet 只用複數）；core:1＝喬登美語 Jack-of-English 3 Quiz 4 的字，一定會出
   keys：小朋友單字表裡出現這些字時，這個名詞會更常出現；adj：可以用的形容詞對 */
var NOUNS=[
 {s:'ball',p:'balls',a:'a',e:'⚽',zh:'球',c:'s',adj:['big','new'],core:1,keys:['ball','balls']},
 {s:'marker',p:'markers',a:'a',e:'🖍️',zh:'麥克筆',c:'s',adj:['new','long'],core:1,keys:['marker','markers']},
 {s:'crayon',p:'crayons',a:'a',e:'🖍️',zh:'蠟筆',c:'s',adj:['new','long'],core:1,keys:['crayon','crayons']},
 {s:'flower',p:'flowers',a:'a',e:'🌸',zh:'花',c:'s',adj:['big'],core:1,keys:['flower','flowers']},
 {s:null,p:'scissors',e:'✂️',zh:'剪刀',c:'s',adj:['new','big'],core:1,keys:['scissors']},
 {s:'muffin',p:'muffins',a:'a',e:'🧁',zh:'馬芬蛋糕',c:'f',adj:['big'],core:1,keys:['muffin','muffins']},
 {s:'train',p:'trains',a:'a',e:'🚆',zh:'火車',c:'b',veh:1,adj:['long','new','big'],core:1,keys:['train','trains']},
 {s:'bagel',p:'bagels',a:'a',e:'🥯',zh:'貝果',c:'f',adj:['big'],core:1,keys:['bagel','bagels']},
 {s:'sweater',p:'sweaters',a:'a',e:'🧥',zh:'毛衣',c:'cl',adj:['clean','new','big'],core:1,keys:['sweater','sweaters']},
 {s:'jump rope',p:'jump ropes',a:'a',e:'🪢',zh:'跳繩',c:'s',adj:['long','new'],core:1,keys:['jump rope','jump ropes']},
 {s:'hula hoop',p:'hula hoops',a:'a',e:'⭕',zh:'呼拉圈',c:'s',adj:['big','new'],core:1,keys:['hula hoop','hula hoops']},
 {s:'bun',p:'buns',a:'a',e:'🍞',zh:'小圓麵包',c:'f',adj:['big'],core:1,keys:['bun','buns']},
 {s:'toe',p:'toes',e:'🦶',zh:'腳趾',c:'bd',adj:['clean'],core:1,keys:['toe','toes']},
 {s:'T-shirt',p:'T-shirts',a:'a',e:'👕',zh:'T恤',c:'cl',adj:['clean','new','big'],core:1,keys:['t-shirt','t-shirts','tshirt']},
 /* 以前單字表裡的字（有學過才出現） */
 {s:'cake',p:'cakes',a:'a',e:'🍰',zh:'蛋糕',c:'f',adj:['big'],keys:['cake','cakes']},
 {s:'flag',p:'flags',a:'a',e:'🚩',zh:'旗子',c:'s',adj:['big','new'],keys:['flag','flags']},
 {s:'car',p:'cars',a:'a',e:'🚗',zh:'汽車',c:'b',veh:1,adj:['big','new'],keys:['car','cars']},
 {s:'bug',p:'bugs',a:'a',e:'🐛',zh:'小蟲',c:'a',adj:['big'],keys:['bug','bugs']},
 {s:'hand',p:'hands',e:'✋',zh:'手',c:'bd',adj:['clean'],keys:['hand','hands']},
 {s:null,p:'feet',e:'🦶',zh:'腳',c:'bd',adj:['clean'],keys:['feet','foot']},
 {s:'box',p:'boxes',a:'a',e:'📦',zh:'盒子',c:'s',adj:['big','new'],keys:['box','boxes']},
 {s:'frog',p:'frogs',a:'a',e:'🐸',zh:'青蛙',c:'a',adj:['big'],keys:['frog','frogs']},
 {s:'goose',p:'geese',a:'a',e:'🪿',zh:'鵝',c:'a',adj:['big'],keys:['goose','geese']},
 {s:'cow',p:'cows',a:'a',e:'🐮',zh:'乳牛',c:'b',adj:['big'],keys:['cow','cows']},
 {s:'cap',p:'caps',a:'a',e:'🧢',zh:'棒球帽',c:'cl',adj:['clean','new','big'],keys:['cap','caps']},
 {s:'plate',p:'plates',a:'a',e:'🍽️',zh:'盤子',c:'s',adj:['clean','big'],keys:['plate','plates']},
 {s:'yo-yo',p:'yo-yos',a:'a',e:'🪀',zh:'溜溜球',c:'s',adj:['new'],keys:['yo-yo','yo-yos','yoyo']},
 {s:'rope',p:'ropes',a:'a',e:'🪢',zh:'繩子',c:'s',adj:['long'],keys:['rope','ropes']},
 {s:'sofa',p:'sofas',a:'a',e:'🛋️',zh:'沙發',c:'b',veh:1,adj:['big','new'],keys:['sofa','sofas']},
 /* 常見的二年級字：以後單字表加進來就會自動出現 */
 {s:'apple',p:'apples',a:'an',e:'🍎',zh:'蘋果',c:'f',adj:['big'],keys:['apple','apples']},
 {s:'egg',p:'eggs',a:'an',e:'🥚',zh:'蛋',c:'f',adj:['big'],keys:['egg','eggs']},
 {s:'orange',p:'oranges',a:'an',e:'🍊',zh:'柳橙',c:'f',adj:['big'],keys:['orange','oranges']},
 {s:'banana',p:'bananas',a:'a',e:'🍌',zh:'香蕉',c:'f',adj:['long'],keys:['banana','bananas']},
 {s:'book',p:'books',a:'a',e:'📕',zh:'書',c:'s',adj:['new','big'],keys:['book','books']},
 {s:'pencil',p:'pencils',a:'a',e:'✏️',zh:'鉛筆',c:'s',adj:['long','new'],keys:['pencil','pencils']},
 {s:'eraser',p:'erasers',a:'an',e:'🧽',zh:'橡皮擦',c:'s',adj:['new','big'],keys:['eraser','erasers']},
 {s:'ruler',p:'rulers',a:'a',e:'📏',zh:'尺',c:'s',adj:['long','new'],keys:['ruler','rulers']},
 {s:'bag',p:'bags',a:'a',e:'🎒',zh:'書包',c:'s',adj:['big','new','clean'],keys:['bag','bags','schoolbag']},
 {s:'umbrella',p:'umbrellas',a:'an',e:'☂️',zh:'雨傘',c:'s',adj:['big','new'],keys:['umbrella','umbrellas']},
 {s:'cat',p:'cats',a:'a',e:'🐱',zh:'貓',c:'a',adj:['big'],keys:['cat','cats']},
 {s:'dog',p:'dogs',a:'a',e:'🐶',zh:'狗',c:'a',adj:['big'],keys:['dog','dogs']},
 {s:'bird',p:'birds',a:'a',e:'🐦',zh:'鳥',c:'a',adj:['big'],keys:['bird','birds']},
 {s:'rabbit',p:'rabbits',a:'a',e:'🐰',zh:'兔子',c:'a',adj:['big'],keys:['rabbit','rabbits','bunny']},
 {s:'duck',p:'ducks',a:'a',e:'🦆',zh:'鴨子',c:'a',adj:['big'],keys:['duck','ducks']},
 {s:'ant',p:'ants',a:'an',e:'🐜',zh:'螞蟻',c:'a',adj:['big'],keys:['ant','ants']},
 {s:'mouse',p:'mice',a:'a',e:'🐭',zh:'老鼠',c:'a',adj:['big'],keys:['mouse','mice']},
 {s:'sock',p:'socks',a:'a',e:'🧦',zh:'襪子',c:'cl',adj:['clean','new','long'],keys:['sock','socks']},
 {s:'shoe',p:'shoes',a:'a',e:'👟',zh:'鞋子',c:'cl',adj:['clean','new','big'],keys:['shoe','shoes']},
 {s:'hat',p:'hats',a:'a',e:'👒',zh:'帽子',c:'cl',adj:['clean','new','big'],keys:['hat','hats']},
 {s:'dress',p:'dresses',a:'a',e:'👗',zh:'洋裝',c:'cl',adj:['clean','new','long'],keys:['dress','dresses']},
 {s:'kite',p:'kites',a:'a',e:'🪁',zh:'風箏',c:'s',adj:['big','new'],keys:['kite','kites']},
 {s:'doll',p:'dolls',a:'a',e:'🪆',zh:'娃娃',c:'s',adj:['big','new'],keys:['doll','dolls']},
 {s:'robot',p:'robots',a:'a',e:'🤖',zh:'機器人',c:'s',adj:['big','new'],keys:['robot','robots']},
 {s:'bus',p:'buses',a:'a',e:'🚌',zh:'公車',c:'b',veh:1,adj:['big','new'],keys:['bus','buses']},
 {s:'cup',p:'cups',a:'a',e:'🥤',zh:'杯子',c:'s',adj:['big','clean'],keys:['cup','cups']},
 {s:'pig',p:'pigs',a:'a',e:'🐷',zh:'豬',c:'b',adj:['big','clean'],keys:['pig','pigs']}
];
/* 形容詞對（問一個、No 的時候答相反的） */
var ADJ={big:'small',small:'big',clean:'dirty',dirty:'clean',new:'old',old:'new',long:'short',short:'long'};
var ADJZH={big:'大',small:'小',clean:'乾淨',dirty:'髒',new:'新',old:'舊',long:'長',short:'短'};
var PRZH={'in':'裡面','on':'上面','under':'下面','behind':'後面','in front of':'前面','next to':'旁邊'};
/* 地點：pr＝可以用的位置介系詞 → 可以放的名詞類別 */
var PLACES=[
 {k:'box',e:'📦',zh:'盒子',pr:{'in':'sfa','on':'sfa','under':'sfa','behind':'sfa','in front of':'sfa','next to':'sfa'},core:1},
 {k:'bag',e:'🎒',zh:'袋子',pr:{'in':'sf','behind':'sfa','in front of':'sfa','next to':'sfa'},core:1},
 {k:'basket',e:'🧺',zh:'籃子',pr:{'in':'sf','next to':'sfa','behind':'sfa'},core:1},
 {k:'fridge',e:'svg:fridge',zh:'冰箱',pr:{'in':'f','next to':'sab','in front of':'sab'},core:1},
 {k:'seesaw',e:'svg:seesaw',zh:'翹翹板',pr:{'under':'sfa','on':'sa','next to':'sfab','in front of':'sfab'},core:1},
 {k:'book',e:'📕',zh:'書',pr:{'on':'sf','under':'s','behind':'sf','in front of':'sf','next to':'sf'},core:1},
 {k:'table',e:'svg:table',zh:'桌子',pr:{'on':'sf','under':'sfa','next to':'sfab','in front of':'sfab'},core:1},
 {k:'sofa',e:'🛋️',zh:'沙發',pr:{'on':'sfa','under':'sa','behind':'sfab','in front of':'sfab','next to':'sfab'},core:1},
 {k:'bed',e:'🛏️',zh:'床',pr:{'on':'sfa','under':'sa','next to':'sfab'},core:1},
 {k:'chair',e:'🪑',zh:'椅子',pr:{'on':'sfa','under':'sa','next to':'sfab'},core:1},
 {k:'tree',e:'🌳',zh:'樹',pr:{'under':'sfab','behind':'sfab','in front of':'sfab','next to':'sfab'},core:1},
 {k:'cage',e:'svg:cage',zh:'籠子',pr:{'in':'a','next to':'sfab'},keys:['cage','cages']}
];
var COLORS=[
 {k:'red',zh:'紅色',hex:'#ef3b3b'},{k:'blue',zh:'藍色',hex:'#2f7cf6'},{k:'black',zh:'黑色',hex:'#222'},{k:'pink',zh:'粉紅色',hex:'#ff8fc0'},
 {k:'green',zh:'綠色',hex:'#34b858'},{k:'yellow',zh:'黃色',hex:'#ffd21f'},{k:'white',zh:'白色',hex:'#fff'},{k:'orange',zh:'橘色',hex:'#ff8a1f'},
 {k:'purple',zh:'紫色',hex:'#9b59e0'},{k:'brown',zh:'咖啡色',hex:'#8b5a2b'}];
var POSS=[{k:'my',zh:'我'},{k:'your',zh:'你'},{k:'their',zh:'他們'},{k:'his',zh:'他'},{k:'her',zh:'她'}];
/* 句型卡（第二次答錯時的提示） */
var PATS=[
 {id:'isThere',zh:'Is there…?',rule:'Is there…? → Yes, there is. ／ No, there isn\'t.',clue:'Is there'},
 {id:'areThere',zh:'Are there…?',rule:'Are there…? → Yes, there are. ／ No, there aren\'t. ／ No, there are + 數字',clue:'Are there'},
 {id:'isIt',zh:'Is this / that / it…?',rule:'Is this / that / it / the…? → Yes, it is. ／ No, it isn\'t.',clue:'Is'},
 {id:'areThey',zh:'Are these / those / my…?',rule:'Are these / those / your…? → Yes, they are. ／ No, they are not.',clue:'Are'},
 {id:'whatIs',zh:'What is this?',rule:'What is this / that? → It is a ＿＿.',clue:'What is'},
 {id:'whatAre',zh:'What are these?',rule:'What are these / those? → They are ＿＿s. ／ Those are ＿＿s.',clue:'What are'},
 {id:'whatColor',zh:'What color…?',rule:'What color is…? → It is ＋顏色。 What color are…? → They are ＋顏色。',clue:'What color'},
 {id:'howMany',zh:'How many…?',rule:'How many ＿＿s are there…? → There are ＋數字 ＋＿＿s.',clue:'How many'},
 {id:'whereIs',zh:'Where is…?',rule:'Where is…? → It is ＋ in / on / under / behind… ＋ the ＿＿.',clue:'Where is'},
 {id:'whereAre',zh:'Where are…?',rule:'Where are…? → They are ＋ in / on / under / behind… ＋ the ＿＿.',clue:'Where are'}
];
var PAT={};PATS.forEach(function(p){PAT[p.id]=p});
/* 每個句型容易搞混的字（排排看多放一張「陷阱字卡」） */
var TRAP={isThere:['are'],areThere:['is'],isIt:['they','are'],areThey:['it','is'],whatIs:['they','are'],whatAre:['it','is'],howMany:['is'],whereIs:['they','are'],whereAre:['it','is']};

function cap(s){return s.charAt(0).toUpperCase()+s.slice(1)}
function aN(n){return n.a+' '+n.s}
/* 隨機：可注入（測試時用固定種子） */
function mkRand(seed){if(seed==null)return Math.random;var s=(seed>>>0)||1;return function(){s=(s*1664525+1013904223)>>>0;return s/4294967296}}
function pickW(R,arr,wf){var t=0,ws=arr.map(function(x){var w=wf?wf(x):1;t+=w;return w});var r=R()*t;for(var i=0;i<arr.length;i++){r-=ws[i];if(r<=0)return arr[i]}return arr[arr.length-1]}
function pick(R,arr){return arr[Math.floor(R()*arr.length)]}
function shuf(R,a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(R()*(i+1)),t=a[i];a[i]=a[j];a[j]=t}return a}
/* 斷字：No, there are fifteen bagels. → [No][,][there][are][fifteen][bagels][.] */
function toks(s){return String(s).replace(/([,.?!])/g,' $1 ').split(/\s+/).filter(Boolean)}

/* 字庫：依小朋友單字表（words:[{en,m:是否熟練,r:0~1 越新越大}]）決定可以用哪些字和權重 */
function lexicon(words){
  var have={};(words||[]).forEach(function(w){var k=String(w.en||'').trim().toLowerCase();if(!k)return;var o=have[k]||(have[k]={m:false,r:0});o.m=o.m||!!w.m;o.r=Math.max(o.r,+w.r||0)});
  function info(keys){var best=null;(keys||[]).forEach(function(k){var h=have[k];if(h&&(!best||h.m&&!best.m||h.r>best.r))best=h});return best}
  var nouns=[],places=[],colors=[];
  NOUNS.forEach(function(n){var h=info(n.keys);if(!n.core&&!h)return;
    var w=n.core?2:0;if(h)w+=1+(h.m?1:0)+h.r;nouns.push({n:n,w:w,mine:!!h})});
  PLACES.forEach(function(p){var h=info(p.keys||[p.k]);if(!p.core&&!h)return;places.push({p:p,w:1+(h?1+(h.m?.5:0)+h.r*.5:0)})});
  COLORS.forEach(function(c){var h=have[c.k];colors.push({c:c,w:1+(h?1+(h.m?.5:0)+h.r*.5:0)})});
  return {nouns:nouns,places:places,colors:colors}}

function nounW(x){return x.w}
function pNoun(R,L,f){var c=L.nouns.filter(function(x){return f(x.n)});return c.length?pickW(R,c,nounW).n:null}
/* 找一個「名詞＋位置＋地點」合理的組合 */
function pScene(R,L,f,no){no=no||[];
  for(var t=0;t<40;t++){var n=pNoun(R,L,f);if(!n)return null;
    var ok=L.places.filter(function(x){if(x.p.k===n.s||x.p.k===n.p)return false;for(var pr in x.p.pr)if(no.indexOf(pr)<0&&x.p.pr[pr].indexOf(n.c)>=0)return true;return false});
    if(!ok.length)continue;var pl=pickW(R,ok,function(x){return x.w}).p;
    var prs=Object.keys(pl.pr).filter(function(pr){return no.indexOf(pr)<0&&pl.pr[pr].indexOf(n.c)>=0});
    return {n:n,pl:pl,pr:pick(R,prs)}}
  return null}
function where(s){return s.pr+' the '+s.pl.k}
function whereZh(s){return s.pl.zh+PRZH[s.pr]}
function num(R,lo,hi){return lo+Math.floor(R()*(hi-lo+1))}

/* 每個句型的出題。回傳 {q,zh,a(標準答案),acc(可接受的完整答案),valid(這題所有合理答法，含另一種 Yes/No),wrong(干擾選項候選),hint,pic,
   need:{num,noun}（排排看缺字回饋用）} */
var GEN={
 isThere:function(R,L){var s=pScene(R,L,function(n){return !!n.s&&n.c!=='bd'});if(!s)return null;var n=s.n,yes=R()<.5;
   var q='Is there '+aN(n)+' '+where(s)+'?',Y='Yes, there is.',N="No, there isn't.";
   return {q:q,zh:whereZh(s)+'有'+n.zh+'嗎？',a:yes?Y:N,acc:yes?[Y]:[N,'No, there is not.'],valid:[Y,N,'No, there is not.'],hint:[yes?'Yes':'No'],
     wrong:['Yes, there are.',"No, there aren't.",'Yes, it is.','Yes, they are.','It is '+aN(n)+'.','No, they are not.'],
     pic:{k:'scene',e:n.e,pl:s.pl,pr:s.pr,cnt:yes?1:0}}},
 areThere:function(R,L){var s=pScene(R,L,function(n){return !!n.s&&!!n.p&&n.c!=='bd'&&n.c!=='b'},['behind']);if(!s)return null;var n=s.n,k=num(R,2,20),ty=R(),m=k;
   while(m===k)m=num(R,Math.max(2,k-4),Math.min(20,k+4));
   var q='Are there '+NUM[k]+' '+n.p+' '+where(s)+'?',Y='Yes, there are.',N="No, there aren't.",F='No, there are '+NUM[m]+' '+n.p+'.';
   var o=ty<.4?{a:Y,acc:[Y],hint:['Yes'],cnt:k}:ty<.6?{a:N,acc:[N,'No, there are not.'],hint:['No'],cnt:0}:{a:F,acc:[F,'No, there are '+NUM[m]+'.'],hint:['No',NUM[m]],cnt:m,need:{num:NUM[m],noun:n.p}};
   return {q:q,zh:whereZh(s)+'有 '+k+' 個'+n.zh+'嗎？',a:o.a,acc:o.acc,valid:[Y,N,'No, there are not.'].concat(o.acc),hint:o.hint,need:o.need,
     wrong:['Yes, there is.',"No, there isn't.",'Yes, they are.','No, they are not.','There is '+(n.s?aN(n):'one')+'.','It is '+NUM[m]+'.'],
     pic:{k:'scene',e:n.e,pl:s.pl,pr:s.pr,cnt:o.cnt}}},
 isIt:function(R,L){var ty=R(),yes=R()<.5,Y='Yes, it is.',N="No, it isn't.",n,q,zh,o;
   if(ty<.55){n=pNoun(R,L,function(n){return !!n.s&&n.c!=='bd'});if(!n)return null;var d=pick(R,['this','that','it']);
     q='Is '+d+' '+aN(n)+'?';zh=(d==='this'?'這':d==='that'?'那':'它')+'是'+n.zh+'嗎？';
     var m=yes?n:pNoun(R,L,function(z){return !!z.s&&z.c!=='bd'&&z.e!==n.e});if(!m)return null;
     o={a:yes?Y:N,acc:yes?[Y]:[N,'No, it is not.'],valid:[Y,N,'No, it is not.'],hint:[yes?'Yes':'No'],pic:{k:'one',e:m.e,pt:d==='it'?'':d}}}
   else{n=pNoun(R,L,function(n){return !!n.s&&n.c!=='bd'});if(!n)return null;var ad=pick(R,n.adj);if(R()<.4)ad=ADJ[ad];var op=ADJ[ad],F='No, it is '+op+'.';
     q='Is the '+n.s+' '+ad+'?';zh='這個'+n.zh+'很'+ADJZH[ad]+'嗎？';
     o=yes?{a:Y,acc:[Y],hint:['Yes']}:(R()<.5?{a:F,acc:[F,"No, it isn't.",'No, it is not.'],hint:['No',op],need:{adj:op}}:{a:N,acc:[N,'No, it is not.'],hint:['No']});
     o.valid=[Y,N,'No, it is not.',F];o.pic={k:'one',e:n.e,adj:yes?ad:op}}
   return {q:q,zh:zh,a:o.a,acc:o.acc,valid:o.valid,hint:o.hint,need:o.need,pic:o.pic,
     wrong:['Yes, they are.','No, they are not.','Yes, there is.',"No, there isn't.",'They are '+n.p+'.']}},
 areThey:function(R,L){var ty=R(),yes=R()<.5,Y='Yes, they are.',N='No, they are not.',n,q,zh,o,ps;
   if(ty<.35){n=pNoun(R,L,function(n){return !!n.p&&n.c!=='bd'&&n.c!=='b'});if(!n)return null;var d=pick(R,['these','those']);ps=pick(R,POSS.filter(function(p){return p.k!=='my'}));
     q='Are '+d+' '+ps.k+' '+n.p+'?';zh=(d==='these'?'這些':'那些')+'是'+ps.zh+'的'+n.zh+'嗎？';
     o={a:yes?Y:N,acc:yes?[Y]:[N,"No, they aren't."],valid:[Y,N,"No, they aren't."],hint:[yes?'Yes':'No'],pic:{k:'many',e:n.e,cnt:3}}}
   else if(ty<.7){n=pNoun(R,L,function(n){return !!n.p&&n.c!=='b'});if(!n)return null;ps=pick(R,POSS);var ad=pick(R,n.adj);if(R()<.4)ad=ADJ[ad];var op=ADJ[ad],F='No, they are '+op+'.';
     q='Are '+ps.k+' '+n.p+' '+ad+'?';zh=ps.zh+'的'+n.zh+'很'+ADJZH[ad]+'嗎？';
     o=yes?{a:Y,acc:[Y],hint:['Yes']}:(R()<.6?{a:F,acc:[F,N,"No, they aren't."],hint:['No',op],need:{adj:op}}:{a:N,acc:[N,"No, they aren't."],hint:['No']});
     o.valid=[Y,N,"No, they aren't.",F];o.pic={k:'many',e:n.e,cnt:2,adj:yes?ad:op}}
   else{var s=pScene(R,L,function(n){return !!n.p&&n.c!=='bd'&&n.c!=='b'});if(!s)return null;n=s.n;ps=pick(R,POSS);
     q='Are '+ps.k+' '+n.p+' '+where(s)+'?';zh=ps.zh+'的'+n.zh+'在'+whereZh(s)+'嗎？';
     o={a:yes?Y:N,acc:yes?[Y]:[N,"No, they aren't."],valid:[Y,N,"No, they aren't."],hint:[yes?'Yes':'No'],pic:{k:'scene',e:n.e,pl:s.pl,pr:s.pr,cnt:yes?2:0}}}
   return {q:q,zh:zh,a:o.a,acc:o.acc,valid:o.valid,hint:o.hint,need:o.need,pic:o.pic,
     wrong:['Yes, it is.',"No, it isn't.",'Yes, there are.',"No, there aren't.",'It is '+(n.s?aN(n):'big')+'.']}},
 whatIs:function(R,L){var n=pNoun(R,L,function(n){return !!n.s&&n.c!=='bd'});if(!n)return null;var d=R()<.5?'this':'that',A='It is '+aN(n)+'.';
   return {q:'What is '+d+'?',zh:(d==='this'?'這':'那')+'是什麼？',a:A,acc:[A,cap(d)+' is '+aN(n)+'.'],valid:[A,cap(d)+' is '+aN(n)+'.'],hint:[n.s],need:{noun:n.s},
     wrong:['They are '+n.p+'.','Yes, it is.','There is '+aN(n)+'.','Yes, there is.'],pic:{k:'one',e:n.e,pt:d}}},
 whatAre:function(R,L){var n=pNoun(R,L,function(n){return !!n.p&&n.c!=='bd'});if(!n)return null;var d=R()<.5?'these':'those',A=cap(d)+' are '+n.p+'.',T='They are '+n.p+'.';
   var a=d==='those'||R()<.5?A:T;
   return {q:'What are '+d+'?',zh:(d==='these'?'這些':'那些')+'是什麼？',a:a,acc:[A,T],valid:[A,T],hint:[n.p],need:{noun:n.p},
     wrong:[n.s?'It is '+aN(n)+'.':'It is big.','Yes, they are.','There are '+n.p+'.','Yes, there are.'],pic:{k:'many',e:n.e,cnt:3,pt:d}}},
 whatColor:function(R,L){var pl=R()<.5,n=pNoun(R,L,function(n){return (pl?!!n.p:!!n.s)&&n.c!=='bd'&&n.c!=='f'&&n.c!=='a'&&(n.c!=='b'||n.veh)});if(!n)return null;
   var c=pickW(R,L.colors,function(x){return x.w}).c,ps=pick(R,[{k:'the',zh:''},{k:'your',zh:'你的'},{k:'my',zh:'我的'}]);
   var q='What color '+(pl?'are':'is')+' '+ps.k+' '+(pl?n.p:n.s)+'?',A=(pl?'They are ':'It is ')+c.k+'.',W=(pl?'It is ':'They are ')+c.k+'.';
   return {q:q,zh:ps.zh+n.zh+'是什麼顏色？',a:A,acc:[A],valid:[A],hint:[c.k],need:{adj:c.k},
     wrong:[W,'Yes, '+(pl?'they are':'it is')+'.',pl?'There are '+NUM[2+Math.floor(R()*8)]+' '+n.p+'.':'It is '+aN(n)+'.',pl?'They are '+n.p+'.':'There is '+aN(n)+'.'],
     pic:{k:pl?'many':'one',e:n.e,cnt:2,col:c}}},
 howMany:function(R,L){var s=pScene(R,L,function(n){return !!n.s&&!!n.p&&n.c!=='bd'&&n.c!=='b'},['behind']);if(!s)return null;var n=s.n,k=num(R,2,20);
   var A='There are '+NUM[k]+' '+n.p+'.';
   return {q:'How many '+n.p+' are there '+where(s)+'?',zh:whereZh(s)+'有幾個'+n.zh+'？',a:A,acc:[A,'There are '+NUM[k]+'.'],valid:[A,'There are '+NUM[k]+'.'],hint:[NUM[k]],need:{num:NUM[k],noun:n.p},
     wrong:['Yes, there are.','They are '+pick(R,COLORS).k+'.','It is '+NUM[k]+'.','No, there aren\'t.'],
     pic:{k:'scene',e:n.e,pl:s.pl,pr:s.pr,cnt:k}}},
 whereIs:function(R,L){var s=pScene(R,L,function(n){return !!n.s&&n.c!=='bd'});if(!s)return null;var n=s.n,A='It is '+where(s)+'.';
   return {q:'Where is the '+n.s+'?',zh:n.zh+'在哪裡？',a:A,acc:[A],valid:[A],hint:[s.pr,s.pl.k],need:{place:s.pl.k,prep:s.pr},
     wrong:['They are '+where(s)+'.','Yes, it is.','There is '+aN(n)+'.','It is '+aN(n)+'.'],pic:{k:'scene',e:n.e,pl:s.pl,pr:s.pr,cnt:1}}},
 whereAre:function(R,L){var s=pScene(R,L,function(n){return !!n.p&&n.c!=='bd'&&n.c!=='b'});if(!s)return null;var n=s.n,A='They are '+where(s)+'.';
   return {q:'Where are the '+n.p+'?',zh:n.zh+'在哪裡？',a:A,acc:[A],valid:[A],hint:[s.pr,s.pl.k],need:{place:s.pl.k,prep:s.pr},
     wrong:['It is '+where(s)+'.','Yes, they are.','There are '+n.p+'.','They are '+n.p+'.'],pic:{k:'scene',e:n.e,pl:s.pl,pr:s.pr,cnt:2}}}
};
/* 產生一題（含配配看選項、排排看字卡） */
function make(pat,opt){opt=opt||{};var R=opt.rand||Math.random,L=opt.lex||lexicon(opt.words);
  var x=null;for(var t=0;t<8&&!x;t++)x=GEN[pat](R,L);if(!x)return null;
  x.pat=pat;x.rule=PAT[pat].rule;x.clue=PAT[pat].clue;x.acc=uniq(x.acc);x.valid=uniq(x.valid.concat(x.acc));
  /* 配配看：正確答案＋3 個「句型不對」的選項 */
  var wr=uniq(x.wrong.filter(function(w){return w&&x.valid.indexOf(w)<0}));
  x.opts=shuf(R,[x.a].concat(shuf(R,wr).slice(0,3)));
  /* 排排看：答案字卡＋題目裡抄來的字（陷阱）＋句型陷阱字 */
  var at=toks(x.a),inA={};at.concat.apply(at,x.acc.map(toks)).forEach(function(t){inA[t.toLowerCase()]=1});
  x.toks=at;
  var qt=toks(x.q).filter(function(t){return /[a-z]/i.test(t)}).map(function(t){return t.toLowerCase()==='t-shirt'||t.toLowerCase()==='t-shirts'?t:t.toLowerCase()});
  var copy=[],seen={};for(var i=qt.length-1;i>=0&&copy.length<3;i--){var k=qt[i].toLowerCase();if(inA[k]||seen[k])continue;seen[k]=1;copy.unshift(qt[i])}
  var trap=(TRAP[pat]||[]).filter(function(t){return !inA[t]&&!seen[t]}).slice(0,1);
  x.copy=copy;x.trap=trap;x.bank=shuf(R,at.concat(copy,trap));
  return x}
function uniq(a){var o=[],s={};a.forEach(function(x){if(!s[x]){s[x]=1;o.push(x)}});return o}
/* 檢查排好的字卡：回傳 {ok, kind, bad:[索引]} */
function check(x,built){
  var s=built.join(' ').replace(/ ([,.?!])/g,'$1');
  if(x.acc.indexOf(s)>=0)return {ok:true};
  var low=function(t){return t.toLowerCase()},bad=[];
  var cp=x.copy.map(low),tp=x.trap.map(low),at=x.toks;
  built.forEach(function(t,i){if(cp.indexOf(low(t))>=0)bad.push(i)});if(bad.length)return {ok:false,kind:'copy',bad:bad,words:bad.map(function(i){return built[i]})};
  built.forEach(function(t,i){if(tp.indexOf(low(t))>=0)bad.push(i)});if(bad.length)return {ok:false,kind:'trap',bad:bad};
  var need=x.need||{},hb={};built.forEach(function(t){hb[low(t)]=(hb[low(t)]||0)+1});
  if(need.num&&!hb[need.num])return {ok:false,kind:'num',word:need.num,bad:[]};
  if(need.noun&&!hb[low(need.noun.split(' ').slice(-1)[0])])return {ok:false,kind:'noun',word:need.noun,bad:[]};
  if(need.adj&&!hb[need.adj])return {ok:false,kind:'adj',word:need.adj,bad:[]};
  if(need.place&&!hb[need.place])return {ok:false,kind:'place',word:need.place,bad:[]};
  if(at.indexOf(',')>=0&&!hb[','])return {ok:false,kind:'comma',bad:[]};
  if(!hb['.'])return {ok:false,kind:'period',bad:[]};
  var miss=at.filter(function(t){return !hb[low(t)]||(hb[low(t)]--,false)});
  if(miss.length&&built.length<at.length)return {ok:false,kind:'short',bad:[]};
  for(var i=0;i<built.length;i++)if(built[i]!==at[i]){bad.push(i);break}
  return {ok:false,kind:built[0]!==at[0]?'first':'order',bad:bad}}
var api={NUM:NUM,NOUNS:NOUNS,PLACES:PLACES,COLORS:COLORS,ADJ:ADJ,PATS:PATS,PAT:PAT,TRAP:TRAP,lexicon:lexicon,make:make,check:check,toks:toks,mkRand:mkRand,PRZH:PRZH};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.SENTPAT=api;
})(this);
