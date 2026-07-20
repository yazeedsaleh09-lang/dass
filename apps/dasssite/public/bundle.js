var br=Object.create;var $t=Object.defineProperty;var xr=Object.getOwnPropertyDescriptor;var yr=Object.getOwnPropertyNames;var wr=Object.getPrototypeOf,kr=Object.prototype.hasOwnProperty;var $r=(e,t)=>()=>{try{return t||e((t={exports:{}}).exports,t),t.exports}catch(r){throw t=0,r}};var Er=(e,t,r,a)=>{if(t&&typeof t=="object"||typeof t=="function")for(let n of yr(t))!kr.call(e,n)&&n!==r&&$t(e,n,{get:()=>t[n],enumerable:!(a=xr(t,n))||a.enumerable});return e};var Mr=(e,t,r)=>(r=e!=null?br(wr(e)):{},Er(t||!e||!e.__esModule?$t(r,"default",{value:e,enumerable:!0}):r,e));var Rt=$r((Tt,Pt)=>{var Lt=(function(){var e=function(A,S){var w=236,k=17,u=A,x=r[S],l=null,o=0,y=null,f=[],b={},I=function(m,g){o=u*4+17,l=(function(c){for(var h=new Array(c),v=0;v<c;v+=1){h[v]=new Array(c);for(var M=0;M<c;M+=1)h[v][M]=null}return h})(o),B(0,0),B(o-7,0),B(0,o-7),Z(),K(),pe(m,g),u>=7&&de(m),y==null&&(y=hr(u,x,f)),ue(y,g)},B=function(m,g){for(var c=-1;c<=7;c+=1)if(!(m+c<=-1||o<=m+c))for(var h=-1;h<=7;h+=1)g+h<=-1||o<=g+h||(0<=c&&c<=6&&(h==0||h==6)||0<=h&&h<=6&&(c==0||c==6)||2<=c&&c<=4&&2<=h&&h<=4?l[m+c][g+h]=!0:l[m+c][g+h]=!1)},j=function(){for(var m=0,g=0,c=0;c<8;c+=1){I(!0,c);var h=n.getLostPoint(b);(c==0||m>h)&&(m=h,g=c)}return g},K=function(){for(var m=8;m<o-8;m+=1)l[m][6]==null&&(l[m][6]=m%2==0);for(var g=8;g<o-8;g+=1)l[6][g]==null&&(l[6][g]=g%2==0)},Z=function(){for(var m=n.getPatternPosition(u),g=0;g<m.length;g+=1)for(var c=0;c<m.length;c+=1){var h=m[g],v=m[c];if(l[h][v]==null)for(var M=-2;M<=2;M+=1)for(var T=-2;T<=2;T+=1)M==-2||M==2||T==-2||T==2||M==0&&T==0?l[h+M][v+T]=!0:l[h+M][v+T]=!1}},de=function(m){for(var g=n.getBCHTypeNumber(u),c=0;c<18;c+=1){var h=!m&&(g>>c&1)==1;l[Math.floor(c/3)][c%3+o-8-3]=h}for(var c=0;c<18;c+=1){var h=!m&&(g>>c&1)==1;l[c%3+o-8-3][Math.floor(c/3)]=h}},pe=function(m,g){for(var c=x<<3|g,h=n.getBCHTypeInfo(c),v=0;v<15;v+=1){var M=!m&&(h>>v&1)==1;v<6?l[v][8]=M:v<8?l[v+1][8]=M:l[o-15+v][8]=M}for(var v=0;v<15;v+=1){var M=!m&&(h>>v&1)==1;v<8?l[8][o-v-1]=M:v<9?l[8][15-v-1+1]=M:l[8][15-v-1]=M}l[o-8][8]=!m},ue=function(m,g){for(var c=-1,h=o-1,v=7,M=0,T=n.getMaskFunction(g),L=o-1;L>0;L-=2)for(L==6&&(L-=1);;){for(var O=0;O<2;O+=1)if(l[h][L-O]==null){var Y=!1;M<m.length&&(Y=(m[M]>>>v&1)==1);var R=T(h,L-O);R&&(Y=!Y),l[h][L-O]=Y,v-=1,v==-1&&(M+=1,v=7)}if(h+=c,h<0||o<=h){h-=c,c=-c;break}}},we=function(m,g){for(var c=0,h=0,v=0,M=new Array(g.length),T=new Array(g.length),L=0;L<g.length;L+=1){var O=g[L].dataCount,Y=g[L].totalCount-O;h=Math.max(h,O),v=Math.max(v,Y),M[L]=new Array(O);for(var R=0;R<M[L].length;R+=1)M[L][R]=255&m.getBuffer()[R+c];c+=O;var ie=n.getErrorCorrectPolynomial(Y),ne=s(M[L],ie.getLength()-1),yt=ne.mod(ie);T[L]=new Array(ie.getLength()-1);for(var R=0;R<T[L].length;R+=1){var wt=R+yt.getLength()-T[L].length;T[L][R]=wt>=0?yt.getAt(wt):0}}for(var kt=0,R=0;R<g.length;R+=1)kt+=g[R].totalCount;for(var at=new Array(kt),We=0,R=0;R<h;R+=1)for(var L=0;L<g.length;L+=1)R<M[L].length&&(at[We]=M[L][R],We+=1);for(var R=0;R<v;R+=1)for(var L=0;L<g.length;L+=1)R<T[L].length&&(at[We]=T[L][R],We+=1);return at},hr=function(m,g,c){for(var h=d.getRSBlocks(m,g),v=p(),M=0;M<c.length;M+=1){var T=c[M];v.put(T.getMode(),4),v.put(T.getLength(),n.getLengthInBits(T.getMode(),m)),T.write(v)}for(var L=0,M=0;M<h.length;M+=1)L+=h[M].dataCount;if(v.getLengthInBits()>L*8)throw"code length overflow. ("+v.getLengthInBits()+">"+L*8+")";for(v.getLengthInBits()+4<=L*8&&v.put(0,4);v.getLengthInBits()%8!=0;)v.putBit(!1);for(;!(v.getLengthInBits()>=L*8||(v.put(w,8),v.getLengthInBits()>=L*8));)v.put(k,8);return we(v,h)};b.addData=function(m,g){g=g||"Byte";var c=null;switch(g){case"Numeric":c=E(m);break;case"Alphanumeric":c=N(m);break;case"Byte":c=V(m);break;case"Kanji":c=U(m);break;default:throw"mode:"+g}f.push(c),y=null},b.isDark=function(m,g){if(m<0||o<=m||g<0||o<=g)throw m+","+g;return l[m][g]},b.getModuleCount=function(){return o},b.make=function(){if(u<1){for(var m=1;m<40;m++){for(var g=d.getRSBlocks(m,x),c=p(),h=0;h<f.length;h++){var v=f[h];c.put(v.getMode(),4),c.put(v.getLength(),n.getLengthInBits(v.getMode(),m)),v.write(c)}for(var M=0,h=0;h<g.length;h++)M+=g[h].dataCount;if(c.getLengthInBits()<=M*8)break}u=m}I(!1,j())},b.createTableTag=function(m,g){m=m||2,g=typeof g>"u"?m*4:g;var c="";c+='<table style="',c+=" border-width: 0px; border-style: none;",c+=" border-collapse: collapse;",c+=" padding: 0px; margin: "+g+"px;",c+='">',c+="<tbody>";for(var h=0;h<b.getModuleCount();h+=1){c+="<tr>";for(var v=0;v<b.getModuleCount();v+=1)c+='<td style="',c+=" border-width: 0px; border-style: none;",c+=" border-collapse: collapse;",c+=" padding: 0px; margin: 0px;",c+=" width: "+m+"px;",c+=" height: "+m+"px;",c+=" background-color: ",c+=b.isDark(h,v)?"#000000":"#ffffff",c+=";",c+='"/>';c+="</tr>"}return c+="</tbody>",c+="</table>",c},b.createSvgTag=function(m,g,c,h){var v={};typeof arguments[0]=="object"&&(v=arguments[0],m=v.cellSize,g=v.margin,c=v.alt,h=v.title),m=m||2,g=typeof g>"u"?m*4:g,c=typeof c=="string"?{text:c}:c||{},c.text=c.text||null,c.id=c.text?c.id||"qrcode-description":null,h=typeof h=="string"?{text:h}:h||{},h.text=h.text||null,h.id=h.text?h.id||"qrcode-title":null;var M=b.getModuleCount()*m+g*2,T,L,O,Y,R="",ie;for(ie="l"+m+",0 0,"+m+" -"+m+",0 0,-"+m+"z ",R+='<svg version="1.1" xmlns="http://www.w3.org/2000/svg"',R+=v.scalable?"":' width="'+M+'px" height="'+M+'px"',R+=' viewBox="0 0 '+M+" "+M+'" ',R+=' preserveAspectRatio="xMinYMin meet"',R+=h.text||c.text?' role="img" aria-labelledby="'+ke([h.id,c.id].join(" ").trim())+'"':"",R+=">",R+=h.text?'<title id="'+ke(h.id)+'">'+ke(h.text)+"</title>":"",R+=c.text?'<description id="'+ke(c.id)+'">'+ke(c.text)+"</description>":"",R+='<rect width="100%" height="100%" fill="white" cx="0" cy="0"/>',R+='<path d="',O=0;O<b.getModuleCount();O+=1)for(Y=O*m+g,T=0;T<b.getModuleCount();T+=1)b.isDark(O,T)&&(L=T*m+g,R+="M"+L+","+Y+ie);return R+='" stroke="transparent" fill="black"/>',R+="</svg>",R},b.createDataURL=function(m,g){m=m||2,g=typeof g>"u"?m*4:g;var c=b.getModuleCount()*m+g*2,h=g,v=c-g;return fr(c,c,function(M,T){if(h<=M&&M<v&&h<=T&&T<v){var L=Math.floor((M-h)/m),O=Math.floor((T-h)/m);return b.isDark(O,L)?0:1}else return 1})},b.createImgTag=function(m,g,c){m=m||2,g=typeof g>"u"?m*4:g;var h=b.getModuleCount()*m+g*2,v="";return v+="<img",v+=' src="',v+=b.createDataURL(m,g),v+='"',v+=' width="',v+=h,v+='"',v+=' height="',v+=h,v+='"',c&&(v+=' alt="',v+=ke(c),v+='"'),v+="/>",v};var ke=function(m){for(var g="",c=0;c<m.length;c+=1){var h=m.charAt(c);switch(h){case"<":g+="&lt;";break;case">":g+="&gt;";break;case"&":g+="&amp;";break;case'"':g+="&quot;";break;default:g+=h;break}}return g},vr=function(m){var g=1;m=typeof m>"u"?g*2:m;var c=b.getModuleCount()*g+m*2,h=m,v=c-m,M,T,L,O,Y,R={"██":"█","█ ":"▀"," █":"▄","  ":" "},ie={"██":"▀","█ ":"▀"," █":" ","  ":" "},ne="";for(M=0;M<c;M+=2){for(L=Math.floor((M-h)/g),O=Math.floor((M+1-h)/g),T=0;T<c;T+=1)Y="█",h<=T&&T<v&&h<=M&&M<v&&b.isDark(L,Math.floor((T-h)/g))&&(Y=" "),h<=T&&T<v&&h<=M+1&&M+1<v&&b.isDark(O,Math.floor((T-h)/g))?Y+=" ":Y+="█",ne+=m<1&&M+1>=v?ie[Y]:R[Y];ne+=`
`}return c%2&&m>0?ne.substring(0,ne.length-c-1)+Array(c+1).join("▀"):ne.substring(0,ne.length-1)};return b.createASCII=function(m,g){if(m=m||1,m<2)return vr(g);m-=1,g=typeof g>"u"?m*2:g;var c=b.getModuleCount()*m+g*2,h=g,v=c-g,M,T,L,O,Y=Array(m+1).join("██"),R=Array(m+1).join("  "),ie="",ne="";for(M=0;M<c;M+=1){for(L=Math.floor((M-h)/m),ne="",T=0;T<c;T+=1)O=1,h<=T&&T<v&&h<=M&&M<v&&b.isDark(L,Math.floor((T-h)/m))&&(O=0),ne+=O?Y:R;for(L=0;L<m;L+=1)ie+=ne+`
`}return ie.substring(0,ie.length-1)},b.renderTo2dContext=function(m,g){g=g||2;for(var c=b.getModuleCount(),h=0;h<c;h++)for(var v=0;v<c;v++)m.fillStyle=b.isDark(h,v)?"black":"white",m.fillRect(h*g,v*g,g,g)},b};e.stringToBytesFuncs={default:function(A){for(var S=[],w=0;w<A.length;w+=1){var k=A.charCodeAt(w);S.push(k&255)}return S}},e.stringToBytes=e.stringToBytesFuncs.default,e.createStringToBytes=function(A,S){var w=(function(){for(var u=mr(A),x=function(){var K=u.read();if(K==-1)throw"eof";return K},l=0,o={};;){var y=u.read();if(y==-1)break;var f=x(),b=x(),I=x(),B=String.fromCharCode(y<<8|f),j=b<<8|I;o[B]=j,l+=1}if(l!=S)throw l+" != "+S;return o})(),k=63;return function(u){for(var x=[],l=0;l<u.length;l+=1){var o=u.charCodeAt(l);if(o<128)x.push(o);else{var y=w[u.charAt(l)];typeof y=="number"?(y&255)==y?x.push(y):(x.push(y>>>8),x.push(y&255)):x.push(k)}}return x}};var t={MODE_NUMBER:1,MODE_ALPHA_NUM:2,MODE_8BIT_BYTE:4,MODE_KANJI:8},r={L:1,M:0,Q:3,H:2},a={PATTERN000:0,PATTERN001:1,PATTERN010:2,PATTERN011:3,PATTERN100:4,PATTERN101:5,PATTERN110:6,PATTERN111:7},n=(function(){var A=[[],[6,18],[6,22],[6,26],[6,30],[6,34],[6,22,38],[6,24,42],[6,26,46],[6,28,50],[6,30,54],[6,32,58],[6,34,62],[6,26,46,66],[6,26,48,70],[6,26,50,74],[6,30,54,78],[6,30,56,82],[6,30,58,86],[6,34,62,90],[6,28,50,72,94],[6,26,50,74,98],[6,30,54,78,102],[6,28,54,80,106],[6,32,58,84,110],[6,30,58,86,114],[6,34,62,90,118],[6,26,50,74,98,122],[6,30,54,78,102,126],[6,26,52,78,104,130],[6,30,56,82,108,134],[6,34,60,86,112,138],[6,30,58,86,114,142],[6,34,62,90,118,146],[6,30,54,78,102,126,150],[6,24,50,76,102,128,154],[6,28,54,80,106,132,158],[6,32,58,84,110,136,162],[6,26,54,82,110,138,166],[6,30,58,86,114,142,170]],S=1335,w=7973,k=21522,u={},x=function(l){for(var o=0;l!=0;)o+=1,l>>>=1;return o};return u.getBCHTypeInfo=function(l){for(var o=l<<10;x(o)-x(S)>=0;)o^=S<<x(o)-x(S);return(l<<10|o)^k},u.getBCHTypeNumber=function(l){for(var o=l<<12;x(o)-x(w)>=0;)o^=w<<x(o)-x(w);return l<<12|o},u.getPatternPosition=function(l){return A[l-1]},u.getMaskFunction=function(l){switch(l){case a.PATTERN000:return function(o,y){return(o+y)%2==0};case a.PATTERN001:return function(o,y){return o%2==0};case a.PATTERN010:return function(o,y){return y%3==0};case a.PATTERN011:return function(o,y){return(o+y)%3==0};case a.PATTERN100:return function(o,y){return(Math.floor(o/2)+Math.floor(y/3))%2==0};case a.PATTERN101:return function(o,y){return o*y%2+o*y%3==0};case a.PATTERN110:return function(o,y){return(o*y%2+o*y%3)%2==0};case a.PATTERN111:return function(o,y){return(o*y%3+(o+y)%2)%2==0};default:throw"bad maskPattern:"+l}},u.getErrorCorrectPolynomial=function(l){for(var o=s([1],0),y=0;y<l;y+=1)o=o.multiply(s([1,i.gexp(y)],0));return o},u.getLengthInBits=function(l,o){if(1<=o&&o<10)switch(l){case t.MODE_NUMBER:return 10;case t.MODE_ALPHA_NUM:return 9;case t.MODE_8BIT_BYTE:return 8;case t.MODE_KANJI:return 8;default:throw"mode:"+l}else if(o<27)switch(l){case t.MODE_NUMBER:return 12;case t.MODE_ALPHA_NUM:return 11;case t.MODE_8BIT_BYTE:return 16;case t.MODE_KANJI:return 10;default:throw"mode:"+l}else if(o<41)switch(l){case t.MODE_NUMBER:return 14;case t.MODE_ALPHA_NUM:return 13;case t.MODE_8BIT_BYTE:return 16;case t.MODE_KANJI:return 12;default:throw"mode:"+l}else throw"type:"+o},u.getLostPoint=function(l){for(var o=l.getModuleCount(),y=0,f=0;f<o;f+=1)for(var b=0;b<o;b+=1){for(var I=0,B=l.isDark(f,b),j=-1;j<=1;j+=1)if(!(f+j<0||o<=f+j))for(var K=-1;K<=1;K+=1)b+K<0||o<=b+K||j==0&&K==0||B==l.isDark(f+j,b+K)&&(I+=1);I>5&&(y+=3+I-5)}for(var f=0;f<o-1;f+=1)for(var b=0;b<o-1;b+=1){var Z=0;l.isDark(f,b)&&(Z+=1),l.isDark(f+1,b)&&(Z+=1),l.isDark(f,b+1)&&(Z+=1),l.isDark(f+1,b+1)&&(Z+=1),(Z==0||Z==4)&&(y+=3)}for(var f=0;f<o;f+=1)for(var b=0;b<o-6;b+=1)l.isDark(f,b)&&!l.isDark(f,b+1)&&l.isDark(f,b+2)&&l.isDark(f,b+3)&&l.isDark(f,b+4)&&!l.isDark(f,b+5)&&l.isDark(f,b+6)&&(y+=40);for(var b=0;b<o;b+=1)for(var f=0;f<o-6;f+=1)l.isDark(f,b)&&!l.isDark(f+1,b)&&l.isDark(f+2,b)&&l.isDark(f+3,b)&&l.isDark(f+4,b)&&!l.isDark(f+5,b)&&l.isDark(f+6,b)&&(y+=40);for(var de=0,b=0;b<o;b+=1)for(var f=0;f<o;f+=1)l.isDark(f,b)&&(de+=1);var pe=Math.abs(100*de/o/o-50)/5;return y+=pe*10,y},u})(),i=(function(){for(var A=new Array(256),S=new Array(256),w=0;w<8;w+=1)A[w]=1<<w;for(var w=8;w<256;w+=1)A[w]=A[w-4]^A[w-5]^A[w-6]^A[w-8];for(var w=0;w<255;w+=1)S[A[w]]=w;var k={};return k.glog=function(u){if(u<1)throw"glog("+u+")";return S[u]},k.gexp=function(u){for(;u<0;)u+=255;for(;u>=256;)u-=255;return A[u]},k})();function s(A,S){if(typeof A.length>"u")throw A.length+"/"+S;var w=(function(){for(var u=0;u<A.length&&A[u]==0;)u+=1;for(var x=new Array(A.length-u+S),l=0;l<A.length-u;l+=1)x[l]=A[l+u];return x})(),k={};return k.getAt=function(u){return w[u]},k.getLength=function(){return w.length},k.multiply=function(u){for(var x=new Array(k.getLength()+u.getLength()-1),l=0;l<k.getLength();l+=1)for(var o=0;o<u.getLength();o+=1)x[l+o]^=i.gexp(i.glog(k.getAt(l))+i.glog(u.getAt(o)));return s(x,0)},k.mod=function(u){if(k.getLength()-u.getLength()<0)return k;for(var x=i.glog(k.getAt(0))-i.glog(u.getAt(0)),l=new Array(k.getLength()),o=0;o<k.getLength();o+=1)l[o]=k.getAt(o);for(var o=0;o<u.getLength();o+=1)l[o]^=i.gexp(i.glog(u.getAt(o))+x);return s(l,0).mod(u)},k}var d=(function(){var A=[[1,26,19],[1,26,16],[1,26,13],[1,26,9],[1,44,34],[1,44,28],[1,44,22],[1,44,16],[1,70,55],[1,70,44],[2,35,17],[2,35,13],[1,100,80],[2,50,32],[2,50,24],[4,25,9],[1,134,108],[2,67,43],[2,33,15,2,34,16],[2,33,11,2,34,12],[2,86,68],[4,43,27],[4,43,19],[4,43,15],[2,98,78],[4,49,31],[2,32,14,4,33,15],[4,39,13,1,40,14],[2,121,97],[2,60,38,2,61,39],[4,40,18,2,41,19],[4,40,14,2,41,15],[2,146,116],[3,58,36,2,59,37],[4,36,16,4,37,17],[4,36,12,4,37,13],[2,86,68,2,87,69],[4,69,43,1,70,44],[6,43,19,2,44,20],[6,43,15,2,44,16],[4,101,81],[1,80,50,4,81,51],[4,50,22,4,51,23],[3,36,12,8,37,13],[2,116,92,2,117,93],[6,58,36,2,59,37],[4,46,20,6,47,21],[7,42,14,4,43,15],[4,133,107],[8,59,37,1,60,38],[8,44,20,4,45,21],[12,33,11,4,34,12],[3,145,115,1,146,116],[4,64,40,5,65,41],[11,36,16,5,37,17],[11,36,12,5,37,13],[5,109,87,1,110,88],[5,65,41,5,66,42],[5,54,24,7,55,25],[11,36,12,7,37,13],[5,122,98,1,123,99],[7,73,45,3,74,46],[15,43,19,2,44,20],[3,45,15,13,46,16],[1,135,107,5,136,108],[10,74,46,1,75,47],[1,50,22,15,51,23],[2,42,14,17,43,15],[5,150,120,1,151,121],[9,69,43,4,70,44],[17,50,22,1,51,23],[2,42,14,19,43,15],[3,141,113,4,142,114],[3,70,44,11,71,45],[17,47,21,4,48,22],[9,39,13,16,40,14],[3,135,107,5,136,108],[3,67,41,13,68,42],[15,54,24,5,55,25],[15,43,15,10,44,16],[4,144,116,4,145,117],[17,68,42],[17,50,22,6,51,23],[19,46,16,6,47,17],[2,139,111,7,140,112],[17,74,46],[7,54,24,16,55,25],[34,37,13],[4,151,121,5,152,122],[4,75,47,14,76,48],[11,54,24,14,55,25],[16,45,15,14,46,16],[6,147,117,4,148,118],[6,73,45,14,74,46],[11,54,24,16,55,25],[30,46,16,2,47,17],[8,132,106,4,133,107],[8,75,47,13,76,48],[7,54,24,22,55,25],[22,45,15,13,46,16],[10,142,114,2,143,115],[19,74,46,4,75,47],[28,50,22,6,51,23],[33,46,16,4,47,17],[8,152,122,4,153,123],[22,73,45,3,74,46],[8,53,23,26,54,24],[12,45,15,28,46,16],[3,147,117,10,148,118],[3,73,45,23,74,46],[4,54,24,31,55,25],[11,45,15,31,46,16],[7,146,116,7,147,117],[21,73,45,7,74,46],[1,53,23,37,54,24],[19,45,15,26,46,16],[5,145,115,10,146,116],[19,75,47,10,76,48],[15,54,24,25,55,25],[23,45,15,25,46,16],[13,145,115,3,146,116],[2,74,46,29,75,47],[42,54,24,1,55,25],[23,45,15,28,46,16],[17,145,115],[10,74,46,23,75,47],[10,54,24,35,55,25],[19,45,15,35,46,16],[17,145,115,1,146,116],[14,74,46,21,75,47],[29,54,24,19,55,25],[11,45,15,46,46,16],[13,145,115,6,146,116],[14,74,46,23,75,47],[44,54,24,7,55,25],[59,46,16,1,47,17],[12,151,121,7,152,122],[12,75,47,26,76,48],[39,54,24,14,55,25],[22,45,15,41,46,16],[6,151,121,14,152,122],[6,75,47,34,76,48],[46,54,24,10,55,25],[2,45,15,64,46,16],[17,152,122,4,153,123],[29,74,46,14,75,47],[49,54,24,10,55,25],[24,45,15,46,46,16],[4,152,122,18,153,123],[13,74,46,32,75,47],[48,54,24,14,55,25],[42,45,15,32,46,16],[20,147,117,4,148,118],[40,75,47,7,76,48],[43,54,24,22,55,25],[10,45,15,67,46,16],[19,148,118,6,149,119],[18,75,47,31,76,48],[34,54,24,34,55,25],[20,45,15,61,46,16]],S=function(u,x){var l={};return l.totalCount=u,l.dataCount=x,l},w={},k=function(u,x){switch(x){case r.L:return A[(u-1)*4+0];case r.M:return A[(u-1)*4+1];case r.Q:return A[(u-1)*4+2];case r.H:return A[(u-1)*4+3];default:return}};return w.getRSBlocks=function(u,x){var l=k(u,x);if(typeof l>"u")throw"bad rs block @ typeNumber:"+u+"/errorCorrectionLevel:"+x;for(var o=l.length/3,y=[],f=0;f<o;f+=1)for(var b=l[f*3+0],I=l[f*3+1],B=l[f*3+2],j=0;j<b;j+=1)y.push(S(I,B));return y},w})(),p=function(){var A=[],S=0,w={};return w.getBuffer=function(){return A},w.getAt=function(k){var u=Math.floor(k/8);return(A[u]>>>7-k%8&1)==1},w.put=function(k,u){for(var x=0;x<u;x+=1)w.putBit((k>>>u-x-1&1)==1)},w.getLengthInBits=function(){return S},w.putBit=function(k){var u=Math.floor(S/8);A.length<=u&&A.push(0),k&&(A[u]|=128>>>S%8),S+=1},w},E=function(A){var S=t.MODE_NUMBER,w=A,k={};k.getMode=function(){return S},k.getLength=function(l){return w.length},k.write=function(l){for(var o=w,y=0;y+2<o.length;)l.put(u(o.substring(y,y+3)),10),y+=3;y<o.length&&(o.length-y==1?l.put(u(o.substring(y,y+1)),4):o.length-y==2&&l.put(u(o.substring(y,y+2)),7))};var u=function(l){for(var o=0,y=0;y<l.length;y+=1)o=o*10+x(l.charAt(y));return o},x=function(l){if("0"<=l&&l<="9")return l.charCodeAt(0)-48;throw"illegal char :"+l};return k},N=function(A){var S=t.MODE_ALPHA_NUM,w=A,k={};k.getMode=function(){return S},k.getLength=function(x){return w.length},k.write=function(x){for(var l=w,o=0;o+1<l.length;)x.put(u(l.charAt(o))*45+u(l.charAt(o+1)),11),o+=2;o<l.length&&x.put(u(l.charAt(o)),6)};var u=function(x){if("0"<=x&&x<="9")return x.charCodeAt(0)-48;if("A"<=x&&x<="Z")return x.charCodeAt(0)-65+10;switch(x){case" ":return 36;case"$":return 37;case"%":return 38;case"*":return 39;case"+":return 40;case"-":return 41;case".":return 42;case"/":return 43;case":":return 44;default:throw"illegal char :"+x}};return k},V=function(A){var S=t.MODE_8BIT_BYTE,w=A,k=e.stringToBytes(A),u={};return u.getMode=function(){return S},u.getLength=function(x){return k.length},u.write=function(x){for(var l=0;l<k.length;l+=1)x.put(k[l],8)},u},U=function(A){var S=t.MODE_KANJI,w=A,k=e.stringToBytesFuncs.SJIS;if(!k)throw"sjis not supported.";(function(l,o){var y=k(l);if(y.length!=2||(y[0]<<8|y[1])!=o)throw"sjis not supported."})("友",38726);var u=k(A),x={};return x.getMode=function(){return S},x.getLength=function(l){return~~(u.length/2)},x.write=function(l){for(var o=u,y=0;y+1<o.length;){var f=(255&o[y])<<8|255&o[y+1];if(33088<=f&&f<=40956)f-=33088;else if(57408<=f&&f<=60351)f-=49472;else throw"illegal char at "+(y+1)+"/"+f;f=(f>>>8&255)*192+(f&255),l.put(f,13),y+=2}if(y<o.length)throw"illegal char at "+(y+1)},x},J=function(){var A=[],S={};return S.writeByte=function(w){A.push(w&255)},S.writeShort=function(w){S.writeByte(w),S.writeByte(w>>>8)},S.writeBytes=function(w,k,u){k=k||0,u=u||w.length;for(var x=0;x<u;x+=1)S.writeByte(w[x+k])},S.writeString=function(w){for(var k=0;k<w.length;k+=1)S.writeByte(w.charCodeAt(k))},S.toByteArray=function(){return A},S.toString=function(){var w="";w+="[";for(var k=0;k<A.length;k+=1)k>0&&(w+=","),w+=A[k];return w+="]",w},S},se=function(){var A=0,S=0,w=0,k="",u={},x=function(o){k+=String.fromCharCode(l(o&63))},l=function(o){if(!(o<0)){if(o<26)return 65+o;if(o<52)return 97+(o-26);if(o<62)return 48+(o-52);if(o==62)return 43;if(o==63)return 47}throw"n:"+o};return u.writeByte=function(o){for(A=A<<8|o&255,S+=8,w+=1;S>=6;)x(A>>>S-6),S-=6},u.flush=function(){if(S>0&&(x(A<<6-S),A=0,S=0),w%3!=0)for(var o=3-w%3,y=0;y<o;y+=1)k+="="},u.toString=function(){return k},u},mr=function(A){var S=A,w=0,k=0,u=0,x={};x.read=function(){for(;u<8;){if(w>=S.length){if(u==0)return-1;throw"unexpected end of file./"+u}var o=S.charAt(w);if(w+=1,o=="=")return u=0,-1;if(o.match(/^\s$/))continue;k=k<<6|l(o.charCodeAt(0)),u+=6}var y=k>>>u-8&255;return u-=8,y};var l=function(o){if(65<=o&&o<=90)return o-65;if(97<=o&&o<=122)return o-97+26;if(48<=o&&o<=57)return o-48+52;if(o==43)return 62;if(o==47)return 63;throw"c:"+o};return x},gr=function(A,S){var w=A,k=S,u=new Array(A*S),x={};x.setPixel=function(f,b,I){u[b*w+f]=I},x.write=function(f){f.writeString("GIF87a"),f.writeShort(w),f.writeShort(k),f.writeByte(128),f.writeByte(0),f.writeByte(0),f.writeByte(0),f.writeByte(0),f.writeByte(0),f.writeByte(255),f.writeByte(255),f.writeByte(255),f.writeString(","),f.writeShort(0),f.writeShort(0),f.writeShort(w),f.writeShort(k),f.writeByte(0);var b=2,I=o(b);f.writeByte(b);for(var B=0;I.length-B>255;)f.writeByte(255),f.writeBytes(I,B,255),B+=255;f.writeByte(I.length-B),f.writeBytes(I,B,I.length-B),f.writeByte(0),f.writeString(";")};var l=function(f){var b=f,I=0,B=0,j={};return j.write=function(K,Z){if(K>>>Z)throw"length over";for(;I+Z>=8;)b.writeByte(255&(K<<I|B)),Z-=8-I,K>>>=8-I,B=0,I=0;B=K<<I|B,I=I+Z},j.flush=function(){I>0&&b.writeByte(B)},j},o=function(f){for(var b=1<<f,I=(1<<f)+1,B=f+1,j=y(),K=0;K<b;K+=1)j.add(String.fromCharCode(K));j.add(String.fromCharCode(b)),j.add(String.fromCharCode(I));var Z=J(),de=l(Z);de.write(b,B);var pe=0,ue=String.fromCharCode(u[pe]);for(pe+=1;pe<u.length;){var we=String.fromCharCode(u[pe]);pe+=1,j.contains(ue+we)?ue=ue+we:(de.write(j.indexOf(ue),B),j.size()<4095&&(j.size()==1<<B&&(B+=1),j.add(ue+we)),ue=we)}return de.write(j.indexOf(ue),B),de.write(I,B),de.flush(),Z.toByteArray()},y=function(){var f={},b=0,I={};return I.add=function(B){if(I.contains(B))throw"dup key:"+B;f[B]=b,b+=1},I.size=function(){return b},I.indexOf=function(B){return f[B]},I.contains=function(B){return typeof f[B]<"u"},I};return x},fr=function(A,S,w){for(var k=gr(A,S),u=0;u<S;u+=1)for(var x=0;x<A;x+=1)k.setPixel(x,u,w(x,u));var l=J();k.write(l);for(var o=se(),y=l.toByteArray(),f=0;f<y.length;f+=1)o.writeByte(y[f]);return o.flush(),"data:image/gif;base64,"+o};return e})();(function(){Lt.stringToBytesFuncs["UTF-8"]=function(e){function t(r){for(var a=[],n=0;n<r.length;n++){var i=r.charCodeAt(n);i<128?a.push(i):i<2048?a.push(192|i>>6,128|i&63):i<55296||i>=57344?a.push(224|i>>12,128|i>>6&63,128|i&63):(n++,i=65536+((i&1023)<<10|r.charCodeAt(n)&1023),a.push(240|i>>18,128|i>>12&63,128|i>>6&63,128|i&63))}return a}return t(e)}})();(function(e){typeof define=="function"&&define.amd?define([],e):typeof Tt=="object"&&(Pt.exports=e())})(function(){return Lt})});var re=(e,t=document)=>t.querySelector(e),Et=(e,t=document)=>Array.from(t.querySelectorAll(e));function $e(e){return e.replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}function qe(e){let t=document.createElement("style");return t.textContent=e,document.head.appendChild(t),t}var Mt={instant:110,micro:190,comp:340,scene:680,cine:1600,out:"cubic-bezier(.2,.85,.25,1)",inOut:"cubic-bezier(.65,0,.35,1)",sharp:"cubic-bezier(.9,.03,.2,1)",pull:"cubic-bezier(.16,1,.3,1)",spring:"cubic-bezier(.34,1.56,.64,1)"},me=()=>typeof matchMedia=="function"&&matchMedia("(prefers-reduced-motion: reduce)").matches;function Ar(e,t,r){return me()?e.animate({opacity:[.001,1]},{duration:1,fill:"both"}):e.animate(t,{fill:"both",...r})}function At(e){return Ar(e,{transform:["scale(1)","scale(.955)","scale(1)"]},{duration:Mt.instant,easing:Mt.out})}var Sr=`
:root{
  /* ground & surfaces (warm-cool near-black, layered depth) */
  --bg:#08070C; --bg-1:#0D0A13; --bg-2:#120E1B;
  --surface:#171122; --surface-2:#1F1830; --surface-3:#2A2140;
  --line:rgba(245,239,228,.07); --line-2:rgba(245,239,228,.14); --line-3:rgba(245,239,228,.22);
  /* functional colors (max 4 over bg+text) */
  --gold:#EBB24C; --gold-2:#F7CE72; --gold-deep:#A9762A;   /* primary + Vault (locked) */
  --green:#35D6A0;                                          /* support / live up */
  --red:#FF4D5E;                                            /* attack / betray / live down */
  --violet:#8B79F2;                                         /* secret / focus accent */
  /* text */
  --text:#F5EFE4; --text-2:#CFC7DA; --muted:#948CA6;
  /* elevation / glow / blur */
  --sh-1:0 2px 10px rgba(0,0,0,.35);
  --sh-2:0 10px 34px rgba(0,0,0,.5);
  --sh-card:0 18px 60px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,255,255,.04);
  --glow-gold:0 0 42px rgba(235,178,76,.28);
  --glow-green:0 0 34px rgba(53,214,160,.3);
  --glow-red:0 0 34px rgba(255,77,94,.32);
  --blur-1:8px; --blur-2:18px;
  /* radius / spacing / type */
  --r-1:8px; --r-2:14px; --r-3:22px; --r-pill:999px;
  --s1:4px; --s2:8px; --s3:12px; --s4:16px; --s5:24px; --s6:32px; --s7:48px; --s8:72px;
  --fs-display:clamp(44px,9vw,132px); --fs-h1:clamp(28px,5vw,64px); --fs-h2:clamp(22px,3.4vw,40px);
  --fs-h3:clamp(18px,2.4vw,26px); --fs-body:clamp(15px,1.6vw,19px); --fs-label:13px; --fs-cap:12px;
  --fs-vault:clamp(30px,4.4vw,72px); --fs-code:clamp(40px,7vw,96px);
  /* motion (mirror motion.ts) */
  --t-instant:110ms; --t-micro:190ms; --t-comp:340ms; --t-scene:680ms;
  --e-out:cubic-bezier(.2,.85,.25,1); --e-inout:cubic-bezier(.65,0,.35,1);
  --e-sharp:cubic-bezier(.9,.03,.2,1); --e-pull:cubic-bezier(.16,1,.3,1); --e-spring:cubic-bezier(.34,1.56,.64,1);
  /* z-layers */
  --z-bg:0; --z-content:10; --z-hud:20; --z-overlay:30; --z-toast:40; --z-modal:50;
  /* safe areas */
  --safe-t:env(safe-area-inset-top,0px); --safe-b:env(safe-area-inset-bottom,0px);
  --safe-l:env(safe-area-inset-left,0px); --safe-r:env(safe-area-inset-right,0px);
  --font:'Tajawal','Segoe UI','Tahoma',system-ui,sans-serif;
}
*{box-sizing:border-box}
html{overflow-x:hidden}
html,body{margin:0;min-height:100%}
body{
  background:var(--bg); color:var(--text); font-family:var(--font); font-weight:500;
  -webkit-font-smoothing:antialiased; text-rendering:optimizeLegibility;
  overscroll-behavior-y:none; -webkit-tap-highlight-color:transparent;
}
button{font-family:inherit;color:inherit;background:none;border:0;cursor:pointer}
input{font-family:inherit}
:focus{outline:none}
:focus-visible{outline:2px solid var(--violet);outline-offset:3px;border-radius:6px}
.mono{font-variant-numeric:tabular-nums;letter-spacing:.02em}
.muted{color:var(--muted)}
.dim{color:var(--text-2)}
.up{color:var(--green)} .dn{color:var(--red)} .gold{color:var(--gold)}
.center{display:flex;align-items:center;justify-content:center}
.col{display:flex;flex-direction:column}
.hide{display:none!important}

/* --- wordmark --- */
.wordmark{font-weight:900;letter-spacing:-.02em;line-height:.9;
  background:linear-gradient(180deg,var(--text),#d9cdb6);-webkit-background-clip:text;background-clip:text;color:transparent}
.wordmark.g{background:linear-gradient(120deg,var(--gold-2),var(--gold),var(--gold-deep));-webkit-background-clip:text;background-clip:text;color:transparent}

/* --- buttons --- */
.btn{position:relative;display:inline-flex;align-items:center;justify-content:center;gap:var(--s2);
  padding:15px 26px;font-size:var(--fs-body);font-weight:700;border-radius:var(--r-2);
  background:var(--surface-2);color:var(--text);border:1px solid var(--line-2);
  transition:transform var(--t-instant) var(--e-out),background var(--t-micro) var(--e-out),border-color var(--t-micro) var(--e-out),box-shadow var(--t-micro) var(--e-out);
  min-height:52px}
.btn:hover{background:var(--surface-3);border-color:var(--line-3)}
.btn:active{transform:scale(.97)}
.btn.primary{background:linear-gradient(180deg,var(--gold-2),var(--gold));color:#241704;border-color:transparent;box-shadow:var(--glow-gold)}
.btn.primary:hover{filter:brightness(1.06)}
.btn.ghost{background:transparent}
.btn.danger{color:var(--red);border-color:color-mix(in srgb,var(--red) 45%,transparent)}
.btn.wide{width:100%}
.btn[disabled]{opacity:.4;pointer-events:none;box-shadow:none}
.icon-btn{width:46px;height:46px;border-radius:var(--r-pill);display:grid;place-items:center;
  background:var(--surface-2);border:1px solid var(--line-2);color:var(--text-2);
  transition:transform var(--t-instant) var(--e-out),color var(--t-micro),border-color var(--t-micro)}
.icon-btn:hover{color:var(--text);border-color:var(--line-3)}
.icon-btn:active{transform:scale(.92)}

/* --- input --- */
.input{width:100%;padding:17px 18px;font-size:clamp(18px,4.5vw,22px);font-weight:700;text-align:center;
  color:var(--text);background:var(--surface-2);border:1.6px solid var(--line-3);border-radius:var(--r-2);
  box-shadow:inset 0 2px 10px rgba(0,0,0,.4);
  transition:border-color var(--t-micro) var(--e-out),box-shadow var(--t-micro) var(--e-out),background var(--t-micro) var(--e-out)}
.input:hover{background:var(--surface-3);border-color:var(--line-3)}
.input::placeholder{color:var(--text-2);font-weight:600;opacity:.85}
.input:focus{border-color:var(--violet);box-shadow:0 0 0 4px color-mix(in srgb,var(--violet) 18%,transparent)}
.input.err{border-color:var(--red);box-shadow:0 0 0 4px color-mix(in srgb,var(--red) 18%,transparent)}

/* --- panel / card --- */
.panel{background:linear-gradient(180deg,var(--surface-2),var(--surface));border:1px solid var(--line-2);
  border-radius:var(--r-3);box-shadow:var(--sh-card);position:relative;overflow:hidden}
.panel::before{content:'';position:absolute;inset:0 0 auto;height:1px;background:linear-gradient(90deg,transparent,var(--line-3),transparent)}

/* --- player card + avatar --- */
.pcard{display:flex;align-items:center;gap:var(--s3);padding:12px 14px;border-radius:var(--r-2);
  background:var(--surface);border:1px solid var(--line-2);transition:border-color var(--t-micro) var(--e-out),opacity var(--t-micro),transform var(--t-micro) var(--e-out)}
.pcard.is-ready{border-color:color-mix(in srgb,var(--green) 55%,transparent)}
.pcard.is-you{background:linear-gradient(180deg,var(--surface-2),var(--surface));border-color:var(--line-3)}
.pcard.is-off{opacity:.45}
.pcard .nm{font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.avatar{width:38px;height:38px;flex:0 0 auto;border-radius:12px;display:grid;place-items:center;font-weight:900;
  color:#0c0a12;font-size:17px}
.badge{display:inline-flex;align-items:center;gap:6px;font-size:var(--fs-cap);font-weight:800;padding:4px 9px;border-radius:var(--r-pill);
  background:var(--surface-3);color:var(--text-2);border:1px solid var(--line-2)}
.badge.ok{color:var(--green);border-color:color-mix(in srgb,var(--green) 40%,transparent)}
.badge.host{color:var(--gold);border-color:color-mix(in srgb,var(--gold) 40%,transparent)}
.dot{width:8px;height:8px;border-radius:50%;background:var(--muted)}
.dot.on{background:var(--green);box-shadow:0 0 8px var(--green)}
.dot.off{background:var(--red)}

/* --- timer ring --- */
.ring{--p:1;position:relative;width:var(--rs,56px);height:var(--rs,56px);border-radius:50%;
  background:conic-gradient(var(--gold) calc(var(--p)*360deg),var(--surface-3) 0);
  -webkit-mask:radial-gradient(closest-side,transparent 70%,#000 72%);mask:radial-gradient(closest-side,transparent 70%,#000 72%);
  transition:background .25s linear}
.ring.urgent{background:conic-gradient(var(--red) calc(var(--p)*360deg),var(--surface-3) 0)}

/* --- live bar + vault --- */
.bar{width:100%;border-radius:6px 6px 3px 3px;background:linear-gradient(180deg,var(--green),color-mix(in srgb,var(--green) 30%,#0a1a12));
  transition:height var(--t-scene) var(--e-out),background var(--t-scene) var(--e-out),box-shadow var(--t-micro)}
.bar.falling{background:linear-gradient(180deg,color-mix(in srgb,var(--red) 60%,#180a0d),var(--red))}
.vaultnum{font-weight:900;color:var(--gold);font-variant-numeric:tabular-nums;letter-spacing:-.02em;text-shadow:0 0 22px rgba(235,178,76,.35)}
.vaultnum.snap{animation:vaultSnap var(--t-scene) var(--e-spring)}

/* --- الوسيط --- */
.waseet{display:inline-flex;align-items:center;gap:10px;background:color-mix(in srgb,var(--surface-2) 88%,transparent);
  backdrop-filter:blur(var(--blur-1));border:1px solid var(--line-2);border-radius:var(--r-pill);padding:9px 16px;
  font-weight:700;box-shadow:var(--sh-1)}
.waseet .wm{flex:0 0 auto}

/* --- toast --- */
.toast{position:fixed;left:50%;top:calc(var(--safe-t) + 12px);transform:translateX(-50%);z-index:var(--z-toast);
  background:var(--surface-3);border:1px solid var(--line-2);border-radius:var(--r-pill);padding:10px 18px;font-weight:800;
  box-shadow:var(--sh-2);animation:toastIn var(--t-comp) var(--e-spring)}
.toast.err{color:var(--red);border-color:color-mix(in srgb,var(--red) 45%,transparent)}
.toast.ok{color:var(--green)}

/* --- scene container --- */
.scene{position:relative;z-index:var(--z-content);width:100%;min-height:100dvh;
  padding:calc(var(--safe-t) + var(--s5)) calc(var(--safe-r) + var(--s5)) calc(var(--safe-b) + var(--s5)) calc(var(--safe-l) + var(--s5))}

/* keyframes */
@keyframes vaultSnap{0%{transform:scale(.55);opacity:0}55%{transform:scale(1.14)}100%{transform:scale(1);opacity:1}}
@keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(-10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
@keyframes breathe{0%,100%{opacity:.55}50%{opacity:.9}}
@keyframes sealSweep{from{transform:translateX(-120%)}to{transform:translateX(120%)}}
@keyframes crackDraw{to{stroke-dashoffset:0}}
@keyframes floatUp{to{transform:translateY(-14vh);opacity:0}}
@keyframes spin{to{transform:rotate(360deg)}}
.spinner{width:34px;height:34px;border-radius:50%;border:3px solid var(--line-2);border-top-color:var(--gold);animation:spin .8s linear infinite}

/* scroll reveal */
[data-reveal]{opacity:0;transform:translateY(30px);transition:opacity .8s var(--e-pull),transform .8s var(--e-pull)}
[data-reveal].in{opacity:1;transform:none}
[data-reveal] [data-rc]{opacity:0;transform:translateY(18px);transition:opacity .7s var(--e-pull),transform .7s var(--e-pull)}
[data-reveal].in [data-rc]{opacity:1;transform:none}
[data-reveal].in [data-rc]:nth-child(2){transition-delay:.08s}
[data-reveal].in [data-rc]:nth-child(3){transition-delay:.16s}
[data-reveal].in [data-rc]:nth-child(4){transition-delay:.24s}
[data-reveal].in [data-rc]:nth-child(5){transition-delay:.32s}
[data-px]{will-change:transform;transition:transform .25s var(--e-out)}
@media (prefers-reduced-motion: reduce){[data-reveal],[data-reveal] [data-rc]{opacity:1;transform:none;transition:none}}

@media (prefers-reduced-motion: reduce){
  *{animation-duration:.001ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}
}
`;function St(){let e=document.createElement("style");e.id="dass-base",e.textContent=Sr,document.head.appendChild(e)}var Ct=!1;try{Ct=typeof localStorage<"u"&&localStorage.getItem("dass_muted")==="1"}catch{Ct=!1}var It=Mr(Rt(),1);function Bt(e,t="#0b0a0f",r="#f4eee3",a=2){let n=(0,It.default)(0,"M");n.addData(e),n.make();let i=n.getModuleCount(),s=i+a*2,d="";for(let p=0;p<i;p++)for(let E=0;E<i;E++)n.isDark(p,E)&&(d+=`M${E+a} ${p+a}h1v1h-1z`);return`<svg viewBox="0 0 ${s} ${s}" width="100%" height="100%" shape-rendering="crispEdges" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg"><rect width="${s}" height="${s}" fill="${r}"/><path d="${d}" fill="${t}"/></svg>`}function zt(e=document){let t=new IntersectionObserver(r=>{for(let a of r)a.isIntersecting&&(a.target.classList.add("in"),t.unobserve(a.target))},{threshold:.16,rootMargin:"0px 0px -8% 0px"});for(let r of Array.from(e.querySelectorAll("[data-reveal]")))me()?r.classList.add("in"):t.observe(r);return t}var Dt="backfire_sound_enabled",it=class{context=null;ambient=null;enabled=!1;constructor(){try{this.enabled=localStorage.getItem(Dt)==="1"}catch{this.enabled=!1}document.addEventListener("visibilitychange",()=>{!this.context||!this.enabled||(document.hidden?this.context.suspend():(this.context.resume(),this.ensureAmbient()))})}isEnabled(){return this.enabled}toggle(){return this.setEnabled(!this.enabled),this.enabled}setEnabled(t){this.enabled=t;try{localStorage.setItem(Dt,t?"1":"0")}catch{}t?(this.getContext(),this.ensureAmbient(),this.tone(196,294,.11,"triangle",.038)):(this.stopAmbient(),this.context?.state==="running"&&this.context.suspend())}tick(){this.tone(410,455,.032,"triangle",.021)}reveal(){this.tone(147,392,.23,"triangle",.048),this.tone(220,523,.16,"sine",.027,.09)}transfer(){this.tone(523,165,.19,"triangle",.035)}impact(){this.tone(147,49,.22,"sawtooth",.055)}cta(){this.tone(196,392,.15,"triangle",.042)}error(){this.tone(210,130,.13,"sawtooth",.055)}getContext(){if(!this.enabled||typeof window>"u")return null;if(!this.context){let t=window.AudioContext??window.webkitAudioContext;if(!t)return null;try{this.context=new t}catch{return null}}return this.context.state==="suspended"&&!document.hidden&&this.context.resume(),this.context}tone(t,r,a,n,i,s=0){let d=this.getContext();if(!d)return;let p=d.currentTime+s,E=d.createOscillator(),N=d.createGain();E.type=n,E.frequency.setValueAtTime(t,p),E.frequency.exponentialRampToValueAtTime(Math.max(1,r),p+a),N.gain.setValueAtTime(1e-4,p),N.gain.exponentialRampToValueAtTime(i,p+.008),N.gain.exponentialRampToValueAtTime(1e-4,p+a),E.connect(N).connect(d.destination),E.start(p),E.stop(p+a+.03)}ensureAmbient(){let t=this.getContext();if(!t||this.ambient||document.hidden)return;let r=t.createGain();r.gain.value=.012;let a=t.createOscillator(),n=t.createOscillator(),i=t.createBiquadFilter();a.type="sine",a.frequency.value=44,n.type="sine",n.frequency.value=66,i.type="lowpass",i.frequency.value=150,a.connect(i),n.connect(i),i.connect(r).connect(t.destination),a.start(),n.start(),this.ambient={gain:r,sources:[a,n]}}stopAmbient(){if(!this.ambient)return;let t=this.context?.currentTime??0;this.ambient.gain.gain.cancelScheduledValues(t),this.ambient.gain.gain.setTargetAtTime(1e-4,t,.025);for(let r of this.ambient.sources)r.stop(t+.15);this.ambient=null}},Ee=new it;var Ne="".replace(/\/$/,"");var oe=(e,t="one-time")=>({amountMinor:e,currency:"SAR",interval:t,taxInclusive:!0}),Fe=[{id:"theme-original",category:"theme",name:"الرجعة الأصلية",description:"هوية BACKFIRE الأساسية: أسود عميق، قرمزي، وجمر دافئ.",price:oe(0),accent:"#E23A4F",glyph:"BF",includedIn:"free"},{id:"theme-sadu",category:"theme",name:"نسيج الأثر",description:"تأويل بصري هادئ مستلهم من السدو لجلسات اللعب الطويلة.",price:oe(1900),accent:"#B51F36",glyph:"◆",includedIn:"majlis-plus"},{id:"bg-desert",category:"background",name:"آخر الإرسال",description:"خلفية تلفاز داكنة توحي بأثر بعيد من دون تشتيت.",price:oe(1200),accent:"#E85B3F",glyph:"☾"},{id:"avatar-falcon",category:"avatar",name:"الصقر",description:"صورة رمزية حادة وواضحة داخل جلسة اللعب.",price:oe(700),accent:"#FAF6F7",glyph:"♢"},{id:"frame-gold",category:"frame",name:"إطار الارتداد",description:"إطار قرمزي يبرز الملف من غير مبالغة.",price:oe(900),accent:"#B51F36",glyph:"◇",includedIn:"majlis-plus"},{id:"winner-spark",category:"winner",name:"نبضة الفوز",description:"لحظة فوز قصيرة ومضبوطة على الشاشة الكبيرة.",price:oe(1500),accent:"#E85B3F",glyph:"✦"},{id:"reveal-crack",category:"reveal",name:"ارتداد الأثر",description:"مؤثر كشف يبرز عودة العاقبة إلى المشهد العام.",price:oe(1400),accent:"#E23A4F",glyph:"╱"},{id:"season-eid",category:"seasonal",name:"حزمة العيد",description:"حزمة موسمية قيد التجهيز — لا يمكن شراؤها الآن.",price:oe(2900),accent:"#4A0B18",glyph:"✺",comingSoon:!0}],nt=[{id:"free",name:"الأساسية",description:"اللعبة الأساسية كاملة لكل شلة.",features:["إنشاء الغرف والانضمام بلا حد مدفوع","اللعبة الكاملة من ٤ إلى ٨ لاعبين","الإعدادات وميزات الوصول الأساسية"]},{id:"majlis-plus",name:"Backfire Plus",description:"تخصيص أعمق للمضيف والملف الشخصي.",monthly:oe(1900,"month"),yearly:oe(19e3,"year"),recommended:!0,features:["ثيمات وإطارات مختارة","حفظ إعدادات الجلسة","سجل مباريات ممتد مستقبلًا","مؤثرات تقديم إضافية بلا أفضلية لعب"]},{id:"events",name:"باقة مناسبات",description:"تقديم مخصص للفعاليات والجلسات الكبيرة.",monthly:oe(5900,"month"),yearly:oe(59e3,"year"),features:["هوية غرفة قابلة للتخصيص","قوالب عرض للمناسبات","إعدادات مضيف متقدمة مستقبلًا","لا تتضمن أي عنصر ادفع لتفوز"]}];function ve(e){return Fe.find(t=>t.id===e)}function Me(e){return nt.find(t=>t.id===e)}function ge(e){return e.amountMinor===0?"مجاني":new Intl.NumberFormat("ar-SA",{style:"currency",currency:e.currency,maximumFractionDigits:2}).format(e.amountMinor/100)}function Xe(e){let t=e.normalize("NFKC").trim().replace(/\s+/g," ");return t?[...t].length>24?{ok:!1,message:"الاسم الظاهر بحد أقصى ٢٤ حرفًا."}:/[<>&\u0000-\u001f\u007f-\u009f\u202a-\u202e]/u.test(t)?{ok:!1,message:"الاسم يحتوي رموزًا غير مدعومة."}:{ok:!0,value:t}:{ok:!1,message:"اكتب الاسم الظاهر."}}function ot(e){let t=e.trim().toLowerCase();return/^[a-z0-9_]{3,20}$/.test(t)?{ok:!0,value:t}:{ok:!1,message:"اسم المستخدم من ٣–٢٠: حروف إنجليزية وأرقام وشرطة سفلية."}}function je(e){let t=e.trim().toLowerCase();return/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)?{ok:!0,value:t}:{ok:!1,message:"اكتب بريدًا إلكترونيًا صحيحًا."}}function st(e){return e.length<8||!/[A-Za-z]/.test(e)||!/\d/.test(e)?{ok:!1,message:"كلمة المرور ٨ خانات على الأقل وتحتوي حرفًا ورقمًا."}:{ok:!0,value:e}}var Ce="dass.product.v1.",_t={language:"ar",appearance:"dass",effectsVolume:70,musicVolume:45,muted:!1,animations:!0,reducedMotion:!1,highContrast:!1,textScale:"normal",haptics:!0,confirmCritical:!0,autoReady:!1,productUpdates:!0,matchInvites:!0,friendInvites:!1,purchaseReceipts:!0,subscriptionReminders:!0,marketing:!1,profileVisibility:"players",activityVisibility:!1,recentPlayerVisibility:!1,analytics:!1,functionalCookies:!0},Ae={displayName:"ضيف المجلس",username:"guest",avatar:"theme-original",frame:"theme-original"},qt={ownedProductIds:["theme-original"],equipped:{theme:"theme-original"}},Se={id:"demo_user_seed",displayName:"لاعب تجريبي",username:"demo_player",email:"demo@backfire.local",createdAt:"2026-01-01T00:00:00.000Z",plan:"free"};function ae(e){return JSON.parse(JSON.stringify(e))}function Oe(e){let t=globalThis.crypto?.randomUUID?.()??`${Date.now()}-${Math.random().toString(36).slice(2)}`;return`${e}_${t}`}function Q(e,t,r){try{let a=e.getItem(Ce+t);return a?JSON.parse(a):ae(r)}catch{return ae(r)}}function H(e,t,r){e.setItem(Ce+t,JSON.stringify(r))}function le(e){if(!e.ok)throw new Error(e.message);return e.value}function W(e,t){return`${e}.${t?.id??"anonymous"}`}function Nt(e){let t=new Set,r=()=>{let i=n.getSession();for(let s of t)s(i)},a=()=>{let i=n.getSession();if(!i)throw new Error("سجّل الدخول أو تابع كضيف أولًا.");return i},n={mode:"demo",getSession:()=>Q(e,"session",null),subscribeToSessionChanges(i){return t.add(i),()=>t.delete(i)},async signIn(i,s){let d=le(je(i));le(st(s));let p=Q(e,"identities",[]).find(V=>V.email===d)??(d===Se.email?Se:void 0);if(!p)throw new Error("بيانات الدخول غير صحيحة في وضع العرض. أنشئ حسابًا محليًا أولًا.");let E={id:p.id,mode:"demo",displayName:p.displayName,username:p.username,email:d,verified:!1,plan:p.plan,createdAt:p.createdAt};return H(e,"session",E),Q(e,W("profile",E),null)||H(e,W("profile",E),{...Ae,displayName:E.displayName,username:E.username}),r(),ae(E)},async signUp(i){if(!i.acceptedTerms)throw new Error("وافق على الشروط وسياسة الخصوصية للمتابعة.");let s=le(Xe(i.displayName)),d=le(ot(i.username)),p=le(je(i.email));le(st(i.password));let E=Q(e,"identities",[]);if(E.some(J=>J.email===p)||p===Se.email)throw new Error("البريد مستخدم مسبقًا في هذا المتصفح.");if(E.some(J=>J.username===d)||d===Se.username)throw new Error("اسم المستخدم مستخدم مسبقًا في هذا المتصفح.");let N=new Date().toISOString(),V=Oe("demo_user"),U={id:V,mode:"demo",displayName:s,username:d,email:p,verified:!1,plan:"free",createdAt:N};return E.push({id:V,displayName:s,username:d,email:p,createdAt:N,plan:"free"}),H(e,"identities",E),H(e,"session",U),H(e,W("profile",U),{...Ae,displayName:s,username:d}),H(e,W("settings",U),_t),H(e,W("inventory",U),qt),r(),ae(U)},async continueAsGuest(i=Ae.displayName){let s=le(Xe(i)),d=Math.random().toString(36).slice(2,7),p={id:Oe("guest"),mode:"guest",displayName:s,username:`guest_${d}`,verified:!1,plan:"free",createdAt:new Date().toISOString()};return H(e,"session",p),H(e,W("profile",p),{...Ae,displayName:s,username:p.username}),r(),ae(p)},async signOut(){e.removeItem(Ce+"session"),r()},async requestPasswordReset(i){return le(je(i)),{delivered:!1,demo:!0}},getProfile(){let i=n.getSession();return Q(e,W("profile",i),i?{...Ae,displayName:i.displayName,username:i.username}:Ae)},async updateProfile(i){let s=a(),p={...n.getProfile(),...i};i.displayName!==void 0&&(p.displayName=le(Xe(i.displayName))),i.username!==void 0&&(p.username=le(ot(i.username)));let E=Q(e,"identities",[]);if(E.some(U=>U.id!==s.id&&U.username===p.username)||s.id!==Se.id&&p.username===Se.username)throw new Error("اسم المستخدم مستخدم مسبقًا في هذا المتصفح.");H(e,W("profile",s),p);let N={...s,displayName:p.displayName,username:p.username};H(e,"session",N);let V=E.find(U=>U.id===s.id);return V&&(V.displayName=p.displayName,V.username=p.username,H(e,"identities",E)),r(),ae(p)},getSettings:()=>{let i=n.getSession();return{..._t,...Q(e,W("settings",i),{})}},updateSettings(i){a();let s={...n.getSettings(),...i};return s.effectsVolume=Math.min(100,Math.max(0,Number(s.effectsVolume))),s.musicVolume=Math.min(100,Math.max(0,Number(s.musicVolume))),H(e,W("settings",n.getSession()),s),ae(s)},getInventory:()=>Q(e,W("inventory",n.getSession()),qt),async equipProduct(i){a();let s=ve(i);if(!s)throw new Error("العنصر غير موجود.");let d=n.getInventory();if(!d.ownedProductIds.includes(i))throw new Error("العنصر غير مملوك.");return d.equipped[s.category]=i,H(e,W("inventory",n.getSession()),d),ae(d)},async unequipProduct(i){a();let s=ve(i);if(!s)throw new Error("العنصر غير موجود.");let d=n.getInventory();return d.equipped[s.category]!==i?d:(s.category==="theme"?d.equipped.theme="theme-original":delete d.equipped[s.category],H(e,W("inventory",n.getSession()),d),ae(d))},async createCheckout(i,s,d="month"){let p=a(),E=i==="product"?ve(s):void 0,N=i==="plan"?Me(s):void 0;if(i==="product"&&(!E||E.comingSoon))throw new Error("هذا العنصر غير متاح للشراء.");if(i==="plan"&&(!N||N.id==="free"))throw new Error("هذه الباقة لا تحتاج إلى دفع.");let V=E?.price??(d==="year"?N?.yearly:N?.monthly);if(!V)throw new Error("سعر الاختيار غير متاح.");let U={id:Oe("demo_checkout"),ownerId:p.id,kind:i,referenceId:s,label:E?.name??N.name,price:V,status:"pending",demo:!0,createdAt:new Date().toISOString()};return H(e,`checkout.${U.id}`,U),ae(U)},getCheckout(i){return Q(e,`checkout.${i}`,null)},async completeDemoCheckout(i,s){let d=a(),p=n.getCheckout(i);if(!p)throw new Error("جلسة الدفع غير موجودة.");if(p.ownerId!==d.id)throw new Error("جلسة الدفع لا تخص هذا الحساب.");if(p.status!=="pending")return p;if(p.status=s,H(e,`checkout.${p.id}`,p),s==="succeeded"){if(p.kind==="product"){let V=n.getInventory();V.ownedProductIds.includes(p.referenceId)||V.ownedProductIds.push(p.referenceId),H(e,W("inventory",n.getSession()),V)}else{let V=a();H(e,"session",{...V,plan:p.referenceId});let U=Q(e,"identities",[]),J=U.find(se=>se.id===V.id);J&&(J.plan=p.referenceId,H(e,"identities",U)),r()}let E=n.getPurchaseHistory(),N={id:Oe("demo_receipt"),checkoutId:p.id,label:p.label,totalMinor:p.price.amountMinor,currency:p.price.currency,createdAt:new Date().toISOString(),demo:!0};E.unshift(N),H(e,W("receipts",n.getSession()),E)}return ae(p)},getPurchaseHistory:()=>Q(e,W("receipts",n.getSession()),[]),async cancelSubscription(){let i=a(),s={...i,plan:"free"};H(e,"session",s);let d=Q(e,"identities",[]),p=d.find(E=>E.id===i.id);return p&&(p.plan="free",H(e,"identities",d)),r(),ae(s)},getMatchHistory:()=>Q(e,W("matches",n.getSession()),[]),async saveSupportRequest(i){let s=i.subject.trim(),d=i.message.trim();if(s.length<3||s.length>100)throw new Error("عنوان الطلب من ٣ إلى ١٠٠ حرف.");if(d.length<10||d.length>2e3)throw new Error("التفاصيل من ١٠ إلى ٢٠٠٠ حرف.");i.email&&le(je(i.email));let p={...i,subject:s,message:d,id:Oe("demo_support"),createdAt:new Date().toISOString(),delivery:"local-only"},E=Q(e,"support",[]);return E.unshift(p),H(e,"support",E),ae(p)},async deleteLocalAccount(i){if(i.trim()!=="احذف حسابي")throw new Error("اكتب «احذف حسابي» للتأكيد.");let s=a();for(let p of["profile","settings","inventory","receipts","matches"])e.removeItem(Ce+W(p,s));let d=Q(e,"identities",[]).filter(p=>p.id!==s.id);H(e,"identities",d),e.removeItem(Ce+"support"),e.removeItem(Ce+"session"),r()}};return n}function Ft(){let e=()=>{throw new Error("خدمات الحساب والدفع غير موصولة في هذا الإصدار.")};return{mode:"unavailable",getSession:()=>null,subscribeToSessionChanges:()=>()=>{},signIn:async()=>e(),signUp:async()=>e(),continueAsGuest:async()=>e(),signOut:async()=>{},requestPasswordReset:async()=>e(),getProfile:e,updateProfile:async()=>e(),getSettings:e,updateSettings:e,getInventory:e,equipProduct:async()=>e(),unequipProduct:async()=>e(),createCheckout:async()=>e(),getCheckout:()=>null,completeDemoCheckout:async()=>e(),getPurchaseHistory:()=>[],cancelSubscription:async()=>e(),getMatchHistory:()=>[],saveSupportRequest:async()=>e(),deleteLocalAccount:async()=>e()}}var lt=new Map,Cr={getItem:e=>lt.get(e)??null,setItem:(e,t)=>{lt.set(e,t)},removeItem:e=>{lt.delete(e)}},Lr=typeof localStorage>"u"?Cr:localStorage,jt=!0,P=jt?Nt(Lr):Ft(),Ot=jt;var Tr="ABCDEFGHJKLMNPQRSTUVWXYZ23456789",Pr="٠١٢٣٤٥٦٧٨٩",Rr="۰۱۲۳۴۵۶۷۸۹";function Ze(e){return String(e??"").trim().replace(/[\s-]+/g,"").replace(/[٠-٩]/g,t=>String(Pr.indexOf(t))).replace(/[۰-۹]/g,t=>String(Rr.indexOf(t))).toUpperCase()}function Ht(e){let t=Ze(e);return t.length===8&&[...t].every(r=>Tr.includes(r))}var dt=new Set(["/store","/pricing","/login","/signup","/forgot-password","/reset-password","/verify-email","/session-ended","/store/product","/checkout/result","/account","/account/profile","/account/settings","/account/inventory","/account/history","/account/history/match","/account/achievements","/account/billing","/checkout","/support","/faq","/contact","/report-player","/about","/credits","/status","/changelog","/invite","/legal/privacy","/legal/terms","/legal/refunds","/legal/cookies"]),F=$e,z=e=>document.querySelector(e);function D(e,t,r,a,n=""){return`<main id="main-content" class="product-page" tabindex="-1">
    <header class="product-hero"><div><span class="eyebrow">${e}</span><h1>${t}</h1><p>${r}</p></div>${n}</header>
    ${Ot?Ir():Br()}
    ${a}
  </main>`}function Ir(){return'<aside class="demo-banner" role="note"><span class="demo-dot"></span><div><b>وضع العرض المحلي</b><span>الحسابات والمشتريات محفوظة على هذا المتصفح فقط. لا يوجد دفع أو إرسال بريد حقيقي.</span></div></aside>'}function Br(){return'<aside class="demo-banner unavailable" role="alert"><span class="demo-dot"></span><div><b>الخدمات التجارية غير متصلة</b><span>التصفح متاح، لكن الحساب والدفع يحتاجان مزود إنتاج.</span></div></aside>'}function _(e,t="ok"){let r=z("#product-notice");r&&(r.className=`product-notice ${t}`,r.textContent=e,r.removeAttribute("hidden"),r.scrollIntoView({behavior:"smooth",block:"nearest"}))}function X(e){return e instanceof Error?e.message:"تعذر إكمال العملية."}function ce(e,t){e.setAttribute("aria-busy",String(t));let r=e.querySelector('button[type="submit"]');r&&(t?(r.dataset.label=r.textContent??"",r.textContent="جاري التنفيذ…"):r.dataset.label&&(r.textContent=r.dataset.label),r.disabled=t)}function he(e,t=""){return e?null:`<section class="empty-state panel"><span class="empty-glyph">◇</span><h2>تحتاج حسابًا محليًا</h2><p>سجّل دخولك في وضع العرض أو تابع كضيف للوصول لهذه الصفحة.</p><a class="btn primary" data-link="${t?`/login?next=${encodeURIComponent(t)}`:"/login"}">دخول أو متابعة كضيف</a></section>`}function Vt(){let e=new URLSearchParams(location.search).get("next")??"",t=e.split("?")[0]??"";return t.startsWith("/")&&dt.has(t)?e:"/account/profile"}function Le(e){return`<nav class="account-tabs" aria-label="صفحات الحساب">${[["profile","/account/profile","الملف"],["inventory","/account/inventory","المقتنيات"],["history","/account/history","المباريات"],["achievements","/account/achievements","الإنجازات"],["billing","/account/billing","الفوترة"],["settings","/account/settings","الإعدادات"]].map(([r,a,n])=>`<a data-link="${a}" class="${e===r?"on":""}">${n}</a>`).join("")}</nav>`}function ee(e,t,r="text",a="",n=""){return`<label class="field"><span>${t}</span><input class="input" name="${e}" type="${r}" value="${F(a)}" ${n}></label>`}function zr(){let e=P.getSession();return{active:"account",title:"تسجيل الدخول",description:"الدخول إلى حساب BACKFIRE التجريبي.",html:e?D("الحساب","أهلًا "+F(e.displayName),"جلستك المحلية جاهزة.",`<section class="auth-card panel"><div id="product-notice" hidden></div><p class="muted">${e.mode==="guest"?"أنت داخل كضيف.":`الحساب التجريبي: ${F(e.email??"")}`}</p><a class="btn primary wide" data-link="/account/profile">افتح حسابي</a><button class="btn wide" id="logout">تسجيل الخروج</button></section>`):D("الحساب","ارجع للعبة","دخول تجريبي محلي لا يرسل بيانات إلى خادم.",`<section class="auth-layout"><form id="login-form" class="auth-card panel"><div id="product-notice" role="status" aria-live="polite" hidden></div>${ee("email","البريد الإلكتروني","email","",'autocomplete="email" required')}${ee("password","كلمة المرور","password","",'data-secret autocomplete="current-password" minlength="8" required')}<div class="demo-credential"><span>حساب العرض الجاهز</span><code dir="ltr">demo@backfire.local · demoPass8</code></div><div class="form-options"><label class="check-row"><input name="remember" type="checkbox" checked><span>تذكر الجلسة على هذا الجهاز</span></label><button class="secret-toggle" type="button">إظهار كلمة المرور</button></div><button class="btn primary wide" type="submit">دخول تجريبي</button><a data-link="/forgot-password" class="text-link">نسيت كلمة المرور؟</a></form><aside class="auth-side"><span class="auth-seal">BF</span><h2>ما عندك حساب؟</h2><p>أنشئ ملفًا محليًا، أو ادخل كضيف من دون بريد.</p><a class="btn" data-link="/signup">إنشاء حساب تجريبي</a><button id="guest-login" class="btn ghost">المتابعة كضيف</button></aside></section>`),bind(r){Kt(),z("#logout")?.addEventListener("click",async()=>{await P.signOut(),r("/")}),z("#guest-login")?.addEventListener("click",async a=>{a.currentTarget.disabled=!0;try{await P.continueAsGuest(),r(Vt())}catch(n){_(X(n),"error"),a.currentTarget.disabled=!1}}),z("#login-form")?.addEventListener("submit",async a=>{a.preventDefault();let n=a.currentTarget;ce(n,!0);let i=new FormData(n);try{await P.signIn(String(i.get("email")??""),String(i.get("password")??"")),r(Vt())}catch(s){_(X(s),"error")}finally{ce(n,!1)}})}}}function Dr(){return{active:"account",title:"إنشاء حساب",description:"إنشاء حساب BACKFIRE تجريبي محلي.",html:D("حساب جديد","سمّ نفسك","البيانات تبقى على هذا الجهاز في وضع العرض.",`<form id="signup-form" class="auth-card panel form-grid"><div id="product-notice" role="status" aria-live="polite" hidden></div>${ee("displayName","الاسم الظاهر","text","",'maxlength="24" autocomplete="name" required aria-describedby="name-help"')}<small id="name-help" class="field-help">حتى ٢٤ حرفًا. لا نسمح بالترميز أو محارف التحكم.</small>${ee("username","اسم المستخدم","text","",'maxlength="20" pattern="[a-zA-Z0-9_]{3,20}" dir="ltr" required aria-describedby="username-help"')}<small id="username-help" class="field-help">٣–٢٠ من الحروف الإنجليزية والأرقام والشرطة السفلية.</small>${ee("email","البريد الإلكتروني","email","",'autocomplete="email" required')}${ee("password","كلمة المرور","password","",'data-secret minlength="8" autocomplete="new-password" required aria-describedby="password-help"')}${ee("confirmPassword","تأكيد كلمة المرور","password","",'data-secret minlength="8" autocomplete="new-password" required')}<small id="password-help" class="field-help">٨ خانات على الأقل، وتتضمن حرفًا ورقمًا.</small><button class="secret-toggle" type="button">إظهار كلمتي المرور</button><label class="check-row"><input name="terms" type="checkbox" required><span>أوافق على <a data-link="/legal/terms">الشروط</a> و<a data-link="/legal/privacy">الخصوصية</a>.</span></label><button class="btn primary wide" type="submit">أنشئ الحساب التجريبي</button><p class="form-foot">عندك حساب؟ <a data-link="/login">سجّل الدخول</a></p></form>`),bind(e){Kt(),z("#signup-form")?.addEventListener("submit",async t=>{t.preventDefault();let r=t.currentTarget;ce(r,!0);let a=new FormData(r);try{if(String(a.get("password")??"")!==String(a.get("confirmPassword")??""))throw new Error("كلمتا المرور غير متطابقتين.");await P.signUp({displayName:String(a.get("displayName")??""),username:String(a.get("username")??""),email:String(a.get("email")??""),password:String(a.get("password")??""),acceptedTerms:a.get("terms")==="on"}),e("/account/profile")}catch(n){_(X(n),"error")}finally{ce(r,!1)}})}}}function Kt(){z(".secret-toggle")?.addEventListener("click",e=>{let t=document.querySelectorAll("[data-secret]"),r=[...t].some(a=>a.type==="password");t.forEach(a=>{a.type=r?"text":"password"}),e.currentTarget.textContent=r?"إخفاء كلمة المرور":"إظهار كلمة المرور"})}function _r(){return{active:"account",title:"استعادة كلمة المرور",description:"توضيح استعادة كلمة المرور في النسخة التجريبية.",html:D("استعادة الحساب","نسيت كلمة المرور؟","لن نرسل بريدًا وهميًا. مزود البريد غير موصول في وضع العرض.",`<form id="reset-form" class="auth-card panel"><div id="product-notice" hidden></div>${ee("email","البريد الإلكتروني","email","",'required autocomplete="email"')}<button class="btn primary wide" type="submit">تحقق من الطلب</button><a class="text-link" data-link="/login">العودة للدخول</a></form>`),bind(){z("#reset-form")?.addEventListener("submit",async e=>{e.preventDefault();let t=e.currentTarget;ce(t,!0);let r=new FormData(t);try{await P.requestPasswordReset(String(r.get("email")??"")),_("البريد صحيح، لكن لم يُرسل شيء لأن مزود البريد غير موصول في وضع العرض.")}catch(a){_(X(a),"error")}finally{ce(t,!1)}})}}}function qr(e){return e==="/session-ended"?{active:"account",title:"انتهت الجلسة",description:"انتهت جلسة حساب BACKFIRE.",html:D("أمان الحساب","انتهت الجلسة","لم نحتفظ بعملية معلّقة. ادخل مرة ثانية للمتابعة.",'<section class="empty-state panel"><span class="empty-glyph">⌁</span><h2>سجّل دخولك من جديد</h2><p>في مزود الإنتاج ستنتهي الجلسة عند الإلغاء أو انتهاء صلاحية الرمز. وضع العرض المحلي لا يدّعي دورة رموز خادم.</p><a class="btn primary" data-link="/login">تسجيل الدخول</a></section>')}:e==="/verify-email"?{active:"account",title:"تأكيد البريد",description:"حالة تأكيد بريد حساب BACKFIRE.",html:D("تأكيد البريد","البريد غير موثّق","مزود البريد غير موصول، لذلك لن نرسل رسالة وهمية.",'<section class="empty-state panel"><span class="empty-glyph">✉</span><h2>التأكيد غير متاح في وضع العرض</h2><p>الحساب المحلي يبقى بعلامة «غير موثّق». عند توصيل مزود الهوية ستُرسل الروابط وتُتحقق على الخادم.</p><a class="btn" data-link="/account/profile">العودة للملف</a></section>')}:{active:"account",title:"إعادة تعيين كلمة المرور",description:"إعادة تعيين كلمة مرور BACKFIRE.",html:D("استعادة الحساب","رابط إعادة التعيين غير نشط","هذه الشاشة موجودة لحالة الرابط، لكنها لن تغير كلمة مرور من دون مزود هوية.",'<section class="empty-state panel"><span class="empty-glyph">◇</span><h2>لا يوجد رمز استعادة صالح</h2><p>اطلب رابطًا بعد توصيل خدمة البريد والهوية. لم نقرأ أو نقبل أي رمز من الرابط في وضع العرض.</p><a class="btn primary" data-link="/forgot-password">العودة للاستعادة</a></section>')}}function Nr(e,t){let r=e.comingSoon?'<button class="btn sm" disabled>قريبًا</button>':t.has(e.id)?`<a class="btn sm" data-link="/account/inventory">${e.price.amountMinor===0?"ضمن حسابك":"مملوك"}</a>`:`<a class="btn primary sm" data-link="/checkout?kind=product&id=${e.id}">اقتناء</a>`;return`<article class="product-card" data-category="${e.category}" data-name="${F(e.name.toLowerCase())}" data-price="${e.price.amountMinor}"><a class="product-art" style="--accent:${e.accent}" data-link="/store/product?id=${e.id}" aria-label="معاينة ${F(e.name)}"><span>${F(e.glyph)}</span></a><div class="product-card-copy"><span class="product-type">${He(e.category)}</span><h2><a data-link="/store/product?id=${e.id}">${F(e.name)}</a></h2><p>${F(e.description)}</p><div class="product-card-foot"><b>${ge(e.price)}</b><div><a class="btn sm ghost" data-link="/store/product?id=${e.id}">معاينة</a>${r}</div></div></div></article>`}function He(e){return{theme:"ثيم",background:"خلفية",avatar:"صورة",frame:"إطار",winner:"فوز",reveal:"كشف",seasonal:"موسمي"}[e]}function Fr(){let e=new Set(P.getSession()?P.getInventory().ownedProductIds:["theme-original"]);return{active:"store",title:"المتجر",description:"مظاهر وتجارب بصرية اختيارية للعبة BACKFIRE.",html:D("متجر BACKFIRE","خلّ الجلسة تشبهكم","مظاهر ومؤثرات اختيارية فقط — لا أفضلية لعب ولا صناديق عشوائية.",`<section class="catalog-tools"><div class="filter-pills" role="group" aria-label="تصفية المتجر"><button class="on" data-filter="all">الكل</button><button data-filter="theme">الثيمات</button><button data-filter="avatar">الملف</button><button data-filter="winner">المؤثرات</button></div><div class="catalog-inputs"><label><span class="sr-only">ابحث في المتجر</span><input id="store-search" class="input" type="search" placeholder="ابحث بالاسم"></label><label><span class="sr-only">ترتيب المتجر</span><select id="store-sort" class="input"><option value="featured">الترتيب المقترح</option><option value="low">السعر: الأقل</option><option value="high">السعر: الأعلى</option></select></label></div><p class="catalog-note">الأسعار تشمل الضريبة · الدفع الحقيقي غير مفعّل</p></section><div id="store-empty" class="empty-state panel compact" hidden><h2>ما لقينا هذا العنصر</h2><p>غيّر البحث أو افتح فئة ثانية.</p></div><section class="product-grid" id="product-grid">${Fe.map(t=>Nr(t,e)).join("")}</section>`),bind(){let t="all",r=()=>{let a=(z("#store-search")?.value??"").trim().toLowerCase(),n=0;document.querySelectorAll("[data-category]").forEach(s=>{s.hidden=t!=="all"&&s.dataset.category!==t||!(s.dataset.name??"").includes(a),s.hidden||(n+=1)});let i=z("#store-empty");i&&i.toggleAttribute("hidden",n!==0)};document.querySelectorAll("[data-filter]").forEach(a=>a.addEventListener("click",()=>{document.querySelectorAll("[data-filter]").forEach(n=>n.classList.toggle("on",n===a)),t=a.dataset.filter??"all",r()})),z("#store-search")?.addEventListener("input",r),z("#store-sort")?.addEventListener("change",a=>{let n=z("#product-grid");if(!n)return;let i=[...n.querySelectorAll("[data-price]")],s=a.currentTarget.value;s!=="featured"&&i.sort((d,p)=>Number(d.dataset.price)-Number(p.dataset.price)||(d.dataset.name??"").localeCompare(p.dataset.name??"","ar")),s==="high"&&i.reverse(),i.forEach(d=>n.append(d))})}}}function jr(e){let t=ve(e.get("id")??"");if(!t)return ct("العنصر غير موجود","ارجع للمتجر واختر عنصرًا من الكتالوج.");let r=P.getSession()?P.getInventory():null,a=r?.ownedProductIds.includes(t.id)??t.price.amountMinor===0,n=r?.equipped[t.category]===t.id,i=t.comingSoon?'<button class="btn primary" disabled>قريبًا</button>':a?`<button id="detail-equip" class="btn primary" ${n?"disabled":""}>${n?"مفعّل الآن":"تفعيل العنصر"}</button>`:`<a class="btn primary" data-link="/checkout?kind=product&id=${t.id}">اقتناء تجريبي</a>`;return{active:"store",title:t.name,description:t.description,html:D("تفاصيل العنصر",F(t.name),F(t.description),`<section class="product-detail"><div class="product-detail-art panel" style="--accent:${t.accent}"><span>${F(t.glyph)}</span><i>معاينة بصرية تمثيلية</i></div><div class="product-detail-copy panel"><span class="product-type">${He(t.category)}</span><h2>${ge(t.price)}</h2><dl><div><dt>الحالة</dt><dd>${t.comingSoon?"قيد التجهيز":a?"مملوك":"متاح"}</dd></div><div><dt>الفئة</dt><dd>${He(t.category)}</dd></div><div><dt>الأثر على اللعب</dt><dd>تجميلي فقط</dd></div></dl>${i}<p>لا يمنح العنصر نقاطًا أو قرارات أو فرصة فوز إضافية.</p><a class="text-link" data-link="/store">العودة للمتجر</a></div></section>`),bind(s,d){z("#detail-equip")?.addEventListener("click",async()=>{try{await P.equipProduct(t.id),d()}catch(p){_(X(p),"error")}})}}}function Or(e){let t=P.getSession()?.plan===e.id,r=e.monthly?ge(e.monthly):"مجاني",a=e.yearly?ge(e.yearly):"مجاني",n=t?'<button class="btn wide" disabled>باقتك الحالية</button>':e.id==="free"?'<a class="btn wide" data-link="/create">ابدأ الآن</a>':`<a class="btn ${e.recommended?"primary":""} wide price-action" data-plan="${e.id}" data-link="/checkout?kind=plan&id=${e.id}&interval=month">اختر الباقة</a>`;return`<article class="plan-card ${e.recommended?"recommended":""} ${t?"current":""}">${t?'<span class="plan-badge current">الحالية</span>':e.recommended?'<span class="plan-badge">الأوضح للمجالس</span>':""}<div><span class="product-type">${e.id==="free"?"الأساسي":"اشتراك"}</span><h2>${F(e.name)}</h2><p>${F(e.description)}</p></div><div class="plan-price"><b data-month="${r}" data-year="${a}">${r}</b><span class="plan-cycle">${e.id==="free"?"دائمًا":"شهريًا"}</span></div><ul>${e.features.map(i=>`<li>${F(i)}</li>`).join("")}</ul>${n}</article>`}function Hr(){return{active:"pricing",title:"الأسعار",description:"باقات BACKFIRE الشفافة من دون أفضلية لعب.",html:D("العضوية","اللعبة كاملة… والتخصيص اختياري","النسخة المجانية تشمل اللعب الأساسي كاملًا. العضوية تضيف مظهرًا وتنظيمًا فقط.",`<div class="billing-toggle" role="group" aria-label="دورة الفوترة"><button class="on" data-cycle="month">شهري</button><button data-cycle="year">سنوي <span>وفر شهرين</span></button></div><section class="plans-grid">${nt.map(Or).join("")}</section><section class="pricing-trust"><h2>وعدنا التجاري</h2><div><p><b>لا ادفع لتفوز</b><span>كل القرارات والنتائج متساوية.</span></p><p><b>لا تجديد مخفي</b><span>السعر والدورة ظاهران قبل التأكيد.</span></p><p><b>لا شراء عشوائي</b><span>تعرف بالضبط وش تقتني.</span></p></div></section><section class="plan-compare panel"><h2>مقارنة سريعة</h2><div><span>اللعبة الأساسية</span><b>كل الباقات</b></div><div><span>ميزات الوصول</span><b>كل الباقات</b></div><div><span>الثيمات والإطارات</span><b>بلس والمناسبات</b></div><div><span>هوية مناسبة مخصصة</span><b>المناسبات</b></div></section><section class="faq-list"><h2>أسئلة الفوترة</h2><details><summary>هل يتم الخصم الآن؟</summary><p>لا. المزود الحالي محلي وتجريبي، ولا يطلب بطاقة أو يخصم مبلغًا.</p></details><details><summary>كيف ألغي أو أخفّض الباقة؟</summary><p>تظهر واجهة الإدارة في صفحة الفوترة، لكن الإلغاء والتجديد الحقيقيين يحتاجان بوابة مزود الدفع.</p></details><details><summary>هل السعر شامل الضريبة؟</summary><p>بيانات الكتالوج الحالية معنونة بأنها شاملة الضريبة. يجب تأكيد الفواتير والسياسة مع مزود الدفع قبل البيع.</p></details></section>`),bind(){document.querySelectorAll("[data-cycle]").forEach(e=>e.addEventListener("click",()=>{let t=e.dataset.cycle;document.querySelectorAll("[data-cycle]").forEach(r=>r.classList.toggle("on",r===e)),document.querySelectorAll(".plan-price b").forEach(r=>{r.textContent=r.dataset[t]??""}),document.querySelectorAll(".plan-cycle").forEach(r=>{r.textContent!=="دائمًا"&&(r.textContent=t==="year"?"سنويًا":"شهريًا")}),document.querySelectorAll(".price-action").forEach(r=>{r.dataset.link=`/checkout?kind=plan&id=${r.dataset.plan}&interval=${t}`})}))}}}function Gt(){let e=P.getSession(),t=he(e);if(t)return{active:"account",title:"الملف الشخصي",description:"ملف حساب BACKFIRE.",html:D("حسابي","الملف الشخصي","إدارة هويتك داخل BACKFIRE.",t)};let r=P.getProfile(),a=new Date(e.createdAt).toLocaleDateString("ar-SA",{year:"numeric",month:"long",day:"numeric"});return{active:"account",title:"الملف الشخصي",description:"إدارة ملف حساب BACKFIRE.",html:D("حسابي","الملف الشخصي","اسمك وهويتك أمام لاعبي المجلس.",`${Le("profile")}<section class="account-grid"><aside class="profile-preview panel"><div class="profile-avatar">${F(r.displayName.slice(0,1))}</div><h2>${F(r.displayName)}</h2><span>@${F(r.username)}</span><div class="profile-badges"><i>${e.mode==="guest"?"ضيف محلي":"حساب تجريبي"}</i><i>${e.plan==="free"?"مجلس":F(Me(e.plan)?.name??"")}</i>${e.verified?'<i class="verified">موثّق</i>':'<a data-link="/verify-email">غير موثّق</a>'}</div><small>منضم منذ ${a}</small></aside><form id="profile-form" class="account-form panel"><div id="product-notice" role="status" aria-live="polite" hidden></div>${ee("displayName","الاسم الظاهر","text",r.displayName,'maxlength="24" required')}${ee("username","اسم المستخدم","text",r.username,'maxlength="20" dir="ltr" required')}<p class="field-help">وضع العرض يفحص التكرار داخل هذا المتصفح. الإنتاج يحتاج فحصًا مركزيًا وطبقة إشراف على الأسماء.</p><button class="btn primary" type="submit">حفظ التغييرات</button><a class="btn" data-link="/account/inventory">اختيار الصورة والإطار والمظهر</a><button class="btn danger-outline" id="logout" type="button">تسجيل الخروج</button></form></section><section class="profile-stats panel"><header><div><h2>الإحصاءات</h2><p>لا توجد مزامنة مباريات لهذا الحساب بعد.</p></div><a data-link="/account/history">سجل المباريات</a></header><div>${[["المباريات","٠"],["الفوز","٠"],["الخسارة","٠"],["نسبة الفوز","—"],["السلسلة الحالية","٠"],["أفضل سلسلة","٠"]].map(([n,i])=>`<p><b>${i}</b><span>${n}</span></p>`).join("")}</div><footer>هذه أصفار حقيقية لحساب بلا سجل، وليست بيانات عيّنة.</footer></section>`),bind(n,i){z("#profile-form")?.addEventListener("submit",async s=>{s.preventDefault();let d=s.currentTarget;ce(d,!0);let p=new FormData(d);try{await P.updateProfile({displayName:String(p.get("displayName")??""),username:String(p.get("username")??"")}),_("تم حفظ الملف."),setTimeout(i,350)}catch(E){_(X(E),"error")}finally{ce(d,!1)}}),z("#logout")?.addEventListener("click",async()=>{await P.signOut(),n("/")})}}}function Vr(){let e=P.getSession(),t=he(e);if(t)return{active:"account",title:"المقتنيات",description:"مقتنيات حساب BACKFIRE.",html:D("حسابي","المقتنيات","العناصر المملوكة والمفعّلة.",t)};let r=P.getInventory(),a=Fe.filter(n=>r.ownedProductIds.includes(n.id));return{active:"account",title:"المقتنيات",description:"إدارة مقتنيات BACKFIRE.",html:D("حسابي","المقتنيات","فعّل مظهرًا واحدًا من كل فئة.",`${Le("inventory")}<div id="product-notice" role="status" aria-live="polite" hidden></div><section class="inventory-grid">${a.map(n=>{let i=r.equipped[n.category]===n.id;return`<article class="inventory-item panel"><div class="inventory-glyph" style="--accent:${n.accent}">${F(n.glyph)}</div><div><span>${He(n.category)}</span><h2>${F(n.name)}</h2></div><button class="btn sm ${i?"unequip":"equip"}" data-product="${n.id}" ${n.id==="theme-original"&&i?"disabled":""}>${i?n.id==="theme-original"?"الأساسي":"إلغاء التفعيل":"تفعيل"}</button></article>`}).join("")}</section>${a.length<Fe.length?'<div class="account-nudge"><p>تبغى خيارات أكثر للمجلس؟</p><a class="btn" data-link="/store">تصفح المتجر</a></div>':""}`),bind(n,i){document.querySelectorAll(".equip").forEach(s=>s.addEventListener("click",async()=>{try{await P.equipProduct(s.dataset.product),_("تم تفعيل العنصر."),setTimeout(i,300)}catch(d){_(X(d),"error")}})),document.querySelectorAll(".unequip").forEach(s=>s.addEventListener("click",async()=>{try{await P.unequipProduct(s.dataset.product),_("تم إلغاء تفعيل العنصر."),setTimeout(i,300)}catch(d){_(X(d),"error")}}))}}}function Ur(){let e=P.getSession(),t=he(e);if(t)return{active:"account",title:"الإعدادات",description:"إعدادات حساب BACKFIRE.",html:D("حسابي","الإعدادات","التحكم بالتجربة والخصوصية.",t)};let r=P.getSettings(),a=(n,i,s)=>`<label class="setting-row"><span><b>${i}</b><small>${s}</small></span><input type="checkbox" name="${n}" ${r[n]===!0||n==="textScale"&&r.textScale==="large"?"checked":""}></label>`;return{active:"account",title:"الإعدادات",description:"إعدادات تجربة وخصوصية BACKFIRE.",html:D("حسابي","الإعدادات","كل إعداد واضح ويُحفظ على هذا الجهاز.",`${Le("settings")}<form id="settings-form"><div id="product-notice" role="status" aria-live="polite" hidden></div><section class="settings-section panel"><h2>عام</h2><label class="select-row"><span><b>اللغة</b><small>واجهة عربية كاملة حاليًا.</small></span><select class="input" disabled><option>العربية</option></select></label><label class="select-row"><span><b>المظهر</b><small>هوية دسّ الليلية هي المظهر المصمم بالكامل.</small></span><select class="input" disabled><option>دسّ الأصلي</option></select></label>${a("highContrast","تباين مرتفع","زيادة وضوح الحدود والنصوص.")}${a("textScale","نص أكبر","تكبير نصوص صفحات المنتج.")}</section><section class="settings-section panel"><h2>الصوت والحركة</h2>${a("muted","كتم الصوت","إيقاف مؤثرات الموقع.")}${a("animations","الحركات","تشغيل انتقالات الواجهة.")}${a("reducedMotion","تقليل الحركة","تخفيف المؤثرات المستمرة.")}${a("haptics","الاهتزاز","ردود فعل لمسية على الجوال عند دعمها.")}<label class="range-row"><span>صوت المؤثرات <output>${r.effectsVolume}%</output></span><input name="effectsVolume" type="range" min="0" max="100" value="${r.effectsVolume}"></label><label class="range-row"><span>صوت الموسيقى <output>${r.musicVolume}%</output></span><input name="musicVolume" type="range" min="0" max="100" value="${r.musicVolume}"></label></section><section class="settings-section panel"><h2>اللعب</h2>${a("confirmCritical","تأكيد القرارات الحرجة","خطوة تأكيد قبل البيع أو القرار النهائي.")}${a("autoReady","استعداد تلقائي","غير مفعّل افتراضيًا حتى لا تبدأ بالغلط.")}<p class="field-help">تفضيلات المضيف والغرفة تحتاج ربط الحساب بالمضيف قبل تفعيلها.</p></section><section class="settings-section panel"><h2>التنبيهات</h2>${a("productUpdates","تحديثات المنتج","إشعارات محلية عن النسخ الجديدة.")}${a("matchInvites","دعوات المباريات","جاهزة لخدمة الدعوات المستقبلية.")}${a("friendInvites","دعوات اللاعبين السابقين","لا يوجد إرسال خارجي في وضع العرض.")}${a("purchaseReceipts","إيصالات الشراء","إيصالات العرض تظهر محليًا.")}${a("subscriptionReminders","تذكير الاشتراك","يتطلب خدمة اشتراك وتنبيهات.")}${a("marketing","رسائل تسويقية","غير مفعّلة افتراضيًا.")}</section><section class="settings-section panel"><h2>الخصوصية وملفات الارتباط</h2><label class="select-row"><span><b>ظهور الملف</b><small>اختيار محلي حتى تتوفر خدمة الملفات.</small></span><select class="input" name="profileVisibility"><option value="private" ${r.profileVisibility==="private"?"selected":""}>خاص</option><option value="players" ${r.profileVisibility==="players"?"selected":""}>لاعبو المجلس</option><option value="public" ${r.profileVisibility==="public"?"selected":""}>عام</option></select></label>${a("activityVisibility","إظهار النشاط","غير مفعّل افتراضيًا.")}${a("recentPlayerVisibility","الظهور للاعبين السابقين","جاهز لخدمة الدعوات المستقبلية.")}${a("analytics","تحليلات الاستخدام","غير مفعّلة في وضع العرض.")}${a("functionalCookies","تخزين وظيفي","يستخدم الموقع التخزين المحلي لتفضيلات العرض.")}</section><button class="btn primary" type="submit">حفظ الإعدادات</button></form><section class="settings-section account-actions panel"><h2>الحساب والبيانات</h2><div><span><b>تغيير البريد أو كلمة المرور</b><small>يتطلب مزود هوية موصولًا.</small></span><button class="btn sm" disabled>غير متاح</button></div><div><span><b>الحسابات المتصلة</b><small>لا توجد موفّرات خارجية.</small></span><button class="btn sm" disabled>لا يوجد</button></div><div><span><b>تصدير البيانات</b><small>البيانات التجريبية موجودة في المتصفح فقط.</small></span><button id="export-local" class="btn sm">تنزيل نسخة محلية</button></div><div><span><b>الخروج من كل الجلسات</b><small>لا توجد جلسات خادم في وضع العرض.</small></span><button class="btn sm" disabled>غير متاح</button></div></section><section class="danger-zone panel"><h2>حذف البيانات المحلية</h2><p>يمسح الحساب والمقتنيات والإعدادات التجريبية من هذا المتصفح فقط.</p>${ee("delete-confirm","اكتب: احذف حسابي")}<div class="danger-actions"><button id="delete-account" class="btn danger-outline">حذف البيانات</button><button id="cancel-delete" class="btn ghost">إلغاء</button></div></section>`),bind(n){document.querySelectorAll('input[type="range"]').forEach(i=>i.addEventListener("input",()=>{let s=i.closest("label")?.querySelector("output");s&&(s.textContent=`${i.value}%`)})),z("#settings-form")?.addEventListener("submit",i=>{i.preventDefault();let s=i.currentTarget,d=new FormData(s);try{P.updateSettings({muted:d.get("muted")==="on",animations:d.get("animations")==="on",reducedMotion:d.get("reducedMotion")==="on",haptics:d.get("haptics")==="on",confirmCritical:d.get("confirmCritical")==="on",autoReady:d.get("autoReady")==="on",productUpdates:d.get("productUpdates")==="on",matchInvites:d.get("matchInvites")==="on",friendInvites:d.get("friendInvites")==="on",purchaseReceipts:d.get("purchaseReceipts")==="on",subscriptionReminders:d.get("subscriptionReminders")==="on",marketing:d.get("marketing")==="on",activityVisibility:d.get("activityVisibility")==="on",recentPlayerVisibility:d.get("recentPlayerVisibility")==="on",analytics:d.get("analytics")==="on",functionalCookies:d.get("functionalCookies")==="on",effectsVolume:Number(d.get("effectsVolume")),musicVolume:Number(d.get("musicVolume")),highContrast:d.get("highContrast")==="on",textScale:d.get("textScale")==="on"?"large":"normal",profileVisibility:d.get("profileVisibility")}),_("تم حفظ الإعدادات.")}catch(p){_(X(p),"error")}}),z("#export-local")?.addEventListener("click",()=>{let i=JSON.stringify({exportedAt:new Date().toISOString(),demo:!0,session:P.getSession(),profile:P.getProfile(),settings:P.getSettings(),inventory:P.getInventory(),receipts:P.getPurchaseHistory()},null,2),s=document.createElement("a");s.href=URL.createObjectURL(new Blob([i],{type:"application/json"})),s.download="backfire-demo-data.json",s.click(),URL.revokeObjectURL(s.href)}),z("#delete-account")?.addEventListener("click",async()=>{try{await P.deleteLocalAccount(z('[name="delete-confirm"]')?.value??""),n("/")}catch(i){_(X(i),"error")}}),z("#cancel-delete")?.addEventListener("click",()=>{let i=z('[name="delete-confirm"]');i&&(i.value=""),_("أُلغي الحذف ولم تتغير البيانات.")})}}}function Kr(){let e=P.getSession(),t=he(e),r=e?P.getMatchHistory():[],a=t??`${Le("history")}${r.length?`<section class="history-list">${r.map(n=>`<a class="panel" data-link="/account/history/match?id=${encodeURIComponent(n.id)}"><b>${F(n.roomLabel)}</b><span>${new Date(n.playedAt).toLocaleDateString("ar-SA")}</span></a>`).join("")}</section>`:'<section class="empty-state panel"><span class="empty-glyph">↗</span><h2>ما فيه مباريات محفوظة</h2><p>المباريات الحالية لا تُنسب إلى الحساب بعد. لن نعرض سجلًا مختلقًا.</p><a class="btn primary" data-link="/create">ابدأ مباراة</a></section><section class="history-empty-grid"><article class="panel"><h2>اللاعبون السابقون</h2><p>لا توجد بيانات موثوقة للدعوة أو الحظر. ستظهر هنا بعد ربط هوية اللاعب بالمباراة.</p></article><article class="panel"><h2>الغرف السابقة</h2><p>لا نحفظ أكواد الغرف المنتهية في المتصفح، ولا نعيد فتح غرفة مدمرة.</p></article></section>'}`;return{active:"account",title:"سجل المباريات",description:"سجل مباريات حساب BACKFIRE.",html:D("حسابي","سجل المباريات","نتائجك عندما تتوفر مزامنة الحساب.",a)}}function Gr(e){let t=P.getSession(),r=he(t);if(r)return{active:"account",title:"تفاصيل المباراة",description:"تفاصيل مباراة BACKFIRE.",html:D("حسابي","تفاصيل المباراة","ملخص آمن بعد نهاية اللعبة.",r)};let a=e.get("id")??"",n=P.getMatchHistory().find(i=>i.id===a);return n?{active:"account",title:n.roomLabel,description:"ملخص مباراة محفوظة.",html:D("سجل المباريات",F(n.roomLabel),"أحداث عامة فقط، من دون أسرار غير مكشوفة.",`<section class="prose-page panel"><p>${new Date(n.playedAt).toLocaleString("ar-SA")}</p><p>اللاعبون: ${n.players} · الجولات: ${n.rounds} · المدة: ${n.durationMinutes} دقيقة</p><p>الفائز: ${F(n.winnerName)}</p></section>`)}:{active:"account",title:"المباراة غير موجودة",description:"لم نجد مباراة محفوظة.",html:D("سجل المباريات","المباراة غير موجودة","لم نجد سجلًا موثوقًا بهذا المعرّف.",'<section class="empty-state panel"><span class="empty-glyph">؟</span><h2>لا نعرض تفاصيل مختلقة</h2><p>قد يكون السجل حُذف أو لم يُزامن أصلًا. الأسرار غير المكشوفة لا تُحفظ هنا.</p><a class="btn" data-link="/account/history">العودة للسجل</a></section>')}}function Yr(){let e=P.getSession(),r=he(e)??`${Le("achievements")}<section class="empty-state panel"><span class="empty-glyph">✦</span><h2>الإنجازات تحت التجهيز</h2><p>لن نعرض شارات أو تقدمًا وهميًا. هذه الصفحة جاهزة لربطها بخدمة النتائج الموثوقة.</p><a class="btn" data-link="/how-to-play">راجع طريقة اللعب</a></section>`;return{active:"account",title:"الإنجازات",description:"إنجازات BACKFIRE المستقبلية.",html:D("حسابي","الإنجازات","إنجازات مرتبطة باللعب الحقيقي فقط.",r)}}function Wr(){let e=P.getSession(),t=he(e),r=e?P.getPurchaseHistory():[],a=e?.plan!=="free",n=t??`${Le("billing")}<div id="product-notice" role="status" aria-live="polite" hidden></div><section class="billing-summary panel"><div><span>الباقة الحالية</span><h2>${F(Me(e.plan)?.name??"مجلس")}</h2><small>${a?"اشتراك عرض محلي · بلا تجديد أو خصم تلقائي":"الباقة الأساسية بلا رسوم"}</small></div><div class="billing-actions"><a class="btn" data-link="/pricing">${a?"تغيير الباقة":"عرض الباقات"}</a>${a?'<button id="cancel-plan" class="btn danger-outline">إلغاء اشتراك العرض</button>':""}</div></section><h2 class="section-label">السجل المحلي</h2>${r.length?`<section class="receipt-list">${r.map(i=>`<article class="panel"><div><b>${F(i.label)}</b><span>إيصال عرض · لم تُخصم أموال · ${new Date(i.createdAt).toLocaleDateString("ar-SA")}</span></div><strong>${ge({amountMinor:i.totalMinor,currency:"SAR",interval:"one-time",taxInclusive:!0})}</strong></article>`).join("")}</section>`:'<section class="empty-state panel compact"><h2>لا توجد عمليات</h2><p>أي تجربة شراء ناجحة ستظهر هنا بإشارة واضحة أنها محلية.</p></section>'}`;return{active:"account",title:"الفوترة",description:"باقة وفواتير حساب BACKFIRE.",html:D("حسابي","الفوترة","الباقة وسجل تجارب الدفع المحلية.",n),bind(i,s){z("#cancel-plan")?.addEventListener("click",async d=>{let p=d.currentTarget;if(p.dataset.confirmed!=="true"){p.dataset.confirmed="true",p.textContent="أكد إلغاء اشتراك العرض",_("اضغط مرة ثانية للتأكيد. يمكنك مغادرة الصفحة للإلغاء.");return}try{await P.cancelSubscription(),_("أُلغي اشتراك العرض وعاد الحساب إلى الباقة المجانية."),setTimeout(s,450)}catch(E){_(X(E),"error")}})}}}function Xr(e){let t=e.get("kind")==="plan"?"plan":"product",r=e.get("id")??"",a=e.get("interval")==="year"?"year":"month",n=t==="product"?ve(r):void 0,i=t==="plan"?Me(r):void 0,s=n??i,d=n?.price??(a==="year"?i?.yearly:i?.monthly);if(!s||!d||n?.comingSoon||i?.id==="free")return ct("الاختيار غير متاح","ارجع للمتجر واختر عنصرًا متاحًا.");let p=P.getSession(),N=he(p,`/checkout?kind=${t}&id=${encodeURIComponent(r)}&interval=${a}`)??`<section class="checkout-layout"><div class="checkout-main panel"><div id="product-notice" role="status" aria-live="polite" hidden></div><div class="checkout-demo-seal">تجربة دفع — لا خصم حقيقي</div><h2>راجع طلبك</h2><div class="checkout-item"><div class="checkout-glyph">${F(n?.glyph??"◇")}</div><div><b>${F(s.name)}</b><span>${t==="plan"?`اشتراك ${a==="year"?"سنوي":"شهري"}`:He(n.category)}</span></div><strong>${ge(d)}</strong></div><dl class="checkout-total"><div><dt>المجموع الفرعي</dt><dd>${ge(d)}</dd></div><div><dt>الخصم</dt><dd>—</dd></div><div><dt>الضريبة</dt><dd>مشمولة</dd></div><div class="grand"><dt>الإجمالي</dt><dd>${ge(d)}</dd></div></dl><label class="field"><span>رمز خصم — غير موصول</span><input class="input" value="" placeholder="لا توجد رموز نشطة" disabled></label><div class="sandbox-method"><span>◇</span><div><b>محاكي الدفع المحلي</b><small>لا بطاقة · لا تحويل · لا حفظ بيانات مالية</small></div></div><label class="check-row"><input id="checkout-consent" type="checkbox"><span>أفهم أن هذه تجربة محلية ولن يتم خصم أي مبلغ.</span></label><button id="start-checkout" class="btn primary wide">إنشاء جلسة العرض</button><div id="checkout-actions" class="checkout-actions" hidden><button class="btn primary" data-outcome="succeeded">محاكاة نجاح</button><button class="btn" data-outcome="failed">محاكاة فشل</button><button class="btn" data-outcome="timed-out">محاكاة انتهاء المهلة</button><button class="btn ghost" data-outcome="cancelled">إلغاء</button></div></div><aside class="checkout-aside panel"><h2>واضح من البداية</h2><ul><li>لا حقول بطاقة في وضع العرض.</li><li>السعر من كتالوج مركزي، لا من الرابط.</li><li>الفشل والإلغاء لا يمنحان العنصر.</li><li>النجاح ينشئ إيصال عرض محليًا.</li></ul><a data-link="/legal/refunds">سياسة الاسترجاع</a><a data-link="/legal/terms">شروط الشراء</a></aside></section>`,V="";return{active:"store",title:"إتمام الطلب",description:"مراجعة طلب BACKFIRE في وضع العرض.",html:D("الطلب","إتمام آمن وواضح","لن نطلب بيانات بطاقة ما دام مزود الدفع غير موصول.",N),bind(U){z("#start-checkout")?.addEventListener("click",async()=>{if(!z("#checkout-consent")?.checked)return _("أكد فهمك أن العملية تجريبية.","error");try{V=(await P.createCheckout(t,r,a)).id,z("#checkout-actions")?.removeAttribute("hidden");let se=z("#start-checkout");se&&(se.disabled=!0,se.textContent="تم إنشاء الجلسة"),_("جلسة العرض جاهزة. اختر نتيجة الاختبار.")}catch(J){_(X(J),"error")}}),document.querySelectorAll("[data-outcome]").forEach(J=>J.addEventListener("click",async()=>{if(V)try{let se=await P.completeDemoCheckout(V,J.dataset.outcome);U(`/checkout/result?status=${se.status}&kind=${t}`)}catch(se){_(X(se),"error")}}))}}}function Zr(e){let t=e.get("status"),r=t==="succeeded",a={failed:["تعذرت تجربة الدفع","لم يُمنح عنصر أو اشتراك. يمكنك الرجوع والمحاولة مرة ثانية."],cancelled:["ألغيت العملية","لم يحدث خصم ولم يُمنح أي شيء."],"timed-out":["انتهت مهلة الجلسة","أغلقت جلسة العرض قبل التأكيد. أنشئ جلسة جديدة للمحاولة."]},[n,i]=r?["نجحت تجربة الدفع","تم تحديث المقتنيات وإنشاء إيصال عرض محلي. لم يتم خصم أي مبلغ."]:a[t??""]??["حالة غير معروفة","لا توجد نتيجة دفع صالحة في الرابط."];return{active:"store",title:n,description:i,html:D("نتيجة العرض",n,i,`<section class="empty-state panel checkout-result ${r?"success":"failure"}"><span class="empty-glyph">${r?"✓":"×"}</span><h2>${r?"عرض ناجح — بلا شحن مالي":"لم تكتمل العملية"}</h2><p>${i}</p><div class="empty-actions">${r?'<a class="btn primary" data-link="/account/billing">عرض إيصال العرض</a><a class="btn" data-link="/account/inventory">المقتنيات</a>':'<a class="btn primary" data-link="/store">العودة للمتجر</a><a class="btn" data-link="/support">المساعدة</a>'}</div></section>`)}}function Jr(e="/support"){let t=P.getSession()?.email??"",r=e==="/report-player";return{active:"support",title:"الدعم",description:"مركز مساعدة ودعم BACKFIRE.",html:D("الدعم",r?"بلّغ عن لاعب":e==="/contact"?"تواصل معنا":"وش نقدر نحل؟","ابدأ بالحلول السريعة، أو احفظ طلبًا محليًا في وضع العرض.",`<section class="support-grid"><aside class="support-links"><a class="panel" data-link="/faq"><b>الأسئلة الشائعة</b><span>الحساب واللعب والدفع التجريبي.</span></a><a class="panel" data-link="/how-to-play"><b>شرح اللعبة</b><span>الجولات والقرارات والكشف.</span></a><article class="panel"><b>مشكلة دخول غرفة؟</b><span>تأكد من الكود، ثم حدّث الصفحة وحاول من نفس الرابط.</span></article><a class="panel" data-link="/status"><b>حالة الخدمة</b><span>ما هو موصول وما يزال تجريبيًا.</span></a></aside><form id="support-form" class="support-form panel"><div id="product-notice" role="status" aria-live="polite" hidden></div><label class="field"><span>نوع الطلب</span><select class="input" name="category"><option value="problem">مشكلة تقنية</option><option value="player-report" ${r?"selected":""}>بلاغ لاعب</option><option value="suggestion">اقتراح</option><option value="billing">فوترة</option></select></label>${ee("subject","العنوان","text",r?"بلاغ عن سلوك لاعب":"",'maxlength="100" required')}${ee("email","البريد للرجوع إليك — اختياري","email",t)}${ee("roomCode","كود الغرفة — اختياري","text","",'maxlength="12" dir="ltr"')}<label class="field"><span>التفاصيل</span><textarea class="input" name="message" minlength="10" maxlength="2000" required></textarea></label><label class="check-row"><input name="technical" type="checkbox" checked><span>إرفاق إصدار المتصفح والمسار الحالي.</span></label><button class="btn primary" type="submit">حفظ الطلب محليًا</button><small class="muted">لن يصل الطلب إلى فريق دعم حتى يُوصل مزود التذاكر. لا تضف بيانات حساسة.</small></form></section>`),bind(){z("#support-form")?.addEventListener("submit",async n=>{n.preventDefault();let i=n.currentTarget;ce(i,!0);let s=new FormData(i);try{await P.saveSupportRequest({category:s.get("category"),subject:String(s.get("subject")??""),message:String(s.get("message")??""),email:String(s.get("email")??"")||void 0,roomCode:String(s.get("roomCode")??"")||void 0,technicalDetails:s.get("technical")==="on"?`${navigator.userAgent} · ${location.pathname}`:void 0}),i.reset(),_("حُفظ الطلب على هذا المتصفح فقط. لم يُرسل إلى خادم.")}catch(d){_(X(d),"error")}finally{ce(i,!1)}})}}}async function Ut(e){try{await navigator.clipboard.writeText(e);return}catch{}let t=document.createElement("textarea");t.value=e,t.style.position="fixed",t.style.opacity="0",document.body.append(t),t.select();let r=document.execCommand("copy");if(t.remove(),!r)throw new Error("تعذر النسخ. حدّد الرابط يدويًا.")}function Qr(e){let t=F(Ze(e.get("code")??""));return{active:"support",title:"مشاركة دعوة",description:"مشاركة رابط وكود غرفة BACKFIRE.",html:D("دعوة المجلس","أرسل الكود… وخلك جاهز","الرابط يُبنى من نفس النطاق المفتوح الآن، بلا نطاق تطوير أو أسرار.",`<section class="invite-layout"><form id="invite-form" class="panel invite-form"><div id="product-notice" role="status" aria-live="polite" hidden></div>${ee("code","كود الغرفة","text",t,'maxlength="12" dir="ltr" inputmode="text" autocapitalize="characters" required')}<button class="btn primary" type="submit">جهّز الدعوة</button></form><section id="invite-preview" class="panel invite-preview" hidden><span class="product-type">معاينة الدعوة</span><h2>تعالوا نلعب دسّ</h2><p id="invite-copy"></p><div class="invite-actions"><button id="copy-code" class="btn">نسخ الكود</button><button id="copy-link" class="btn">نسخ الرابط</button><button id="native-share" class="btn primary">مشاركة</button><a id="whatsapp-share" class="btn" target="_blank" rel="noopener noreferrer">واتساب</a></div><small>الرابط لا يحتوي رمز مضيف أو لاعب. الدعوة قد تنتهي إذا أُغلقت الغرفة أو امتلأت.</small></section></section>`),bind(){let r="",a="",n="";z("#invite-form")?.addEventListener("submit",i=>{if(i.preventDefault(),r=Ze(new FormData(i.currentTarget).get("code")),!Ht(r))return _("اكتب كود غرفة صحيحًا من ٨ خانات.","error");a=new URL(`/join?code=${encodeURIComponent(r)}`,Ne||location.origin).href,n=`تعالوا نلعب BACKFIRE 🎮
كود الغرفة: ${r}
ادخل من هنا: ${a}`;let s=z("#invite-copy");s&&(s.textContent=n);let d=z("#invite-preview");d&&(d.hidden=!1);let p=z("#whatsapp-share");p&&(p.href=`https://wa.me/?text=${encodeURIComponent(n)}`);let E=z("#native-share");E&&(E.hidden=!("share"in navigator)),_("الدعوة جاهزة. تحقق من الكود قبل الإرسال.")}),z("#copy-code")?.addEventListener("click",async()=>{try{await Ut(r),_("نُسخ كود الغرفة.")}catch(i){_(X(i),"error")}}),z("#copy-link")?.addEventListener("click",async()=>{try{await Ut(a),_("نُسخ رابط الانضمام.")}catch(i){_(X(i),"error")}}),z("#native-share")?.addEventListener("click",async()=>{try{navigator.share&&await navigator.share({title:"دعوة BACKFIRE",text:n,url:a})}catch(i){i.name!=="AbortError"&&_(X(i),"error")}}),t&&z("#invite-form")?.requestSubmit()}}}function ea(e){return e==="/faq"?{active:"support",title:"الأسئلة الشائعة",description:"إجابات واضحة عن لعبة وخدمات دسّ.",html:D("المساعدة","الأسئلة الشائعة","إجابات هذه المرحلة من المنتج بلا وعود غير موصولة.",'<section class="faq-list wide"><details open><summary>كيف أبدأ لعبة؟</summary><p>افتح «إنشاء غرفة» على الشاشة الكبيرة، ثم يدخل اللاعبون بالكود أو QR من جوالاتهم.</p></details><details><summary>هل أحتاج تحميل تطبيق؟</summary><p>لا. تعمل اللعبة من المتصفح على الشاشة والجوال.</p></details><details><summary>هل الحساب مطلوب للعب؟</summary><p>لا. اللعب الأساسي والغرف لا يعتمدان على طبقة الحساب التجريبية.</p></details><details><summary>هل المشتريات حقيقية؟</summary><p>لا حاليًا. المتجر والدفع يعملان كمحاكاة محلية واضحة ولا يطلبان بطاقة.</p></details><details><summary>هل تتزامن بياناتي بين الأجهزة؟</summary><p>لا. الحساب والمقتنيات والإعدادات التجريبية محفوظة على المتصفح الحالي فقط.</p></details><details><summary>كيف أبلّغ عن لاعب؟</summary><p>استخدم نموذج البلاغ المحلي، مع العلم أنه لا يُرسل إلى فريق حتى توصيل خدمة الدعم.</p><a data-link="/report-player">فتح نموذج البلاغ</a></details><details><summary>وش المتصفحات المناسبة؟</summary><p>إصدار حديث من Chrome أو Safari أو Edge مع JavaScript واتصال ثابت. التلفاز يحتاج متصفحًا حديثًا أو جهاز بث يدعمه.</p></details></section>')}:e==="/credits"?{title:"الاعتمادات",description:"اعتمادات بناء BACKFIRE.",html:D("BACKFIRE","الاعتمادات","المنتج مبني بهوية عربية أصلية وتقنيات ويب مفتوحة.",'<section class="prose-page panel"><h2>التصميم والمنتج</h2><p>هوية BACKFIRE ونظامها البصري ومحتواها العربي جزء من المنتج نفسه.</p><h2>التقنيات</h2><p>TypeScript وesbuild وواجهات الويب القياسية، مع توليد QR محليًا. الخط المستخدم هو Tajawal عبر Google Fonts.</p><h2>المحتوى البصري</h2><p>الرسوم الأساسية وواجهات اللعبة مبنية بالكود. صورة المشاركة الاجتماعية مولدة خصيصًا لهذا المشروع ومراجعة للاستخدام الحالي.</p></section>')}:e==="/about"?{title:"عن BACKFIRE",description:"عن لعبة BACKFIRE ورؤيتها.",html:D("عن BACKFIRE","كل حركة لها عواقب","نبني لحظة جماعية حقيقية حول شاشة واحدة، مو عزلة داخل كل جوال.",'<section class="prose-page panel"><h2>الفكرة</h2><p>BACKFIRE تجربة سيناريوهات جماعية: التلفاز يعرض المشهد العام، وكل جوال يحمل معلومة أو حركة مختلفة. قرارات اللاعبين تغيّر ما يعود إلى الشاشة عبر الجولات.</p><h2>مبادئنا</h2><p>العربية أصل المنتج، والوضوح أهم من الإلحاح التجاري، واللعبة الأساسية لا تُباع على شكل أفضلية.</p><h2>هذه المرحلة</h2><p>إنشاء الغرف والانضمام وإعادة الاتصال تعمل، بينما نظام السيناريو والعواقب الجديد ما زال قيد التطوير. الحساب والمتجر والدفع معروضة الآن من خلال مزود محلي صريح إلى أن تُوصل خدمات الإنتاج.</p></section>')}:e==="/status"?{title:"حالة الخدمة",description:"حالة أنظمة BACKFIRE.",html:D("الحالة","الأنظمة بوضوح","تحديث محلي يصف ما هو عامل وما يحتاج مزود إنتاج.",'<section class="status-list panel"><article><i class="ok"></i><div><b>إنشاء الغرف والانضمام</b><span>مسار الإنتاج الحالي — تتم مراقبته باختبارات المستودع.</span></div><strong>متاح</strong></article><article><i class="ok"></i><div><b>موقع BACKFIRE العام</b><span>الصفحات والملفات الثابتة.</span></div><strong>متاح</strong></article><article><i class="demo"></i><div><b>الحسابات والمقتنيات</b><span>مزود عرض محلي، بلا مزامنة أجهزة.</span></div><strong>عرض</strong></article><article><i class="demo"></i><div><b>الدفع والبريد والدعم</b><span>غير موصولة بمزودي إنتاج.</span></div><strong>غير موصول</strong></article></section>')}:e==="/changelog"?{title:"سجل التغييرات",description:"أحدث تغييرات منتج BACKFIRE.",html:D("التحديثات","وش تغيّر؟","سجل مختصر لما وصل فعليًا، من غير وعود منجزة وهمية.",'<section class="timeline"><article class="panel"><time>يوليو ٢٠٢٦</time><h2>هوية BACKFIRE العامة</h2><ul><li>موقع تسويقي جديد مبني حول التلفاز والجوالات والعواقب المتغيرة.</li><li>هوية سينمائية قرمزية مستقلة عن واجهات اللعب الحالية.</li><li>شرح صريح لما يعمل وما يزال قيد التطوير.</li></ul></article><article class="panel"><time>الإصدار الأساسي</time><h2>تثبيت تدفق الغرف</h2><ul><li>إنشاء الغرفة والانضمام اليدوي والـQR.</li><li>استرجاع المضيف ومنع الانضمام المكرر.</li><li>إعادة اتصال اللاعب.</li></ul></article></section>')}:e==="/legal/privacy"?{title:"سياسة الخصوصية",description:"سياسة خصوصية دسّ الحالية.",html:Je("سياسة الخصوصية","<h2>ملخص هذه النسخة</h2><p>صفحات الحساب والمتجر تستخدم تخزين المتصفح المحلي في وضع العرض. لا ترسل هذه الطبقة بيانات حساب أو دفع أو دعم إلى خادم.</p><h2>بيانات اللعب</h2><p>خدمة الغرف تعالج كود الغرفة واسم اللاعب والرموز اللازمة للاتصال وتشغيل المباراة. لا تعرض رمز المضيف داخل QR.</p><h2>التحكم</h2><p>يمكنك تنزيل نسخة من بيانات العرض أو حذفها من صفحة الإعدادات. مسح بيانات الموقع من المتصفح يزيلها أيضًا.</p><h2>قبل الإطلاق التجاري</h2><p>يلزم تحديد جهة التحكم بالبيانات، مدد الاحتفاظ، مزودي الاستضافة والدفع والبريد، وقناة طلبات الخصوصية قبل تفعيل خدمات الحساب الحقيقية.</p>")}:e==="/legal/refunds"?{title:"سياسة الاسترجاع",description:"حالة سياسة استرجاع دسّ.",html:Je("سياسة الاسترجاع","<h2>لا توجد مبيعات فعلية الآن</h2><p>مسار الدفع الحالي عرض محلي ولا يخصم أموالًا، لذلك لا توجد عملية قابلة للاسترجاع.</p><h2>قبل تفعيل الدفع</h2><p>يجب نشر مدة طلب الاسترجاع، العناصر غير القابلة للاسترجاع، معالجة الاشتراكات، قناة التواصل، ومدة إعادة المبلغ وفق نظام الدفع والأنظمة المطبقة.</p><h2>إيصالات العرض</h2><p>الإيصال التجريبي يحمل علامة واضحة ولا يمثل مستندًا ضريبيًا أو إثبات دفع.</p>")}:e==="/legal/cookies"?{title:"سياسة ملفات الارتباط",description:"التخزين المحلي في دسّ.",html:Je("ملفات الارتباط والتخزين","<h2>ما نستخدمه الآن</h2><p>طبقة المنتج التجريبية تستخدم localStorage لحفظ الجلسة المحلية والإعدادات والمقتنيات، وsessionStorage لتذكر زيارة الواجهة في الجلسة الحالية.</p><h2>التحليلات</h2><p>لا توجد خدمة تحليلات خارجية موصولة في هذه الطبقة، والموافقة غير مفعلة افتراضيًا.</p><h2>التحكم</h2><p>يمكنك تغيير تفضيلات التخزين الوظيفي والتحليلات من الإعدادات وحذف بيانات العرض بالكامل.</p>")}:{title:"الشروط",description:"شروط استخدام دسّ الحالية.",html:Je("شروط الاستخدام والشراء","<h2>اللعبة</h2><p>استخدم دسّ باحترام ومن دون إساءة أو تحايل أو محاولة الوصول إلى صلاحيات المضيف.</p><h2>وضع العرض</h2><p>الحسابات والإيصالات والمشتريات الظاهرة في وضع العرض محلية وتجريبية. لا تمثل عقد بيع ولا خصمًا ماليًا ولا اشتراكًا حقيقيًا.</p><h2>الأسعار</h2><p>الأسعار المعروضة بالريال السعودي وتشمل الضريبة على سبيل تصميم الكتالوج. لا تُقبل مدفوعات حتى يوصل مزود دفع إنتاجي وتُنشر سياسة استرداد نهائية.</p><h2>المحتوى والسلوك</h2><p>يمكن تقييد الوصول عند إساءة استخدام الخدمة أو محاولة تعطيلها. البلاغات في وضع العرض لا تُرسل إلى فريق دعم.</p>")}}function Je(e,t){return D("قانوني",e,"نسخة تشغيلية واضحة لهذه المرحلة، وتحتاج مراجعة قانونية قبل البيع الفعلي.",`<article class="prose-page panel"><div class="legal-meta">آخر تحديث: ١٨ يوليو ٢٠٢٦ · نسخة قبل البيع الحقيقي</div>${t}<p class="legal-note">هذه الصياغة منتجية وليست بديلًا عن مراجعة مستشار قانوني في مناطق التشغيل.</p></article>`)}function ta(){return Gt()}function ct(e="الصفحة غير موجودة",t="يمكن أن الرابط تغيّر أو أن الصفحة غير متاحة."){return{title:"غير موجود",description:t,html:D("٤٠٤",e,t,'<section class="empty-state panel"><span class="empty-glyph">؟</span><h2>نرجعك للمجلس</h2><div class="empty-actions"><a class="btn primary" data-link="/">الرئيسية</a><a class="btn" data-link="/support">الدعم</a></div></section>')}}function Yt(e,t=""){return e==="/store"?Fr():e==="/store/product"?jr(new URLSearchParams(t)):e==="/pricing"?Hr():e==="/login"?zr():e==="/signup"?Dr():e==="/forgot-password"?_r():["/reset-password","/verify-email","/session-ended"].includes(e)?qr(e):e==="/account"?ta():e==="/account/profile"?Gt():e==="/account/settings"?Ur():e==="/account/inventory"?Vr():e==="/account/history"?Kr():e==="/account/history/match"?Gr(new URLSearchParams(t)):e==="/account/achievements"?Yr():e==="/account/billing"?Wr():e==="/checkout"?Xr(new URLSearchParams(t)):e==="/checkout/result"?Zr(new URLSearchParams(t)):["/support","/contact","/report-player"].includes(e)?Jr(e):e==="/invite"?Qr(new URLSearchParams(t)):["/faq","/about","/credits","/status","/changelog","/legal/privacy","/legal/terms","/legal/refunds","/legal/cookies"].includes(e)?ea(e):ct()}function Wt(){return`
  .product-page{position:relative;z-index:var(--z-content);width:min(1180px,calc(100% - 40px));min-height:75dvh;margin:0 auto;padding:clamp(54px,8vw,96px) 0 100px}
  .product-page{animation:productEnter .38s var(--e-out) both}.product-page:focus{outline:none}@keyframes productEnter{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
  .product-hero{display:flex;align-items:end;justify-content:space-between;gap:24px;margin-bottom:28px;padding-bottom:28px;border-bottom:1px solid var(--line)}
  .product-hero>div{max-width:760px}.product-hero h1{font-size:clamp(42px,7vw,82px);line-height:1.05;margin:10px 0 14px;letter-spacing:-.04em}.product-hero p{font-size:var(--fs-h3);line-height:1.7;color:var(--text-2);margin:0;max-width:62ch}
  .demo-banner{display:flex;align-items:flex-start;gap:12px;margin:0 0 26px;padding:14px 16px;border:1px solid color-mix(in srgb,var(--gold) 35%,transparent);border-radius:var(--r-2);background:color-mix(in srgb,var(--gold) 7%,var(--surface));color:var(--text-2)}
  .demo-banner>div{display:grid;gap:3px}.demo-banner b{color:var(--gold)}.demo-banner span:last-child{font-size:14px}.demo-dot{width:9px;height:9px;border-radius:50%;background:var(--gold);box-shadow:0 0 16px var(--gold);margin-top:7px;flex:0 0 auto}.demo-banner.unavailable{border-color:color-mix(in srgb,var(--red) 40%,transparent)}.demo-banner.unavailable .demo-dot{background:var(--red)}
  .product-notice{padding:12px 14px;border-radius:12px;background:color-mix(in srgb,var(--green) 12%,var(--surface));border:1px solid color-mix(in srgb,var(--green) 34%,transparent);color:var(--green);font-weight:800;margin-bottom:14px}.product-notice.error{color:var(--red);background:color-mix(in srgb,var(--red) 10%,var(--surface));border-color:color-mix(in srgb,var(--red) 34%,transparent)}
  .auth-layout{display:grid;grid-template-columns:minmax(0,1fr) minmax(280px,.72fr);gap:20px;max-width:900px;margin:0 auto}.auth-card{width:min(100%,560px);margin:0 auto;padding:clamp(24px,4vw,38px);display:flex;flex-direction:column;gap:17px}.auth-side{padding:clamp(28px,5vw,54px);border:1px solid var(--line-2);border-radius:var(--r-3);background:radial-gradient(circle at top right,color-mix(in srgb,var(--violet) 24%,transparent),transparent 55%),var(--surface);display:flex;flex-direction:column;justify-content:center;align-items:flex-start;gap:14px}.auth-side h2,.auth-side p{margin:0}.auth-side p{line-height:1.65;color:var(--text-2)}.auth-seal{width:70px;height:70px;border-radius:22px;display:grid;place-items:center;font-size:22px;font-weight:900;color:var(--gold);border:1px solid color-mix(in srgb,var(--gold) 35%,transparent);background:color-mix(in srgb,var(--gold) 8%,var(--surface))}.text-link,.form-foot a,.checkout-aside a,.legal-note a{color:var(--gold);font-weight:800;text-decoration:none}.auth-card>.text-link{text-align:center}.form-foot{text-align:center;color:var(--muted);margin:0}.form-grid{max-width:620px}
  .field{display:grid;gap:8px;text-align:start}.field>span{font-weight:800;color:var(--text-2);font-size:14px}.field textarea{min-height:150px;resize:vertical;padding-top:14px}.field select{appearance:auto}.check-row{display:flex;align-items:flex-start;gap:10px;color:var(--text-2);line-height:1.55;font-size:14px}.check-row input{margin-top:4px;accent-color:var(--gold);width:18px;height:18px;flex:0 0 auto}.check-row a{color:var(--gold);font-weight:800}.btn.ghost{background:transparent}.btn.danger-outline{border-color:color-mix(in srgb,var(--red) 50%,transparent);color:var(--red)}.btn.sm{min-height:38px;padding:8px 14px;font-size:14px}.btn[disabled]{opacity:.58;cursor:not-allowed;transform:none}
  .catalog-tools{display:flex;justify-content:space-between;align-items:center;gap:20px;margin:28px 0}.filter-pills,.billing-toggle{display:flex;gap:5px;background:var(--surface);padding:5px;border:1px solid var(--line-2);border-radius:var(--r-pill);width:max-content}.filter-pills button,.billing-toggle button{border:0;border-radius:var(--r-pill);background:transparent;color:var(--muted);padding:9px 16px;font:inherit;font-weight:800;cursor:pointer}.filter-pills button.on,.billing-toggle button.on{background:var(--surface-3);color:var(--text);box-shadow:var(--shadow-1)}.catalog-note{margin:0;color:var(--muted);font-size:14px}
  .product-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}.product-card{overflow:hidden;border:1px solid var(--line-2);border-radius:var(--r-3);background:linear-gradient(180deg,var(--surface-2),var(--surface));transition:transform var(--t-comp) var(--e-out),border-color var(--t-comp)}.product-card:hover{transform:translateY(-5px);border-color:var(--line-3)}.product-art{height:190px;display:grid;place-items:center;background:radial-gradient(circle,color-mix(in srgb,var(--accent) 25%,transparent),transparent 66%),linear-gradient(135deg,color-mix(in srgb,var(--accent) 8%,var(--bg-1)),var(--bg-1));border-bottom:1px solid var(--line)}.product-art span{width:86px;height:86px;border-radius:27px;display:grid;place-items:center;color:var(--accent);font-size:28px;font-weight:900;border:1px solid color-mix(in srgb,var(--accent) 50%,transparent);box-shadow:0 18px 70px color-mix(in srgb,var(--accent) 17%,transparent);transform:rotate(-4deg)}.product-card-copy{padding:22px;display:flex;min-height:250px;flex-direction:column}.product-type{font-size:12px;font-weight:900;letter-spacing:.1em;color:var(--gold);text-transform:uppercase}.product-card h2{margin:7px 0;font-size:var(--fs-h3)}.product-card p{margin:0;color:var(--text-2);line-height:1.6}.product-card-foot{display:flex;align-items:center;justify-content:space-between;gap:14px;margin-top:auto;padding-top:20px}.product-card-foot>b{font-size:18px;color:var(--text)}
  .billing-toggle{margin:0 auto 26px}.billing-toggle button span{font-size:11px;color:var(--green);margin-inline-start:4px}.plans-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;align-items:stretch}.plan-card{position:relative;padding:28px 24px;border:1px solid var(--line-2);border-radius:var(--r-3);background:linear-gradient(180deg,var(--surface-2),var(--surface));display:flex;flex-direction:column;gap:24px}.plan-card.recommended{border-color:color-mix(in srgb,var(--gold) 60%,transparent);box-shadow:0 26px 90px color-mix(in srgb,var(--gold) 8%,transparent)}.plan-badge{position:absolute;top:0;inset-inline-end:20px;transform:translateY(-50%);background:var(--gold);color:var(--bg);padding:6px 12px;border-radius:var(--r-pill);font-size:12px;font-weight:900}.plan-card h2{font-size:var(--fs-h2);margin:6px 0}.plan-card p{color:var(--text-2);line-height:1.6;margin:0}.plan-price{display:flex;align-items:baseline;gap:8px}.plan-price b{font-size:clamp(25px,3vw,38px)}.plan-price span{color:var(--muted)}.plan-card ul{list-style:none;margin:0;padding:0;display:grid;gap:13px;color:var(--text-2);line-height:1.5;flex:1}.plan-card li::before{content:'✓';color:var(--green);margin-inline-end:9px;font-weight:900}.pricing-trust{padding:60px 0 0}.pricing-trust>h2{text-align:center}.pricing-trust>div{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.pricing-trust p{display:grid;gap:6px;padding:20px;border-top:1px solid var(--line-2)}.pricing-trust span{color:var(--muted)}
  .account-tabs{display:flex;gap:5px;overflow:auto;padding:5px;margin-bottom:22px;border:1px solid var(--line-2);background:var(--surface);border-radius:var(--r-2)}.account-tabs a{white-space:nowrap;color:var(--muted);text-decoration:none;font-weight:800;padding:10px 14px;border-radius:10px;cursor:pointer}.account-tabs a.on{color:var(--text);background:var(--surface-3)}.account-grid{display:grid;grid-template-columns:300px minmax(0,1fr);gap:20px}.profile-preview,.account-form{padding:28px}.profile-preview{display:flex;flex-direction:column;align-items:center;text-align:center;gap:8px}.profile-preview h2{margin:7px 0 0}.profile-preview>span{color:var(--muted);direction:ltr}.profile-preview>i{font-style:normal;color:var(--gold);font-weight:800;font-size:13px}.profile-avatar{width:96px;height:96px;border-radius:32px;display:grid;place-items:center;font-size:38px;font-weight:900;color:var(--gold);background:radial-gradient(circle,color-mix(in srgb,var(--gold) 20%,var(--surface)),var(--surface));border:1px solid color-mix(in srgb,var(--gold) 40%,transparent)}.account-form{display:flex;flex-direction:column;gap:16px}.inventory-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px}.inventory-item{padding:18px;display:grid;grid-template-columns:70px 1fr auto;align-items:center;gap:16px}.inventory-glyph{width:70px;height:70px;border-radius:20px;display:grid;place-items:center;background:color-mix(in srgb,var(--accent) 10%,var(--surface));border:1px solid color-mix(in srgb,var(--accent) 35%,transparent);color:var(--accent);font-size:22px;font-weight:900}.inventory-item h2{margin:3px 0;font-size:18px}.inventory-item span{font-size:12px;color:var(--muted)}.account-nudge{display:flex;align-items:center;justify-content:space-between;margin-top:20px;padding:20px 4px;border-top:1px solid var(--line)}.account-nudge p{font-size:var(--fs-h3);font-weight:800}
  .settings-section{padding:24px;margin-bottom:16px}.settings-section h2{margin:0 0 12px}.setting-row{display:flex;justify-content:space-between;align-items:center;gap:18px;padding:15px 0;border-top:1px solid var(--line)}.setting-row>span{display:grid;gap:4px}.setting-row small{color:var(--muted)}.setting-row input{appearance:none;width:50px;height:28px;border-radius:var(--r-pill);background:var(--surface-3);border:1px solid var(--line-2);position:relative;cursor:pointer;transition:.2s}.setting-row input::after{content:'';position:absolute;width:20px;height:20px;border-radius:50%;background:var(--muted);top:3px;inset-inline-start:4px;transition:.2s}.setting-row input:checked{background:color-mix(in srgb,var(--green) 25%,var(--surface));border-color:var(--green)}.setting-row input:checked::after{background:var(--green);transform:translateX(-21px)}.range-row{display:grid;gap:12px;padding:15px 0;border-top:1px solid var(--line)}.range-row span{display:flex;justify-content:space-between;font-weight:800}.range-row input{accent-color:var(--gold)}.danger-zone{padding:24px;margin-top:34px;border-color:color-mix(in srgb,var(--red) 35%,transparent)}.danger-zone h2{color:var(--red);margin-top:0}.danger-zone p{color:var(--text-2)}
  .empty-state{max-width:700px;margin:28px auto;padding:clamp(32px,6vw,70px);text-align:center;display:flex;flex-direction:column;align-items:center;gap:12px}.empty-state.compact{padding:34px}.empty-state h2,.empty-state p{margin:0}.empty-state p{color:var(--text-2);line-height:1.7;max-width:52ch}.empty-glyph{width:78px;height:78px;border-radius:25px;display:grid;place-items:center;background:var(--surface-3);color:var(--gold);font-size:34px;font-weight:900}.empty-actions{display:flex;gap:10px}.billing-summary{padding:25px;display:flex;align-items:center;justify-content:space-between}.billing-summary span{color:var(--muted)}.billing-summary h2{margin:5px 0}.section-label{margin:30px 0 14px}.receipt-list{display:grid;gap:10px}.receipt-list article{padding:18px;display:flex;align-items:center;justify-content:space-between}.receipt-list article>div{display:grid;gap:3px}.receipt-list span{color:var(--muted);font-size:13px}.receipt-list strong{color:var(--gold)}
  .checkout-layout{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(260px,.7fr);gap:20px}.checkout-main,.checkout-aside{padding:clamp(22px,4vw,36px)}.checkout-main h2,.checkout-aside h2{margin-top:0}.checkout-demo-seal{display:inline-block;padding:7px 10px;border-radius:8px;background:color-mix(in srgb,var(--gold) 12%,var(--surface));color:var(--gold);font-size:13px;font-weight:900;margin-bottom:20px}.checkout-item{display:grid;grid-template-columns:64px 1fr auto;gap:15px;align-items:center;padding:20px 0;border-block:1px solid var(--line)}.checkout-glyph{width:64px;height:64px;border-radius:18px;display:grid;place-items:center;background:var(--surface-3);color:var(--gold);font-size:24px}.checkout-item>div:nth-child(2){display:grid;gap:4px}.checkout-item span{color:var(--muted)}.checkout-item strong{font-size:20px}.checkout-total{margin:18px 0}.checkout-total>div{display:flex;justify-content:space-between}.checkout-total dt{color:var(--text-2)}.checkout-total dd{margin:0;font-weight:900}.checkout-main>.btn{margin-top:18px}.checkout-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px}.checkout-aside ul{padding-inline-start:20px;color:var(--text-2);line-height:1.8}.checkout-aside a{display:inline-block;margin-top:10px}
  .support-grid{display:grid;grid-template-columns:minmax(240px,.65fr) minmax(0,1.35fr);gap:20px}.support-links{display:flex;flex-direction:column;gap:12px}.support-links>*{padding:20px;display:grid;gap:6px;color:inherit;text-decoration:none}.support-links span{color:var(--muted);line-height:1.5}.support-form{padding:28px;display:flex;flex-direction:column;gap:16px}
  .prose-page{max-width:820px;margin:0 auto;padding:clamp(26px,5vw,54px);font-size:17px;line-height:1.9}.prose-page h2{font-size:var(--fs-h2);margin:38px 0 4px}.prose-page h2:first-of-type{margin-top:10px}.prose-page p{color:var(--text-2)}.legal-meta{color:var(--gold);font-size:13px;font-weight:800;border-bottom:1px solid var(--line);padding-bottom:14px}.legal-note{border-top:1px solid var(--line);padding-top:18px;font-size:14px}.status-list{padding:10px 24px}.status-list article{display:grid;grid-template-columns:12px 1fr auto;gap:15px;align-items:center;padding:20px 0;border-bottom:1px solid var(--line)}.status-list article:last-child{border:0}.status-list i{width:10px;height:10px;border-radius:50%;background:var(--green);box-shadow:0 0 12px currentColor}.status-list i.demo{background:var(--gold)}.status-list article>div{display:grid;gap:4px}.status-list span{color:var(--muted)}.status-list strong{font-size:13px;color:var(--green)}.status-list i.demo~div~strong{color:var(--gold)}.timeline{display:grid;gap:18px;max-width:820px;margin:0 auto}.timeline article{padding:28px;border-inline-start:3px solid var(--gold)}.timeline time{color:var(--gold);font-weight:900}.timeline h2{margin:7px 0}.timeline ul{color:var(--text-2);line-height:1.8}
  .field-help{display:block;color:var(--muted);line-height:1.55;margin-top:-10px}.form-options{display:flex;align-items:center;justify-content:space-between;gap:12px}.secret-toggle{border:0;background:transparent;color:var(--gold);font:inherit;font-size:13px;font-weight:800;cursor:pointer;padding:4px}.sr-only{position:absolute!important;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
  .demo-credential{display:flex;justify-content:space-between;gap:10px;padding:11px 12px;border:1px dashed var(--line-3);border-radius:10px;color:var(--muted);font-size:12px}.demo-credential code{color:var(--gold);font-family:ui-monospace,monospace}
  .catalog-tools{gap:16px;flex-wrap:wrap}.catalog-inputs{display:flex;gap:8px}.catalog-inputs .input{min-height:43px;padding:9px 12px;font-size:14px}.catalog-inputs input{width:160px}.catalog-inputs select{width:170px}.product-art{color:inherit;text-decoration:none}.product-card h2 a{color:inherit;text-decoration:none}.product-card-foot>div{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end}
  .product-detail{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(300px,.9fr);gap:20px}.product-detail-art{min-height:480px;display:grid;place-items:center;align-content:center;gap:25px;background:radial-gradient(circle,color-mix(in srgb,var(--accent) 25%,transparent),transparent 60%),var(--surface)}.product-detail-art>span{width:150px;height:150px;border-radius:44px;display:grid;place-items:center;color:var(--accent);border:1px solid color-mix(in srgb,var(--accent) 48%,transparent);font-size:46px;font-weight:900;box-shadow:0 30px 100px color-mix(in srgb,var(--accent) 20%,transparent)}.product-detail-art i{font-style:normal;color:var(--muted);font-size:13px}.product-detail-copy{padding:clamp(24px,4vw,42px);display:flex;flex-direction:column;justify-content:center;align-items:flex-start;gap:17px}.product-detail-copy h2{font-size:var(--fs-h1);margin:0}.product-detail-copy dl{width:100%;margin:0;border-block:1px solid var(--line)}.product-detail-copy dl>div{display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid var(--line)}.product-detail-copy dl>div:last-child{border:0}.product-detail-copy dt{color:var(--muted)}.product-detail-copy dd{margin:0;font-weight:800}.product-detail-copy>p{color:var(--text-2);line-height:1.6}
  .plan-badge.current{background:var(--green)}.plan-card.current{border-color:color-mix(in srgb,var(--green) 45%,transparent)}.plan-compare{max-width:850px;margin:45px auto 0;padding:28px}.plan-compare h2{margin-top:0}.plan-compare>div{display:flex;justify-content:space-between;gap:20px;padding:13px 0;border-top:1px solid var(--line)}.plan-compare span{color:var(--text-2)}.faq-list{max-width:850px;margin:50px auto 0}.faq-list.wide{margin-top:0}.faq-list>h2{font-size:var(--fs-h2)}.faq-list details{border-bottom:1px solid var(--line);padding:18px 2px}.faq-list summary{font-weight:900;font-size:18px;cursor:pointer}.faq-list p{color:var(--text-2);line-height:1.7}.faq-list a{color:var(--gold);font-weight:800}
  .profile-preview>small{color:var(--muted);margin-top:5px}.profile-badges{display:flex;gap:6px;justify-content:center;flex-wrap:wrap}.profile-badges>*{font-style:normal;color:var(--gold);font-weight:800;font-size:12px;padding:5px 8px;border-radius:var(--r-pill);background:color-mix(in srgb,var(--gold) 8%,var(--surface));text-decoration:none}.profile-badges .verified{color:var(--green)}.profile-stats{margin-top:20px;padding:26px}.profile-stats header{display:flex;align-items:flex-start;justify-content:space-between}.profile-stats h2,.profile-stats p{margin:0}.profile-stats header p,.profile-stats footer{color:var(--muted)}.profile-stats header a{color:var(--gold);font-weight:800;text-decoration:none}.profile-stats>div{display:grid;grid-template-columns:repeat(6,1fr);margin:24px 0;border-block:1px solid var(--line)}.profile-stats>div p{padding:18px 10px;display:grid;gap:5px;text-align:center;border-inline-end:1px solid var(--line)}.profile-stats>div p:last-child{border:0}.profile-stats b{font-size:24px}.profile-stats span{color:var(--muted);font-size:12px}
  .select-row,.account-actions>div{display:flex;justify-content:space-between;align-items:center;gap:18px;padding:15px 0;border-top:1px solid var(--line)}.select-row>span,.account-actions>div>span{display:grid;gap:4px}.select-row small,.account-actions small{color:var(--muted)}.select-row .input{width:min(220px,45%);min-height:44px}.account-actions>div:first-of-type{border-top:0}
  .checkout-total>div{padding:5px 0}.checkout-total .grand{margin-top:8px;padding-top:12px;border-top:1px solid var(--line);font-size:18px}.sandbox-method{display:flex;gap:12px;align-items:center;margin:17px 0;padding:14px;border:1px dashed color-mix(in srgb,var(--gold) 40%,transparent);border-radius:12px}.sandbox-method>span{width:40px;height:40px;display:grid;place-items:center;border-radius:10px;background:var(--surface-3);color:var(--gold)}.sandbox-method>div{display:grid;gap:3px}.sandbox-method small{color:var(--muted)}.checkout-aside>a{display:block}.checkout-result.success .empty-glyph{color:var(--green)}.checkout-result.failure .empty-glyph{color:var(--red)}
  .history-list{display:grid;gap:10px}.history-list a{display:flex;justify-content:space-between;padding:18px;color:var(--text);text-decoration:none}.history-list span{color:var(--muted)}.history-empty-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:16px}.history-empty-grid article{padding:22px}.history-empty-grid h2{font-size:var(--fs-h3);margin-top:0}.history-empty-grid p{color:var(--text-2);line-height:1.6}.billing-summary small{color:var(--muted)}.billing-actions{display:flex;gap:8px;flex-wrap:wrap}
  .danger-actions{display:flex;gap:9px;flex-wrap:wrap;margin-top:14px}
  .invite-layout{display:grid;grid-template-columns:minmax(280px,.7fr) minmax(0,1.3fr);gap:18px}.invite-form,.invite-preview{padding:28px}.invite-form{display:flex;flex-direction:column;gap:14px;align-self:start}.invite-preview h2{font-size:var(--fs-h2);margin:10px 0}.invite-preview>p{white-space:pre-line;direction:rtl;padding:18px;border:1px solid var(--line);border-radius:12px;background:var(--bg-1);line-height:1.8}.invite-actions{display:flex;gap:8px;flex-wrap:wrap}.invite-preview>small{display:block;color:var(--muted);line-height:1.6;margin-top:15px}
  .dass-high-contrast .panel,.dass-high-contrast .product-card{border-color:color-mix(in srgb,var(--text) 38%,transparent)}.dass-high-contrast .muted,.dass-high-contrast .field-help{color:var(--text-2)!important}.dass-large-text{font-size:112.5%}.dass-reduced-motion .product-page{animation:none!important}.dass-reduced-motion *{scroll-behavior:auto!important}
  @media(max-width:900px){.product-grid,.plans-grid{grid-template-columns:repeat(2,1fr)}.plans-grid .plan-card:first-child{grid-column:1/-1}.account-grid,.checkout-layout,.product-detail,.invite-layout{grid-template-columns:1fr}.product-detail-art{min-height:360px}.profile-preview{min-height:260px}.inventory-grid{grid-template-columns:1fr}.profile-stats>div{grid-template-columns:repeat(3,1fr)}}
  @media(max-width:700px){.product-page{width:min(100% - 28px,1180px);padding-top:42px}.product-hero h1{font-size:clamp(38px,13vw,58px)}.auth-layout,.support-grid{grid-template-columns:1fr}.auth-side{order:-1}.product-grid,.plans-grid,.pricing-trust>div{grid-template-columns:1fr}.plans-grid .plan-card:first-child{grid-column:auto}.catalog-tools{align-items:flex-start;flex-direction:column}.catalog-inputs{width:100%;display:grid;grid-template-columns:1fr 1fr}.catalog-inputs input,.catalog-inputs select{width:100%}.filter-pills{max-width:100%;overflow:auto}.catalog-note{padding-inline:5px}.product-art{height:155px}.product-card-copy{min-height:220px}.product-detail-art{min-height:300px}.product-detail-art>span{width:110px;height:110px}.account-tabs{margin-inline:-7px}.inventory-item{grid-template-columns:58px 1fr auto}.inventory-glyph{width:58px;height:58px}.profile-stats>div{grid-template-columns:repeat(2,1fr)}.profile-stats>div p:nth-child(2n){border-inline-end:0}.select-row,.account-actions>div{align-items:flex-start;flex-direction:column}.select-row .input{width:100%}.checkout-item{grid-template-columns:54px 1fr}.checkout-item>strong{grid-column:2}.status-list article{grid-template-columns:10px 1fr}.status-list strong{grid-column:2}.billing-summary{align-items:flex-start;gap:15px;flex-direction:column}.receipt-list article{align-items:flex-start;gap:10px;flex-direction:column}.history-empty-grid{grid-template-columns:1fr}.empty-actions{flex-wrap:wrap;justify-content:center}}
  @media(prefers-reduced-motion:reduce){.product-page{animation:none}.product-card{transition:none}}
  `}var Te=[{id:"majlis",name:"المجلس",codename:"THE ORIGINAL",premise:"خمس جوالات، طاولة واحدة، ووعود تنقلب في السر.",brief:"الطور الأساسي وأول ما تلعبونه. كل لاعب يجلس على الطاولة ويعلن نيّته أمام الجميع، لكن القرار الحقيقي يُقفل على جواله. ما تكشفه الشاشة في نهاية الجولة هو الفرق بين ما قيل وما فُعل.",hook:"وعدك معلن للجميع، وقرارك مخفي عن الكل.",players:"٤–٨ لاعبين",duration:"١٥–٢٥ دقيقة",intensity:"متوسط",price:"مجاني",priceNote:"ضمن اللعبة",availability:"playable",accent:"#b72e38",playRoute:"/create",beats:["أعلنوا نيّاتكم على الطاولة","اقفلوا القرار الحقيقي سرًّا","الشاشة تكشف من التزم ومن انقلب"]},{id:"classroom",name:"الصف",codename:"THE CLASS",premise:"سرٌّ واحد بين خمسة طلاب، ومجلس تأديب لا يعرف الرحمة.",brief:"حدث شيء في الصف، والإدارة تريد اسمًا واحدًا قبل الجرس. كل طالب يحمل جزءًا من الحقيقة وسببًا للكذب. من يحمي صاحبه؟ ومن يبيعه ليخرج نظيفًا؟",hook:"أحدكم يعرف الفاعل. وأحدكم هو الفاعل.",players:"٥ لاعبين",duration:"٢٠ دقيقة",intensity:"عالٍ",price:"٢٩ ر.س",availability:"coming-soon",accent:"#c8873a",beats:["وزّعوا الشهادات المتناقضة","صوّتوا على اسم قبل الجرس","الحقيقة تظهر بعد فوات الأوان"]},{id:"siege",name:"الحصار",codename:"SIEGE",premise:"المدينة محاصرة، والقرار: من يخرج ومن يبقى خلف الجدار.",brief:"المؤن تكفي القليل، والبوابة تُفتح مرة واحدة كل ليلة. كل لاعب يمثّل بيتًا له مصالحه وأسراره. التحالفات تُبنى في الظلام، وتنهار عند أول رغيف.",hook:"من تُنقذه الليلة قد يغلق البوابة في وجهك غدًا.",players:"٥–٦ لاعبين",duration:"٣٠ دقيقة",intensity:"عالٍ جدًا",price:"٣٤ ر.س",availability:"coming-soon",accent:"#d0552f",beats:["قسّموا المؤن سرًّا","افتحوا البوابة لواحد فقط","الجوع يكشف من خان الحصار"]},{id:"blackout",name:"العتمة",codename:"BLACKOUT",premise:"انطفأت المدينة، وكل قرار في الظلام قد يضيء الهدف الخطأ.",brief:"انقطعت الكهرباء، ومعها كل وسيلة للتأكد. لديكم مولّد واحد وقرارات لا رجعة فيها. ما تفعله في العتمة لا يراه أحد… حتى تعود الأنوار.",hook:"في الظلام، الجميع بريء. عند الضوء، يظهر أثر واحد.",players:"٥ لاعبين",duration:"١٨ دقيقة",intensity:"متوسط",price:"٢٤ ر.س",availability:"waitlist",accent:"#e0e0dc",beats:["تحرّكوا وأنتم في العتمة","وجّهوا المولّد لغرفة واحدة","الضوء يفضح ما جرى في الظلام"]},{id:"orbit",name:"المدار",codename:"ORBIT",premise:"المحطة تتهاوى، والأكسجين لا يكفي الجميع — من تُنقذ؟",brief:"المحطة تفقد مدارها، والوحدات تُغلق واحدة تلو الأخرى. كل طاقم يخفي عطلًا يخصّه وحلًّا يخص غيره. القرار جماعي، والهبوط فردي.",hook:"كل وحدة تُغلقها لإنقاذ نفسك تحبس أحدهم بالداخل.",players:"٦ لاعبين",duration:"٢٥ دقيقة",intensity:"عالٍ",price:"٣٩ ر.س",availability:"coming-soon",accent:"#7f97a6",beats:["شخّصوا الأعطال سرًّا","أغلقوا وحدة لإنقاذ المدار","المحطة تتذكّر من ضحّى بمن"]},{id:"hotel",name:"النزيل",codename:"THE GUEST",premise:"فندق بلا خروج، ونزيل واحد ليس كما يدّعي.",brief:"الليل طويل، والغرف كلها محجوزة، والمفاتيح تنتقل بين الأيدي. كل نزيل يحمل قصة غطاء وسببًا للبقاء مستيقظًا. باب واحد موارب يكفي ليقلب الليلة كلها.",hook:"أحد النزلاء لا يملك غرفة… لكنه يملك مفتاحك.",players:"٥–٧ لاعبين",duration:"٢٢ دقيقة",intensity:"متوسط",price:"٢٩ ر.س",availability:"coming-soon",accent:"#8a2f44",beats:["بدّلوا المفاتيح في الممر","اطرقوا بابًا واحدًا في الليل","الصباح يكشف من لم يكن نزيلًا"]}];function Xt(e){return Te.find(t=>t.id===e)}function Ve(e){return{playable:"متاح الآن","coming-soon":"قريبًا",waitlist:"قائمة الانتظار"}[e]}var C={black:"#080808",ink:"#0c0c0d",charcoal:"#151517",graphite:"#222226",lead:"#3a3a40",steel:"#66666d",gray:"#808088",muted:"#9a9a9f",paper:"#efece4",white:"#fafaf7"};function ra(e,t={}){let r=t.hr??24,a=t.hx??50,n=t.hy??62,i=t.sw??92,s=t.rise??0,d=t.neck??98,p=50-i/2,E=50+i/2,N=`M${p} 152 C${p} ${d+24+s} ${p+20} ${d+s} ${a} ${d} C${E-20} ${d-s} ${E} ${d+24-s} ${E} 152 Z`;return`<circle cx="${a}" cy="${n}" r="${r}" fill="${e}"/><path d="${N}" fill="${e}"/>`}function fe(e,t,r,a,n={}){return`<g transform="translate(${e} ${t}) scale(${r})">${ra(a,n)}</g>`}function Pe(e){return`<rect x="14" y="14" width="472" height="572" fill="none" stroke="${e}" stroke-width="1.4" opacity=".38"/>`}function Re(e,t){return`<defs>
    <linearGradient id="sky-${t}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.charcoal}"/><stop offset="1" stop-color="${C.black}"/></linearGradient>
    <radialGradient id="glow-${t}" cx="50%" cy="34%" r="62%"><stop offset="0" stop-color="${e}" stop-opacity=".26"/><stop offset="1" stop-color="${e}" stop-opacity="0"/></radialGradient>
    <filter id="sh-${t}" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="10" stdDeviation="8" flood-color="#000" flood-opacity=".45"/></filter>
  </defs>`}function Ue(e,t,r,a,n){return`<g transform="translate(${e} ${t}) rotate(${a}) scale(${r})"><rect x="${-26/2}" y="${-52/2}" width="26" height="52" rx="5" fill="${C.charcoal}" stroke="${C.lead}" stroke-width="1.2"/><rect x="${-26/2+3}" y="${-52/2+5}" width="20" height="42" rx="2" fill="${n}"/></g>`}function aa(e,t,r,a){return[[0,0],[1,0],[2,0],[0,1],[2,1],[0,2],[1,2],[2,2],[4,0],[4,2],[1,4],[3,4],[4,4],[0,4]].map(([i,s])=>`<rect x="${e+i*r}" y="${t+s*r}" width="${r*.8}" height="${r*.8}" fill="${a}" opacity=".8"/>`).join("")}function Zt(e){let t="mode-majlis";return`<svg class="mode-cover-art" viewBox="0 0 500 600" preserveAspectRatio="xMidYMid slice" role="img" aria-label="غرفة معيشة: خمسة أشخاص حول تلفزيون واحد مضاء، كل واحد يمسك جوالًا، وخط ملوّن يخرج من جوال إلى الشاشة ويعود إلى صاحبه">
    ${Re(e,t)}
    <rect width="500" height="600" fill="url(#sky-${t})"/><rect width="500" height="600" fill="url(#glow-${t})"/>
    <!-- the one shared TV -->
    <rect x="118" y="290" width="24" height="30" fill="${C.graphite}"/>
    <ellipse cx="250" cy="322" rx="70" ry="11" fill="${C.ink}"/>
    <g filter="url(#sh-${t})"><rect x="112" y="64" width="276" height="168" rx="10" fill="${C.charcoal}" stroke="${C.lead}" stroke-width="2"/></g>
    <rect x="124" y="76" width="252" height="144" rx="6" fill="${C.ink}"/>
    <clipPath id="tv-${t}"><rect x="124" y="76" width="252" height="144" rx="6"/></clipPath>
    <g clip-path="url(#tv-${t})">
      ${fe(176,96,.6,C.steel,{hx:54,sw:96})}
      ${fe(250,104,.54,C.lead,{hx:44,sw:92})}
      <rect x="236" y="164" width="34" height="18" rx="2" fill="${e}" transform="rotate(-8 253 173)"/>
      <circle cx="144" cy="96" r="4" fill="${e}"/>
      <rect x="154" y="93" width="22" height="6" rx="2" fill="${C.steel}" opacity=".7"/>
      ${aa(322,168,8,C.muted)}
    </g>
    <!-- five people gathered around it, from behind -->
    ${fe(60,250,.95,C.lead,{hx:46,sw:84})}
    ${fe(345,250,.95,C.lead,{hx:54,sw:84})}
    ${fe(30,322,1.16,C.steel,{sw:94})}
    ${fe(355,322,1.16,C.steel,{hx:54,sw:94})}
    ${fe(178,352,1.36,C.muted,{sw:96})}
    <!-- each phone throws a faint decision line up to the screen -->
    <g stroke="${C.steel}" stroke-width="1.2" fill="none" opacity=".3" stroke-linecap="round">
      <path d="M140 342 C 190 300 230 262 250 232"/>
      <path d="M112 440 C 170 360 220 280 248 230"/>
      <path d="M388 440 C 330 360 280 280 252 230"/>
      <path d="M360 342 C 310 300 270 262 250 232"/>
    </g>
    <!-- the phones; the central one is the live decision -->
    ${Ue(140,352,.5,-12,C.muted)}
    ${Ue(360,352,.5,12,C.muted)}
    ${Ue(110,456,.66,-10,C.muted)}
    ${Ue(390,456,.66,10,C.muted)}
    ${Ue(246,500,.86,0,e)}
    <!-- the return line: decision rises to the TV, consequence loops back to its sender -->
    <path d="M246 478 C 244 400 250 300 250 232 C 250 190 330 190 326 270 C 322 340 290 372 258 384" fill="none" stroke="${e}" stroke-width="2.4" stroke-linecap="round"/>
    <circle cx="246" cy="478" r="5" fill="${e}"/>
    <path d="M258 384 l16 -10 4 20z" fill="${e}"/>
    ${Pe(e)}
  </svg>`}function ia(e){let t="mode-class",r={x:300,y:150,w:52,h:300},a="";for(let n=0;n<3;n++)for(let i=0;i<3;i++){let s=96+i*116,d=300+n*96,p=n===1&&i===1;a+=fe(s-26,d-128,.62,p?e:C.lead,{sw:88}),a+=`<rect x="${s-34}" y="${d}" width="68" height="14" rx="2" fill="${p?e:C.graphite}"/>`,a+=`<rect x="${s-30}" y="${d+14}" width="60" height="26" fill="${C.ink}"/>`}return`<svg class="mode-cover-art" viewBox="0 0 500 600" preserveAspectRatio="xMidYMid slice" role="img" aria-label="صفّ دراسي من طاولات وطلاب، أحدهم معلّم بالأحمر، يُرى جزء منه عبر شقّ مراقبة">
    ${Re(e,t)}
    <rect width="500" height="600" fill="url(#sky-${t})"/><rect width="500" height="600" fill="url(#glow-${t})"/>
    <!-- chalkboard -->
    <rect x="70" y="70" width="360" height="150" rx="4" fill="${C.ink}" stroke="${C.lead}" stroke-width="2"/>
    <line x1="110" y1="120" x2="300" y2="120" stroke="${C.steel}" stroke-width="2" opacity=".6"/>
    <line x1="110" y1="150" x2="250" y2="150" stroke="${C.steel}" stroke-width="2" opacity=".45"/>
    <path d="M330 108 C 372 96 392 128 356 150" fill="none" stroke="${e}" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M356 150 l10 -12 4 14z" fill="${e}"/>
    <g filter="url(#sh-${t})">${a}</g>
    <!-- the monitor's slit exposes one column brighter -->
    <g clip-path="url(#clip-${t})"><rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" fill="${e}" opacity=".08"/></g>
    <clipPath id="clip-${t}"><rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}"/></clipPath>
    <line x1="${r.x}" y1="${r.y}" x2="${r.x}" y2="${r.y+r.h}" stroke="${C.paper}" stroke-width="1.6" opacity=".5"/>
    <line x1="${r.x+r.w}" y1="${r.y}" x2="${r.x+r.w}" y2="${r.y+r.h}" stroke="${C.paper}" stroke-width="1.6" opacity=".5"/>
    ${Pe(e)}
  </svg>`}function na(e){let t="mode-siege",r=[210,300,160,360,250,420,300,190,340,240,300],a="";return r.forEach((n,i)=>{let s=60+i*38,d=i===5;a+=`<rect x="${s}" y="${520-n}" width="30" height="${n}" fill="${d?C.graphite:C.ink}" stroke="${C.lead}" stroke-width="1"/>`;for(let p=520-n+16;p<500;p+=34){let E=d&&p<520-n+120;a+=`<rect x="${s+8}" y="${p}" width="6" height="10" fill="${E?e:C.steel}" opacity="${E?".9":".35"}"/>`,a+=`<rect x="${s+18}" y="${p}" width="6" height="10" fill="${C.steel}" opacity=".28"/>`}}),`<svg class="mode-cover-art" viewBox="0 0 500 600" preserveAspectRatio="xMidYMid slice" role="img" aria-label="أفق مدينة من أبراج مظلمة، برج واحد مضاء، وقوس أحمر يطبق حول المدينة">
    ${Re(e,t)}
    <rect width="500" height="600" fill="url(#sky-${t})"/><rect width="500" height="600" fill="url(#glow-${t})"/>
    <g filter="url(#sh-${t})">${a}</g>
    <rect x="0" y="518" width="500" height="82" fill="${C.black}"/>
    <!-- the closing perimeter -->
    <path d="M-20 470 C 120 430 260 520 640 430" fill="none" stroke="${e}" stroke-width="2.6" stroke-linecap="round" opacity=".85"/>
    <path d="M-10 520 C 150 500 320 560 520 500" fill="none" stroke="${e}" stroke-width="1.6" stroke-linecap="round" opacity=".4"/>
    <circle cx="250" cy="497" r="5" fill="${e}"/>
    ${Pe(e)}
  </svg>`}function oa(e){let t="mode-blackout",r="";for(let i=0;i<6;i++)for(let s=0;s<5;s++){let d=66+s*78,p=92+i*74,E=i===2&&s===3;r+=`<rect x="${d}" y="${p}" width="56" height="52" fill="${E?e:C.ink}" opacity="${E?".92":"1"}" stroke="${C.lead}" stroke-width="1"/>`,E?r+=fe(d+6,p-6,.4,C.black,{sw:96}):(i+s)%3===0&&(r+=`<rect x="${d+10}" y="${p+12}" width="36" height="4" fill="${C.steel}" opacity=".22"/>`)}return`<svg class="mode-cover-art" viewBox="0 0 500 600" preserveAspectRatio="xMidYMid slice" role="img" aria-label="واجهة مبنى من نوافذ مظلمة، نافذة واحدة مضاءة بالأحمر، وخط طاقة ينقطع">
    ${Re(e,t)}
    <rect width="500" height="600" fill="${C.black}"/><rect width="500" height="600" fill="url(#glow-${t})"/>
    <g filter="url(#sh-${t})">${r}</g>
    <!-- the failing power line: a jagged return that snaps toward the one lit room -->
    <path d="M40 60 L 120 60 L 150 96 L 210 96 L 236 150" fill="none" stroke="${e}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="40" cy="60" r="5" fill="${e}"/>
    <path d="M236 150 l-12 -4 2 14z" fill="${e}"/>
    ${Pe(e)}
  </svg>`}function sa(e){let t="mode-orbit",r="";for(let s=0;s<8;s++){let d=s/8*Math.PI*2-Math.PI/2,p=250+Math.cos(d)*150,E=300+Math.sin(d)*150,N=s===2;r+=`<rect x="${p-20}" y="${E-16}" width="40" height="32" rx="4" transform="rotate(${d*180/Math.PI+90} ${p} ${E})" fill="${N?e:C.graphite}" stroke="${C.steel}" stroke-width="1.4"/>`,N||(r+=`<circle cx="${p}" cy="${E}" r="3" fill="${C.muted}"/>`)}return`<svg class="mode-cover-art" viewBox="0 0 500 600" preserveAspectRatio="xMidYMid slice" role="img" aria-label="محطة فضائية على شكل حلقة، وحدة واحدة مغلقة بالأحمر، ومدار متهاوٍ">
    ${Re(e,t)}
    <rect width="500" height="600" fill="url(#sky-${t})"/><rect width="500" height="600" fill="url(#glow-${t})"/>
    <circle cx="250" cy="300" r="150" fill="none" stroke="${C.lead}" stroke-width="18"/>
    <circle cx="250" cy="300" r="150" fill="none" stroke="${C.steel}" stroke-width="1.4" opacity=".5"/>
    <circle cx="250" cy="300" r="58" fill="${C.ink}" stroke="${C.lead}" stroke-width="2"/>
    <g filter="url(#sh-${t})">${r}</g>
    <!-- decaying orbit: a red arc spiralling outward and breaking -->
    <path d="M250 300 m0 -184 a 184 184 0 1 1 -2 0" fill="none" stroke="${e}" stroke-width="2.2" stroke-linecap="round" stroke-dasharray="6 10" opacity=".85"/>
    <circle cx="250" cy="116" r="5" fill="${e}"/>
    ${Pe(e)}
  </svg>`}function la(e){let t="mode-hotel",r="";for(let a=0;a<4;a++)for(let n=0;n<4;n++){let i=74+n*96,s=96+a*108,d=a===2&&n===2;r+=`<rect x="${i}" y="${s}" width="64" height="86" rx="3" fill="${C.ink}" stroke="${C.lead}" stroke-width="1.4"/>`,d?(r+=`<rect x="${i}" y="${s}" width="30" height="86" rx="3" fill="${e}" opacity=".85"/>`,r+=`<path d="M${i+30} ${s} L ${i+44} ${s+10} L ${i+44} ${s+78} L ${i+30} ${s+86} Z" fill="${C.charcoal}"/>`):(r+=`<circle cx="${i+52}" cy="${s+46}" r="3" fill="${C.steel}"/>`,r+=`<rect x="${i+12}" y="${s+14}" width="40" height="3" fill="${C.steel}" opacity=".3"/>`)}return`<svg class="mode-cover-art" viewBox="0 0 500 600" preserveAspectRatio="xMidYMid slice" role="img" aria-label="واجهة فندق من أبواب مغلقة، باب واحد موارب يتسرب منه ضوء أحمر، ومفتاح يعود على خيط">
    ${Re(e,t)}
    <rect width="500" height="600" fill="url(#sky-${t})"/><rect width="500" height="600" fill="url(#glow-${t})"/>
    <g filter="url(#sh-${t})">${r}</g>
    <!-- a key on a return line, arriving back at the ajar door -->
    <path d="M420 70 C 300 40 150 70 300 300" fill="none" stroke="${e}" stroke-width="2" stroke-linecap="round" opacity=".8"/>
    <circle cx="420" cy="70" r="8" fill="none" stroke="${e}" stroke-width="3"/><rect x="416" y="78" width="8" height="20" fill="${e}"/><rect x="416" y="92" width="14" height="4" fill="${e}"/>
    <path d="M300 300 l-10 -8 -2 16z" fill="${e}"/>
    ${Pe(e)}
  </svg>`}var da={majlis:Zt,classroom:ia,siege:na,blackout:oa,orbit:sa,hotel:la};function Ke(e,t){return(da[e]??Zt)(t)}var q=$e,pt={players:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="8" r="3.2"/><path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5"/><path d="M16 6.2a3 3 0 0 1 0 5.6"/><path d="M18 14.5c1.9.5 3.5 2.2 3.5 4.5"/></svg>',duration:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2"/><path d="M9 2h6"/></svg>',intensity:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13 2 4 14h7l-1 8 9-12h-7z"/></svg>'};function ut(e){return`<span class="mode-flag ${e.availability}">${Ve(e.availability)}</span>`}function Jt(e){return`<ul class="mode-meta" aria-label="مواصفات الطور">
    <li>${pt.players}<span>${q(e.players)}</span></li>
    <li>${pt.duration}<span>${q(e.duration)}</span></li>
    <li>${pt.intensity}<span>${q(e.intensity)}</span></li>
  </ul>`}function mt(e){return e.availability==="playable"?`<a class="btn primary" data-link="${e.playRoute}">ابدأ لعبة</a>`:e.availability==="waitlist"?`<button class="btn primary mode-waitlist" type="button" data-mode="${e.id}">أضفني لقائمة الانتظار</button>`:'<button class="btn primary" type="button" disabled>قريبًا</button>'}function ca(e){return`<article class="mode-featured" style="--accent:${e.accent}">
    <a class="mode-featured-art" data-link="/modes/mode?id=${e.id}" aria-label="استعرض ${q(e.name)}">${Ke(e.id,e.accent)}</a>
    <div class="mode-featured-copy">
      <div class="mode-flags">${ut(e)}<span class="mode-code" dir="ltr">${q(e.codename)}</span></div>
      <h2>${q(e.name)}</h2>
      <p class="mode-premise">${q(e.premise)}</p>
      ${Jt(e)}
      <p class="mode-hook"><span>الخبيئة</span>${q(e.hook)}</p>
      <div class="mode-actions">${mt(e)}<a class="btn ghost" data-link="/modes/mode?id=${e.id}">استعرض الطور</a></div>
    </div>
  </article>`}function pa(e){let t=e.availability==="playable"?`<b>${q(e.price)}</b>${e.priceNote?`<span>${q(e.priceNote)}</span>`:""}`:`<b>${q(e.price)}</b><span>${Ve(e.availability)}</span>`;return`<article class="mode-card ${e.availability}" style="--accent:${e.accent}" data-mode="${e.id}">
    <a class="mode-card-art" data-link="/modes/mode?id=${e.id}" aria-label="استعرض ${q(e.name)}">
      ${Ke(e.id,e.accent)}
      <span class="mode-enter">استعرض الطور</span>
    </a>
    <div class="mode-card-body">
      <div class="mode-flags">${ut(e)}<span class="mode-code" dir="ltr">${q(e.codename)}</span></div>
      <h3><a data-link="/modes/mode?id=${e.id}">${q(e.name)}</a></h3>
      <p class="mode-premise">${q(e.premise)}</p>
      ${Jt(e)}
      <div class="mode-card-foot"><div class="mode-price">${t}</div>${mt(e)}</div>
    </div>
  </article>`}function ua(){let e=Te.find(a=>a.availability==="playable")??Te[0],t=Te.filter(a=>a.id!==e.id);return{active:"modes",title:"الأطوار",description:"عوالم BACKFIRE القابلة للّعب — كل طور بقواعده وتوتره الخاص.",html:`<main id="main-content" class="product-page modes-page" tabindex="-1">
    <header class="product-hero"><div>
      <span class="eyebrow">أطوار BACKFIRE</span>
      <h1>عوالم تُلعب،<br>لا تُشترى.</h1>
      <p>كل طور عالم مستقل بقواعده وتوتره الخاص، لكن القلب واحد: معلومة مخبّأة، قرار سري، وعاقبة تعود. طور واحد متاح الآن، والبقية أبواب على وشك أن تُفتح.</p>
    </div></header>
    <aside class="modes-note" role="note"><span class="demo-dot"></span><div><b>الأطوار القادمة معاينة تصميم</b><span>الطور الأساسي فقط قابل للّعب الآن. باقي العوالم مفاهيم بصرية بلا شراء فعلي أو تفعيل.</span></div></aside>
    ${ca(e)}
    <div class="modes-rail-head"><h2>عوالم أخرى</h2><span>خمسة أبواب — كل واحد يقلب القواعد.</span></div>
    <section class="modes-grid">${t.map(pa).join("")}</section>
    <section class="modes-store-link">
      <div><span class="eyebrow">تخصيص</span><h2>تبغى تغيّر شكل الجلسة؟</h2><p>مظاهر وإطارات ومؤثرات تقديم اختيارية — تجميلية فقط، بلا أفضلية لعب.</p></div>
    </section>
  </main>`,bind:Qt}}function ma(e){return`<ol class="mode-beats">${e.beats.map((t,r)=>`<li><b>${["٠١","٠٢","٠٣"][r]}</b><span>${q(t)}</span></li>`).join("")}</ol>`}function ga(e){let t=Xt(new URLSearchParams(e).get("id")??"");if(!t)return{active:"modes",title:"الطور غير موجود",description:"لم نجد هذا الطور.",html:'<main id="main-content" class="product-page" tabindex="-1"><section class="empty-state panel"><span class="empty-glyph">؟</span><h2>هذا الطور غير موجود</h2><p>يمكن أن الرابط تغيّر. ارجع لصفحة الأطوار واختر عالمًا.</p><a class="btn primary" data-link="/modes">كل الأطوار</a></section></main>'};let r=`<main id="main-content" class="product-page mode-detail-page" tabindex="-1" style="--accent:${t.accent}">
    <a class="mode-back" data-link="/modes">← كل الأطوار</a>
    <section class="mode-detail">
      <div class="mode-detail-art panel">${Ke(t.id,t.accent)}<div class="mode-detail-art-cap">${ut(t)}<span class="mode-code" dir="ltr">${q(t.codename)}</span></div></div>
      <div class="mode-detail-copy">
        <h1>${q(t.name)}</h1>
        <p class="mode-detail-premise">${q(t.premise)}</p>
        <p class="mode-hook"><span>الخبيئة</span>${q(t.hook)}</p>
        <p class="mode-brief">${q(t.brief)}</p>
        <dl class="mode-detail-meta">
          <div><dt>اللاعبون</dt><dd>${q(t.players)}</dd></div>
          <div><dt>المدة</dt><dd>${q(t.duration)}</dd></div>
          <div><dt>التوتر</dt><dd>${q(t.intensity)}</dd></div>
          <div><dt>الحالة</dt><dd>${Ve(t.availability)}</dd></div>
        </dl>
        <div class="mode-detail-price"><b>${q(t.price)}</b>${t.priceNote?`<span>${q(t.priceNote)}</span>`:t.availability!=="playable"?"<span>لا شراء فعلي بعد</span>":""}</div>
        <div class="mode-actions">${mt(t)}<a class="btn ghost" data-link="/how-to-play">كيف تُلعب الأطوار</a></div>
        <p class="mode-waitlist-note" hidden role="status"></p>
      </div>
    </section>
    <section class="mode-round">
      <div class="mode-round-head"><span class="eyebrow">كيف تمرّ الجولة</span><h2>ثلاث لحظات في ${q(t.name)}</h2></div>
      ${ma(t)}
    </section>
  </main>`;return{active:"modes",title:t.name,description:t.premise,html:r,bind:Qt}}function Qt(){document.querySelectorAll(".mode-waitlist").forEach(e=>{e.addEventListener("click",()=>{e.disabled=!0,e.classList.add("on"),e.textContent="في قائمة انتظارك ✓";let t=document.querySelector(".mode-waitlist-note");t&&(t.hidden=!1,t.textContent="هذه معاينة محلية — التسجيل الفعلي في قائمة الانتظار يبدأ عند إطلاق الطور. لم نرسل أي بيانات.")})})}function er(){return`<section class="home-modes on-dark" data-reveal>
    <div class="home-modes-head">
      <span class="eyebrow">عوالم BACKFIRE</span>
      <h2>طور واحد يبدأ الليلة.<br><em>وخمسة أبواب تنتظر.</em></h2>
      <p>نفس القلب — معلومة مخبّأة وقرار سري وعاقبة تعود — في عوالم مختلفة القواعد والتوتر.</p>
    </div>
    <div class="home-modes-rail">
      ${Te.slice(0,4).map(t=>`<a class="home-mode" data-link="/modes/mode?id=${t.id}" style="--accent:${t.accent}" aria-label="استعرض ${q(t.name)}">
        <span class="home-mode-art">${Ke(t.id,t.accent)}</span>
        <span class="home-mode-cap"><span class="mode-flag ${t.availability}">${Ve(t.availability)}</span><b>${q(t.name)}</b><small dir="ltr">${q(t.codename)}</small></span>
      </a>`).join("")}
    </div>
    <div class="home-modes-cta"><a class="btn ghost lg" data-link="/modes">استكشف كل الأطوار</a></div>
  </section>`}var gt=new Set(["/modes","/modes/mode"]);function tr(e,t=""){return e==="/modes/mode"?ga(t):ua()}function rr(){return`
  .modes-page .product-hero h1{line-height:.98}
  .mode-cover-art{display:block;width:100%;height:100%;object-fit:cover}

  /* local-only note (neutral, distinct from the amber demo banner) */
  .modes-note{display:flex;align-items:flex-start;gap:12px;margin:0 0 30px;padding:14px 16px;border:1px solid var(--line-2);border-radius:var(--r-2);background:var(--surface);color:var(--text-2)}
  .modes-note>div{display:grid;gap:3px}.modes-note b{color:var(--text)}.modes-note span:last-child{font-size:14px}
  .modes-note .demo-dot{background:var(--bf-red);box-shadow:0 0 14px var(--bf-red)}

  /* shared mode chrome */
  .mode-flags{display:flex;align-items:center;gap:10px}
  .mode-flag{display:inline-flex;align-items:center;gap:7px;font-size:12px;font-weight:900;letter-spacing:.04em;padding:5px 11px;border-radius:var(--r-pill);border:1px solid var(--line-2)}
  .mode-flag::before{content:'';width:6px;height:6px;border-radius:50%;background:currentColor}
  .mode-flag.playable{color:var(--bf-red-soft);border-color:color-mix(in srgb,var(--bf-red-soft) 45%,transparent);background:color-mix(in srgb,var(--bf-red) 10%,transparent)}
  .mode-flag.playable::before{box-shadow:0 0 8px currentColor}
  .mode-flag.coming-soon{color:var(--bf-muted)}
  .mode-flag.waitlist{color:var(--bf-white)}
  .mode-code{font:900 11px/1 'Arial',sans-serif;letter-spacing:.16em;color:var(--bf-gray)}
  .mode-premise{color:var(--text);font-weight:700;line-height:1.5;margin:0}
  .mode-meta{display:flex;flex-wrap:wrap;gap:8px 18px;list-style:none;margin:0;padding:0}
  .mode-meta li{display:inline-flex;align-items:center;gap:7px;color:var(--text-2);font-size:14px;font-weight:700}
  .mode-meta svg{width:17px;height:17px;color:color-mix(in srgb,var(--accent) 78%,var(--bf-muted));flex:0 0 auto}
  .mode-hook{display:grid;gap:4px;margin:0;padding:14px 16px;border-inline-start:2px solid var(--accent);background:color-mix(in srgb,var(--accent) 8%,transparent);border-radius:0 var(--r-2) var(--r-2) 0;color:var(--text);font-weight:700;line-height:1.5}
  .mode-hook span{font-size:11px;font-weight:900;letter-spacing:.12em;color:color-mix(in srgb,var(--accent) 82%,var(--bf-white));text-transform:uppercase}
  .mode-actions{display:flex;gap:10px;flex-wrap:wrap}
  .btn.on{background:color-mix(in srgb,var(--bf-red) 22%,var(--surface));border-color:var(--line-2);color:var(--bf-white)}

  /* featured mode — the playable one, cinematic and wide */
  .mode-featured{display:grid;grid-template-columns:minmax(0,1.12fr) minmax(0,1fr);gap:clamp(20px,3vw,44px);align-items:stretch;margin:0 0 clamp(40px,6vw,68px);padding:clamp(18px,2.2vw,26px);border:1px solid var(--line-2);border-radius:var(--r-3);background:linear-gradient(140deg,color-mix(in srgb,var(--accent) 12%,var(--surface-2)),var(--surface));position:relative;overflow:hidden}
  .mode-featured::before{content:'';position:absolute;inset:0;background:radial-gradient(80% 90% at 12% 0,color-mix(in srgb,var(--accent) 16%,transparent),transparent 60%);pointer-events:none}
  .mode-featured-art{position:relative;z-index:1;display:block;border-radius:var(--r-2);overflow:hidden;aspect-ratio:5/6;box-shadow:0 30px 80px rgba(0,0,0,.5);transition:transform var(--t-comp) var(--e-out)}
  .mode-featured-art:hover{transform:translateY(-4px)}
  .mode-featured-copy{position:relative;z-index:1;display:flex;flex-direction:column;justify-content:center;gap:16px;padding:6px 4px}
  .mode-featured-copy h2{font-size:clamp(34px,4.6vw,60px);line-height:1;letter-spacing:-.03em;margin:2px 0}
  .mode-featured-copy .mode-premise{font-size:clamp(17px,1.5vw,21px)}

  .modes-rail-head{display:flex;align-items:baseline;justify-content:space-between;gap:16px;flex-wrap:wrap;margin:0 0 20px;padding-bottom:16px;border-bottom:1px solid var(--line)}
  .modes-rail-head h2{font-size:var(--fs-h2);margin:0;letter-spacing:-.02em}
  .modes-rail-head span{color:var(--muted);font-size:15px}

  /* portal grid */
  .modes-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}
  .mode-card{display:flex;flex-direction:column;overflow:hidden;border:1px solid var(--line-2);border-radius:var(--r-3);background:linear-gradient(180deg,var(--surface-2),var(--surface));transition:transform var(--t-comp) var(--e-out),border-color var(--t-comp),box-shadow var(--t-comp)}
  .mode-card:hover{transform:translateY(-6px);border-color:color-mix(in srgb,var(--accent) 55%,var(--line-2));box-shadow:0 30px 70px rgba(0,0,0,.45),0 0 0 1px color-mix(in srgb,var(--accent) 30%,transparent)}
  .mode-card-art{position:relative;display:block;aspect-ratio:5/6;overflow:hidden;border-bottom:1px solid var(--line)}
  .mode-card-art::after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,transparent 52%,color-mix(in srgb,var(--accent) 14%,transparent) 78%,rgba(8,8,8,.72));pointer-events:none}
  .mode-card-art .mode-cover-art{transition:transform var(--t-comp) var(--e-out)}
  .mode-card:hover .mode-card-art .mode-cover-art{transform:scale(1.045)}
  .mode-enter{position:absolute;z-index:2;inset-block-end:12px;inset-inline-start:14px;padding:7px 13px;border-radius:var(--r-pill);background:color-mix(in srgb,var(--accent) 88%,#000);color:var(--bf-white);font-size:12px;font-weight:900;opacity:0;transform:translateY(6px);transition:opacity var(--t-fast),transform var(--t-fast)}
  .mode-card:hover .mode-enter,.mode-card-art:focus-visible .mode-enter{opacity:1;transform:none}
  .mode-card-body{display:flex;flex-direction:column;gap:12px;padding:18px 18px 20px}
  .mode-card-body h3{margin:0;font-size:21px;letter-spacing:-.01em}
  .mode-card-body h3 a{color:inherit}
  .mode-card-body .mode-premise{font-size:15px;color:var(--text-2);font-weight:700;min-height:2.8em}
  .mode-card-foot{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:auto;padding-top:14px;border-top:1px solid var(--line)}
  .mode-price{display:grid;gap:1px}.mode-price b{font-size:17px;color:var(--text)}.mode-price span{font-size:11px;color:var(--muted);font-weight:700}

  .modes-store-link{display:flex;align-items:center;justify-content:space-between;gap:20px;flex-wrap:wrap;margin:clamp(44px,6vw,72px) 0 0;padding:clamp(24px,3vw,36px);border:1px solid var(--line);border-radius:var(--r-3);background:var(--bg-1)}
  .modes-store-link h2{margin:8px 0 6px;font-size:clamp(22px,2.6vw,30px);letter-spacing:-.02em}
  .modes-store-link p{margin:0;color:var(--text-2);max-width:52ch;line-height:1.6}

  /* mode detail */
  .mode-back{display:inline-block;margin:0 0 14px;padding:4px 2px;color:var(--muted);font-weight:800}
  .mode-back:hover{color:var(--text)}
  .mode-detail{display:grid;grid-template-columns:minmax(0,.92fr) minmax(0,1.08fr);gap:clamp(22px,4vw,52px);align-items:start}
  .mode-detail-art{position:relative;padding:0;overflow:hidden;aspect-ratio:5/6;border-radius:var(--r-3)}
  .mode-detail-art .mode-cover-art{width:100%;height:100%}
  .mode-detail-art-cap{position:absolute;inset-block-end:14px;inset-inline:14px;display:flex;align-items:center;justify-content:space-between;gap:10px}
  .mode-detail-copy{display:flex;flex-direction:column;gap:16px;padding-top:6px}
  .mode-detail-copy h1{font-size:clamp(40px,6vw,74px);line-height:.98;letter-spacing:-.03em;margin:0}
  .mode-detail-premise{font-size:clamp(18px,1.7vw,23px);font-weight:800;color:var(--text);line-height:1.4;margin:0}
  .mode-brief{color:var(--text-2);line-height:1.8;margin:0;font-size:16px}
  .mode-detail-meta{display:grid;grid-template-columns:repeat(4,1fr);margin:6px 0;border-block:1px solid var(--line)}
  .mode-detail-meta>div{display:grid;gap:5px;padding:16px 4px;border-inline-end:1px solid var(--line)}
  .mode-detail-meta>div:last-child{border-inline-end:0}
  .mode-detail-meta dt{color:var(--muted);font-size:12px;font-weight:800;letter-spacing:.04em}
  .mode-detail-meta dd{margin:0;font-weight:900;font-size:16px}
  .mode-detail-price{display:flex;align-items:baseline;gap:10px}
  .mode-detail-price b{font-size:26px}.mode-detail-price span{color:var(--muted);font-size:13px;font-weight:700}
  .mode-waitlist-note{margin:0;color:var(--text-2);font-size:13px;line-height:1.6}

  .mode-round{margin:clamp(50px,7vw,86px) 0 0;padding-top:clamp(30px,4vw,44px);border-top:1px solid var(--line)}
  .mode-round-head{margin-bottom:26px}
  .mode-round-head h2{font-size:var(--fs-h2);margin:12px 0 0;letter-spacing:-.02em}
  .mode-beats{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--line)}
  .mode-beats li{list-style:none;display:flex;gap:14px;align-items:flex-start;padding:26px 22px;background:var(--bg);min-height:120px}
  .mode-beats b{font:900 15px/1 'Arial',sans-serif;color:var(--accent)}
  .mode-beats span{font-size:17px;font-weight:700;color:var(--text);line-height:1.5}

  @media(max-width:900px){
    .mode-featured{grid-template-columns:1fr}
    .mode-featured-art{aspect-ratio:16/12;max-height:420px}
    .modes-grid{grid-template-columns:repeat(2,1fr)}
    .mode-detail{grid-template-columns:1fr}
    .mode-detail-art{max-width:440px;margin-inline:auto}
    .mode-beats{grid-template-columns:1fr}
    .mode-beats li{min-height:0}
  }
  @media(max-width:640px){
    .modes-grid{grid-template-columns:1fr}
    .mode-card-art{aspect-ratio:16/11}
    .mode-detail-meta{grid-template-columns:repeat(2,1fr)}
    .mode-detail-meta>div:nth-child(2n){border-inline-end:0}
    .mode-detail-meta>div:nth-child(-n+2){border-bottom:1px solid var(--line)}
    .modes-store-link{flex-direction:column;align-items:flex-start}
    .mode-featured-copy .mode-premise{min-height:0}
  }
  @media(prefers-reduced-motion:reduce){
    .mode-card,.mode-featured-art,.mode-card-art .mode-cover-art,.mode-enter{transition:none}
  }

  /* ---- home page featured-modes band (dark) ---- */
  .home-modes{position:relative;padding:clamp(80px,12vh,140px) var(--pad);background:radial-gradient(84% 80% at 78% 8%,#141013,var(--bf-black) 62%)}
  .home-modes-head{max-width:var(--maxw);margin:0 auto clamp(34px,5vw,54px)}
  .home-modes-head h2{font-size:clamp(2.1rem,4vw,4rem);line-height:1;letter-spacing:-.025em;margin:14px 0 16px;text-wrap:balance}
  .home-modes-head p{color:var(--bf-muted);font-size:clamp(16px,1.3vw,19px);line-height:1.7;max-width:52ch;margin:0}
  .home-modes-rail{max-width:var(--maxw);margin:0 auto;display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
  .home-mode{position:relative;display:block;border-radius:var(--r-3);overflow:hidden;border:1px solid var(--line);background:var(--bf-charcoal);transition:transform var(--t-comp) var(--e-out),border-color var(--t-comp)}
  .home-mode:hover{transform:translateY(-6px);border-color:color-mix(in srgb,var(--accent) 55%,var(--line))}
  .home-mode-art{display:block;aspect-ratio:5/6;overflow:hidden}
  .home-mode-art .mode-cover-art{width:100%;height:100%;transition:transform var(--t-comp) var(--e-out)}
  .home-mode:hover .mode-cover-art{transform:scale(1.05)}
  .home-mode-cap{position:absolute;inset-block-end:0;inset-inline:0;display:grid;gap:3px;padding:16px 16px 14px;background:linear-gradient(transparent,rgba(8,8,8,.5) 34%,rgba(8,8,8,.92));text-align:start}
  .home-mode-cap .mode-flag{margin-bottom:6px;width:max-content;font-size:11px;padding:4px 9px}
  .home-mode-cap b{font-size:19px;color:var(--bf-white);letter-spacing:-.01em}
  .home-mode-cap small{font:900 10px/1 'Arial',sans-serif;letter-spacing:.16em;color:var(--bf-gray)}
  .home-modes-cta{max-width:var(--maxw);margin:clamp(30px,4vw,44px) auto 0;display:flex}
  @media(max-width:900px){.home-modes-rail{grid-template-columns:repeat(2,1fr)}}
  @media(max-width:560px){.home-modes-rail{grid-template-columns:1fr 1fr;gap:12px}.home-mode-cap b{font-size:16px}.home-modes-cta .btn{width:100%}}
  `}var ft="BACKFIRE";var ar="/og-backfire.png";var fa="demo@dass.local";function Qe(e){return e.replaceAll("دسّ",ft).replaceAll(fa,"demo@backfire.local")}var ha="/play?code=BF24X7",ir=["#b3202d","#7e151e","#8a4a2e","#5c5c60","#a3a3a5","#d24850"];function va(e){return ir[e%ir.length]??"#b3202d"}function G(e,t,r=""){return`<span class="p-av ${r}" style="--av:${va(t)}">${e}</span>`}var Ie={support:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20V7"/><path d="M6 13l6-6 6 6"/></svg>',attack:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v13"/><path d="M6 11l6 6 6-6"/></svg>',vault:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="5" width="16" height="14" rx="2.5"/><circle cx="12" cy="12" r="3.4"/><path d="M12 12v3.6"/></svg>'};function ba(e){return`<span class="gs-ring" style="--p:${e}"></span>`}function xa(e,t,r){return`<div class="scr scr-secret"><span class="scr-eyebrow">${e}</span><p class="scr-lead">${t}</p><div class="scr-seal"><span class="seal-mark"></span><span>${r}</span></div></div>`}function ya(e="round"){return e==="lobby"?`<div class="game-screen tv-lobby-screen" data-product-screen="tv-lobby">
      <header class="gs-hud"><span class="gs-brand">BACKFIRE</span><span class="gs-chip live">غرفة مفتوحة</span></header>
      <div class="lobby-body">
        <div class="lobby-qr">${Bt(ha,"#0d0d0e","#f1f0ec",2)}</div>
        <div class="lobby-join"><small>امسح الرمز من جوالك أو اكتبه</small><strong dir="ltr">BF24X7</strong><span class="lobby-count">٤ / ٨ جاهزين</span></div>
      </div>
      <div class="lobby-roster">${G("ي",0)}${G("ن",1)}${G("س",2)}${G("ر",3)}${G("٥",4,"ghost")}${G("٦",5,"ghost")}</div>
    </div>`:e==="reveal"?`<div class="game-screen tv-reveal-screen" data-product-screen="tv-reveal">
      <header class="gs-hud"><span class="gs-brand">BACKFIRE</span><span class="gs-phase">الكشف</span><span class="gs-round mono" dir="ltr">4 / 8</span></header>
      <div class="reveal-list">
        <article class="rv dassa">${G("ن",1)}<div class="rv-copy"><small>نورة وعدت أن تدعم يزيد</small><b>غيّرت قرارها في السر</b></div><em class="rv-tag dassa">دسّة</em></article>
        <article class="rv kept">${G("ي",0)}<div class="rv-copy"><small>يزيد ثبّت قراره</small><b>التزم بوعده للمجلس</b></div><em class="rv-tag kept">التزم</em></article>
      </div>
      <footer class="reveal-foot"><span>الأثر التالي</span><strong>المسار رجع إلى نورة</strong></footer>
    </div>`:e==="consequence"?`<div class="game-screen tv-conseq-screen" data-product-screen="tv-consequence">
      <header class="gs-hud"><span class="gs-brand">BACKFIRE</span><span class="gs-phase">النتيجة العامة</span><span class="gs-round mono" dir="ltr">4 / 8</span></header>
      <div class="conseq-body"><span class="conseq-eyebrow">تغيّر إيقاع الغرفة</span><h3>سقطت خزنة راكان،<br><em>وارتفع رصيد نورة.</em></h3></div>
      <div class="conseq-bars">
        <span class="cb up" style="--h:78%">${G("ن",1)}<i>+٦</i></span>
        <span class="cb up" style="--h:54%">${G("ي",0)}<i>+٢</i></span>
        <span class="cb flat" style="--h:40%">${G("س",2)}<i>٠</i></span>
        <span class="cb down" style="--h:22%">${G("ر",3)}<i>−٤</i></span>
      </div>
    </div>`:`<div class="game-screen tv-round-screen" data-product-screen="tv-round">
    <header class="gs-hud"><span class="gs-brand">BACKFIRE</span><span class="gs-phase">الإعلان</span><span class="gs-round mono" dir="ltr">3 / 8</span>${ba(.62)}</header>
    <div class="round-prompt"><small>أعلنوا نيّاتكم على جوالاتكم</small><strong class="round-count" dir="ltr">12</strong></div>
    <div class="round-floor">
      <span class="rf-col"><i class="rf-intent up">${Ie.support}</i><span class="rf-bar" style="--h:70%"></span>${G("ي",0)}</span>
      <span class="rf-col"><i class="rf-intent"></i><span class="rf-bar" style="--h:48%"></span>${G("ن",1)}</span>
      <span class="rf-col"><i class="rf-intent dn">${Ie.attack}</i><span class="rf-bar" style="--h:86%"></span>${G("ر",3)}</span>
      <span class="rf-col"><i class="rf-intent"></i><span class="rf-bar" style="--h:34%"></span>${G("س",2)}</span>
      <span class="rf-col wait"><i class="rf-intent">◌</i><span class="rf-bar" style="--h:58%"></span>${G("ح",4)}</span>
    </div>
  </div>`}function wa(e){let t={secret:"الجولة ٣",decision:"الإعلان",waiting:"قُفل",backfire:"الكشف",join:""};return t[e]?`<span class="app-chip">${t[e]}</span>`:'<span class="app-chip ghost">جوّالك</span>'}function ka(e){switch(e){case"secret":return xa("معلومة تخصّك وحدك","راكان يقدر يغيّر اتجاه القرار بعد ما تُقفلونه.","لا أحد غيرك يعرف هذا الآن");case"decision":return`<div class="scr scr-pick">
        <span class="scr-eyebrow">أعلن نيّتك</span>
        <div class="pick-acts"><span class="pa up on">${Ie.support}<b>دعم</b></span><span class="pa dn">${Ie.attack}<b>هجوم</b></span><span class="pa gd">${Ie.vault}<b>خزنة</b></span></div>
        <span class="pick-label">أدعم مين؟</span>
        <div class="pick-chips"><span class="pchip on">${G("ي",0,"sm")}يزيد</span><span class="pchip">${G("ر",3,"sm")}راكان</span><span class="pchip">${G("س",2,"sm")}سارة</span></div>
        <span class="scr-confirm">اقفل الفعل</span>
      </div>`;case"waiting":return`<div class="scr scr-wait"><span class="wait-seal">${Ie.vault}</span><p class="scr-lead">أقفلت فعلك</p><span class="scr-note">ارفع عينك للتلفاز</span><div class="wait-dots"><i class="on"></i><i class="on"></i><i></i><i class="on"></i></div></div>`;case"backfire":return'<div class="scr scr-result"><span class="scr-eyebrow warn">رجع عليك</span><span class="result-arrow" aria-hidden="true">↩</span><p class="scr-lead">المسار الذي عطّلته صار طريقك الوحيد.</p><span class="result-delta" dir="ltr">−4</span><span class="scr-note">الجولة القادمة تغيّرت</span></div>';case"join":return'<div class="scr scr-join"><span class="scr-eyebrow">انضمام</span><b class="scr-title">خشّ المجلس</b><span class="join-field mono" dir="ltr">BF24X7</span><span class="join-field ghost">اسمك</span><span class="scr-confirm">انضم</span></div>'}}function et(e,t,r="",a){return`<div class="phone-unit ${e} ${r}" data-product-screen="player-${e}">${t?`<span class="device-label">${t}</span>`:""}<div class="phone-shell">
    <span class="phone-island"></span><span class="phone-btn vol"></span><span class="phone-btn pow"></span>
    <div class="phone-screen">
      <div class="app-top"><span class="app-brand"><span class="app-mark"></span><b>BACKFIRE</b></span>${wa(e)}</div>
      <div class="app-body">${a??ka(e)}</div>
    </div>
    <span class="home-ind"></span>
  </div></div>`}function ht(e="round",t=""){return`<div class="tv-stage ${t}"><div class="tv-frame"><div class="tv-bezel">${ya(e)}<span class="tv-glare" aria-hidden="true"></span></div><span class="tv-led"></span></div><div class="tv-neck"></div><div class="tv-foot"></div></div>`}var $={black:"#080808",ink:"#0c0c0d",charcoal:"#151517",graphite:"#222226",lead:"#3a3a40",steel:"#66666d",gray:"#808088",muted:"#9a9a9f",paper:"#f0efea",paperShadow:"#d8d6d0",white:"#fafaf7",red:"#b72e38",redDark:"#811c25",redSoft:"#c8454d"};function vt(e){return`<circle cx="50" cy="62" r="26" fill="${e}"/><path d="M4 150 C4 110 27 96 50 96 C73 96 96 110 96 150 Z" fill="${e}"/>`}function tt(e,t,r,a){return`<g transform="translate(${e} ${t}) scale(${r})">${a}</g>`}function Ye(e,t,r,a,n,i=""){return`<rect x="${e}" y="${t}" width="${r}" height="${a}" fill="${n}"${i?" "+i:""}/>`}function $a(e,t={}){let r=t.hr??24,a=t.hx??50,n=t.hy??62,i=t.sw??92,s=t.rise??0,d=t.neck??98,p=50-i/2,E=50+i/2,N=`M${p} 152 C${p} ${d+24+s} ${p+20} ${d+s} ${a} ${d} C${E-20} ${d-s} ${E} ${d+24-s} ${E} 152 Z`;return`<circle cx="${a}" cy="${n}" r="${r}" fill="${e}"/><path d="${N}" fill="${e}"/>`}function te(e,t,r,a,n={}){return tt(e,t,r,$a(a,n))}function Ge(e,t,r,a,n,i=""){let p=i?`<ellipse cx="0" cy="0" rx="40" ry="58" fill="${n}" opacity=".22" filter="url(#${i})"/>`:"";return`<g transform="translate(${e} ${t}) rotate(${a}) scale(${r})">${p}<rect x="${-30/2}" y="${-60/2}" width="30" height="60" rx="6" fill="${$.charcoal}" stroke="${$.lead}" stroke-width="1.4"/><rect x="${-30/2+3.5}" y="${-60/2+6}" width="23" height="48" rx="3" fill="${n}"/></g>`}function Ea(e,t,r,a){return[[0,0],[1,0],[2,0],[0,1],[2,1],[0,2],[1,2],[2,2],[4,0],[4,2],[1,4],[3,4],[4,4],[0,4]].map(([i,s])=>Ye(e+i*r,t+s*r,r*.8,r*.8,a,'opacity=".8"')).join("")}function nr(){return`<svg class="scene hero-scene" viewBox="0 0 1000 620" preserveAspectRatio="xMidYMid meet" role="img" aria-label="غرفة معيشة: خمسة أشخاص حول تلفزيون واحد مضاء، كل واحد يمسك جوالًا، وخط أحمر يخرج من جوال إلى الشاشة ثم يعود كعاقبة نحو صاحبه">
    <defs>
      <radialGradient id="hero-glow" cx="50%" cy="34%" r="60%"><stop offset="0" stop-color="${$.red}" stop-opacity=".22"/><stop offset="1" stop-color="${$.red}" stop-opacity="0"/></radialGradient>
      <linearGradient id="hero-screen" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${$.graphite}"/><stop offset="1" stop-color="${$.black}"/></linearGradient>
      <filter id="hero-soft" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="9"/></filter>
      <filter id="hero-sh" x="-25%" y="-25%" width="150%" height="160%"><feDropShadow dx="0" dy="14" stdDeviation="12" flood-color="#000" flood-opacity=".5"/></filter>
      <clipPath id="hero-tv"><rect x="330" y="84" width="340" height="196" rx="6"/></clipPath>
    </defs>
    <!-- ambient light thrown by the TV -->
    <ellipse cx="500" cy="220" rx="380" ry="250" fill="url(#hero-glow)"/>
    <!-- TV: the one shared screen -->
    <rect x="486" y="290" width="28" height="34" fill="${$.graphite}"/>
    <ellipse cx="500" cy="330" rx="78" ry="12" fill="${$.ink}"/>
    <g filter="url(#hero-sh)"><rect x="314" y="70" width="372" height="224" rx="12" fill="${$.charcoal}" stroke="${$.lead}" stroke-width="2"/></g>
    <rect x="330" y="84" width="340" height="196" rx="6" fill="url(#hero-screen)"/>
    <g clip-path="url(#hero-tv)">
      <line x1="330" y1="214" x2="670" y2="214" stroke="${$.steel}" stroke-width="1.4" opacity=".3"/>
      ${te(392,118,.74,$.steel,{hx:54,sw:96})}
      ${te(488,128,.66,$.lead,{hx:44,sw:92})}
      <rect x="470" y="196" width="40" height="22" rx="2" fill="${$.red}" transform="rotate(-8 490 207)"/>
      <circle cx="352" cy="106" r="5" fill="${$.red}"/>
      <rect x="364" y="102" width="26" height="7" rx="2" fill="${$.steel}" opacity=".7"/>
      <rect x="396" y="102" width="16" height="7" rx="2" fill="${$.steel}" opacity=".5"/>
      ${Ea(600,224,9,$.muted)}
    </g>
    <!-- the gathered players, seen from behind, facing the TV -->
    ${te(150,300,1.3,$.lead,{hx:52,sw:88,hr:22})}
    ${te(770,300,1.3,$.lead,{hx:48,sw:88,hr:22})}
    ${te(300,336,1.5,$.steel,{sw:96})}
    ${te(625,336,1.5,$.steel,{hx:54,sw:96})}
    ${te(417,356,1.66,$.muted,{sw:100})}
    <!-- every phone throws a faint decision line up to the shared screen -->
    <g stroke="${$.steel}" stroke-width="1.4" fill="none" opacity=".32" stroke-linecap="round">
      <path d="M240 452 C 340 380 430 320 496 290"/>
      <path d="M362 500 C 410 420 460 340 500 292"/>
      <path d="M640 500 C 592 420 542 340 504 292"/>
      <path d="M760 452 C 660 380 570 320 504 290"/>
    </g>
    <!-- the five phones; the central one is the live red decision -->
    ${Ge(240,466,.62,-14,$.muted)}
    ${Ge(362,516,.8,-8,$.muted)}
    ${Ge(640,516,.8,9,$.muted)}
    ${Ge(760,466,.62,13,$.muted)}
    ${Ge(500,552,.98,0,$.red,"hero-soft")}
    <!-- the Return Line: the red decision rises to the TV, then the consequence loops back onto its sender -->
    <path class="cs-shadow" d="M500 524 C 494 452 500 372 500 300 C 500 250 612 246 606 336 C 600 408 546 440 508 452" fill="none" stroke="${$.graphite}" stroke-width="8" stroke-linecap="round" transform="translate(9 12)"/>
    <path class="return-line rl-draw" pathLength="1" d="M500 524 C 494 452 500 372 500 300 C 500 250 612 246 606 336 C 600 408 546 440 508 452" fill="none" stroke="${$.red}" stroke-width="2.6" stroke-linecap="round"/>
    <circle class="rl-src" cx="500" cy="524" r="6" fill="${$.redSoft}"/>
    <path class="rl-head" d="M508 452 l16 -10 4 20z" fill="${$.red}"/>
  </svg>`}function or(){let e=te(-8,44,2.9,$.steel,{hx:58,sw:98})+te(360,96,2.6,$.lead,{hx:42,sw:92})+Ye(20,456,620,16,$.lead)+Ye(150,402,96,54,$.muted)+Ye(300,406,84,50,$.steel)+Ye(472,300,66,74,$.red),t=[{id:"a",x:48,y:150,w:150,h:250,head:118},{id:"b",x:250,y:250,w:150,h:250,head:220},{id:"c",x:452,y:168,w:150,h:250,head:136}],r=a=>`
    ${te(a.x+a.w/2-42,a.head-26,.84,$.graphite,{sw:96})}
    <rect x="${a.x-9}" y="${a.y-9}" width="${a.w+18}" height="${a.h+18}" rx="15" fill="${$.ink}" stroke="${$.lead}" stroke-width="1.6"/>
    <rect x="${a.x}" y="${a.y}" width="${a.w}" height="${a.h}" rx="6" fill="${$.black}"/>
    <clipPath id="frag-${a.id}"><rect x="${a.x}" y="${a.y}" width="${a.w}" height="${a.h}" rx="6"/></clipPath>
    <g clip-path="url(#frag-${a.id})">${e}</g>
    <rect x="${a.x}" y="${a.y}" width="${a.w}" height="${a.h}" rx="6" fill="none" stroke="${$.steel}" stroke-width="1" opacity=".55"/>
    <rect x="${a.x+a.w/2-15}" y="${a.y-5}" width="30" height="3.4" rx="1.7" fill="${$.lead}"/>`;return`<svg class="scene incomplete-scene" viewBox="0 0 660 560" preserveAspectRatio="xMidYMid meet" role="img" aria-label="مشهد واحد كامل مخفيّ في الخلفية، وأجزاؤه موزّعة على ثلاثة جوالات يمسكها ثلاثة لاعبين، بينها فجوات مظلمة، ولا أحد يرى الصورة كاملة">
    <defs>
      <filter id="inc-sh" x="-15%" y="-15%" width="130%" height="140%"><feDropShadow dx="0" dy="9" stdDeviation="7" flood-color="#0c0c0d" flood-opacity=".34"/></filter>
    </defs>
    <rect width="660" height="560" fill="${$.black}"/>
    <!-- the whole truth, present but unlit -->
    <g opacity=".12">${e}</g>
    <g filter="url(#inc-sh)">${t.map(r).join("")}</g>
    <!-- the picture line that the fragments never fully rebuild -->
    <path d="M52 500 L 240 500" stroke="${$.lead}" stroke-width="2" stroke-dasharray="4 8" opacity=".5"/>
    <path d="M266 500 L 442 500" stroke="${$.lead}" stroke-width="2" stroke-dasharray="4 8" opacity=".5"/>
    <path d="M468 500 L 610 500" stroke="${$.red}" stroke-width="2.4"/>
  </svg>`}function sr(){let e={x:150,y:214,s:1.62},t=e.x+50*e.s;return`<svg class="scene private-scene" viewBox="0 0 640 520" preserveAspectRatio="xMidYMid meet" role="img" aria-label="مجموعة لاعبين مربوطين بخيوط رمادية متساوية، جوال أحدهم يضيء بالأحمر بمعلومة خاصة، فيتقدّم عن الصف ويرسم خطًّا أحمر جديدًا نحو لاعب آخر بينما ينقطع خيطه القديم">
    <defs>
      <filter id="pv-soft" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="8"/></filter>
    </defs>
    <rect x="30" y="452" width="580" height="20" fill="${$.ink}"/>
    <!-- the public, neutral group -->
    ${te(46,250,1.12,$.steel,{sw:92})}
    ${te(300,246,1.16,$.steel,{hx:52,sw:94,rise:4})}
    ${te(430,252,1.12,$.steel,{sw:90})}
    ${te(552,258,1.02,$.lead,{sw:84,rise:-6})}
    <!-- the even ties everyone shares -->
    <g stroke="${$.steel}" stroke-width="1.6" fill="none" opacity=".4" stroke-linecap="round">
      <path d="M103 300 C 180 268 250 268 358 300"/>
      <path d="M486 300 C 520 288 560 288 603 306"/>
    </g>
    <!-- the old tie from the knower to their neighbour — now snapped -->
    <path d="M${t} 300 C 300 262 340 262 358 300" fill="none" stroke="${$.lead}" stroke-width="1.6" stroke-dasharray="5 9" opacity=".45"/>
    <!-- the knower steps forward, brighter -->
    ${te(e.x,e.y,e.s,$.muted,{hx:52,sw:96})}
    <!-- the private red info, on their phone only -->
    <ellipse class="pv-secret" cx="${t+40}" cy="360" rx="34" ry="46" fill="${$.red}" opacity=".2" filter="url(#pv-soft)"/>
    ${Ma(t+40,360)}
    <!-- the new intent the knowledge creates: a red line redrawn across the group -->
    <path class="rl-draw" pathLength="1" d="M${t+40} 348 C 360 300 470 300 560 320" fill="none" stroke="${$.red}" stroke-width="2.6" stroke-linecap="round"/>
    <path class="rl-head" d="M560 320 l-18 -6 4 20z" fill="${$.red}"/>
    <circle class="rl-src" cx="${t+40}" cy="348" r="5" fill="${$.redSoft}"/>
  </svg>`}function Ma(e,t){return`<g transform="translate(${e} ${t}) rotate(-8)"><rect x="-19" y="-38" width="38" height="76" rx="7" fill="${$.charcoal}" stroke="${$.lead}" stroke-width="1.6"/><rect class="pv-secret" x="-14" y="-31" width="28" height="62" rx="3" fill="${$.red}"/><rect class="pv-secret" x="-8" y="-18" width="16" height="6" rx="2" fill="${$.white}" opacity=".85"/><rect class="pv-secret" x="-8" y="-6" width="24" height="5" rx="2" fill="${$.white}" opacity=".6"/></g>`}function lr(){return`<svg class="scene consequence-scene" viewBox="0 0 1000 580" preserveAspectRatio="xMidYMid meet" role="img" aria-label="ظل يمثل صاحب القرار، خط أحمر يخرج منه ويضرب شخصًا آخر، ثم يعود ليقع عليه كظل أثقل ومنحرف">
    ${tt(70,214,2.02,vt($.graphite))}
    ${tt(120,250,1.78,vt($.steel))}
    <rect x="150" y="262" width="42" height="8" rx="1" fill="${$.paper}" opacity=".85"/>
    ${tt(560,300,1.5,vt($.lead))}
    <circle class="cs-impact" cx="632" cy="392" r="12" fill="${$.red}"/>
    <path class="cs-shadow" d="M250 358 C 420 316 520 340 632 392 C 770 456 856 356 762 300 C 700 264 560 300 250 452" fill="none" stroke="${$.graphite}" stroke-width="12" stroke-linecap="round" transform="translate(14 16)"/>
    <path class="cs-line rl-draw" pathLength="1" d="M250 358 C 420 316 520 340 632 392 C 770 456 856 356 762 300 C 700 264 560 300 250 452" fill="none" stroke="${$.red}" stroke-width="2.8" stroke-linecap="round"/>
    <path class="cs-return" d="M300 430 C 270 442 250 448 234 452" fill="none" stroke="${$.red}" stroke-width="5.4" stroke-linecap="round"/>
    <circle class="cs-src" cx="250" cy="358" r="8" fill="${$.redSoft}"/>
    <path class="cs-head" d="M234 452 l30 -20 3 32z" fill="${$.red}"/>
  </svg>`}function dr(){return`<svg class="scene final-scene" viewBox="0 0 900 520" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
    <path class="fs-shadow" d="M452 120 C 690 120 760 300 620 400 C 470 508 250 470 220 320 C 196 200 320 150 470 176" fill="none" stroke="${$.graphite}" stroke-width="12" stroke-linecap="round" transform="translate(14 16)"/>
    <path class="fs-line rl-draw" pathLength="1" d="M450 108 C 690 108 762 292 620 392 C 466 502 244 462 216 312 C 194 196 322 142 470 168" fill="none" stroke="${$.red}" stroke-width="3" stroke-linecap="round"/>
    <circle cx="450" cy="108" r="7" fill="${$.redSoft}"/>
    <path class="fs-head" d="M470 168 l-30 -14 2 30z" fill="${$.red}"/>
  </svg>`}var cr=String.raw`
:root[data-site-theme="backfire"]{
  color-scheme:dark;
  /* Editorial-noir palette: black / graphite / paper, with a single controlled red. */
  --bf-black:#080808;--bf-ink:#0c0c0d;--bf-charcoal:#151517;--bf-graphite:#222226;--bf-lead:#3a3a40;--bf-steel:#66666d;--bf-gray:#7c7c83;--bf-muted:#9a9a9f;--bf-paper:#f0efea;--bf-paper-shadow:#d8d6d0;--bf-white:#fafaf7;--bf-red:#b72e38;--bf-red-dark:#811c25;--bf-red-soft:#c8454d;--bf-ink-2:#404046;
  --maxw:1440px;--pad:clamp(20px,5vw,84px);
  --space-3:.75rem;--space-4:1rem;--space-5:1.5rem;--space-6:2rem;--space-7:3rem;--space-8:4.5rem;--space-9:6rem;
  --e-out:cubic-bezier(.22,1,.36,1);--t-fast:200ms;--t-micro:180ms;--t-instant:120ms;--t-comp:520ms;
  --line:rgba(250,250,247,.12);--line-2:rgba(250,250,247,.2);--line-3:rgba(250,250,247,.28);
  --shadow:0 30px 90px rgba(0,0,0,.6);--shadow-1:0 14px 40px rgba(0,0,0,.5);
  /* compatibility map for the commercial product/store pages (kept dark, neutral, warm-red accent) */
  --bg:var(--bf-black);--bg-1:var(--bf-ink);--surface:var(--bf-charcoal);--surface-2:var(--bf-graphite);--surface-3:#2c2c30;--text:var(--bf-white);--text-2:var(--bf-muted);--muted:var(--bf-gray);--warm:var(--bf-white);--warm-2:#d7d6d2;--crimson:var(--bf-red-dark);--wine:#1a1013;--red:var(--bf-red);--red-hot:var(--bf-red-soft);--ember:var(--bf-red-soft);--gold:var(--bf-red);--violet:var(--bf-red);--cyan:var(--bf-red-soft);--green:var(--bf-muted);--accent:var(--bf-red);
  --z-content:2;--r-2:8px;--r-3:12px;--r-pill:999px;--fs-h1:clamp(40px,6vw,74px);--fs-h2:clamp(28px,4vw,46px);--fs-h3:19px;
}
*{box-sizing:border-box}
[hidden]{display:none!important}
html{background:var(--bf-black);scroll-behavior:smooth;scrollbar-color:var(--bf-lead) var(--bf-black)}
body.backfire-site{margin:0;min-width:320px;background:var(--bf-black);color:var(--bf-white);font-family:'Tajawal','Segoe UI',Tahoma,sans-serif;overflow-x:hidden;-webkit-font-smoothing:antialiased}
/* One quiet film-grain layer across the whole page, blended so it reads on paper and black alike. */
body.backfire-site::after{content:'';position:fixed;inset:0;z-index:120;pointer-events:none;opacity:.05;mix-blend-mode:overlay;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E")}
.backfire-site a,.backfire-site button,.backfire-site input{font:inherit;color:inherit}
.backfire-site a{cursor:pointer;text-decoration:none}
.backfire-site a,.backfire-site button{touch-action:manipulation}
.backfire-site ::selection{background:var(--bf-red);color:var(--bf-white)}
:focus-visible{outline:2px solid var(--bf-red-soft);outline-offset:3px}
img,svg{max-width:100%}
em{font-style:normal;color:var(--bf-red)}

.scene{display:block;width:100%;height:100%}
[data-reveal]{opacity:0;transform:translateY(22px);transition:opacity .8s var(--e-out),transform .8s var(--e-out)}
[data-reveal].revealed{opacity:1;transform:none}
.rl-draw{stroke-dasharray:1;stroke-dashoffset:1;transition:stroke-dashoffset 1.15s var(--e-out) .15s}
.revealed .rl-draw{stroke-dashoffset:0}
.rl-head,.cs-head,.cs-return,.fs-head,.rl-src,.cs-src,.cs-impact{opacity:0;transition:opacity .5s var(--e-out) .9s}
.revealed .rl-head,.revealed .cs-head,.revealed .cs-return,.revealed .fs-head,.revealed .rl-src,.revealed .cs-src,.revealed .cs-impact{opacity:1}
.pv-secret{opacity:0;transition:opacity .55s var(--e-out) .45s}.revealed .pv-secret{opacity:1}

.skip-link{position:fixed;z-index:1000;inset-block-start:10px;inset-inline-start:10px;transform:translateY(-160%);background:var(--bf-white);color:var(--bf-black);padding:10px 14px;border-radius:4px;font-weight:800}
.skip-link:focus{transform:none}

/* ---------------- header ---------------- */
.site-head{position:fixed;z-index:60;inset-block-start:0;inset-inline:0;height:74px;display:flex;align-items:center;justify-content:space-between;gap:20px;padding-inline:var(--pad);transition:background var(--t-fast),border-color var(--t-fast),height var(--t-fast);border-block-end:1px solid transparent}
.site-head.scrolled{height:64px;background:rgba(8,8,8,.86);backdrop-filter:blur(10px);border-block-end-color:var(--line)}
.bf-word{display:inline-block;font:900 clamp(1.35rem,2vw,1.7rem)/1 'Arial Black','Segoe UI',sans-serif;letter-spacing:.03em;color:var(--bf-white);direction:ltr}
.head-nav{display:flex;align-items:center;gap:clamp(14px,2vw,28px)}
.head-nav a{font-size:14px;font-weight:700;color:var(--bf-muted)}
.head-nav a:hover{color:var(--bf-white)}
.head-actions{display:flex;align-items:center;gap:10px}.nav-logo{display:inline-flex;align-items:center;align-self:stretch}
.head-cta{display:inline-flex;align-items:center;height:42px;padding-inline:18px;background:var(--bf-red);color:var(--bf-white);font-weight:800;border-radius:4px;font-size:14px}
.head-cta:hover{background:var(--bf-red-soft)}
.head-menu{display:none;width:44px;height:44px;border:1px solid var(--line-2);background:transparent;border-radius:4px;place-items:center;cursor:pointer}
.head-menu span{position:absolute;width:18px;height:2px;background:var(--bf-white);transition:.2s}
.head-menu span:first-child{transform:translateY(-4px)}.head-menu span:last-child{transform:translateY(4px)}
.menu-open .head-menu span:first-child{transform:rotate(45deg)}.menu-open .head-menu span:last-child{transform:rotate(-45deg)}
.mobile-panel{position:fixed;z-index:59;inset-block-start:64px;inset-inline:12px;padding:8px;background:rgba(13,13,14,.98);border:1px solid var(--line-2);border-radius:8px}
.mobile-panel a{display:block;padding:15px;color:var(--bf-white);font-weight:700;border-block-end:1px solid var(--line)}
.mobile-panel a:last-child{border:0}

/* ---------------- buttons ---------------- */
.btn{position:relative;display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:50px;padding-inline:24px;border:1px solid transparent;border-radius:5px;font-weight:800;cursor:pointer;transition:transform var(--t-micro) var(--e-out),background var(--t-micro),border-color var(--t-micro),color var(--t-micro)}
.btn.lg{min-height:56px;padding-inline:30px;font-size:16px}
.btn.wide{width:100%}
.btn.primary{background:var(--bf-red);color:var(--bf-white)}
.btn.primary:hover{background:var(--bf-red-soft);transform:translateY(-2px)}
.btn.ghost{background:transparent;border-color:var(--line-3);color:var(--bf-white)}
.btn.ghost:hover{border-color:var(--bf-white);transform:translateY(-2px)}
.on-paper .btn.ghost{border-color:rgba(13,13,14,.28);color:var(--bf-ink)}
.on-paper .btn.ghost:hover{border-color:var(--bf-ink)}
.btn[disabled]{opacity:.55;cursor:wait;transform:none}
.text-link{color:var(--bf-red-soft);font-weight:700;text-underline-offset:5px}
.on-paper .text-link{color:var(--bf-red)}

/* ---------------- section scaffolding + tonal rhythm ---------------- */
.eyebrow{display:inline-flex;align-items:center;gap:10px;font-size:13px;font-weight:800;letter-spacing:.04em;color:var(--bf-red-soft);text-transform:uppercase}
.eyebrow::before{content:'';width:26px;height:2px;background:currentColor}
.on-paper .eyebrow{color:var(--bf-red)}
.sec-index{font:800 12px/1 'Arial',sans-serif;letter-spacing:.14em;color:var(--bf-gray)}
.poster{position:relative;min-height:clamp(560px,84svh,880px);display:grid;align-items:center;padding-block:clamp(80px,12vh,148px);padding-inline:var(--pad)}
.poster-inner{width:100%;max-width:var(--maxw);margin-inline:auto;display:grid;gap:clamp(28px,5vw,80px);align-items:center}
.poster h2{font-size:clamp(2.2rem,4.2vw,4.8rem);line-height:1;letter-spacing:-.025em;margin:14px 0 18px;text-wrap:balance}
.poster p{font-size:clamp(17px,1.35vw,21px);line-height:1.7;max-width:34ch;margin:0}
.on-dark{color:var(--bf-white)}.on-dark p{color:var(--bf-muted)}
.on-paper{color:var(--bf-ink)}.on-paper p{color:var(--bf-lead)}
.on-paper .sec-index{color:var(--bf-gray)}

/* hero */
.hero-noir{position:relative;min-height:100svh;overflow:hidden;background:radial-gradient(130% 100% at 50% 8%,#141416,var(--bf-black) 60%);display:flex;align-items:flex-start}
.hero-inner{position:relative;z-index:2;width:100%;max-width:var(--maxw);margin-inline:auto;padding:clamp(110px,14vh,172px) var(--pad) 0}
.hero-copy{max-width:min(620px,92%)}
.hero-noir h1{font-size:clamp(3rem,6vw,6.4rem);line-height:.98;letter-spacing:-.035em;margin:18px 0 20px;text-wrap:balance}
.hero-lead{font-size:clamp(17px,1.35vw,21px);line-height:1.7;color:var(--bf-muted);max-width:34ch;margin:0}
.hero-cta{display:flex;gap:12px;flex-wrap:wrap;margin-block-start:30px}
.hero-note{display:flex;align-items:center;gap:9px;margin-block-start:22px;color:var(--bf-gray);font-size:12px}
.hero-note i{width:7px;height:7px;border-radius:50%;background:var(--bf-red);flex:0 0 auto}
.hero-facts{display:flex;flex-wrap:wrap;align-items:center;gap:9px 18px;list-style:none;margin:20px 0 0;padding:0;color:var(--bf-muted);font-size:13px;font-weight:700}
.hero-facts li{display:inline-flex;align-items:center;gap:8px}
.hero-facts li::before{content:'';width:5px;height:5px;background:var(--bf-red);transform:rotate(45deg);flex:0 0 auto}
.hero-art{position:absolute;z-index:1;left:calc(var(--pad) - 10px);bottom:8%;width:min(52%,880px)}
.hero-art .hero-scene{width:100%;height:auto;display:block}
.scroll-cue{position:absolute;z-index:2;inset-block-end:22px;inset-inline-start:50%;transform:translateX(-50%);display:grid;justify-items:center;gap:6px;color:var(--bf-gray);font-size:10px}
.scroll-cue i{width:1px;height:26px;background:linear-gradient(var(--bf-red),transparent)}

/* Poster 01 — incomplete picture: a paper editorial panel framed by a dark section,
   so the jump from black is a bridge, not a wall. A red seam carries the eye across. */
.poster-incomplete{position:relative;background:var(--bf-charcoal)}
.poster-incomplete .poster-inner{grid-template-columns:1.05fr .95fr;background:var(--bf-paper);color:var(--bf-ink);padding:clamp(34px,4.4vw,70px);box-shadow:0 46px 100px rgba(0,0,0,.5)}
.poster-incomplete .poster-art{order:-1}
.on-paper .sec-index{color:#6a6a70}
.incomplete-scene{aspect-ratio:660/560;filter:drop-shadow(0 14px 30px rgba(0,0,0,.16))}

/* Poster 02 — private knowledge (graphite) */
.poster-private{background:var(--bf-graphite)}
.poster-private .poster-inner{grid-template-columns:.92fr 1.08fr}
.private-scene{aspect-ratio:640/520}

/* Social tension — one editorial, typographic beat: a statement + a wall of overheard accusations. No cards, no chat UI. */
.social-noir{position:relative;min-height:clamp(520px,76svh,800px);display:grid;align-items:center;padding:clamp(80px,12vh,146px) var(--pad);background:radial-gradient(78% 72% at 28% 42%,#150a0c,var(--bf-black) 60%)}
.social-inner{width:100%;max-width:var(--maxw);margin-inline:auto;display:grid;grid-template-columns:1.02fr .98fr;gap:clamp(28px,5vw,66px);align-items:center}
.social-copy{max-width:22ch}
.social-head{font-size:clamp(2.2rem,4.4vw,4.8rem);line-height:1;letter-spacing:-.025em;margin:14px 0 18px;text-wrap:balance}
.social-note{color:var(--bf-muted);font-size:clamp(15px,1.2vw,18px);line-height:1.7;max-width:44ch;margin:0}
.social-lines{position:relative;height:clamp(300px,44vh,430px)}
.sl{position:absolute;white-space:nowrap;font-weight:900;color:var(--bf-white);letter-spacing:-.01em}
.sl-1{top:3%;inset-inline-end:2%;font-size:clamp(19px,2.4vw,32px);transform:rotate(-2deg)}
.sl-2{top:31%;inset-inline-start:0;font-size:clamp(16px,1.9vw,25px);color:var(--bf-muted);transform:rotate(1deg)}
.sl-3{top:55%;inset-inline-end:5%;font-size:clamp(17px,2.1vw,27px);transform:rotate(-1deg)}
.sl-4{bottom:2%;inset-inline-start:3%;font-size:clamp(22px,2.9vw,40px);color:var(--bf-red-soft);transform:rotate(2deg)}

/* Consequence (black, the red event) */
.poster-consequence{background:radial-gradient(88% 78% at 60% 52%,#160a0c,var(--bf-black) 62%)}
.poster-consequence .poster-inner{grid-template-columns:.94fr 1.06fr}
.poster-consequence h2{font-size:clamp(2.3rem,4vw,4.5rem)}
.consequence-scene{aspect-ratio:1000/580}

/* ---------------- product reality (paper) — the only devices on the site ---------------- */
.product-noir{background:var(--bf-paper);color:var(--bf-ink);padding-block:clamp(84px,13vh,150px);padding-inline:var(--pad)}
.product-inner{width:100%;max-width:var(--maxw);margin-inline:auto}
.product-head{max-width:min(620px,92%);margin-bottom:clamp(38px,5vw,62px)}
.product-head h2{font-size:clamp(2.2rem,4vw,4.4rem);line-height:1;letter-spacing:-.025em;margin:14px 0 16px}
.product-head p{font-size:clamp(17px,1.3vw,20px);line-height:1.7;color:var(--bf-lead);margin:0;max-width:46ch}
.product-stage{display:grid;grid-template-columns:1.55fr 1fr;gap:clamp(30px,4vw,64px);align-items:center;max-width:1180px}
.stage-tv{position:relative}
.stage-tv figcaption,.stage-phones figcaption{margin-block-start:16px;display:flex;gap:9px;align-items:baseline;color:var(--bf-lead);font-size:14px}
.stage-tv figcaption b,.stage-phones figcaption b{color:var(--bf-ink);font-weight:800}
.stage-phones{display:grid;grid-template-columns:1fr 1fr;gap:clamp(16px,2vw,28px);align-items:center}
.stage-phones .phone-unit{width:100%}
.product-steps{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;margin:clamp(40px,6vw,68px) 0 0;padding:0;list-style:none;background:rgba(13,13,14,.14)}
.product-steps li{list-style:none;display:flex;align-items:baseline;gap:14px;padding:26px 8px;background:var(--bf-paper)}
.product-steps b{font:800 15px/1 'Arial',sans-serif;color:var(--bf-red)}
.product-steps span{font-size:clamp(17px,1.6vw,20px);font-weight:700;color:var(--bf-ink)}

/* ---------------- final CTA (black) ---------------- */
.final-noir{position:relative;min-height:clamp(560px,80svh,820px);display:grid;place-items:center;overflow:hidden;padding:clamp(90px,12vh,150px) var(--pad);text-align:center;background:radial-gradient(80% 70% at 50% 46%,#140a0c,var(--bf-black) 60%)}
.final-art{position:absolute;z-index:0;inset:0;display:grid;place-items:center;opacity:.9}
.final-art .final-scene{width:min(760px,92%)}
.final-inner{position:relative;z-index:2;display:grid;justify-items:center;gap:22px}
.final-noir h2{font-size:clamp(2.6rem,6vw,6rem);line-height:.98;letter-spacing:-.035em;margin:0;text-wrap:balance}
.final-noir p{color:var(--bf-muted);font-size:18px;margin:0}

/* ---------------- footer ---------------- */
.foot-noir{background:var(--bf-black);border-block-start:1px solid var(--line);padding:clamp(46px,7vw,72px) var(--pad) 26px}
.foot-inner{max-width:var(--maxw);margin-inline:auto;display:flex;flex-wrap:wrap;gap:24px 60px;align-items:flex-start;justify-content:space-between}
.foot-brand{display:grid;gap:8px;max-width:34ch}
.foot-brand p{color:var(--bf-gray);font-size:13px;line-height:1.6;margin:0}
.foot-links{display:flex;gap:44px;flex-wrap:wrap}
.foot-links div{display:grid;gap:11px}
.foot-links b{color:var(--bf-muted);font-size:12px;letter-spacing:.06em}
.foot-links a{color:var(--bf-gray);font-size:14px}
.foot-links a:hover{color:var(--bf-white)}
.foot-cap{max-width:var(--maxw);margin:36px auto 0;padding-block-start:20px;border-block-start:1px solid var(--line);display:flex;justify-content:space-between;gap:12px;color:#5a5a5e;font-size:12px}

/* ---------------- entry pages: create / join ---------------- */
.door{min-height:100svh;display:grid;grid-template-columns:minmax(0,1fr) minmax(360px,.82fr);background:var(--bf-black)}
.door-form{display:flex;flex-direction:column;justify-content:center;gap:6px;padding:clamp(110px,14vh,150px) var(--pad) 60px}
.door-form .eyebrow{margin-bottom:8px}
.door-form h1{font-size:clamp(2.4rem,4.6vw,4.4rem);line-height:1;letter-spacing:-.03em;margin:0 0 14px}
.door-form>p{color:var(--bf-muted);font-size:17px;line-height:1.7;max-width:40ch;margin:0 0 26px}
.field{display:grid;gap:8px;margin-bottom:16px}
.field span{font-size:13px;font-weight:700;color:var(--bf-muted)}
.input{width:100%;min-height:54px;padding:13px 15px;border:1px solid var(--line-2);border-radius:5px;background:var(--bf-ink);color:var(--bf-white);outline:none;transition:border-color var(--t-micro),box-shadow var(--t-micro)}
.input:focus{border-color:var(--bf-red);box-shadow:0 0 0 3px rgba(179,32,45,.22)}
.input.err{border-color:var(--bf-red-soft)}
.input.mono{direction:ltr;text-align:center;font-family:ui-monospace,monospace;letter-spacing:.16em;font-weight:800}
.door-specs{display:flex;gap:26px;margin:6px 0 24px}
.door-specs span{display:grid;gap:3px;font-size:12px;color:var(--bf-gray)}
.door-specs b{font-size:15px;color:var(--bf-white);font-weight:800}
.j-err{min-height:20px;color:var(--bf-red-soft);font-size:13px;font-weight:700}
.door-form .text-link{margin-block-start:20px}
.door-aside{position:relative;overflow:hidden;display:grid;place-items:center;padding:60px;background:var(--bf-graphite)}
.door-aside .scene{width:min(88%,420px)}
.door-caption{position:absolute;inset-block-end:8%;inset-inline:8%;display:grid;gap:5px}
.door-caption span{color:var(--bf-red-soft);font-size:12px;font-weight:800}
.door-caption b{font-size:clamp(18px,2.4vw,30px);color:var(--bf-white);max-width:20ch}
.spinner{width:17px;height:17px;border:2px solid rgba(255,255,255,.35);border-block-start-color:#fff;border-radius:50%;animation:spin .7s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}

/* create scene uses the product TV; join scene uses a private phone */
.door-aside .tv-stage{width:100%}
.door-aside .phone-unit{width:min(62%,230px)}

/* ---------------- how to play ---------------- */
.how-noir{background:var(--bf-black)}
.how-hero{min-height:64svh;display:grid;align-content:center;gap:12px;padding:clamp(118px,16vh,180px) var(--pad) clamp(50px,7vh,80px);max-width:var(--maxw);margin-inline:auto}
.how-hero h1{font-size:clamp(2.6rem,5.4vw,5rem);line-height:1;letter-spacing:-.03em;margin:0;max-width:16ch}
.how-hero p{color:var(--bf-muted);font-size:18px;line-height:1.7;max-width:48ch;margin:6px 0 0}
.how-steps{max-width:var(--maxw);margin-inline:auto;padding:0 var(--pad) clamp(70px,10vh,120px);display:grid;gap:1px;background:var(--line)}
.how-step{display:grid;grid-template-columns:88px 1fr auto;gap:clamp(16px,3vw,44px);align-items:center;padding:clamp(26px,4vw,44px) 4px;background:var(--bf-black)}
.how-step .n{font:800 clamp(28px,4vw,52px)/1 'Arial',sans-serif;color:var(--bf-red)}
.how-step h3{font-size:clamp(20px,2.4vw,28px);margin:0 0 6px}
.how-step p{color:var(--bf-muted);font-size:16px;line-height:1.6;margin:0;max-width:48ch}
.how-step .step-art{width:120px;height:78px}
.how-cta{max-width:var(--maxw);margin:0 auto;padding:0 var(--pad) clamp(80px,12vh,130px);display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:22px}
.how-cta h2{font-size:clamp(2rem,4vw,3.4rem);margin:0;letter-spacing:-.02em}
/* how-to-play: what you need */
.how-needs{max-width:var(--maxw);margin:0 auto;padding:0 var(--pad) clamp(50px,7vh,86px);display:grid;grid-template-columns:.9fr 1.1fr;gap:clamp(28px,5vw,64px);align-items:center}
.how-needs-copy h2{font-size:clamp(1.9rem,3.4vw,3.2rem);line-height:1;letter-spacing:-.025em;margin:12px 0 12px}
.how-needs-copy p{color:var(--bf-muted);font-size:17px;line-height:1.7;max-width:38ch;margin:0}
.how-need-list{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--line)}
.how-need-list li{list-style:none;display:grid;gap:6px;padding:26px 20px;background:var(--bf-black)}
.how-need-list b{font:900 clamp(26px,3vw,40px)/1 'Arial',sans-serif;color:var(--bf-red)}
.how-need-list span{font-weight:800;font-size:16px;color:var(--bf-white)}
.how-need-list small{color:var(--bf-gray);font-size:13px;line-height:1.5}
/* how-to-play: endgame band */
.how-endgame{position:relative;padding:clamp(70px,10vh,120px) var(--pad);background:radial-gradient(80% 80% at 24% 40%,#160a0c,var(--bf-black) 62%);border-block:1px solid var(--line)}
.how-endgame-inner{max-width:var(--maxw);margin:0 auto;display:grid;grid-template-columns:1.15fr .85fr;gap:clamp(28px,5vw,66px);align-items:center}
.he-copy h2{font-size:clamp(2rem,3.8vw,3.6rem);line-height:1;letter-spacing:-.025em;margin:12px 0 14px;text-wrap:balance}
.he-copy p{color:var(--bf-muted);font-size:clamp(16px,1.3vw,19px);line-height:1.8;max-width:52ch;margin:0}
.he-facts{list-style:none;margin:0;padding:0;display:grid;gap:12px}
.he-facts li{list-style:none;display:flex;align-items:baseline;gap:16px;padding:18px 22px;border:1px solid var(--line);border-radius:var(--r-3);background:rgba(255,255,255,.02)}
.he-facts b{font:900 24px/1 'Arial',sans-serif;color:var(--bf-red-soft);min-width:2.4em}
.he-facts span{color:var(--bf-white);font-weight:700}
/* how-to-play: tips */
.how-tips{max-width:var(--maxw);margin:0 auto;padding:clamp(60px,9vh,110px) var(--pad) 0}
.how-tips-grid{margin-block-start:24px;display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.how-tips-grid article{padding:26px 22px;border:1px solid var(--line);border-radius:var(--r-3);background:var(--bf-ink)}
.how-tips-grid b{display:block;font-size:18px;color:var(--bf-white);margin-bottom:8px;letter-spacing:-.01em}
.how-tips-grid p{color:var(--bf-muted);font-size:15px;line-height:1.65;margin:0}
/* how-to-play: faq */
.how-faq{max-width:var(--maxw);margin:0 auto;padding:clamp(56px,8vh,100px) var(--pad) 0}
.how-faq .faq-list{margin:0}
.how-faq .faq-list>h2{font-size:clamp(1.8rem,3vw,2.6rem);margin:0 0 8px;letter-spacing:-.02em}
@media(max-width:900px){
  .how-needs{grid-template-columns:1fr;gap:26px}
  .how-endgame-inner{grid-template-columns:1fr;gap:28px}
  .how-tips-grid{grid-template-columns:1fr}
}
@media(max-width:560px){
  .how-need-list{grid-template-columns:1fr}
}

/* ---------------- devices (restyled neutral; used only in product + create) ---------------- */
.tv-stage{position:relative;width:100%;padding-bottom:6.5%}
.tv-frame{position:relative;padding:.8%;border-radius:12px;background:linear-gradient(160deg,#3a3a3e,#161618 44%,#0c0c0d);box-shadow:0 40px 100px rgba(0,0,0,.5)}
.tv-frame::before{content:'';position:absolute;inset:0;border-radius:12px;padding:1px;background:linear-gradient(160deg,rgba(255,255,255,.22),transparent 34%,transparent 66%,rgba(0,0,0,.5));-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none}
.tv-bezel{position:relative;overflow:hidden;aspect-ratio:16/9;border-radius:5px;background:#050505;box-shadow:0 0 0 1px #000,0 0 0 3px #1c1c1f}
.tv-glare{position:absolute;inset:0;z-index:6;pointer-events:none;background:linear-gradient(132deg,rgba(255,255,255,.05) 0 7%,transparent 22%)}
.tv-led{position:absolute;width:5px;height:5px;border-radius:50%;background:var(--bf-red);inset-block-end:-1%;inset-inline-start:50%;transform:translateX(-50%);box-shadow:0 0 9px var(--bf-red)}
.tv-neck{position:absolute;width:6%;height:4.2%;inset-block-end:1.1%;inset-inline-start:47%;background:linear-gradient(#242427,#0d0d0e);border-radius:0 0 3px 3px}
.tv-foot{position:absolute;width:24%;height:1.4%;inset-block-end:0;inset-inline-start:38%;border-radius:0 0 46% 46%/0 0 100% 100%;background:#1d1d20;box-shadow:0 14px 28px rgba(0,0,0,.6)}
.game-screen{height:100%;padding:4.4% 4.8%;display:flex;flex-direction:column;color:var(--bf-white);background:radial-gradient(120% 92% at 84% 6%,rgba(179,32,45,.16),transparent 46%),linear-gradient(155deg,#111112,#070707 76%);container-type:inline-size;font-size:clamp(6px,3.05cqw,16px);line-height:1.3}
.gs-hud{display:flex;align-items:center;gap:.7em;color:var(--bf-gray)}
.gs-brand{font:900 1.1em/1 'Arial Black',sans-serif;letter-spacing:.05em;color:var(--bf-white)}
.gs-phase{font-weight:900;color:var(--bf-red-soft)}
.gs-round{margin-inline-start:auto;color:var(--bf-muted);font-weight:800;letter-spacing:.04em}
.gs-chip{margin-inline-start:auto;padding:.32em .68em;border:1px solid rgba(210,72,80,.4);border-radius:.4em;color:var(--bf-red-soft);font-weight:800}
.gs-chip.live::before{content:'';display:inline-block;width:.48em;height:.48em;border-radius:50%;background:var(--bf-red-soft);margin-inline-end:.42em;box-shadow:0 0 6px var(--bf-red-soft)}
.gs-ring{width:2.1em;height:2.1em;flex:0 0 auto;border-radius:50%;background:conic-gradient(var(--bf-red) calc(var(--p)*360deg),rgba(250,250,247,.14) 0);-webkit-mask:radial-gradient(farthest-side,transparent 60%,#000 62%);mask:radial-gradient(farthest-side,transparent 60%,#000 62%)}
.p-av{width:2.4em;height:2.4em;border-radius:.58em;display:grid;place-items:center;background:var(--av,var(--bf-red));color:var(--bf-white);font-weight:900;font-style:normal;flex:0 0 auto;font-size:.92em}
.p-av.ghost{background:transparent;border:1px dashed var(--line-2);color:var(--bf-gray)}
.tv-lobby-screen{padding:4% 5.4%}.lobby-body{flex:1;display:grid;grid-template-columns:auto 1fr;gap:6%;align-items:center}
.lobby-qr{width:min(34%,140px);aspect-ratio:1;padding:3.5%;background:var(--bf-paper);border-radius:6px}
.lobby-qr svg{display:block;width:100%;height:100%}
.lobby-join{display:flex;flex-direction:column;gap:.5em}.lobby-join small{color:var(--bf-gray)}
.lobby-join strong{font:900 3.4em/1 ui-monospace,monospace;letter-spacing:.14em;color:var(--bf-white)}
.lobby-count{color:var(--bf-red-soft);font-weight:800}
.lobby-roster{display:flex;gap:.7em;margin-block-start:auto;padding-block-start:4%}
.round-prompt{display:flex;flex-direction:column;align-items:center;text-align:center;gap:.1em;margin:.5em 0 .7em}
.round-prompt small{color:var(--bf-red-soft);font-weight:900;font-size:1.05em}
.round-count{font:900 2.4em/1 ui-monospace,monospace;color:var(--bf-white)}
.round-floor{flex:1;display:flex;align-items:flex-end;justify-content:center;gap:3.5%;padding-block-end:.2em}
.round-floor .p-av{width:1.9em;height:1.9em;border-radius:.42em}
.rf-col{flex:1;max-width:15%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:.55em}
.rf-intent{width:1.5em;height:1.5em;color:var(--bf-gray)}.rf-intent.up{color:var(--bf-muted)}.rf-intent.dn{color:var(--bf-red-soft)}.rf-intent svg{width:100%;height:100%}
.rf-bar{width:48%;height:var(--h);max-height:62%;min-height:8%;border-radius:3px 3px 0 0;background:linear-gradient(180deg,var(--bf-red-soft),var(--bf-red-dark))}
.rf-col.wait .rf-bar{background:linear-gradient(180deg,#45454a,#232326)}
.tv-reveal-screen{padding:4% 5%}.reveal-list{flex:1;display:flex;flex-direction:column;justify-content:center;gap:.7em}
.rv{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:.9em;padding:.85em 1em;border:1px solid var(--line);border-radius:.7em;background:rgba(255,255,255,.02)}
.rv.dassa{border-color:rgba(210,72,80,.5);background:rgba(179,32,45,.08)}
.rv-copy{display:grid;gap:.12em;min-width:0}.rv-copy small{color:var(--bf-gray)}.rv-copy b{color:var(--bf-white);font-size:1.12em}
.rv-tag{padding:.34em .72em;border-radius:.5em;font-weight:900;font-size:.86em}.rv-tag.dassa{background:var(--bf-red);color:#fff}.rv-tag.kept{border:1px solid var(--line-2);color:var(--bf-muted)}
.reveal-foot{display:flex;align-items:center;justify-content:space-between;color:var(--bf-gray);padding-block-start:.6em;margin-block-start:.4em;border-block-start:1px solid var(--line)}
.reveal-foot strong{color:var(--bf-red-soft)}
.tv-conseq-screen{padding:4.4% 5.2%}.conseq-body{display:flex;flex-direction:column;justify-content:center;gap:.15em}
.conseq-eyebrow{color:var(--bf-red-soft);font-weight:900}.tv-conseq-screen h3{margin:.2em 0 0;font-size:2.3em;line-height:1.08}
.conseq-bars{display:flex;align-items:stretch;justify-content:space-between;gap:3%;height:44%;margin-block-start:auto}
.conseq-bars .p-av{width:1.9em;height:1.9em;border-radius:.42em}
.cb{flex:1;display:grid;grid-template-rows:1fr auto auto;justify-items:center;align-items:end;gap:.35em}
.cb::before{content:'';grid-row:1;align-self:end;width:54%;height:var(--h);min-height:8%;border-radius:3px 3px 0 0;background:linear-gradient(180deg,var(--bf-red-soft),var(--bf-red-dark))}
.cb.down::before{background:linear-gradient(180deg,#4a3033,#232326)}.cb.flat::before{background:linear-gradient(180deg,#55474a,#232326)}
.cb i{font-style:normal;font-weight:900;color:var(--bf-muted);font-size:.86em}.cb.up i{color:var(--bf-white)}.cb.down i{color:var(--bf-red-soft)}
.phone-unit{position:relative;width:210px;flex:0 0 auto}
.device-label{position:absolute;z-index:7;inset-block-start:-11px;inset-inline-start:50%;transform:translateX(-50%);white-space:nowrap;padding:5px 9px;border-radius:3px;background:var(--bf-ink);color:var(--bf-white);font-size:10px;font-weight:800;box-shadow:0 8px 22px rgba(0,0,0,.5)}
.on-paper .device-label{background:var(--bf-ink);color:var(--bf-paper)}
.phone-shell{position:relative;aspect-ratio:9/19;padding:2.9%;border-radius:14%;background:linear-gradient(152deg,#2c2c30,#0d0d0e 60%);box-shadow:0 30px 60px rgba(0,0,0,.5),0 0 0 1px rgba(255,255,255,.05) inset,0 1.4px 0 rgba(255,255,255,.12) inset}
.phone-island{position:absolute;z-index:4;inset-block-start:5.5%;inset-inline-start:50%;transform:translateX(-50%);width:30%;height:3.4%;border-radius:99px;background:#040404}
.phone-btn{position:absolute;width:2px;border-radius:2px;background:#3d3d42}.phone-btn.vol{height:9%;inset-block-start:23%;inset-inline-start:-2px}.phone-btn.pow{height:6%;inset-block-start:25%;inset-inline-end:-2px}
.phone-screen{position:relative;height:100%;overflow:hidden;border-radius:11%;background:radial-gradient(120% 58% at 88% 3%,rgba(179,32,45,.18),transparent 44%),#0a0a0b;display:flex;flex-direction:column;container-type:inline-size;font-size:5.2cqw;line-height:1.4}
.app-top{display:flex;align-items:center;justify-content:space-between;padding:11cqw 8cqw 4cqw;color:var(--bf-gray)}
.app-brand{display:flex;align-items:center;gap:1.4cqw}.app-mark{width:2.6cqw;height:2.6cqw;border:.7cqw solid var(--bf-red)}
.app-brand b{font:900 3.1cqw/1 'Arial Black',sans-serif;color:var(--bf-white);letter-spacing:.02em}
.app-chip{font-size:2.7cqw;font-weight:800;color:var(--bf-red-soft);padding:.7cqw 2.4cqw;border:1px solid rgba(210,72,80,.35);border-radius:99px}.app-chip.ghost{color:var(--bf-gray);border-color:var(--line)}
.app-body{flex:1;display:flex;padding:2cqw 8cqw 9cqw}
.home-ind{position:absolute;z-index:5;inset-block-end:3%;inset-inline-start:50%;transform:translateX(-50%);width:26%;height:1.4%;border-radius:99px;background:rgba(250,250,247,.5)}
.scr{flex:1;display:flex;flex-direction:column;font-size:3.5cqw}
.scr-eyebrow{font-size:.85em;font-weight:900;color:var(--bf-red-soft);letter-spacing:.02em}.scr-eyebrow.warn{color:var(--bf-red-soft)}
.scr-lead{margin:.5em 0;font-size:1.55em;font-weight:800;line-height:1.22;color:var(--bf-white)}.scr-note{font-size:.82em;color:var(--bf-gray)}
.scr-secret{justify-content:center;gap:.2em}.scr-secret .scr-lead{margin:.5em 0}
.scr-seal{margin-block-start:1em;display:flex;align-items:center;gap:.5em;padding-block-start:.9em;border-block-start:1px solid var(--line);color:var(--bf-muted);font-size:.82em}
.seal-mark{width:.7em;height:.7em;background:var(--bf-red);transform:rotate(45deg);flex:0 0 auto}
.scr-pick .scr-eyebrow{margin-block-end:.8em}
.pick-acts{display:grid;grid-template-columns:repeat(3,1fr);gap:.5em}
.pa{display:flex;flex-direction:column;align-items:center;gap:.34em;padding:.7em .2em;border:1.5px solid var(--line);border-radius:.6em;color:var(--bf-gray);font-size:.82em;font-weight:800}
.pa svg{width:1.5em;height:1.5em}.pa b{color:var(--bf-muted)}
.pa.up{--c:var(--bf-muted)}.pa.dn{--c:var(--bf-red-soft)}.pa.gd{--c:var(--bf-red-soft)}
.pa.on{border-color:var(--c);color:var(--c);background:color-mix(in srgb,var(--c) 12%,transparent)}.pa.on b{color:var(--bf-white)}
.pick-label{margin:.9em 0 .5em;font-size:.82em;color:var(--bf-gray);font-weight:800}
.pick-chips{display:flex;flex-direction:column;gap:.45em}
.pchip{display:flex;align-items:center;gap:.5em;padding:.5em .6em;border:1.5px solid var(--line);border-radius:.55em;font-weight:800;color:var(--bf-muted)}
.pchip.on{border-color:var(--bf-red);background:rgba(179,32,45,.12);color:var(--bf-white)}
.p-av.sm{width:2em;height:2em;border-radius:.45em;font-size:.9em}
.scr-confirm{margin-block-start:auto;margin-block-end:1em;padding:.85em;text-align:center;border-radius:.6em;background:var(--bf-red);color:#fff;font-weight:900}
.scr-wait{align-items:center;justify-content:center;text-align:center;gap:1em}
.wait-seal{width:3.4em;height:3.4em;border-radius:1em;display:grid;place-items:center;color:var(--bf-red-soft);border:1px solid rgba(210,72,80,.4);background:rgba(179,32,45,.08)}
.wait-seal svg{width:1.7em;height:1.7em}.scr-wait .scr-lead{margin:0}
.wait-dots{display:flex;gap:.5em}.wait-dots i{width:.62em;height:.62em;border-radius:50%;border:1px solid var(--bf-gray)}.wait-dots i.on{background:var(--bf-red-soft);border-color:var(--bf-red-soft)}
.scr-result{align-items:center;justify-content:center;text-align:center;gap:.4em}
.result-arrow{font-size:3.4em;line-height:1;color:var(--bf-red-soft);transform:rotate(-8deg)}
.result-delta{font:900 3.2em/1 ui-monospace,monospace;color:var(--bf-red-soft)}.scr-result .scr-lead{margin:.1em 0;font-size:1.42em}
.scr-join{gap:.7em}.scr-title{font-size:1.85em;font-weight:900;color:var(--bf-white)}
.join-field{padding:.85em .8em;border:1px solid var(--line-2);border-radius:.55em;color:var(--bf-white)}
.join-field.mono{font-family:ui-monospace,monospace;letter-spacing:.14em;font-weight:900;text-align:center}.join-field.ghost{color:var(--bf-gray)}
.scr-join .scr-confirm{margin-block-start:.2em;margin-block-end:0}

/* ---------------- error / misc ---------------- */
.network-notice{position:fixed;z-index:200;inset-block-end:16px;inset-inline-start:50%;transform:translateX(-50%);padding:11px 16px;background:var(--bf-white);color:var(--bf-black);box-shadow:var(--shadow);font-weight:800;font-size:12px;border-radius:4px}
.cinema-page{min-height:100svh;display:grid;place-items:center;padding:130px var(--pad)}
.door-card{width:min(560px,100%);padding:44px;background:var(--bf-charcoal);border:1px solid var(--line);border-radius:8px;text-align:center}
.door-card h1{font-size:44px;margin:.2em 0}
.panel{background:var(--surface);border-color:var(--line-2)!important}.muted{color:var(--bf-gray)!important}

/* ---------------- responsive ---------------- */
@media(max-width:1080px){
  .head-nav{display:none}.head-menu{display:grid}
  .poster-inner,.poster-incomplete .poster-inner,.poster-private .poster-inner,.poster-consequence .poster-inner{grid-template-columns:1fr;gap:34px}
  .social-inner{grid-template-columns:1fr;gap:28px}.social-copy{max-width:100%}.social-lines{height:clamp(240px,40vh,340px)}
  .poster-incomplete .poster-art,.poster-private .poster-art,.poster-consequence .poster-art{order:0}
  .poster .poster-art{max-width:560px}
  .product-stage{grid-template-columns:1fr;gap:34px}
  .door{grid-template-columns:1fr}
  .door-aside{min-height:auto;padding:60px var(--pad)}
}
@media(max-width:760px){
  .site-head{height:60px}.site-head.scrolled{height:56px}.mobile-panel{inset-block-start:58px}
  .hero-noir{display:flex;flex-direction:column;min-height:auto}
  .hero-inner{padding-block-start:clamp(104px,15vh,150px);padding-block-end:8px}
  .hero-art{position:relative;left:auto;bottom:auto;width:100%;margin-block-start:22px}
  .hero-copy{max-width:100%}
  .scroll-cue{display:none}
  .poster{min-height:auto;padding-block:clamp(70px,11vh,110px)}
  .poster .poster-art{max-width:440px;margin-inline:auto}
  .product-steps{grid-template-columns:1fr}
  .stage-phones{max-width:420px}
  .how-step{grid-template-columns:56px 1fr;gap:16px}
  .how-step .step-art{display:none}
  .foot-links{gap:30px}
  .door{display:flex;flex-direction:column}
  .door-form{order:1;padding:96px var(--pad) 40px}
  .door-aside{order:2}
}
@media(max-width:430px){
  .hero-noir h1{font-size:clamp(2.6rem,12vw,3.4rem)}
  .hero-cta{display:grid;grid-template-columns:1fr}
  .foot-inner{flex-direction:column}
  .foot-cap{flex-direction:column;gap:6px}
}

/* ---------------- reduced motion & a11y ---------------- */
@media(prefers-reduced-motion:reduce){
  html{scroll-behavior:auto}
  [data-reveal]{transition:none;opacity:1;transform:none}
  .rl-draw{transition:none;stroke-dashoffset:0}
  .rl-head,.cs-head,.cs-return,.fs-head,.rl-src,.cs-src,.cs-impact,.pv-secret{transition:none;opacity:1}
  .spinner{animation:none}
}
.dass-reduced-motion *{animation-duration:.001ms!important;animation-iteration-count:1!important;scroll-behavior:auto!important}
.dass-high-contrast{--bf-muted:#d0d0d2;--bf-gray:#b8b8ba;--line:rgba(250,250,247,.3);--line-2:rgba(250,250,247,.5)}
.dass-large-text{font-size:112%}
`;St();document.documentElement.dataset.siteTheme="backfire";document.body.classList.add("backfire-site");qe(cr);qe(Wt());qe(rr());var xe=document.getElementById("app"),Aa=new Set(["/","/create","/join","/how-to-play",...gt,...dt]),ze=[],ur='<span class="bf-word" dir="ltr">BACKFIRE</span>';function bt(e){let t=new URL(e,location.origin);if(!Aa.has(t.pathname)){location.href=`${t.pathname}${t.search}${t.hash}`;return}history.pushState({},"",`${t.pathname}${t.search}${t.hash}`),De(),requestAnimationFrame(()=>{t.hash?document.querySelector(t.hash)?.scrollIntoView({behavior:me()?"auto":"smooth"}):scrollTo({top:0,behavior:me()?"auto":"smooth"}),re("#main")?.focus({preventScroll:!0})})}addEventListener("click",e=>{let t=e;if(t.button!==0||t.metaKey||t.ctrlKey||t.shiftKey||t.altKey)return;let r=e.target.closest("[data-link]");r?.dataset.link&&(e.preventDefault(),Ee.tick(),bt(r.dataset.link))});addEventListener("popstate",De);function Sa(){for(let e of ze)e();ze=[],delete document.body.dataset.route,document.body.classList.remove("menu-open")}function De(){Sa(),Ca();try{switch(location.pathname){case"/":be("لعبة جماعية عن الشك والعواقب","كل لاعب يرى جزءًا مختلفًا. القرار سري، والنتيجة أمام الجميع."),La();break;case"/create":be("ابدأ لعبة","افتح غرفة BACKFIRE على الشاشة الكبيرة، ثم أدخل الشلة من جوالاتهم."),Ta();break;case"/join":be("انضم بكود","أدخل رمز الغرفة واسمك للانضمام إلى BACKFIRE من جوالك."),Pa();break;case"/how-to-play":be("كيف تلعب","الشاشة تحكي، والجوالات تخبّي. خمس خطوات للبدء."),Ra();break;default:gt.has(location.pathname)?Ia(location.pathname):Ba(location.pathname)}}catch(e){console.error("[BACKFIRE site] route render failed",e),be("تعذّر فتح الصفحة","حدث خطأ آمن أثناء عرض الصفحة."),xe.innerHTML=`${ye()}<main id="main" class="cinema-page" tabindex="-1"><section class="door-card"><span class="eyebrow">خطأ آمن</span><h1>المشهد ما اكتمل.</h1><p>لم نرسل أي بيانات. حدّث الصفحة أو ارجع للرئيسية.</p><button id="retry" class="btn primary wide">إعادة المحاولة</button><a data-link="/" class="text-link">العودة للرئيسية</a></section></main>`,re("#retry")?.addEventListener("click",De)}za(),Da()}function Ca(){try{let e=P.getSettings();document.documentElement.classList.toggle("dass-high-contrast",e.highContrast),document.documentElement.classList.toggle("dass-large-text",e.textScale==="large"),document.documentElement.classList.toggle("dass-reduced-motion",e.reducedMotion||!e.animations)}catch{document.documentElement.classList.remove("dass-high-contrast","dass-large-text","dass-reduced-motion")}}function ye(e=""){return`<a class="skip-link" href="#main">تخطَّ إلى المحتوى</a>
    <header class="site-head" id="site-head">
      <a class="nav-logo" data-link="/" aria-label="BACKFIRE — الرئيسية">${ur}</a>
      <nav class="head-nav" aria-label="التنقل الرئيسي"><a data-link="/modes" class="${e==="modes"||e==="store"?"on":""}">الأطوار</a><a data-link="/how-to-play" class="${e==="how"?"on":""}">كيف تلعب</a><a data-link="/join">انضم بكود</a></nav>
      <div class="head-actions"><a data-link="/create" class="head-cta">ابدأ لعبة</a><button id="menu" class="head-menu" type="button" aria-label="القائمة" aria-expanded="false" aria-controls="mpanel"><span></span><span></span></button></div>
      <div id="mpanel" class="mobile-panel" hidden><a data-link="/modes">الأطوار</a><a data-link="/how-to-play">كيف تلعب</a><a data-link="/join">انضم بكود</a><a data-link="/create">ابدأ لعبة</a></div>
    </header>`}function _e(){return`<footer class="foot-noir" data-reveal>
    <div class="foot-inner">
      <div class="foot-brand">${ur}<p>كل حركة لها عواقب. لعبة جماعية على شاشة واحدة وجوالات اللاعبين.</p></div>
      <div class="foot-links">
        <div><b>اللعب</b><a data-link="/create">ابدأ لعبة</a><a data-link="/join">انضم بكود</a><a data-link="/how-to-play">كيف تلعب</a></div>
        <div><b>العوالم</b><a data-link="/modes">الأطوار</a><a data-link="/pricing">الأسعار</a></div>
        <div><b>الموقع</b><a data-link="/about">عن اللعبة</a><a data-link="/faq">الأسئلة</a><a data-link="/support">الدعم</a></div>
        <div><b>قانوني</b><a data-link="/legal/privacy">الخصوصية</a><a data-link="/legal/terms">الشروط</a><a data-link="/legal/refunds">الاسترجاع</a></div>
      </div>
    </div>
    <div class="foot-cap"><span>BACKFIRE — كل حركة لها عواقب.</span><span>٢٠٢٦</span></div>
  </footer>`}function La(){document.body.dataset.route="home",xe.innerHTML=`${ye()}<main id="main" tabindex="-1">
    <section class="hero-noir">
      <div class="hero-inner"><div class="hero-copy" data-reveal>
        <span class="eyebrow">لعبة جماعية للشاشة والجوال</span>
        <h1>كل حركة<br>لها <em>عواقب.</em></h1>
        <p class="hero-lead">كل لاعب يرى جزءًا مختلفًا. القرار سري، والنتيجة أمام الجميع.</p>
        <ul class="hero-facts" aria-label="مواصفات سريعة"><li>٥ لاعبين</li><li>شاشة واحدة</li><li>جوال لكل لاعب</li><li>بلا تحميل</li></ul>
        <div class="hero-cta"><a data-link="/create" class="btn primary lg">ابدأ لعبة</a><a data-link="/join" class="btn ghost lg">انضم بكود</a></div>
        <div class="hero-note"><i></i><span>نسخة تجريبية — نظام السيناريو الجديد قيد التطوير.</span></div>
      </div></div>
      <div class="hero-art" data-reveal>${nr()}</div>
      <a class="scroll-cue" data-link="/#poster01"><span>انزل</span><i></i></a>
    </section>

    <section id="poster01" class="poster poster-incomplete on-paper" data-reveal>
      <div class="poster-inner">
        <div class="poster-copy"><span class="sec-index">01</span><h2>لا أحد يرى<br>الصورة كاملة.</h2><p>المعلومة موزّعة. والثقة قرار.</p></div>
        <div class="poster-art">${or()}</div>
      </div>
    </section>

    <section class="poster poster-private on-dark" data-reveal>
      <div class="poster-inner">
        <div class="poster-copy"><span class="sec-index">02</span><h2>ما تعرفه<br>يغيّر كل شيء.</h2><p>كل واحد يعرف شيئًا، ولا أحد يعرف كل شيء. على جوالك جزء لا يراه غيرك.</p></div>
        <div class="poster-art">${sr()}</div>
      </div>
    </section>

    <section class="social-noir on-dark" data-reveal>
      <div class="social-inner">
        <div class="social-copy">
          <span class="eyebrow">اللعبة الحقيقية بينكم</span>
          <h2 class="social-head">المشكلة مو في المعلومة.<br>المشكلة: <em>مين تصدّق؟</em></h2>
          <p class="social-note">الكذب، ونصف الحقيقة، والثقة المؤقتة، والاتهام المتأخر — هذي اللعبة الحقيقية بين اللاعبين، مو داخل جوالك.</p>
        </div>
        <div class="social-lines" aria-hidden="true">
          <span class="sl sl-1">«مين عطّل المسار؟»</span>
          <span class="sl sl-2">«أنت كنت تعرف من البداية.»</span>
          <span class="sl sl-3">«قلت لكم لا ترسلونها له.»</span>
          <span class="sl sl-4">«خطتك قلبت عليك.»</span>
        </div>
      </div>
    </section>

    <section class="poster poster-consequence on-dark" data-reveal>
      <div class="poster-inner">
        <div class="poster-copy"><span class="sec-index">03</span><h2>القرار يخرج منك.<br>والعاقبة <em>تعود إليك.</em></h2><p>كل جولة تتذكّر ما فعلتموه قبلها.</p></div>
        <div class="poster-art">${lr()}</div>
      </div>
    </section>

    <section class="product-noir on-paper" data-reveal>
      <div class="product-inner">
        <div class="product-head"><span class="eyebrow">المنتج</span><h2>شاشة واحدة.<br>أسرار مختلفة.</h2><p>التلفزيون يعرض ما يعرفه الجميع. هاتفك يحتفظ بما يخصك.</p></div>
        <div class="product-stage">
          <figure class="stage-tv">${ht("reveal")}<figcaption><b>التلفزيون</b><span>المشهد العام الذي يراه الجميع.</span></figcaption></figure>
          <div class="stage-phones"><figure>${et("secret","معلومة خاصة")}</figure><figure>${et("decision","قرار سري")}</figure></div>
        </div>
        <ol class="product-steps"><li><b>01</b><span>افتح غرفة</span></li><li><b>02</b><span>امسح الرمز</span></li><li><b>03</b><span>اختر بسرية</span></li></ol>
      </div>
    </section>

    ${er()}

    <section class="final-noir" data-reveal>
      <div class="final-art">${dr()}</div>
      <div class="final-inner"><span class="eyebrow">BACKFIRE</span><h2>ابدأ قبل أن<br>تكتمل الصورة.</h2><p>ضع الشاشة أمام الجميع، وادخلوا من جوالاتكم.</p><div class="hero-cta"><a data-link="/create" class="btn primary lg">ابدأ لعبة</a><a data-link="/join" class="btn ghost lg">انضم بكود</a></div></div>
    </section>
  </main>${_e()}`,xt()}function Ta(){document.body.dataset.route="create",xe.innerHTML=`${ye()}<main id="main" class="door" tabindex="-1">
    <section class="door-form" data-reveal>
      <span class="eyebrow">غرفة جديدة</span>
      <h1>افتح الشاشة.<br>واجمع الشلة.</h1>
      <p>سننقلك إلى شاشة التلفزيون الحالية. هناك يظهر رمز الغرفة ليدخل اللاعبون من جوالاتهم.</p>
      <div class="door-specs"><span><b>٥</b>لاعبين</span><span><b>رمز</b>أو كود</span><span><b>بلا</b>تحميل</span></div>
      <button id="startbtn" class="btn primary lg wide">افتح الغرفة على التلفاز</button>
      <a data-link="/" class="text-link">العودة للرئيسية</a>
    </section>
    <aside class="door-aside">${ht("lobby")}<div class="door-caption"><span>شاشة واحدة</span><b>رمز الدخول وحالة اللاعبين.</b></div></aside>
  </main>${_e()}`,rt(),re("#startbtn")?.addEventListener("click",e=>{let t=e.currentTarget;At(t),Ee.cta(),t.disabled=!0,t.innerHTML='<span class="spinner"></span><span>جاري فتح الشاشة…</span>',window.setTimeout(()=>{location.href="/tv"},260)})}function Pa(){document.body.dataset.route="join";let e=new URLSearchParams(location.search).get("code")??"";xe.innerHTML=`${ye()}<main id="main" class="door join-door" tabindex="-1">
    <section class="door-form" data-reveal>
      <span class="eyebrow">انضمام من الجوال</span>
      <h1>ادخل الغرفة.<br>ولا تكشف شيئًا.</h1>
      <p>اكتب الرمز الظاهر على التلفزيون، ثم الاسم الذي سيراه بقية اللاعبين.</p>
      <label class="field"><span>رمز الغرفة</span><input id="code" class="input mono" placeholder="AB12CD" value="${$e(e)}" maxlength="12" autocapitalize="characters" autocorrect="off" autocomplete="off" inputmode="text"></label>
      <label class="field"><span>اسم اللاعب</span><input id="name" class="input" placeholder="اسمك" maxlength="20" autocomplete="off"></label>
      <button id="joinbtn" class="btn primary lg wide">انضم إلى الغرفة</button>
      <div id="jerr" class="j-err" role="alert" aria-live="polite"></div>
      <a data-link="/" class="text-link">العودة للرئيسية</a>
    </section>
    <aside class="door-aside">${et("secret")}<div class="door-caption"><span>لك وحدك</span><b>ما تعرفه لا يظهر على الشاشة العامة.</b></div></aside>
  </main>${_e()}`,rt();let t=re("#code"),r=re("#name");(e?r:t).focus();let a=()=>{let n=t.value.trim(),i=r.value.trim();if(!n)return pr(t,"اكتب رمز الغرفة");if(!i)return pr(r,"اكتب اسمك");Ee.cta(),location.href=`/play?code=${encodeURIComponent(n)}&name=${encodeURIComponent(i)}`};re("#joinbtn")?.addEventListener("click",a),r.addEventListener("keydown",n=>{n.key==="Enter"&&a()}),t.addEventListener("keydown",n=>{n.key==="Enter"&&r.focus()})}function Ra(){document.body.dataset.route="how",xe.innerHTML=`${ye("how")}<main id="main" class="how-noir" tabindex="-1">
    <header class="how-hero" data-reveal>
      <span class="eyebrow">كيف تلعب</span>
      <h1>الشاشة تحكي.<br>الجوالات تخبّي.</h1>
      <p>شاشة واحدة أمام الجميع، وجوال في يد كل لاعب. الشاشة تروي المشهد العام، والجوال يحفظ ما يخصك وحدك. هذي رحلة جولة كاملة من الفتح حتى العاقبة.</p>
    </header>

    <section class="how-needs" data-reveal>
      <div class="how-needs-copy"><span class="eyebrow">ما تحتاجونه</span><h2>تجهيز بسيط،<br>بلا تحميل.</h2><p>شاشة كبيرة يراها الجميع، وجوال لكل لاعب على نفس الشبكة. لا حسابات ولا تطبيقات.</p></div>
      <ul class="how-need-list">
        <li><b>١</b><span>شاشة أو تلفاز</span><small>تعرض المشهد العام ورمز الدخول.</small></li>
        <li><b>٤–٨</b><span>جوالات اللاعبين</span><small>كل جوال يحمل معلومة وقرارًا سريًّا.</small></li>
        <li><b>١٥–٢٥</b><span>دقيقة للمباراة</span><small>ثلاث جولات، وكل جولة تتذكّر ما قبلها.</small></li>
      </ul>
    </section>

    <div class="how-steps">
      <article class="how-step" data-reveal><span class="n">01</span><div><h3>افتح الغرفة على الشاشة</h3><p>أنشئ الغرفة من تلفاز أو متصفح كبير يراه الجميع، فيظهر رمز الغرفة و QR.</p></div>${Be("room")}</article>
      <article class="how-step" data-reveal><span class="n">02</span><div><h3>ادخلوا بمسح الرمز</h3><p>كل لاعب يمسح رمز QR أو يكتب الكود من جواله — بلا تسجيل ولا انتظار.</p></div>${Be("scan")}</article>
      <article class="how-step" data-reveal><span class="n">03</span><div><h3>استلم معلوماتك السرية</h3><p>تصل لكل جوال بطاقة خاصة لا يراها غيره: دور، أو معلومة، أو ورقة ضغط.</p></div>${Be("secret")}</article>
      <article class="how-step" data-reveal><span class="n">04</span><div><h3>ناقشوا وتشاوروا</h3><p>الكلام على الطاولة: وعود، وتحالفات، ونصف حقائق. اللعبة الحقيقية بينكم لا في جوالكم.</p></div>${Be("discuss")}</article>
      <article class="how-step" data-reveal><span class="n">05</span><div><h3>اتخذ قرارك سرًّا</h3><p>تقفل حركتك على جوالك بعيدًا عن العيون، وتبقى مخفية حتى تكشفها الشاشة.</p></div>${Be("decide")}</article>
      <article class="how-step" data-reveal><span class="n">06</span><div><h3>واجه العاقبة… ثم تذكّرها</h3><p>النتيجة تظهر أمام الجميع على الشاشة، وقرارك يُحفظ ليعود ضدك أو لك في جولة قادمة.</p></div>${Be("return")}</article>
    </div>

    <section class="how-endgame on-dark" data-reveal>
      <div class="how-endgame-inner">
        <div class="he-copy"><span class="eyebrow">النهاية</span><h2>كل شيء مترابط.<br><em>وكل قرار يُحسب.</em></h2><p>بعد ثلاث جولات، تجمع الشاشة كل ما فعلتموه: من التزم بوعده، ومن انقلب، ومن نجا لأن قرارًا قديمًا عاد في اللحظة الصح. الفائز ليس الأذكى في جولة، بل من قرأ العواقب قبل أن تقع.</p></div>
        <ul class="he-facts">
          <li><b>٣</b><span>جولات متصلة</span></li>
          <li><b>سري</b><span>القرار حتى الكشف</span></li>
          <li><b>يعود</b><span>أثر كل قرار</span></li>
        </ul>
      </div>
    </section>

    <section class="how-tips" data-reveal>
      <span class="eyebrow">لأفضل جلسة</span>
      <div class="how-tips-grid">
        <article><b>اجلسوا بحيث الشاشة أمام الجميع</b><p>المشهد العام هو مرجعكم المشترك — خلّوه واضحًا لكل اللاعبين.</p></article>
        <article><b>احموا جوالكم</b><p>ما على جوالك يخصك وحدك. نظرة واحدة تكفي لتكشف سرًّا يقلب الجولة.</p></article>
        <article><b>تكلّموا… واكذبوا بذكاء</b><p>النقاش سلاح. الوعد والاتهام والصمت كلها قرارات لها عواقب.</p></article>
      </div>
    </section>

    <section class="how-faq" data-reveal>
      <div class="faq-list wide">
        <h2>أسئلة سريعة</h2>
        <details open><summary>كم لاعبًا نحتاج؟</summary><p>من ٤ إلى ٨ لاعبين، وكل لاعب على جواله. أفضل توتر يبدأ من ٥ لاعبين.</p></details>
        <details><summary>هل نحتاج تحميل تطبيق أو حساب؟</summary><p>لا. اللعبة تعمل من المتصفح على الشاشة والجوال، بلا تسجيل دخول.</p></details>
        <details><summary>كم تستغرق المباراة؟</summary><p>غالبًا ١٥–٢٥ دقيقة على ثلاث جولات. تقدرون تلعبون أكثر من جولة متتالية.</p></details>
        <details><summary>وش يصير لو انقطع اتصال أحدهم؟</summary><p>يقدر يرجع لنفس المقعد بنفس معلوماته السرية عبر إعادة الاتصال، من غير خلط الأوراق.</p></details>
      </div>
    </section>

    <div class="how-cta" data-reveal><h2>والباقي عليكم.</h2><div class="hero-cta"><a data-link="/create" class="btn primary lg">ابدأ لعبة</a><a data-link="/join" class="btn ghost lg">انضم بكود</a></div></div>
  </main>${_e()}`,xt()}function Be(e){let t=i=>`<svg class="step-art" viewBox="0 0 120 78" aria-hidden="true">${i}</svg>`,r="#b3202d",a="#707075",n="#38383d";switch(e){case"room":return t(`<rect x="16" y="12" width="88" height="48" rx="4" fill="none" stroke="${a}" stroke-width="2"/><rect x="52" y="62" width="16" height="4" fill="${n}"/><rect x="44" y="66" width="32" height="3" fill="${n}"/>`);case"scan":return t(`<path d="M22 30 V20 H32 M88 20 H98 V30 M98 48 V58 H88 M32 58 H22 V48" fill="none" stroke="${a}" stroke-width="2"/><line x1="32" y1="39" x2="88" y2="39" stroke="${r}" stroke-width="2"/>`);case"secret":return t(`<rect x="34" y="12" width="52" height="54" fill="${n}"/><rect x="44" y="32" width="32" height="8" fill="${r}"/><rect x="44" y="46" width="20" height="5" fill="${a}"/>`);case"discuss":return t(`<rect x="18" y="20" width="42" height="28" rx="5" fill="none" stroke="${a}" stroke-width="2"/><path d="M30 48 l0 8 8 -8z" fill="${a}"/><rect x="62" y="34" width="40" height="26" rx="5" fill="none" stroke="${r}" stroke-width="2"/><path d="M90 60 l0 7 -7 -7z" fill="${r}"/><line x1="26" y1="30" x2="50" y2="30" stroke="${a}" stroke-width="2"/><line x1="70" y1="44" x2="94" y2="44" stroke="${r}" stroke-width="2"/>`);case"decide":return t(`<rect x="36" y="14" width="48" height="50" rx="6" fill="none" stroke="${a}" stroke-width="2"/><rect x="44" y="24" width="14" height="12" rx="2" fill="none" stroke="${a}" stroke-width="1.6"/><rect x="62" y="24" width="14" height="12" rx="2" fill="${r}"/><rect x="44" y="46" width="32" height="8" rx="2" fill="${r}"/>`);case"return":return t(`<path d="M28 42 C 50 18 80 20 92 38 C 99 48 90 58 78 52" fill="none" stroke="${r}" stroke-width="2.4" stroke-linecap="round"/><path d="M78 52 l11 -2 -3 10z" fill="${r}"/><circle cx="28" cy="42" r="3.4" fill="${r}"/>`);default:return t("")}}function pr(e,t){e.classList.add("err");let r=re("#jerr");r&&(r.textContent=t),Ee.error(),me()||e.animate({transform:["translateX(-6px)","translateX(5px)","translateX(0)"]},{duration:180}),window.setTimeout(()=>e.classList.remove("err"),700)}function xt(){rt(),Et(".btn.primary").forEach(e=>e.addEventListener("pointerenter",()=>Ee.cta(),{once:!0}))}function rt(){let e=zt();ze.push(()=>e.disconnect())}function Ia(e){document.body.dataset.route="modes";let t=tr(e,location.search);be(t.title,t.description),xe.innerHTML=`${ye(t.active)}${t.html}${_e()}`,t.bind?.(bt,De),xt()}function Ba(e){document.body.dataset.route="product";let t=Yt(e,location.search);be(Qe(t.title),Qe(t.description)),xe.innerHTML=`${ye(t.active)}${Qe(t.html)}${_e()}`,t.bind?.(bt,De),rt()}function be(e,t){document.title=`${ft} — ${e}`,document.querySelector('meta[name="description"]')?.setAttribute("content",t);let r=document.querySelector('link[rel="canonical"]')??document.head.appendChild(Object.assign(document.createElement("link"),{rel:"canonical"}));r.href=new URL(location.pathname,Ne||location.origin).href,document.querySelector('meta[property="og:url"]')?.setAttribute("content",r.href),document.querySelector('meta[property="og:title"]')?.setAttribute("content",document.title),document.querySelector('meta[property="og:description"]')?.setAttribute("content",t);let a=new URL(ar,Ne||location.origin).href;document.querySelector('meta[property="og:image"]')?.setAttribute("content",a),document.querySelector('meta[name="twitter:image"]')?.setAttribute("content",a)}function za(){let e=re("#site-head"),t=()=>{e?.classList.toggle("scrolled",scrollY>12)};t(),addEventListener("scroll",t,{passive:!0}),ze.push(()=>removeEventListener("scroll",t));let r=re("#menu"),a=re("#mpanel"),n=()=>{a&&(a.hidden=!0),r?.setAttribute("aria-expanded","false"),document.body.classList.remove("menu-open")};r?.addEventListener("click",d=>{d.stopPropagation(),a&&(a.hidden=!a.hidden,r.setAttribute("aria-expanded",String(!a.hidden)),document.body.classList.toggle("menu-open",!a.hidden))});let i=d=>{let p=d.target;!a?.contains(p)&&!r?.contains(p)&&n()},s=d=>{d.key==="Escape"&&(n(),r?.focus())};document.addEventListener("click",i),document.addEventListener("keydown",s),ze.push(()=>document.removeEventListener("click",i),()=>document.removeEventListener("keydown",s))}function Da(){let e=()=>{if(re("#network-notice")?.remove(),navigator.onLine)return;let t=document.createElement("div");t.id="network-notice",t.className="network-notice",t.setAttribute("role","status"),t.textContent="أنت غير متصل — إنشاء الغرف والانضمام يحتاجان اتصالًا بالإنترنت.",document.body.append(t)};addEventListener("online",e),addEventListener("offline",e),e(),ze.push(()=>{removeEventListener("online",e),removeEventListener("offline",e),re("#network-notice")?.remove()})}queueMicrotask(De);
//# sourceMappingURL=bundle.js.map
