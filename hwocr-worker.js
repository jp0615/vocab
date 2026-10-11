/* 手寫辨識 Worker：在背景執行，不會卡住畫面。所有運算都在這台 iPad 上完成。 */
importScripts('hwocr.js');
var model=null;
function load(url){
  return fetch(url).then(function(r){
    if(!r.ok)throw new Error('http '+r.status);
    var total=+r.headers.get('content-length')||0;
    if(!r.body||!r.body.getReader)return r.arrayBuffer();
    var rd=r.body.getReader(),chunks=[],got=0;
    function pump(){return rd.read().then(function(x){
      if(x.done){var all=new Uint8Array(got),o=0;chunks.forEach(function(c){all.set(c,o);o+=c.length});return all.buffer}
      chunks.push(x.value);got+=x.value.length;postMessage({type:'progress',p:total?got/total:0});return pump()})}
    return pump();
  });
}
onmessage=function(e){
  var m=e.data;
  if(m.type==='load'){
    load(m.url).then(function(buf){model=HWOCR.parse(buf);postMessage({type:'ready'})})
      .catch(function(err){postMessage({type:'error',msg:String(err&&err.message||err)})});
  }else if(m.type==='rec'){
    try{
      if(!model)throw new Error('no model');
      var r=HWOCR.forward(model,m.img),g=HWOCR.greedy(r);
      var la=HWOCR.ctcLogProb(r,m.answer),lg=g.text?HWOCR.ctcLogProb(r,g.text):-1e9;
      postMessage({type:'result',id:m.id,text:g.text,conf:g.conf,lpAns:la,lpGreedy:lg});
    }catch(err){postMessage({type:'result',id:m.id,error:String(err&&err.message||err)})}
  }
};
