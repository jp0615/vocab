/* 手寫辨識：純 JS 小型 CNN+CTC，完全在裝置上執行，不連網、不傳資料 */
(function(root){
'use strict';
var ALPH='abcdefghijklmnopqrstuvwxyz';
function f16(u){var s=(u&0x8000)?-1:1,e=(u>>10)&31,m=u&1023;if(e===0)return s*m*5.960464477539063e-8;if(e===31)return m?NaN:s*Infinity;return s*Math.pow(2,e-15)*(1+m/1024)}
function decode16(buf,off,n){var u=new Uint16Array(buf.slice(off,off+n*2)),o=new Float32Array(n);for(var i=0;i<n;i++)o[i]=f16(u[i]);return o}
function parse(buf){
  var hl=new DataView(buf).getUint32(0,true),hdr=JSON.parse(new TextDecoder().decode(new Uint8Array(buf,4,hl))),base=4+hl;
  var L=hdr.layers;
  L.forEach(function(l){
    if(l.t==='conv'){l.W=decode16(buf,base+l.w,l.co*l.ci*9);l.B=decode16(buf,base+l.b,l.co)}
    else if(l.t==='conv1d'){l.W=decode16(buf,base+l.w,l.co*l.ci*l.k);l.B=decode16(buf,base+l.b,l.co)}
    else if(l.t==='fc'){l.W=decode16(buf,base+l.w,l.co*l.ci);l.B=decode16(buf,base+l.b,l.co)}
  });
  return hdr;
}
function conv3(x,ci,h,w,l){
  var co=l.co,W=l.W,B=l.B,out=new Float32Array(co*h*w),hw=h*w;
  for(var o=0;o<co;o++){
    var ob=o*hw,b=B[o];for(var i=0;i<hw;i++)out[ob+i]=b;
    for(var c=0;c<ci;c++){
      var wb=(o*ci+c)*9,xb=c*hw;
      for(var ky=0;ky<3;ky++){
        var dy=ky-1,y0=Math.max(0,-dy),y1=Math.min(h,h-dy);
        for(var kx=0;kx<3;kx++){
          var wv=W[wb+ky*3+kx];if(wv===0)continue;var dx=kx-1,x0=Math.max(0,-dx),x1=Math.min(w,w-dx);
          for(var y=y0;y<y1;y++){
            var op=ob+y*w,ip=xb+(y+dy)*w+dx;
            for(var xx=x0;xx<x1;xx++)out[op+xx]+=wv*x[ip+xx];
          }
        }
      }
    }
    for(var j=0;j<hw;j++){if(out[ob+j]<0)out[ob+j]=0}
  }
  return out;
}
function pool(x,c,h,w,kh,kw){
  var oh=Math.floor(h/kh),ow=Math.floor(w/kw),out=new Float32Array(c*oh*ow);
  for(var k=0;k<c;k++)for(var y=0;y<oh;y++)for(var xx=0;xx<ow;xx++){
    var m=-1e9;for(var a=0;a<kh;a++)for(var b=0;b<kw;b++){var v=x[k*h*w+(y*kh+a)*w+xx*kw+b];if(v>m)m=v}
    out[k*oh*ow+y*ow+xx]=m;
  }
  return out;
}
function conv1(x,ci,T,l,relu){
  var co=l.co,k=l.k,p=(k-1)>>1,out=new Float32Array(co*T);
  for(var o=0;o<co;o++){
    var ob=o*T,b=l.B[o];for(var t=0;t<T;t++)out[ob+t]=b;
    for(var c=0;c<ci;c++)for(var j=0;j<k;j++){
      var wv=l.W[(o*ci+c)*k+j],d=j-p,t0=Math.max(0,-d),t1=Math.min(T,T-d);
      for(var t=t0;t<t1;t++)out[ob+t]+=wv*x[c*T+t+d];
    }
    if(relu)for(var t2=0;t2<T;t2++)if(out[ob+t2]<0)out[ob+t2]=0;
  }
  return out;
}
/* 回傳每個時間步的 log-softmax：T x 27（0=blank） */
function forward(model,img){
  var L=model.layers,x=img,c=1,h=model.H,w=model.W,T=0;
  for(var i=0;i<L.length;i++){
    var l=L[i];
    if(l.t==='conv'){x=conv3(x,c,h,w,l);c=l.co}
    else if(l.t==='pool'){x=pool(x,c,h,w,l.kh,l.kw);h=Math.floor(h/l.kh);w=Math.floor(w/l.kw)}
    else if(l.t==='flatten'){c=c*h;h=1;T=w}
    else if(l.t==='conv1d'){x=conv1(x,c,T,l,true);c=l.co}
    else if(l.t==='fc'){
      var o=new Float32Array(T*l.co);
      for(var t=0;t<T;t++){
        var m=-1e9,s=0;
        for(var k=0;k<l.co;k++){var v=l.B[k];for(var q=0;q<l.ci;q++)v+=l.W[k*l.ci+q]*x[q*T+t];o[t*l.co+k]=v;if(v>m)m=v}
        for(k=0;k<l.co;k++)s+=Math.exp(o[t*l.co+k]-m);
        var ls=m+Math.log(s);for(k=0;k<l.co;k++)o[t*l.co+k]-=ls;
      }
      return {lp:o,T:T,C:l.co};
    }
  }
}
function greedy(r){
  var s='',prev=-1,conf=0,n=0;
  for(var t=0;t<r.T;t++){
    var b=0,m=-1e9;for(var k=0;k<r.C;k++){var v=r.lp[t*r.C+k];if(v>m){m=v;b=k}}
    if(b!==prev&&b!==0){s+=ALPH[b-1];conf+=Math.exp(m);n++}
    prev=b;
  }
  return {text:s,conf:n?conf/n:0};
}
/* CTC 前向演算法：回傳 log P(label | 圖) */
function ctcLogProb(r,label){
  var T=r.T,C=r.C,S=label.length*2+1,NEG=-1e30;
  var lab=[];for(var i=0;i<label.length;i++)lab.push(ALPH.indexOf(label[i])+1);
  if(lab.indexOf(0)>=0)return NEG;
  function ext(s){return s%2===0?0:lab[(s-1)>>1]}
  var a=new Float64Array(S).fill(NEG);
  a[0]=r.lp[0];if(S>1)a[1]=r.lp[ext(1)];
  function lse(x,y){if(x<y){var t=x;x=y;y=t}return y<=NEG?x:x+Math.log1p(Math.exp(y-x))}
  for(var t=1;t<T;t++){
    var n=new Float64Array(S).fill(NEG);
    for(var s=0;s<S;s++){
      var v=a[s];if(s>0)v=lse(v,a[s-1]);
      if(s>1&&ext(s)!==0&&ext(s)!==ext(s-2))v=lse(v,a[s-2]);
      n[s]=v<=NEG?NEG:v+r.lp[t*C+ext(s)];
    }
    a=n;
  }
  return S>1?lse(a[S-1],a[S-2]):a[0];
}
function recognizeImg(model,img){var r=forward(model,img);return {r:r,g:greedy(r)}}
root.HWOCR={parse:parse,forward:forward,greedy:greedy,ctcLogProb:ctcLogProb,recognizeImg:recognizeImg};
if(typeof module!=='undefined')module.exports=root.HWOCR;
})(typeof window!=='undefined'?window:globalThis);
