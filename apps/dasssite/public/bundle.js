var Qe=Object.create;var we=Object.defineProperty;var Xe=Object.getOwnPropertyDescriptor;var Ge=Object.getOwnPropertyNames;var We=Object.getPrototypeOf,Ze=Object.prototype.hasOwnProperty;var Je=(t,n)=>()=>{try{return n||t((n={exports:{}}).exports,n),n.exports}catch(h){throw n=0,h}};var et=(t,n,h,b)=>{if(n&&typeof n=="object"||typeof n=="function")for(let w of Ge(n))!Ze.call(t,w)&&w!==h&&we(t,w,{get:()=>n[w],enumerable:!(b=Xe(n,w))||b.enumerable});return t};var tt=(t,n,h)=>(h=t!=null?Qe(We(t)):{},et(n||!t||!t.__esModule?we(h,"default",{value:t,enumerable:!0}):h,t));var _e=Je((Be,$e)=>{var Ce=(function(){var t=function(m,y){var v=236,g=17,o=m,f=h[y],r=null,e=0,u=null,l=[],p={},E=function(i,s){e=o*4+17,r=(function(a){for(var c=new Array(a),d=0;d<a;d+=1){c[d]=new Array(a);for(var x=0;x<a;x+=1)c[d][x]=null}return c})(e),C(0,0),C(e-7,0),C(0,e-7),z(),O(),K(i,s),o>=7&&q(i),u==null&&(u=Ye(o,f,l)),Q(u,s)},C=function(i,s){for(var a=-1;a<=7;a+=1)if(!(i+a<=-1||e<=i+a))for(var c=-1;c<=7;c+=1)s+c<=-1||e<=s+c||(0<=a&&a<=6&&(c==0||c==6)||0<=c&&c<=6&&(a==0||a==6)||2<=a&&a<=4&&2<=c&&c<=4?r[i+a][s+c]=!0:r[i+a][s+c]=!1)},_=function(){for(var i=0,s=0,a=0;a<8;a+=1){E(!0,a);var c=w.getLostPoint(p);(a==0||i>c)&&(i=c,s=a)}return s},O=function(){for(var i=8;i<e-8;i+=1)r[i][6]==null&&(r[i][6]=i%2==0);for(var s=8;s<e-8;s+=1)r[6][s]==null&&(r[6][s]=s%2==0)},z=function(){for(var i=w.getPatternPosition(o),s=0;s<i.length;s+=1)for(var a=0;a<i.length;a+=1){var c=i[s],d=i[a];if(r[c][d]==null)for(var x=-2;x<=2;x+=1)for(var A=-2;A<=2;A+=1)x==-2||x==2||A==-2||A==2||x==0&&A==0?r[c+x][d+A]=!0:r[c+x][d+A]=!1}},q=function(i){for(var s=w.getBCHTypeNumber(o),a=0;a<18;a+=1){var c=!i&&(s>>a&1)==1;r[Math.floor(a/3)][a%3+e-8-3]=c}for(var a=0;a<18;a+=1){var c=!i&&(s>>a&1)==1;r[a%3+e-8-3][Math.floor(a/3)]=c}},K=function(i,s){for(var a=f<<3|s,c=w.getBCHTypeInfo(a),d=0;d<15;d+=1){var x=!i&&(c>>d&1)==1;d<6?r[d][8]=x:d<8?r[d+1][8]=x:r[e-15+d][8]=x}for(var d=0;d<15;d+=1){var x=!i&&(c>>d&1)==1;d<8?r[8][e-d-1]=x:d<9?r[8][15-d-1+1]=x:r[8][15-d-1]=x}r[e-8][8]=!i},Q=function(i,s){for(var a=-1,c=e-1,d=7,x=0,A=w.getMaskFunction(s),M=e-1;M>0;M-=2)for(M==6&&(M-=1);;){for(var D=0;D<2;D+=1)if(r[c][M-D]==null){var H=!1;x<i.length&&(H=(i[x]>>>d&1)==1);var L=A(c,M-D);L&&(H=!H),r[c][M-D]=H,d-=1,d==-1&&(x+=1,d=7)}if(c+=a,c<0||e<=c){c-=a,a=-a;break}}},Z=function(i,s){for(var a=0,c=0,d=0,x=new Array(s.length),A=new Array(s.length),M=0;M<s.length;M+=1){var D=s[M].dataCount,H=s[M].totalCount-D;c=Math.max(c,D),d=Math.max(d,H),x[M]=new Array(D);for(var L=0;L<x[M].length;L+=1)x[M][L]=255&i.getBuffer()[L+a];a+=D;var F=w.getErrorCorrectPolynomial(H),U=T(x[M],F.getLength()-1),me=U.mod(F);A[M]=new Array(F.getLength()-1);for(var L=0;L<A[M].length;L+=1){var be=L+me.getLength()-A[M].length;A[M][L]=be>=0?me.getAt(be):0}}for(var ye=0,L=0;L<s.length;L+=1)ye+=s[L].totalCount;for(var ue=new Array(ye),oe=0,L=0;L<c;L+=1)for(var M=0;M<s.length;M+=1)L<x[M].length&&(ue[oe]=x[M][L],oe+=1);for(var L=0;L<d;L+=1)for(var M=0;M<s.length;M+=1)L<A[M].length&&(ue[oe]=A[M][L],oe+=1);return ue},Ye=function(i,s,a){for(var c=B.getRSBlocks(i,s),d=$(),x=0;x<a.length;x+=1){var A=a[x];d.put(A.getMode(),4),d.put(A.getLength(),w.getLengthInBits(A.getMode(),i)),A.write(d)}for(var M=0,x=0;x<c.length;x+=1)M+=c[x].dataCount;if(d.getLengthInBits()>M*8)throw"code length overflow. ("+d.getLengthInBits()+">"+M*8+")";for(d.getLengthInBits()+4<=M*8&&d.put(0,4);d.getLengthInBits()%8!=0;)d.putBit(!1);for(;!(d.getLengthInBits()>=M*8||(d.put(v,8),d.getLengthInBits()>=M*8));)d.put(g,8);return Z(d,c)};p.addData=function(i,s){s=s||"Byte";var a=null;switch(s){case"Numeric":a=I(i);break;case"Alphanumeric":a=P(i);break;case"Byte":a=S(i);break;case"Kanji":a=Ne(i);break;default:throw"mode:"+s}l.push(a),u=null},p.isDark=function(i,s){if(i<0||e<=i||s<0||e<=s)throw i+","+s;return r[i][s]},p.getModuleCount=function(){return e},p.make=function(){if(o<1){for(var i=1;i<40;i++){for(var s=B.getRSBlocks(i,f),a=$(),c=0;c<l.length;c++){var d=l[c];a.put(d.getMode(),4),a.put(d.getLength(),w.getLengthInBits(d.getMode(),i)),d.write(a)}for(var x=0,c=0;c<s.length;c++)x+=s[c].dataCount;if(a.getLengthInBits()<=x*8)break}o=i}E(!1,_())},p.createTableTag=function(i,s){i=i||2,s=typeof s>"u"?i*4:s;var a="";a+='<table style="',a+=" border-width: 0px; border-style: none;",a+=" border-collapse: collapse;",a+=" padding: 0px; margin: "+s+"px;",a+='">',a+="<tbody>";for(var c=0;c<p.getModuleCount();c+=1){a+="<tr>";for(var d=0;d<p.getModuleCount();d+=1)a+='<td style="',a+=" border-width: 0px; border-style: none;",a+=" border-collapse: collapse;",a+=" padding: 0px; margin: 0px;",a+=" width: "+i+"px;",a+=" height: "+i+"px;",a+=" background-color: ",a+=p.isDark(c,d)?"#000000":"#ffffff",a+=";",a+='"/>';a+="</tr>"}return a+="</tbody>",a+="</table>",a},p.createSvgTag=function(i,s,a,c){var d={};typeof arguments[0]=="object"&&(d=arguments[0],i=d.cellSize,s=d.margin,a=d.alt,c=d.title),i=i||2,s=typeof s>"u"?i*4:s,a=typeof a=="string"?{text:a}:a||{},a.text=a.text||null,a.id=a.text?a.id||"qrcode-description":null,c=typeof c=="string"?{text:c}:c||{},c.text=c.text||null,c.id=c.text?c.id||"qrcode-title":null;var x=p.getModuleCount()*i+s*2,A,M,D,H,L="",F;for(F="l"+i+",0 0,"+i+" -"+i+",0 0,-"+i+"z ",L+='<svg version="1.1" xmlns="http://www.w3.org/2000/svg"',L+=d.scalable?"":' width="'+x+'px" height="'+x+'px"',L+=' viewBox="0 0 '+x+" "+x+'" ',L+=' preserveAspectRatio="xMinYMin meet"',L+=c.text||a.text?' role="img" aria-labelledby="'+J([c.id,a.id].join(" ").trim())+'"':"",L+=">",L+=c.text?'<title id="'+J(c.id)+'">'+J(c.text)+"</title>":"",L+=a.text?'<description id="'+J(a.id)+'">'+J(a.text)+"</description>":"",L+='<rect width="100%" height="100%" fill="white" cx="0" cy="0"/>',L+='<path d="',D=0;D<p.getModuleCount();D+=1)for(H=D*i+s,A=0;A<p.getModuleCount();A+=1)p.isDark(D,A)&&(M=A*i+s,L+="M"+M+","+H+F);return L+='" stroke="transparent" fill="black"/>',L+="</svg>",L},p.createDataURL=function(i,s){i=i||2,s=typeof s>"u"?i*4:s;var a=p.getModuleCount()*i+s*2,c=s,d=a-s;return qe(a,a,function(x,A){if(c<=x&&x<d&&c<=A&&A<d){var M=Math.floor((x-c)/i),D=Math.floor((A-c)/i);return p.isDark(D,M)?0:1}else return 1})},p.createImgTag=function(i,s,a){i=i||2,s=typeof s>"u"?i*4:s;var c=p.getModuleCount()*i+s*2,d="";return d+="<img",d+=' src="',d+=p.createDataURL(i,s),d+='"',d+=' width="',d+=c,d+='"',d+=' height="',d+=c,d+='"',a&&(d+=' alt="',d+=J(a),d+='"'),d+="/>",d};var J=function(i){for(var s="",a=0;a<i.length;a+=1){var c=i.charAt(a);switch(c){case"<":s+="&lt;";break;case">":s+="&gt;";break;case"&":s+="&amp;";break;case'"':s+="&quot;";break;default:s+=c;break}}return s},Ke=function(i){var s=1;i=typeof i>"u"?s*2:i;var a=p.getModuleCount()*s+i*2,c=i,d=a-i,x,A,M,D,H,L={"██":"█","█ ":"▀"," █":"▄","  ":" "},F={"██":"▀","█ ":"▀"," █":" ","  ":" "},U="";for(x=0;x<a;x+=2){for(M=Math.floor((x-c)/s),D=Math.floor((x+1-c)/s),A=0;A<a;A+=1)H="█",c<=A&&A<d&&c<=x&&x<d&&p.isDark(M,Math.floor((A-c)/s))&&(H=" "),c<=A&&A<d&&c<=x+1&&x+1<d&&p.isDark(D,Math.floor((A-c)/s))?H+=" ":H+="█",U+=i<1&&x+1>=d?F[H]:L[H];U+=`
`}return a%2&&i>0?U.substring(0,U.length-a-1)+Array(a+1).join("▀"):U.substring(0,U.length-1)};return p.createASCII=function(i,s){if(i=i||1,i<2)return Ke(s);i-=1,s=typeof s>"u"?i*2:s;var a=p.getModuleCount()*i+s*2,c=s,d=a-s,x,A,M,D,H=Array(i+1).join("██"),L=Array(i+1).join("  "),F="",U="";for(x=0;x<a;x+=1){for(M=Math.floor((x-c)/i),U="",A=0;A<a;A+=1)D=1,c<=A&&A<d&&c<=x&&x<d&&p.isDark(M,Math.floor((A-c)/i))&&(D=0),U+=D?H:L;for(M=0;M<i;M+=1)F+=U+`
`}return F.substring(0,F.length-1)},p.renderTo2dContext=function(i,s){s=s||2;for(var a=p.getModuleCount(),c=0;c<a;c++)for(var d=0;d<a;d++)i.fillStyle=p.isDark(c,d)?"black":"white",i.fillRect(c*s,d*s,s,s)},p};t.stringToBytesFuncs={default:function(m){for(var y=[],v=0;v<m.length;v+=1){var g=m.charCodeAt(v);y.push(g&255)}return y}},t.stringToBytes=t.stringToBytesFuncs.default,t.createStringToBytes=function(m,y){var v=(function(){for(var o=Ue(m),f=function(){var O=o.read();if(O==-1)throw"eof";return O},r=0,e={};;){var u=o.read();if(u==-1)break;var l=f(),p=f(),E=f(),C=String.fromCharCode(u<<8|l),_=p<<8|E;e[C]=_,r+=1}if(r!=y)throw r+" != "+y;return e})(),g=63;return function(o){for(var f=[],r=0;r<o.length;r+=1){var e=o.charCodeAt(r);if(e<128)f.push(e);else{var u=v[o.charAt(r)];typeof u=="number"?(u&255)==u?f.push(u):(f.push(u>>>8),f.push(u&255)):f.push(g)}}return f}};var n={MODE_NUMBER:1,MODE_ALPHA_NUM:2,MODE_8BIT_BYTE:4,MODE_KANJI:8},h={L:1,M:0,Q:3,H:2},b={PATTERN000:0,PATTERN001:1,PATTERN010:2,PATTERN011:3,PATTERN100:4,PATTERN101:5,PATTERN110:6,PATTERN111:7},w=(function(){var m=[[],[6,18],[6,22],[6,26],[6,30],[6,34],[6,22,38],[6,24,42],[6,26,46],[6,28,50],[6,30,54],[6,32,58],[6,34,62],[6,26,46,66],[6,26,48,70],[6,26,50,74],[6,30,54,78],[6,30,56,82],[6,30,58,86],[6,34,62,90],[6,28,50,72,94],[6,26,50,74,98],[6,30,54,78,102],[6,28,54,80,106],[6,32,58,84,110],[6,30,58,86,114],[6,34,62,90,118],[6,26,50,74,98,122],[6,30,54,78,102,126],[6,26,52,78,104,130],[6,30,56,82,108,134],[6,34,60,86,112,138],[6,30,58,86,114,142],[6,34,62,90,118,146],[6,30,54,78,102,126,150],[6,24,50,76,102,128,154],[6,28,54,80,106,132,158],[6,32,58,84,110,136,162],[6,26,54,82,110,138,166],[6,30,58,86,114,142,170]],y=1335,v=7973,g=21522,o={},f=function(r){for(var e=0;r!=0;)e+=1,r>>>=1;return e};return o.getBCHTypeInfo=function(r){for(var e=r<<10;f(e)-f(y)>=0;)e^=y<<f(e)-f(y);return(r<<10|e)^g},o.getBCHTypeNumber=function(r){for(var e=r<<12;f(e)-f(v)>=0;)e^=v<<f(e)-f(v);return r<<12|e},o.getPatternPosition=function(r){return m[r-1]},o.getMaskFunction=function(r){switch(r){case b.PATTERN000:return function(e,u){return(e+u)%2==0};case b.PATTERN001:return function(e,u){return e%2==0};case b.PATTERN010:return function(e,u){return u%3==0};case b.PATTERN011:return function(e,u){return(e+u)%3==0};case b.PATTERN100:return function(e,u){return(Math.floor(e/2)+Math.floor(u/3))%2==0};case b.PATTERN101:return function(e,u){return e*u%2+e*u%3==0};case b.PATTERN110:return function(e,u){return(e*u%2+e*u%3)%2==0};case b.PATTERN111:return function(e,u){return(e*u%3+(e+u)%2)%2==0};default:throw"bad maskPattern:"+r}},o.getErrorCorrectPolynomial=function(r){for(var e=T([1],0),u=0;u<r;u+=1)e=e.multiply(T([1,k.gexp(u)],0));return e},o.getLengthInBits=function(r,e){if(1<=e&&e<10)switch(r){case n.MODE_NUMBER:return 10;case n.MODE_ALPHA_NUM:return 9;case n.MODE_8BIT_BYTE:return 8;case n.MODE_KANJI:return 8;default:throw"mode:"+r}else if(e<27)switch(r){case n.MODE_NUMBER:return 12;case n.MODE_ALPHA_NUM:return 11;case n.MODE_8BIT_BYTE:return 16;case n.MODE_KANJI:return 10;default:throw"mode:"+r}else if(e<41)switch(r){case n.MODE_NUMBER:return 14;case n.MODE_ALPHA_NUM:return 13;case n.MODE_8BIT_BYTE:return 16;case n.MODE_KANJI:return 12;default:throw"mode:"+r}else throw"type:"+e},o.getLostPoint=function(r){for(var e=r.getModuleCount(),u=0,l=0;l<e;l+=1)for(var p=0;p<e;p+=1){for(var E=0,C=r.isDark(l,p),_=-1;_<=1;_+=1)if(!(l+_<0||e<=l+_))for(var O=-1;O<=1;O+=1)p+O<0||e<=p+O||_==0&&O==0||C==r.isDark(l+_,p+O)&&(E+=1);E>5&&(u+=3+E-5)}for(var l=0;l<e-1;l+=1)for(var p=0;p<e-1;p+=1){var z=0;r.isDark(l,p)&&(z+=1),r.isDark(l+1,p)&&(z+=1),r.isDark(l,p+1)&&(z+=1),r.isDark(l+1,p+1)&&(z+=1),(z==0||z==4)&&(u+=3)}for(var l=0;l<e;l+=1)for(var p=0;p<e-6;p+=1)r.isDark(l,p)&&!r.isDark(l,p+1)&&r.isDark(l,p+2)&&r.isDark(l,p+3)&&r.isDark(l,p+4)&&!r.isDark(l,p+5)&&r.isDark(l,p+6)&&(u+=40);for(var p=0;p<e;p+=1)for(var l=0;l<e-6;l+=1)r.isDark(l,p)&&!r.isDark(l+1,p)&&r.isDark(l+2,p)&&r.isDark(l+3,p)&&r.isDark(l+4,p)&&!r.isDark(l+5,p)&&r.isDark(l+6,p)&&(u+=40);for(var q=0,p=0;p<e;p+=1)for(var l=0;l<e;l+=1)r.isDark(l,p)&&(q+=1);var K=Math.abs(100*q/e/e-50)/5;return u+=K*10,u},o})(),k=(function(){for(var m=new Array(256),y=new Array(256),v=0;v<8;v+=1)m[v]=1<<v;for(var v=8;v<256;v+=1)m[v]=m[v-4]^m[v-5]^m[v-6]^m[v-8];for(var v=0;v<255;v+=1)y[m[v]]=v;var g={};return g.glog=function(o){if(o<1)throw"glog("+o+")";return y[o]},g.gexp=function(o){for(;o<0;)o+=255;for(;o>=256;)o-=255;return m[o]},g})();function T(m,y){if(typeof m.length>"u")throw m.length+"/"+y;var v=(function(){for(var o=0;o<m.length&&m[o]==0;)o+=1;for(var f=new Array(m.length-o+y),r=0;r<m.length-o;r+=1)f[r]=m[r+o];return f})(),g={};return g.getAt=function(o){return v[o]},g.getLength=function(){return v.length},g.multiply=function(o){for(var f=new Array(g.getLength()+o.getLength()-1),r=0;r<g.getLength();r+=1)for(var e=0;e<o.getLength();e+=1)f[r+e]^=k.gexp(k.glog(g.getAt(r))+k.glog(o.getAt(e)));return T(f,0)},g.mod=function(o){if(g.getLength()-o.getLength()<0)return g;for(var f=k.glog(g.getAt(0))-k.glog(o.getAt(0)),r=new Array(g.getLength()),e=0;e<g.getLength();e+=1)r[e]=g.getAt(e);for(var e=0;e<o.getLength();e+=1)r[e]^=k.gexp(k.glog(o.getAt(e))+f);return T(r,0).mod(o)},g}var B=(function(){var m=[[1,26,19],[1,26,16],[1,26,13],[1,26,9],[1,44,34],[1,44,28],[1,44,22],[1,44,16],[1,70,55],[1,70,44],[2,35,17],[2,35,13],[1,100,80],[2,50,32],[2,50,24],[4,25,9],[1,134,108],[2,67,43],[2,33,15,2,34,16],[2,33,11,2,34,12],[2,86,68],[4,43,27],[4,43,19],[4,43,15],[2,98,78],[4,49,31],[2,32,14,4,33,15],[4,39,13,1,40,14],[2,121,97],[2,60,38,2,61,39],[4,40,18,2,41,19],[4,40,14,2,41,15],[2,146,116],[3,58,36,2,59,37],[4,36,16,4,37,17],[4,36,12,4,37,13],[2,86,68,2,87,69],[4,69,43,1,70,44],[6,43,19,2,44,20],[6,43,15,2,44,16],[4,101,81],[1,80,50,4,81,51],[4,50,22,4,51,23],[3,36,12,8,37,13],[2,116,92,2,117,93],[6,58,36,2,59,37],[4,46,20,6,47,21],[7,42,14,4,43,15],[4,133,107],[8,59,37,1,60,38],[8,44,20,4,45,21],[12,33,11,4,34,12],[3,145,115,1,146,116],[4,64,40,5,65,41],[11,36,16,5,37,17],[11,36,12,5,37,13],[5,109,87,1,110,88],[5,65,41,5,66,42],[5,54,24,7,55,25],[11,36,12,7,37,13],[5,122,98,1,123,99],[7,73,45,3,74,46],[15,43,19,2,44,20],[3,45,15,13,46,16],[1,135,107,5,136,108],[10,74,46,1,75,47],[1,50,22,15,51,23],[2,42,14,17,43,15],[5,150,120,1,151,121],[9,69,43,4,70,44],[17,50,22,1,51,23],[2,42,14,19,43,15],[3,141,113,4,142,114],[3,70,44,11,71,45],[17,47,21,4,48,22],[9,39,13,16,40,14],[3,135,107,5,136,108],[3,67,41,13,68,42],[15,54,24,5,55,25],[15,43,15,10,44,16],[4,144,116,4,145,117],[17,68,42],[17,50,22,6,51,23],[19,46,16,6,47,17],[2,139,111,7,140,112],[17,74,46],[7,54,24,16,55,25],[34,37,13],[4,151,121,5,152,122],[4,75,47,14,76,48],[11,54,24,14,55,25],[16,45,15,14,46,16],[6,147,117,4,148,118],[6,73,45,14,74,46],[11,54,24,16,55,25],[30,46,16,2,47,17],[8,132,106,4,133,107],[8,75,47,13,76,48],[7,54,24,22,55,25],[22,45,15,13,46,16],[10,142,114,2,143,115],[19,74,46,4,75,47],[28,50,22,6,51,23],[33,46,16,4,47,17],[8,152,122,4,153,123],[22,73,45,3,74,46],[8,53,23,26,54,24],[12,45,15,28,46,16],[3,147,117,10,148,118],[3,73,45,23,74,46],[4,54,24,31,55,25],[11,45,15,31,46,16],[7,146,116,7,147,117],[21,73,45,7,74,46],[1,53,23,37,54,24],[19,45,15,26,46,16],[5,145,115,10,146,116],[19,75,47,10,76,48],[15,54,24,25,55,25],[23,45,15,25,46,16],[13,145,115,3,146,116],[2,74,46,29,75,47],[42,54,24,1,55,25],[23,45,15,28,46,16],[17,145,115],[10,74,46,23,75,47],[10,54,24,35,55,25],[19,45,15,35,46,16],[17,145,115,1,146,116],[14,74,46,21,75,47],[29,54,24,19,55,25],[11,45,15,46,46,16],[13,145,115,6,146,116],[14,74,46,23,75,47],[44,54,24,7,55,25],[59,46,16,1,47,17],[12,151,121,7,152,122],[12,75,47,26,76,48],[39,54,24,14,55,25],[22,45,15,41,46,16],[6,151,121,14,152,122],[6,75,47,34,76,48],[46,54,24,10,55,25],[2,45,15,64,46,16],[17,152,122,4,153,123],[29,74,46,14,75,47],[49,54,24,10,55,25],[24,45,15,46,46,16],[4,152,122,18,153,123],[13,74,46,32,75,47],[48,54,24,14,55,25],[42,45,15,32,46,16],[20,147,117,4,148,118],[40,75,47,7,76,48],[43,54,24,22,55,25],[10,45,15,67,46,16],[19,148,118,6,149,119],[18,75,47,31,76,48],[34,54,24,34,55,25],[20,45,15,61,46,16]],y=function(o,f){var r={};return r.totalCount=o,r.dataCount=f,r},v={},g=function(o,f){switch(f){case h.L:return m[(o-1)*4+0];case h.M:return m[(o-1)*4+1];case h.Q:return m[(o-1)*4+2];case h.H:return m[(o-1)*4+3];default:return}};return v.getRSBlocks=function(o,f){var r=g(o,f);if(typeof r>"u")throw"bad rs block @ typeNumber:"+o+"/errorCorrectionLevel:"+f;for(var e=r.length/3,u=[],l=0;l<e;l+=1)for(var p=r[l*3+0],E=r[l*3+1],C=r[l*3+2],_=0;_<p;_+=1)u.push(y(E,C));return u},v})(),$=function(){var m=[],y=0,v={};return v.getBuffer=function(){return m},v.getAt=function(g){var o=Math.floor(g/8);return(m[o]>>>7-g%8&1)==1},v.put=function(g,o){for(var f=0;f<o;f+=1)v.putBit((g>>>o-f-1&1)==1)},v.getLengthInBits=function(){return y},v.putBit=function(g){var o=Math.floor(y/8);m.length<=o&&m.push(0),g&&(m[o]|=128>>>y%8),y+=1},v},I=function(m){var y=n.MODE_NUMBER,v=m,g={};g.getMode=function(){return y},g.getLength=function(r){return v.length},g.write=function(r){for(var e=v,u=0;u+2<e.length;)r.put(o(e.substring(u,u+3)),10),u+=3;u<e.length&&(e.length-u==1?r.put(o(e.substring(u,u+1)),4):e.length-u==2&&r.put(o(e.substring(u,u+2)),7))};var o=function(r){for(var e=0,u=0;u<r.length;u+=1)e=e*10+f(r.charAt(u));return e},f=function(r){if("0"<=r&&r<="9")return r.charCodeAt(0)-48;throw"illegal char :"+r};return g},P=function(m){var y=n.MODE_ALPHA_NUM,v=m,g={};g.getMode=function(){return y},g.getLength=function(f){return v.length},g.write=function(f){for(var r=v,e=0;e+1<r.length;)f.put(o(r.charAt(e))*45+o(r.charAt(e+1)),11),e+=2;e<r.length&&f.put(o(r.charAt(e)),6)};var o=function(f){if("0"<=f&&f<="9")return f.charCodeAt(0)-48;if("A"<=f&&f<="Z")return f.charCodeAt(0)-65+10;switch(f){case" ":return 36;case"$":return 37;case"%":return 38;case"*":return 39;case"+":return 40;case"-":return 41;case".":return 42;case"/":return 43;case":":return 44;default:throw"illegal char :"+f}};return g},S=function(m){var y=n.MODE_8BIT_BYTE,v=m,g=t.stringToBytes(m),o={};return o.getMode=function(){return y},o.getLength=function(f){return g.length},o.write=function(f){for(var r=0;r<g.length;r+=1)f.put(g[r],8)},o},Ne=function(m){var y=n.MODE_KANJI,v=m,g=t.stringToBytesFuncs.SJIS;if(!g)throw"sjis not supported.";(function(r,e){var u=g(r);if(u.length!=2||(u[0]<<8|u[1])!=e)throw"sjis not supported."})("友",38726);var o=g(m),f={};return f.getMode=function(){return y},f.getLength=function(r){return~~(o.length/2)},f.write=function(r){for(var e=o,u=0;u+1<e.length;){var l=(255&e[u])<<8|255&e[u+1];if(33088<=l&&l<=40956)l-=33088;else if(57408<=l&&l<=60351)l-=49472;else throw"illegal char at "+(u+1)+"/"+l;l=(l>>>8&255)*192+(l&255),r.put(l,13),u+=2}if(u<e.length)throw"illegal char at "+(u+1)},f},xe=function(){var m=[],y={};return y.writeByte=function(v){m.push(v&255)},y.writeShort=function(v){y.writeByte(v),y.writeByte(v>>>8)},y.writeBytes=function(v,g,o){g=g||0,o=o||v.length;for(var f=0;f<o;f+=1)y.writeByte(v[f+g])},y.writeString=function(v){for(var g=0;g<v.length;g+=1)y.writeByte(v.charCodeAt(g))},y.toByteArray=function(){return m},y.toString=function(){var v="";v+="[";for(var g=0;g<m.length;g+=1)g>0&&(v+=","),v+=m[g];return v+="]",v},y},Fe=function(){var m=0,y=0,v=0,g="",o={},f=function(e){g+=String.fromCharCode(r(e&63))},r=function(e){if(!(e<0)){if(e<26)return 65+e;if(e<52)return 97+(e-26);if(e<62)return 48+(e-52);if(e==62)return 43;if(e==63)return 47}throw"n:"+e};return o.writeByte=function(e){for(m=m<<8|e&255,y+=8,v+=1;y>=6;)f(m>>>y-6),y-=6},o.flush=function(){if(y>0&&(f(m<<6-y),m=0,y=0),v%3!=0)for(var e=3-v%3,u=0;u<e;u+=1)g+="="},o.toString=function(){return g},o},Ue=function(m){var y=m,v=0,g=0,o=0,f={};f.read=function(){for(;o<8;){if(v>=y.length){if(o==0)return-1;throw"unexpected end of file./"+o}var e=y.charAt(v);if(v+=1,e=="=")return o=0,-1;if(e.match(/^\s$/))continue;g=g<<6|r(e.charCodeAt(0)),o+=6}var u=g>>>o-8&255;return o-=8,u};var r=function(e){if(65<=e&&e<=90)return e-65;if(97<=e&&e<=122)return e-97+26;if(48<=e&&e<=57)return e-48+52;if(e==43)return 62;if(e==47)return 63;throw"c:"+e};return f},Ve=function(m,y){var v=m,g=y,o=new Array(m*y),f={};f.setPixel=function(l,p,E){o[p*v+l]=E},f.write=function(l){l.writeString("GIF87a"),l.writeShort(v),l.writeShort(g),l.writeByte(128),l.writeByte(0),l.writeByte(0),l.writeByte(0),l.writeByte(0),l.writeByte(0),l.writeByte(255),l.writeByte(255),l.writeByte(255),l.writeString(","),l.writeShort(0),l.writeShort(0),l.writeShort(v),l.writeShort(g),l.writeByte(0);var p=2,E=e(p);l.writeByte(p);for(var C=0;E.length-C>255;)l.writeByte(255),l.writeBytes(E,C,255),C+=255;l.writeByte(E.length-C),l.writeBytes(E,C,E.length-C),l.writeByte(0),l.writeString(";")};var r=function(l){var p=l,E=0,C=0,_={};return _.write=function(O,z){if(O>>>z)throw"length over";for(;E+z>=8;)p.writeByte(255&(O<<E|C)),z-=8-E,O>>>=8-E,C=0,E=0;C=O<<E|C,E=E+z},_.flush=function(){E>0&&p.writeByte(C)},_},e=function(l){for(var p=1<<l,E=(1<<l)+1,C=l+1,_=u(),O=0;O<p;O+=1)_.add(String.fromCharCode(O));_.add(String.fromCharCode(p)),_.add(String.fromCharCode(E));var z=xe(),q=r(z);q.write(p,C);var K=0,Q=String.fromCharCode(o[K]);for(K+=1;K<o.length;){var Z=String.fromCharCode(o[K]);K+=1,_.contains(Q+Z)?Q=Q+Z:(q.write(_.indexOf(Q),C),_.size()<4095&&(_.size()==1<<C&&(C+=1),_.add(Q+Z)),Q=Z)}return q.write(_.indexOf(Q),C),q.write(E,C),q.flush(),z.toByteArray()},u=function(){var l={},p=0,E={};return E.add=function(C){if(E.contains(C))throw"dup key:"+C;l[C]=p,p+=1},E.size=function(){return p},E.indexOf=function(C){return l[C]},E.contains=function(C){return typeof l[C]<"u"},E};return f},qe=function(m,y,v){for(var g=Ve(m,y),o=0;o<y;o+=1)for(var f=0;f<m;f+=1)g.setPixel(f,o,v(f,o));var r=xe();g.write(r);for(var e=Fe(),u=r.toByteArray(),l=0;l<u.length;l+=1)e.writeByte(u[l]);return e.flush(),"data:image/gif;base64,"+e};return t})();(function(){Ce.stringToBytesFuncs["UTF-8"]=function(t){function n(h){for(var b=[],w=0;w<h.length;w++){var k=h.charCodeAt(w);k<128?b.push(k):k<2048?b.push(192|k>>6,128|k&63):k<55296||k>=57344?b.push(224|k>>12,128|k>>6&63,128|k&63):(w++,k=65536+((k&1023)<<10|h.charCodeAt(w)&1023),b.push(240|k>>18,128|k>>12&63,128|k>>6&63,128|k&63))}return b}return n(t)}})();(function(t){typeof define=="function"&&define.amd?define([],t):typeof Be=="object"&&($e.exports=t())})(function(){return Ce})});function te(t,n,h){let b=document.createElement(t);return n&&(b.className=n),h!=null&&(b.innerHTML=h),b}var j=(t,n=document)=>n.querySelector(t),ve=(t,n=document)=>Array.from(n.querySelectorAll(t));function ke(t){return t.replace(/[&<>"']/g,n=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[n])}function ie(t){let n=document.createElement("style");return n.textContent=t,document.head.appendChild(n),n}var se={instant:110,micro:190,comp:340,scene:680,cine:1600,out:"cubic-bezier(.2,.85,.25,1)",inOut:"cubic-bezier(.65,0,.35,1)",sharp:"cubic-bezier(.9,.03,.2,1)",pull:"cubic-bezier(.16,1,.3,1)",spring:"cubic-bezier(.34,1.56,.64,1)"},Y=()=>typeof matchMedia=="function"&&matchMedia("(prefers-reduced-motion: reduce)").matches;function Me(t,n,h){return Y()?t.animate({opacity:[.001,1]},{duration:1,fill:"both"}):t.animate(n,{fill:"both",...h})}function Ae(t,n=0){return Me(t,{opacity:[0,1],transform:["translateY(16px) scale(.985)","translateY(0) scale(1)"],filter:["blur(7px)","blur(0)"]},{duration:se.comp,easing:se.pull,delay:n})}function Le(t){return Me(t,{transform:["scale(1)","scale(.955)","scale(1)"]},{duration:se.instant,easing:se.out})}var rt=`
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
`;function Te(){let t=document.createElement("style");t.id="dass-base",t.textContent=rt,document.head.appendChild(t)}var G={brand:"دسّ",tagline:"قدّامهم شي… ووراهم شي.",subtitle:"أعلن نيّتك… ثم دسّها بالسر.",namePlaceholder:"وش اسمك؟",codePlaceholder:"كود الغرفة",join:"خشّ",create:"سوّي غرفة",scanToJoin:"صوّر الرمز بجوالك",orType:"أو اكتب الكود بصفحة",waiting:"ننتظر البقية…",emptySeat:"مقعد فاضي",ready:"جاهز",unready:"رجعت مو جاهز",imReady:"جاهز، يلا",start:"ابدأ اللعبة",needMore:"باقي لاعبين",needFour:"لازم ٤ على الأقل",hostStarts:"الهوست يبدأ من الشاشة",everyoneReady:"الكل جاهز — يلا نبدأ",youAreHost:"أنت الهوست",waitingHost:"بانتظار الهوست",hostReconnecting:"الهوست يعيد الاتصال…",players:"اللاعبين",host:"الهوست",you:"أنت",lookUp:"ارفع راسك للشاشة",ofN:(t,n)=>`${t} من ${n}`,support:"أدعمه",attack:"أضربه",sell:"أبيع",supportShort:"دعم",attackShort:"ضرب",sellShort:"بيع",pickTarget:"اختر لاعب",declareTitle:"أعلن نيّتك — بصوت عالي",declareSub:"مين ترفعه، مين توطّيه؟ ولا تبيع وتثبّت؟",declared:"أعلنتها",reactionTitle:"شوفوا نيّات بعض",reactionSub:"تقدر تغيّر إعلانك مرة وحدة… لو ودك تلعبها.",changeOnce:"غيّر إعلاني",changedAlready:"غيّرتها — خلاص",lockTitle:"الحين… بالسر",lockSub:"الفعل الحقيقي. تلتزم بوعدك، أو تدسّها عليهم.",keepPromise:"ألتزم بكلامي",betrayIt:"أدسّها 🔪",locked:"قفلت السر",sellSelf:"تبيع نفسك — تثبّت وضعك بالخزنة، وترجع من تحت.",sentWaiting:"أرسلت قرارك",waitOthers:"ننتظر البقية يقررون…",watchScreen:"الحركة على الشاشة الكبيرة",yourMoveHidden:"قرارك محفوظ… ومخفي.",vault:"الخزنة",yourVault:"خزنتك",round:"جولة",roundOf:(t,n)=>`جولة ${t} من ${n}`,marketClose:"إغلاق السوق",finalTitle:"الكشف الكامل",finalSub:"كل وعد… ووش صار فيه.",dassa:"دسّة",kept:"التزم",promised:"وعد",truth:"الحقيقة",winner:"الفايز",coChamps:"تعادل على القمة",biggestVault:"أكبر خزنة",playAgain:"نفس الشلة، مرة ثانية",newCrew:"شلة جديدة",playedIt:"خلصنا 😮‍💨",yourResult:"نتيجتك",booting:"نجهّز المسرح…",connecting:"نربط الاتصال…",reconnecting:"رجعنالك… ثانية",disconnected:"انقطع الاتصال — نحاول نرجّعك",reconnected:"رجع الاتصال",sessionRestored:"تم استعادة جلستك",recoveryExpired:"انتهت صلاحية الاستعادة",playerReconnecting:"اللاعب يعيد الاتصال",timedOut:"فاتتك! عدّينا الجولة.",roomNotFound:"الغرفة مو موجودة — تأكد من الكود",roomFull:"الغرفة كاملة (٨ لاعبين)",nameTaken:"الاسم مكرر — عدّلناه لك",genericError:"صار خلل بسيط — جرّب مرة ثانية",loading:"لحظة…",skip:"تخطّي",copied:"اننسخ ✓",muteOn:"الصوت شغّال",muteOff:"الصوت مكتوم"};var Ee='fill="none" stroke="currentColor" stroke-width="2.1" stroke-linejoin="round" stroke-linecap="round"';function le(t=40){return`<svg width="${t}" height="${t}" viewBox="0 0 48 48" fill="none" aria-hidden="true">
    <line x1="7" y1="27" x2="41" y2="27" stroke="var(--line-2)" stroke-width="2"/>
    <path d="M24 5 L30.5 23.5 L24 27 L17.5 23.5 Z" fill="var(--gold)"/>
    <path d="M24 27 L28 40 L24 44 L20 40 Z" fill="var(--gold-deep)" opacity=".5"/>
    <circle cx="24" cy="25.5" r="1.5" fill="#fff"/>
  </svg>`}function ce(t,n=30){let h=`<svg width="${n}" height="${n}" viewBox="0 0 24 24" ${Ee} aria-hidden="true">`;return t==="back"?`${h}<path d="M12 20 V6"/><path d="M6.5 11 L12 5.5 L17.5 11"/><path d="M8.5 16.5 L12 13 L15.5 16.5" opacity=".55"/></svg>`:t==="dump"?`${h}<path d="M12 4 V16"/><path d="M6.5 11 L12 16.5 L17.5 11"/><path d="M8.5 5.5 L12 9 L15.5 5.5" opacity=".55"/></svg>`:`${h}<path d="M12 3 V10.5"/><path d="M8.5 8 L12 11.5 L15.5 8"/><rect x="4.5" y="14" width="15" height="6" rx="1.4"/><path d="M9.5 14 V12.4 A2.5 2.5 0 0 1 14.5 12.4 V14"/></svg>`}function V(t,n=22){return`${`<svg width="${n}" height="${n}" viewBox="0 0 24 24" ${Ee} aria-hidden="true">`}${{soundOn:'<path d="M4 9 V15 H8 L13 19 V5 L8 9 Z"/><path d="M16.5 8.5 A5 5 0 0 1 16.5 15.5"/><path d="M19 6 A8.5 8.5 0 0 1 19 18" opacity=".55"/>',soundOff:'<path d="M4 9 V15 H8 L13 19 V5 L8 9 Z"/><path d="M17 9 L21 15 M21 9 L17 15"/>',copy:'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8 V6 A2 2 0 0 0 14 4 H6 A2 2 0 0 0 4 6 V14 A2 2 0 0 0 6 16 H8"/>',check:'<path d="M4 12.5 L9.5 18 L20 6.5"/>',lock:'<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11 V8 A4 4 0 0 1 16 8 V11"/><circle cx="12" cy="15.5" r="1.3"/>',bolt:'<path d="M13 3 L5 13 H11 L10 21 L19 10 H12 Z"/>',refresh:'<path d="M20 11 A8 8 0 1 0 19 15"/><path d="M20 5 V11 H14"/>',users:'<circle cx="9" cy="8" r="3.2"/><path d="M3.5 20 A6 6 0 0 1 14.5 20"/><path d="M16 5.5 A3 3 0 0 1 16 11.4"/><path d="M17 14.5 A6 6 0 0 1 20.5 20" opacity=".6"/>',link:'<path d="M9 15 L15 9"/><path d="M11 6 L13 4 A4 4 0 0 1 19 10 L17 12"/><path d="M13 18 L11 20 A4 4 0 0 1 5 14 L7 12"/>',skip:'<path d="M6 5 L15 12 L6 19 Z"/><path d="M18 5 V19"/>'}[t]}</svg>`}var re=null,W=!1;try{W=typeof localStorage<"u"&&localStorage.getItem("dass_muted")==="1"}catch{W=!1}function ae(){if(typeof window>"u"||W)return null;if(!re){let t=window.AudioContext??window.webkitAudioContext;if(!t)return null;try{re=new t}catch{return null}}return re.state==="suspended"&&re.resume(),re}function R(t,n,h,b,w=.16,k=0){let T=ae();if(!T)return;let B=T.currentTime+k,$=T.createOscillator(),I=T.createGain();$.type=b,$.frequency.setValueAtTime(t,B),$.frequency.exponentialRampToValueAtTime(Math.max(1,n),B+h),I.gain.setValueAtTime(1e-4,B),I.gain.exponentialRampToValueAtTime(w,B+.006),I.gain.exponentialRampToValueAtTime(1e-4,B+h),$.connect(I).connect(T.destination),$.start(B),$.stop(B+h+.03)}function at(t,n,h){let b=ae();if(!b)return;let w=b.currentTime,k=Math.floor(b.sampleRate*t),T=b.createBuffer(1,k,b.sampleRate),B=T.getChannelData(0);for(let S=0;S<k;S++)B[S]=(Math.random()*2-1)*(1-S/k);let $=b.createBufferSource();$.buffer=T;let I=b.createBiquadFilter();I.type="highpass",I.frequency.value=h;let P=b.createGain();P.gain.setValueAtTime(n,w),P.gain.exponentialRampToValueAtTime(1e-4,w+t),$.connect(I).connect(P).connect(b.destination),$.start(w),$.stop(w+t+.03)}var N={unlock(){ae()},isMuted(){return W},setMuted(t){W=t;try{localStorage.setItem("dass_muted",t?"1":"0")}catch{}t||ae()},toggle(){return this.setMuted(!W),W},open(){R(180,320,.5,"sine",.1),R(90,70,.7,"sine",.14)},press(){R(340,300,.04,"square",.07)},inputOk(){R(520,720,.09,"sine",.12)},inputErr(){R(220,140,.14,"sawtooth",.14)},join(){R(440,620,.1,"sine",.12)},ready(){R(500,760,.12,"triangle",.13)},countdown(t=!1){R(t?940:700,t?940:700,.03,"square",t?.12:.06)},roundStart(){R(160,300,.28,"triangle",.14)},submit(){R(520,540,.05,"square",.1)},support(){R(420,760,.13,"sine",.18)},attack(){R(540,150,.12,"sawtooth",.2)},vault(){R(200,128,.24,"sine",.22),R(380,320,.18,"triangle",.08)},timeWarn(){R(300,300,.06,"sawtooth",.1)},roundClose(){R(260,120,.22,"sine",.14)},revealEvent(){R(300,420,.14,"triangle",.12)},betray(){at(.11,.32,1500),R(780,70,.2,"sawtooth",.22)},score(){R(600,900,.08,"sine",.1)},win(){ae()&&[262,330,392,523,659].forEach((n,h)=>window.setTimeout(()=>R(n,n*1.5,.5,"triangle",.14),h*150))},replay(){R(360,540,.12,"triangle",.12)}};var De=tt(_e(),1);function Pe(t,n="#0b0a0f",h="#f4eee3",b=2){let w=(0,De.default)(0,"M");w.addData(t),w.make();let k=w.getModuleCount(),T=k+b*2,B="";for(let $=0;$<k;$++)for(let I=0;I<k;I++)w.isDark($,I)&&(B+=`M${I+b} ${$+b}h1v1h-1z`);return`<svg viewBox="0 0 ${T} ${T}" width="100%" height="100%" shape-rendering="crispEdges" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg"><rect width="${T}" height="${T}" fill="${h}"/><path d="${B}" fill="${n}"/></svg>`}var Re={calm:{a:"139,121,242",a2:"235,178,76",i:.16},tension:{a:"235,178,76",a2:"235,178,76",i:.3},attack:{a:"255,77,94",a2:"139,121,242",i:.42},support:{a:"53,214,160",a2:"235,178,76",i:.34},secret:{a:"139,121,242",a2:"20,16,30",i:.12},win:{a:"247,206,114",a2:"235,178,76",i:.5}},nt=`
.dass-bg{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden;background:
  radial-gradient(120% 90% at 50% -10%, var(--bg-2), var(--bg) 60%)}
.dass-bg canvas{position:absolute;inset:0;width:100%;height:100%}
.dass-bg .glow{position:absolute;inset:-20%;transition:opacity 1.2s var(--e-out),background 1.2s var(--e-out);
  opacity:var(--bgi,.18);background:
    radial-gradient(45% 40% at 22% 18%, rgba(var(--bga,139,121,242),.5), transparent 70%),
    radial-gradient(50% 45% at 82% 78%, rgba(var(--bgb,235,178,76),.4), transparent 72%)}
.dass-bg .grain{position:absolute;inset:0;opacity:.05;mix-blend-mode:overlay;
  background-image:radial-gradient(circle at 1px 1px, #fff 1px, transparent 0);background-size:3px 3px}
`;function Ie(){ie(nt);let t=te("div","dass-bg"),n=te("canvas"),h=te("div","glow"),b=te("div","grain");t.append(h,b,n),document.body.prepend(t);let w=n.getContext("2d"),k=[],T=Math.min(2,window.devicePixelRatio||1);function B(){n.width=Math.floor(innerWidth*T),n.height=Math.floor(innerHeight*T);let P=Math.min(40,Math.round(innerWidth*innerHeight/42e3));k=Array.from({length:P},()=>({x:Math.random()*n.width,y:Math.random()*n.height,vy:-(.1+Math.random()*.25)*T,r:(.6+Math.random()*1.6)*T,a:.06+Math.random()*.14}))}B(),addEventListener("resize",B,{passive:!0});function $(){if(w){if(!document.hidden&&!Y()){w.clearRect(0,0,n.width,n.height);for(let P of k)P.y+=P.vy,P.y<-4&&(P.y=n.height+4,P.x=Math.random()*n.width),w.beginPath(),w.arc(P.x,P.y,P.r,0,7),w.fillStyle=`rgba(245,239,228,${P.a})`,w.fill()}requestAnimationFrame($)}}requestAnimationFrame($);function I(P){let S=Re[P];t.style.setProperty("--bga",S.a),t.style.setProperty("--bgb",S.a2),t.style.setProperty("--bgi",String(S.i))}return I("calm"),{setMood:I,flash(P){let S=Re[P];t.style.setProperty("--bga",S.a),t.style.setProperty("--bgi",String(Math.min(.6,S.i+.2))),window.setTimeout(()=>t.style.setProperty("--bgi",String(S.i)),420)}}}function ne(t=document){let n=new IntersectionObserver(h=>{for(let b of h)b.isIntersecting&&(b.target.classList.add("in"),n.unobserve(b.target))},{threshold:.16,rootMargin:"0px 0px -8% 0px"});for(let h of Array.from(t.querySelectorAll("[data-reveal]")))Y()?h.classList.add("in"):n.observe(h);return n}function Oe(t){let n=!1,h=()=>{n||(n=!0,requestAnimationFrame(()=>{t(),n=!1}))};return addEventListener("scroll",h,{passive:!0}),addEventListener("resize",h,{passive:!0}),t(),()=>{removeEventListener("scroll",h),removeEventListener("resize",h)}}function He(t){let n=t.getBoundingClientRect(),h=n.height+innerHeight,b=innerHeight-n.top;return Math.min(1,Math.max(0,b/h))}function ze(t,n=14){if(Y()||matchMedia("(pointer:coarse)").matches)return()=>{};let h=Array.from(t.querySelectorAll("[data-px]")),b=w=>{let k=(w.clientX/innerWidth-.5)*2,T=(w.clientY/innerHeight-.5)*2;for(let B of h){let $=Number(B.dataset.px||1);B.style.transform=`translate3d(${k*n*$}px,${T*n*$}px,0)`}};return t.addEventListener("pointermove",b),()=>t.removeEventListener("pointermove",b)}Te();ie(wt());var de=Ie(),pe=document.getElementById("app"),X=[],ge=!1;addEventListener("pointerdown",()=>{ge||(ge=!0,N.unlock(),N.open())},{once:!0});var ot=new Set(["/","/create","/join","/how-to-play"]);function it(t){let n=t.split("?")[0]??"/";ot.has(n)?(history.pushState({},"",t),he(),scrollTo({top:0,behavior:Y()?"auto":"smooth"})):location.href=t}addEventListener("popstate",he);addEventListener("click",t=>{let n=t.target.closest("[data-link]");n&&(t.preventDefault(),N.press(),it(n.dataset.link))});function st(){for(let t of X)t();X=[]}function he(){st();let t=location.pathname;t==="/create"?ft():t==="/join"?ut():t==="/how-to-play"?vt():dt(),lt()}queueMicrotask(he);function fe(t=""){return`<nav class="nav">
    <a class="nav-logo" data-link="/">${le(30)}<span class="wordmark g">${G.brand}</span></a>
    <div class="nav-links">
      <a data-link="/how-to-play" class="nav-a ${t==="how"?"on":""}">كيف تلعب</a>
      <a data-link="/join" class="nav-a ${t==="join"?"on":""}">انضم بكود</a>
      <button id="mute" class="icon-btn sm" aria-label="صوت">${V(N.isMuted()?"soundOff":"soundOn",18)}</button>
      <a data-link="/create" class="btn primary nav-cta">ابدأ لعبة</a>
    </div>
  </nav>`}function je(){return`<footer class="foot" data-reveal>
    <div class="foot-brand">${le(26)}<span class="wordmark g">${G.brand}</span></div>
    <div class="foot-links">
      <a data-link="/how-to-play" class="foot-a">كيف تلعب</a>
      <a data-link="/join" class="foot-a">انضم بكود</a>
      <a data-link="/create" class="foot-a">سوّي غرفة</a>
    </div>
    <div class="foot-cap muted">دسّ · لعبة مجالس · نسخة ٠.١</div>
  </footer>`}function lt(){j("#mute")?.addEventListener("click",()=>{N.toggle(),N.isMuted()||N.press(),j("#mute").innerHTML=V(N.isMuted()?"soundOff":"soundOn",18)})}function ct(){let t=new IntersectionObserver(n=>{for(let h of n)h.isIntersecting&&de.setMood(h.target.dataset.mood)},{threshold:.5});for(let n of ve("[data-mood]"))t.observe(n);X.push(()=>t.disconnect())}function dt(){let t=!sessionStorage.getItem("dass_seen");sessionStorage.setItem("dass_seen","1"),pe.innerHTML=`${fe()}
  <main class="site">
    <section class="hero" data-mood="calm">
      <div class="hero-bgart" id="heroart">${gt()}</div>
      <div class="hero-copy ${t?"intro":""}">
        <div class="hero-kicker" data-rc>لعبة مجالس · من ٤ إلى ٨ لاعبين</div>
        <h1 class="hero-title wordmark">${G.brand}</h1>
        <p class="hero-tag" data-rc>اختياراتكم سرية… لكن كل الدسّات تنفضح.</p>
        <p class="hero-sub" data-rc>أعلن نيّتك بصوت عالي، وسوّي عكسها بالسر. الشاشة الكبيرة مسرحكم، وجوالك أداة القرار — وبالنهاية ينكشف مين دعم، مين ضرب، ومين دسّها على الكل.</p>
        <div class="hero-cta" data-rc>
          <a data-link="/create" class="btn primary lg">ابدأ لعبة</a>
          <a data-link="/join" class="btn lg">انضم بكود</a>
        </div>
      </div>
      <div class="scroll-hint" aria-hidden="true"><span>مرّر</span><i></i></div>
    </section>

    <section class="scene concept" data-mood="secret" data-reveal>
      <div class="scene-head"><span class="eyebrow" data-rc>الفكرة</span><h2 class="scene-title" data-rc>مجلس واحد… ونوايا مخفية</h2></div>
      <div class="concept-grid">
        <div class="concept-art" data-rc>${ht()}</div>
        <ul class="concept-list">
          <li data-rc><b>الشاشة الكبيرة</b> هي المسرح — الكل يشوفها.</li>
          <li data-rc><b>جوالك</b> أداة قرارك السري، ما أحد يشوف وش اخترت.</li>
          <li data-rc><b>ادعم</b> صاحبك، <b>اضرب</b> خصمك، أو <b>بيع</b> وثبّت مكسبك.</li>
          <li data-rc>تحالفات، شك، وخيانات… <b>والنهاية تكشف كل شي.</b></li>
        </ul>
      </div>
    </section>

    <section class="scene steps" data-mood="calm" data-reveal>
      <div class="scene-head"><span class="eyebrow" data-rc>ثلاث خطوات</span><h2 class="scene-title" data-rc>تبدأون خلال ثوانٍ</h2></div>
      <div class="steps-grid">
        <div class="step" data-rc><span class="step-n">١</span><div class="step-mock">${mt()}</div><h3>افتح الغرفة على الشاشة</h3><p class="muted">تطلع لك غرفة وكود وQR.</p></div>
        <div class="step" data-rc><span class="step-n">٢</span><div class="step-mock">${bt()}</div><h3>يدخل الكل من جوالاتهم</h3><p class="muted">يصوّرون الـQR أو يكتبون الكود.</p></div>
        <div class="step" data-rc><span class="step-n">٣</span><div class="step-mock">${yt()}</div><h3>قرّروا… وانتظروا الكشف</h3><p class="muted">كل جولة قرار سري، وبالنهاية الفضيحة.</p></div>
      </div>
      <div class="steps-cta" data-rc><a data-link="/how-to-play" class="btn">اشرحها لي بالتفصيل</a></div>
    </section>

    <section class="scene features" data-mood="secret" data-reveal>
      <div class="scene-head center"><span class="eyebrow" data-rc>ليش دسّ؟</span><h2 class="scene-title" data-rc>مصمّمة للمجلس</h2></div>
      <div class="feat-grid">
        <div class="feat" data-rc><span class="feat-ic">${V("users",24)}</span><h3>شاشة وحدة، والكل يلعب</h3><p class="muted">التلفاز هو المسرح، وكل واحد يتحكم من جواله.</p></div>
        <div class="feat" data-rc><span class="feat-ic gold">${V("lock",24)}</span><h3>قراراتك تبقى بجوالك</h3><p class="muted">نيّتك وفعلك السري ما يوصلون لأحد قبل الكشف.</p></div>
        <div class="feat" data-rc><span class="feat-ic">${V("bolt",24)}</span><h3>بدون تحميل تطبيق</h3><p class="muted">رابط + اسم، وخلاص — تدخلون بثوانٍ.</p></div>
        <div class="feat" data-rc><span class="feat-ic">${le(26)}</span><h3>عربي من جد</h3><p class="muted">واجهة ونصوص بعامية طبيعية، مو ترجمة.</p></div>
        <div class="feat" data-rc><span class="feat-ic">${V("refresh",24)}</span><h3>جولة ورا جولة</h3><p class="muted">تعيدونها بنفس الشلة أو شلة جديدة بضغطة.</p></div>
        <div class="feat" data-rc><span class="feat-ic">${V("users",24)}</span><h3>من ٤ إلى ٨ لاعبين</h3><p class="muted">تكفي لسهرة صغيرة أو مجلس كامل.</p></div>
      </div>
    </section>

    <section class="cycle" data-mood="tension" id="cycle">
      <div class="cycle-pin">
        <span class="eyebrow">دورة المباراة</span>
        <div class="cycle-stage" id="cyclestage"></div>
        <div class="cycle-rail" id="cyclerail"></div>
      </div>
    </section>

    <section class="scene betray" data-mood="attack" data-reveal id="betray">
      <div class="betray-art">${xt()}</div>
      <div class="betray-copy">
        <span class="eyebrow" data-rc>اللحظة</span>
        <h2 class="scene-title" data-rc>وعد… ثم دسّة</h2>
        <p class="betray-line" data-rc>مسار الدعم يبان ثابت… لين تنكسر الثقة أمام الجميع. هنا تعرف مين كان معك فعلاً، ومين كان يلعبها من تحت لتحت.</p>
      </div>
    </section>

    <section class="scene atmos" data-mood="attack" data-reveal>
      <div class="atmos-inner">
        <span class="eyebrow" data-rc>الجو</span>
        <blockquote class="atmos-q" data-rc>«لا واللهِ… أنا كنت أدعمك!»</blockquote>
        <p class="atmos-p" data-rc>ضحك، اتهامات، وتحالفات تنهار بثانية. دسّ مو بس لعبة — هي قصص تتناقلونها بعد المجلس. مين خان مين؟ ومين صدّق الغلط؟ كل جولة تطلّع بطل… وضحيّة.</p>
      </div>
    </section>

    <section class="scene final" data-mood="win" data-reveal>
      <h2 class="final-title" data-rc>مجلسكم… ناقص دسّة</h2>
      <p class="final-sub" data-rc>اجمعوا الشلة، افتحوا الشاشة، وشوفوا مين يطلع أذكى واحد.</p>
      <div class="final-cta" data-rc>
        <a data-link="/create" class="btn primary lg">ابدأ لعبة</a>
        <a data-link="/join" class="btn lg">انضم بكود</a>
      </div>
    </section>
    ${je()}
  </main>`;let n=j("#heroart");n&&X.push(ze(n,16));let h=ne();if(X.push(()=>h.disconnect()),ct(),pt(),t&&!Y()){let b=j(".hero-title");b&&b.animate({opacity:[0,1],filter:["blur(16px)","blur(0)"],transform:["scale(.92)","scale(1)"]},{duration:900,easing:"cubic-bezier(.16,1,.3,1)",fill:"both"})}}var ee=[{t:"اللوبي",d:"الكل يدخل ويستعد",c:"var(--violet)"},{t:"العد التنازلي",d:"يبدأ الضغط",c:"var(--gold)"},{t:"القرار السري",d:"تختار… بلا ما أحد يدري",c:"var(--text)"},{t:"التوتر",d:"قبل ما ينكشف شي",c:"var(--violet)"},{t:"نتيجة الجولة",d:"الأسهم تتحرك",c:"var(--green)"},{t:"الكشف",d:"كل دسّة تنفضح",c:"var(--red)"},{t:"الفائز",d:"أكبر خزنة تكسب",c:"var(--gold)"}];function pt(){let t=j("#cyclestage"),n=j("#cyclerail"),h=j("#cycle");if(!t||!n||!h)return;n.innerHTML=ee.map((T,B)=>`<span class="rail-dot" data-i="${B}"><i></i><b>${T.t}</b></span>`).join("");let b=-1,w=T=>{if(T===b)return;b=T;let B=ee[T];t.style.setProperty("--c",B.c),t.innerHTML=`<div class="cy-num">${T+1}<span>/ ${ee.length}</span></div><div class="cy-t">${B.t}</div><div class="cy-d muted">${B.d}</div><div class="cy-bars">${ee.map(($,I)=>`<i class="${I<=T?"on":""}"></i>`).join("")}</div>`,Ae(j(".cy-t",t));for(let $ of ve(".rail-dot",n))$.classList.toggle("on",Number($.dataset.i)<=T);ge&&N.revealEvent()};w(0);let k=Oe(()=>{let T=He(h),B=Math.min(ee.length-1,Math.max(0,Math.floor(T*ee.length)));w(B)});X.push(k)}function ft(){de.setMood("secret"),pe.innerHTML=`${fe()}
  <main class="page center-page">
    <div class="page-card panel" data-reveal>
      <span class="eyebrow" data-rc>غرفة جديدة</span>
      <h1 class="page-title" data-rc>افتح المسرح</h1>
      <p class="muted page-sub" data-rc>بننقلك لشاشة التلفاز، بتطلع غرفة بكود وQR — حطّها على شاشة كبيرة، وخلّ الشلة يدخلون من جوالاتهم.</p>
      <div class="create-tips" data-rc>
        <div class="tip">${V("users",20)} ٤ إلى ٨ لاعبين</div>
        <div class="tip">${V("link",20)} انضمام بالـQR أو الكود</div>
      </div>
      <button id="startbtn" class="btn primary lg wide" data-rc>افتح الغرفة على الشاشة</button>
      <a data-link="/" class="back-link" data-rc>رجوع للرئيسية</a>
    </div>
  </main>`;let t=ne();X.push(()=>t.disconnect()),j("#startbtn")?.addEventListener("click",n=>{let h=n.currentTarget;Le(h),N.roundStart(),h.innerHTML='<span class="spinner"></span>',setTimeout(()=>location.href="/tv",260)})}function ut(){de.setMood("calm");let t=new URLSearchParams(location.search).get("code")??"";pe.innerHTML=`${fe("join")}
  <main class="page center-page">
    <div class="page-card panel" data-reveal>
      <span class="eyebrow" data-rc>انضمام</span>
      <h1 class="page-title" data-rc>خشّ المجلس</h1>
      <div class="join-form" data-rc>
        <input id="code" class="input mono" placeholder="${G.codePlaceholder}" value="${ke(t)}" maxlength="12" autocapitalize="characters" autocorrect="off" autocomplete="off" inputmode="text" />
        <input id="name" class="input" placeholder="${G.namePlaceholder}" maxlength="20" autocomplete="off" />
        <button id="joinbtn" class="btn primary lg wide">${G.join}</button>
        <div id="jerr" class="j-err"></div>
      </div>
      <a data-link="/" class="back-link" data-rc>رجوع للرئيسية</a>
    </div>
  </main>`;let n=ne();X.push(()=>n.disconnect());let h=j("#code"),b=j("#name");(t?b:h).focus();let w=()=>{let k=h.value.trim(),T=b.value.trim();if(!k)return Se(h,"اكتب كود الغرفة");if(!T)return Se(b,"اكتب اسمك");N.submit(),location.href=`/play?code=${encodeURIComponent(k)}&name=${encodeURIComponent(T)}`};j("#joinbtn")?.addEventListener("click",w),b.addEventListener("keydown",k=>{k.key==="Enter"&&w()})}function Se(t,n){t.classList.add("err");let h=j("#jerr");h&&(h.textContent=n),N.inputErr(),t.animate({transform:["translateX(-6px)","translateX(5px)","translateX(0)"]},{duration:180}),setTimeout(()=>t.classList.remove("err"),700)}function vt(){de.setMood("calm");let t=w=>w.toLocaleString("ar-EG"),n=[["افتح دسّ على الشاشة","شغّل الموقع على تلفاز أو شاشة كبيرة يشوفها الكل."],["سوّي غرفة","اضغط «ابدأ لعبة» — يطلع كود وQR على الشاشة."],["ادخلوا من الجوال","كل لاعب يصوّر الـQR، أو يكتب الكود بصفحة الانضمام."],["حطّوا الأسماء","كل واحد يكتب اسمه ويضغط «جاهز»."],["ابدأوا","لما الكل يجهز (٤ لاعبين على الأقل) الهوست يبدأ المباراة."]],h=[["var(--green)","الإعلان","كل جولة تعلن للكل: تدعم لاعب، تضربه، أو تبيع نفسك."],["var(--violet)","نافذة التفاعل","تشوفون إعلانات بعض… وتقدر تغيّر إعلانك مرة وحدة."],["var(--violet)","القفل السري","على جوالك بس، تختار فعلك الحقيقي — تلتزم بوعدك، أو تدسّها وتسوّي العكس. محد يشوف."],["var(--red)","التحريك","الأسهم تتحرك على الشاشة… بس بدون ما ينكشف مين سوّى وش."],["var(--gold)","الخزنة","لما سهمك يطلع فوق، بيع وثبّته بالخزنة — رقم مقفول ما ينزل."]];pe.innerHTML=`${fe("how")}
  <main class="page howto">
    <section class="howto-hero" data-reveal>
      <span class="eyebrow" data-rc>كيف تلعب</span>
      <h1 class="page-title big" data-rc>دسّ… من الصفر</h1>
      <p class="muted page-sub" data-rc>لعبة سرّية بسيطة: تعلن نيّتك قدّام الكل، وبعدين تقرّر بالسر — إما تلتزم بوعدك، أو <b class="gold">تدسّها</b> وتسوّي العكس. وبالنهاية كل الدسّات تنفضح.</p>
    </section>

    <section class="ht-block" data-reveal>
      <div class="ht-head"><span class="eyebrow" data-rc>أولاً · التجهيز</span><h2 class="scene-title" data-rc>من الرابط للّعب بأقل من دقيقة</h2></div>
      <div class="howto-steps">
        ${n.map((w,k)=>`<div class="hstep" data-rc><span class="hstep-n">${t(k+1)}</span><div><h3>${w[0]}</h3><p class="muted">${w[1]}</p></div></div>`).join("")}
      </div>
    </section>

    <section class="ht-block" data-reveal>
      <div class="ht-head"><span class="eyebrow" data-rc>ثانياً · الجولة</span><h2 class="scene-title" data-rc>دورة كل جولة</h2></div>
      <div class="hphases">
        ${h.map((w,k)=>`<div class="hphase" data-rc style="--c:${w[0]}"><span class="hp-n">${t(k+1)}</span><div><h3>${w[1]}</h3><p class="muted">${w[2]}</p></div></div>`).join("")}
      </div>
    </section>

    <section class="ht-block" data-reveal>
      <div class="ht-head"><span class="eyebrow" data-rc>السر مقابل العلن</span><h2 class="scene-title" data-rc>جوالك يخفي… الشاشة تكشف</h2></div>
      <div class="ht-split">
        <div class="ht-side secret" data-rc><div class="hs-badge">جوالك · سري 🔒</div><ul><li>قرارك ونيّتك.</li><li>فعلك الحقيقي (الدسّة).</li><li>محد من اللاعبين يشوفه.</li></ul></div>
        <div class="ht-side public" data-rc><div class="hs-badge gold">الشاشة · علني</div><ul><li>الإعلانات وحركة الأسهم.</li><li>الخزنات والترتيب.</li><li>الكشف النهائي للجميع.</li></ul></div>
      </div>
    </section>

    <section class="ht-block" data-reveal>
      <div class="ht-head"><span class="eyebrow" data-rc>النهاية</span><h2 class="scene-title" data-rc>الكشف… ثم مين يكسب</h2></div>
      <p class="ht-p" data-rc>بعد آخر جولة، الشاشة تكشف كل إعلان مقابل الفعل الحقيقي — كل دسّة تطلع للنور، وتشوفون مين خان مين. <b class="gold">صاحب أكبر خزنة يفوز.</b> وبعدها تعيدونها بنفس الشلة، أو تبدأون شلة جديدة.</p>
    </section>

    <section class="ht-block" data-reveal>
      <div class="ht-head"><span class="eyebrow" data-rc>الأفعال الثلاثة</span></div>
      <div class="actcards">
        <div class="actcard" data-rc style="--c:var(--green)"><span class="ac-ic">${ce("back",34)}</span><b>دعم</b><span class="muted">ترفع سهم لاعب ثاني.</span></div>
        <div class="actcard" data-rc style="--c:var(--red)"><span class="ac-ic">${ce("dump",34)}</span><b>ضرب</b><span class="muted">توطّي سهم لاعب ثاني.</span></div>
        <div class="actcard" data-rc style="--c:var(--gold)"><span class="ac-ic">${ce("sell",34)}</span><b>بيع</b><span class="muted">تثبّت سهمك بالخزنة.</span></div>
      </div>
    </section>

    <section class="ht-cta-final" data-reveal>
      <h2 class="scene-title" data-rc>جاهزين؟</h2>
      <div class="howto-cta" data-rc><a data-link="/create" class="btn primary lg">ابدأ لعبة</a><a data-link="/join" class="btn lg">انضم بكود</a></div>
    </section>
    ${je()}
  </main>`;let b=ne();X.push(()=>b.disconnect())}function gt(){return`<svg viewBox="0 0 680 520" class="art hero-network" aria-hidden="true">
    <defs>
      <linearGradient id="table-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--gold-2)"/><stop offset="1" stop-color="var(--gold-deep)"/></linearGradient>
      <linearGradient id="table-dark" x1="0" y1="0" x2="0" y2="1"><stop stop-color="var(--surface-3)"/><stop offset="1" stop-color="var(--surface)"/></linearGradient>
      <filter id="soft"><feGaussianBlur stdDeviation="14"/></filter>
    </defs>
    <ellipse cx="340" cy="276" rx="238" ry="166" fill="rgba(139,121,242,.08)" filter="url(#soft)" data-px=".2"/>
    <g class="whispers" fill="none" stroke="var(--line-2)" stroke-width="1.5" stroke-dasharray="4 10" data-px=".25">
      <path d="M104 176 Q340 18 576 176"/><path d="M88 340 Q340 510 592 340"/>
    </g>
    <g class="alliances" fill="none" stroke-linecap="round" stroke-width="4" data-px=".65">
      <path class="route support" d="M132 182 C210 126 255 136 302 218"/>
      <path class="route support delay" d="M548 176 C466 122 416 142 378 218"/>
      <path class="route attack" d="M116 342 C210 388 264 354 294 306"/>
      <path class="route betrayal" d="M564 346 C482 390 434 352 404 318 L448 278 L416 244"/>
    </g>
    <g class="table" data-px="1">
      <path d="M340 164 L454 230 L430 354 L250 354 L226 230 Z" fill="url(#table-dark)" stroke="var(--line-3)" stroke-width="2"/>
      <path d="M340 196 L402 232 L390 310 L290 310 L278 232 Z" fill="rgba(9,8,14,.72)" stroke="var(--line-2)"/>
      <path d="M340 218 L370 282 L340 316 L310 282 Z" fill="url(#table-gold)"/>
      <circle cx="340" cy="278" r="5" fill="#fff"/>
      <text x="340" y="342" text-anchor="middle" fill="var(--muted)" font-size="13" font-weight="800">القرار الحقيقي تحت الطاولة</text>
    </g>
    <g class="cards" data-px="1.25">
      <g transform="translate(170 224) rotate(-12)"><rect width="58" height="78" rx="10" fill="var(--surface-2)" stroke="var(--green)"/><path d="M18 39h22M29 28v22" stroke="var(--green)" stroke-width="3"/></g>
      <g transform="translate(456 230) rotate(13)"><rect width="58" height="78" rx="10" fill="var(--surface-2)" stroke="var(--red)"/><path d="M17 28l24 24M41 28L17 52" stroke="var(--red)" stroke-width="3"/></g>
      <g transform="translate(316 376)"><rect width="54" height="70" rx="10" fill="var(--surface-2)" stroke="var(--gold)"/><path d="M18 35h18" stroke="var(--gold)" stroke-width="3"/></g>
    </g>
    <g class="players" data-px="1.5">
      ${[[116,166,"ف","green"],[340,76,"س","gold"],[564,166,"ع","green"],[580,360,"ن","red"],[340,470,"م","gold"],[100,360,"ر","red"]].map(([t,n,h,b])=>`<g transform="translate(${t} ${n})" class="player ${b}"><circle r="30" fill="var(--surface-2)" stroke="currentColor" stroke-width="2"/><circle r="22" fill="var(--bg-1)"/><text y="7" text-anchor="middle" fill="var(--text)" font-size="20" font-weight="900">${h}</text><circle class="pulse" r="36" fill="none" stroke="currentColor"/></g>`).join("")}
    </g>
    <g class="secret-seal" transform="translate(340 278)" data-px="1.8"><circle r="54" fill="none" stroke="var(--gold)" stroke-width="1.5" stroke-dasharray="3 8"/><path d="M0-18L14 10 0 24-14 10Z" fill="var(--gold)" opacity=".9"/></g>
  </svg>`}function ht(){return`<svg viewBox="0 0 420 300" class="art" aria-hidden="true">
    ${[...Array(5)].map((t,n)=>{let h=60+n*75;return`<g><circle cx="${h}" cy="70" r="20" fill="var(--surface-3)" stroke="var(--line-3)" stroke-width="2"/><text x="${h}" y="77" text-anchor="middle" fill="var(--text-2)" font-size="18" font-weight="800">${["ف","س","ع","ن","م"][n]}</text></g>`}).join("")}
    <path d="M60 90 L135 210" stroke="var(--green)" stroke-width="3" fill="none"/>
    <path d="M135 90 L210 210" stroke="var(--green)" stroke-width="3" fill="none" opacity=".7"/>
    <path d="M285 90 L210 210" stroke="var(--red)" stroke-width="3" fill="none"/>
    <path d="M360 90 L285 210 L330 240" stroke="var(--red)" stroke-width="3" fill="none" stroke-linecap="round"/>
    <rect x="30" y="210" width="360" height="60" rx="10" fill="var(--surface)" stroke="var(--line-2)"/>
    <text x="210" y="248" text-anchor="middle" fill="var(--muted)" font-size="16" font-weight="700">القرارات السرية… تحت الطبقة</text>
  </svg>`}function xt(){return`<svg viewBox="0 0 480 340" class="art betray-svg" aria-hidden="true">
    <g stroke="var(--line-2)" stroke-width="1.4" opacity=".45" stroke-linecap="round">
      <line x1="54" y1="36" x2="54" y2="302"/>
      <line x1="54" y1="302" x2="446" y2="302"/>
    </g>
    <g class="b-nodes" fill="var(--surface-3)"><circle cx="54" cy="222" r="8" stroke="var(--green)" stroke-width="2.4"/><circle cx="54" cy="250" r="8" stroke="var(--green)" stroke-width="2.4" opacity=".7"/><circle cx="54" cy="240" r="8" stroke="var(--gold)" stroke-width="2.4"/></g>
    <path class="p-keep" d="M54 222 C150 216 250 150 424 92" stroke="var(--green)" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path class="p-keep" d="M54 250 C150 246 250 208 424 164" stroke="var(--green)" stroke-width="5" fill="none" stroke-linecap="round" opacity=".55"/>
    <path class="p-keep" d="M54 240 C132 236 194 214 252 194" stroke="var(--gold)" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path class="p-break" d="M252 194 L288 302 L332 250 L432 322" stroke="var(--red)" stroke-width="5.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <path class="b-crack" d="M252 194 L244 170 M252 194 L276 180 M252 194 L236 208" stroke="var(--red)" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <g class="b-ends"><circle cx="424" cy="92" r="9" fill="var(--surface-3)" stroke="var(--green)" stroke-width="2.4"/><circle cx="424" cy="164" r="9" fill="var(--surface-3)" stroke="var(--green)" stroke-width="2.4" opacity=".7"/><circle cx="252" cy="194" r="6" fill="var(--red)"/><circle cx="432" cy="322" r="9" fill="var(--surface-3)" stroke="var(--red)" stroke-width="2.4"/></g>
  </svg>`}function mt(){return`<div class="m-tv"><div class="m-tv-top"><span class="m-code mono">A·B·C</span><span class="m-qr">${Pe("https://dass","#0b0a0f","#f4eee3",1)}</span></div><div class="m-bars">${[60,90,40,75].map(t=>`<i style="height:${t}%"></i>`).join("")}</div></div>`}function bt(){return`<div class="m-phones">${["back","dump","sell"].map((t,n)=>`<div class="m-phone p${n}"><div class="m-ph-ic" style="color:${t==="back"?"var(--green)":t==="dump"?"var(--red)":"var(--gold)"}">${V("check",18)}</div></div>`).join("")}</div>`}function yt(){return'<div class="m-reveal"><span class="m-dassa">دسّة</span><div class="m-vault">١٤٨٠</div></div>'}function wt(){return`
  .site,.page{position:relative;z-index:var(--z-content)}
  .nav{position:sticky;top:0;z-index:var(--z-hud);display:flex;align-items:center;justify-content:space-between;gap:16px;
    padding:14px clamp(16px,4vw,48px);backdrop-filter:blur(12px);background:color-mix(in srgb,var(--bg) 70%,transparent);border-bottom:1px solid var(--line)}
  .nav-logo{display:flex;align-items:center;gap:8px;font-size:24px;text-decoration:none}
  .nav-links{display:flex;align-items:center;gap:clamp(10px,2vw,22px)}
  .nav-a{color:var(--text-2);text-decoration:none;font-weight:700;transition:color var(--t-micro)}
  .nav-a:hover,.nav-a.on{color:var(--text)}
  .nav-cta{min-height:44px;padding:10px 20px;text-decoration:none}
  .icon-btn.sm{width:40px;height:40px}
  @media(max-width:640px){ .nav-a{display:none} }

  .btn.lg{padding:17px 34px;font-size:clamp(17px,2vw,21px);min-height:58px;text-decoration:none}
  .eyebrow{display:inline-block;font-size:var(--fs-label);font-weight:800;letter-spacing:.14em;color:var(--gold);text-transform:uppercase}

  .hero{min-height:calc(100dvh - 73px);display:flex;align-items:center;padding:clamp(64px,8vh,110px) clamp(20px,6vw,90px);position:relative;overflow:hidden}
  .hero::after{content:"";position:absolute;inset:10% 7% 8%;border:1px solid var(--line);border-radius:48% 52% 44% 56%/58% 42% 58% 42%;opacity:.55;pointer-events:none}
  .hero-copy{max-width:680px;width:min(58%,680px);position:relative;z-index:2;padding:clamp(20px,3vw,44px);background:linear-gradient(90deg,color-mix(in srgb,var(--bg) 92%,transparent) 62%,transparent);border-inline-start:2px solid color-mix(in srgb,var(--gold) 55%,transparent)}
  .hero-kicker{color:var(--text-2);font-weight:800;margin-bottom:14px}
  .hero-title{font-size:var(--fs-display);margin:0 0 6px}
  .hero-tag{font-size:clamp(22px,3.2vw,38px);font-weight:900;line-height:1.25;margin:0 0 14px}
  .hero-sub{font-size:var(--fs-body);color:var(--text-2);line-height:1.8;max-width:52ch;margin:0 0 28px}
  .hero-cta{display:flex;gap:14px;flex-wrap:wrap}
  .hero-bgart{position:absolute;z-index:1;inset-inline-end:clamp(-70px,1vw,20px);top:50%;transform:translateY(-50%);width:min(58vw,760px);aspect-ratio:680/520}
  .art{width:100%;height:100%;overflow:visible}
  .hero-network .player{color:var(--gold)} .hero-network .player.green{color:var(--green)} .hero-network .player.red{color:var(--red)}
  .hero-network .route{stroke-dasharray:420;stroke-dashoffset:420;animation:routeDraw 2.4s var(--e-pull) .35s forwards}
  .hero-network .route.support{stroke:var(--green)} .hero-network .route.attack,.hero-network .route.betrayal{stroke:var(--red)}
  .hero-network .route.delay{animation-delay:.8s}.hero-network .route.betrayal{animation-delay:1.15s}
  .hero-network .pulse{opacity:0;animation:playerPulse 3.6s ease-out infinite}.hero-network .player:nth-child(2n) .pulse{animation-delay:1.2s}
  .hero-network .secret-seal{transform-box:fill-box;transform-origin:center;animation:sealTurn 18s linear infinite}
  @keyframes routeDraw{to{stroke-dashoffset:0}}@keyframes playerPulse{0%,55%{opacity:0;r:30px}70%{opacity:.45}100%{opacity:0;r:48px}}@keyframes sealTurn{to{rotate:360deg}}
  .hero-copy.intro>*{opacity:0;animation:heroUp .7s var(--e-pull) forwards}
  .hero-copy.intro .hero-kicker{animation-delay:.1s} .hero-copy.intro .hero-tag{animation-delay:.35s} .hero-copy.intro .hero-sub{animation-delay:.5s} .hero-copy.intro .hero-cta{animation-delay:.65s}
  @keyframes heroUp{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:none}}
  .scroll-hint{position:absolute;bottom:24px;left:50%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:6px;color:var(--muted);font-size:12px}
  .scroll-hint i{width:1px;height:26px;background:linear-gradient(var(--muted),transparent);animation:breathe 1.8s ease-in-out infinite}

  .scene{max-width:1180px;margin:0 auto;padding:clamp(70px,12vh,150px) clamp(20px,5vw,48px)}
  .scene-head{margin-bottom:clamp(28px,5vh,56px)}
  .scene-title{font-size:var(--fs-h1);font-weight:900;margin:10px 0 0;text-wrap:balance}
  .concept-grid{display:grid;grid-template-columns:1fr 1fr;gap:clamp(24px,4vw,60px);align-items:center}
  .concept-art{background:var(--surface);border:1px solid var(--line-2);border-radius:var(--r-3);padding:20px}
  .concept-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:18px}
  .concept-list li{font-size:var(--fs-h3);line-height:1.6;padding-inline-start:20px;border-inline-start:2px solid var(--line-2)}
  .concept-list b{color:var(--gold)}

  .steps-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
  .step{background:linear-gradient(180deg,var(--surface-2),var(--surface));border:1px solid var(--line-2);border-radius:var(--r-3);padding:24px;display:flex;flex-direction:column;gap:12px}
  .step-n{width:40px;height:40px;border-radius:12px;display:grid;place-items:center;font-weight:900;background:var(--surface-3);color:var(--gold);font-size:20px}
  .step-mock{height:150px;border-radius:var(--r-2);background:var(--bg-1);border:1px solid var(--line);display:grid;place-items:center;overflow:hidden}
  .step h3{margin:0;font-size:var(--fs-h3)}
  .steps-cta{margin-top:28px;text-align:center}

  .m-tv{width:80%;height:80%;background:var(--surface);border:1px solid var(--line-2);border-radius:10px;padding:10px;display:flex;flex-direction:column;gap:8px}
  .m-tv-top{display:flex;justify-content:space-between;align-items:center} .m-code{color:var(--gold);font-weight:900}
  .m-qr{width:34px;height:34px;background:#f4eee3;border-radius:4px;padding:2px} .m-qr svg{width:100%;height:100%}
  .m-bars{flex:1;display:flex;align-items:flex-end;gap:6px}
  .m-bars i{flex:1;background:linear-gradient(180deg,var(--green),transparent);border-radius:3px}
  .m-phones{display:flex;gap:8px} .m-phone{width:38px;height:74px;border-radius:9px;background:var(--surface);border:1px solid var(--line-2);display:grid;place-items:center}
  .m-phone.p1{transform:translateY(-8px)} .m-phone.p2{transform:translateY(4px)}
  .m-reveal{text-align:center} .m-dassa{color:var(--red);font-weight:900;font-size:20px} .m-vault{color:var(--gold);font-weight:900;font-size:30px;font-variant-numeric:tabular-nums}

  .cycle{position:relative;height:220vh}
  .cycle-pin{position:sticky;top:0;height:100dvh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:22px;text-align:center;padding:20px}
  .cycle-stage{--c:var(--gold);display:flex;flex-direction:column;align-items:center;gap:10px}
  .cy-num{font-size:clamp(60px,12vw,150px);font-weight:900;color:var(--c);line-height:1}
  .cy-num span{font-size:.3em;color:var(--muted);margin-inline-start:8px}
  .cy-t{font-size:var(--fs-h1);font-weight:900} .cy-d{font-size:var(--fs-h3)}
  .cy-bars{display:flex;gap:6px;margin-top:10px} .cy-bars i{width:34px;height:5px;border-radius:3px;background:var(--surface-3);transition:background .4s} .cy-bars i.on{background:var(--c)}
  .cycle-rail{display:flex;gap:clamp(8px,2vw,22px);flex-wrap:wrap;justify-content:center;max-width:900px}
  .rail-dot{display:flex;align-items:center;gap:6px;color:var(--muted);font-size:13px;font-weight:700;transition:color .3s}
  .rail-dot i{width:8px;height:8px;border-radius:50%;background:var(--surface-3);transition:background .3s}
  .rail-dot.on{color:var(--text-2)} .rail-dot.on i{background:var(--gold)}
  @media(max-width:640px){ .rail-dot b{display:none} }

  .betray{display:grid;grid-template-columns:1fr 1fr;gap:clamp(24px,4vw,60px);align-items:center}
  .betray-art{background:radial-gradient(circle at 60% 40%,color-mix(in srgb,var(--red) 10%,transparent),transparent 70%);border-radius:var(--r-3)}
  .betray-svg .p-keep,.betray-svg .p-break{stroke-dasharray:600;stroke-dashoffset:600}
  .betray.in .betray-svg .p-keep{animation:crackDraw 1s var(--e-pull) forwards}
  .betray.in .betray-svg .p-break{animation:crackDraw .8s var(--e-sharp) .8s forwards}
  .betray-svg .b-crack{stroke-dasharray:120;stroke-dashoffset:120} .betray.in .betray-svg .b-crack{animation:crackDraw .3s var(--e-sharp) 1.5s forwards}
  .betray-svg .b-ends{opacity:0} .betray.in .betray-svg .b-ends{opacity:1;transition:opacity .5s ease 1.35s}
  .betray-line{font-size:var(--fs-h3);line-height:1.7;color:var(--text-2);margin-top:14px}
  .betray-art{min-height:300px;display:grid;place-items:center;padding:16px}
  .betray-svg{width:100%;max-width:460px}
  .scene-head.center{text-align:center}
  .features .scene-head{text-align:center}
  .feat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
  .feat{padding:26px 22px;border-radius:var(--r-3);background:linear-gradient(180deg,var(--surface-2),var(--surface));border:1px solid var(--line-2);display:flex;flex-direction:column;gap:10px;transition:transform var(--t-comp) var(--e-out),border-color var(--t-comp) var(--e-out)}
  .feat:hover{transform:translateY(-4px);border-color:var(--line-3)}
  .feat-ic{width:50px;height:50px;border-radius:14px;display:grid;place-items:center;background:var(--surface-3);color:var(--text)}
  .feat-ic.gold{color:var(--gold);background:color-mix(in srgb,var(--gold) 14%,var(--surface-3))}
  .feat h3{margin:0;font-size:var(--fs-h3)} .feat p{margin:0;line-height:1.6}
  .atmos{display:flex;justify-content:center;text-align:center}
  .atmos-inner{max-width:780px}
  .atmos-q{font-size:clamp(28px,5.2vw,58px);font-weight:900;line-height:1.3;margin:14px 0 20px;background:linear-gradient(120deg,var(--red),var(--gold-2));-webkit-background-clip:text;background-clip:text;color:transparent;text-wrap:balance}
  .atmos-p{font-size:var(--fs-h3);line-height:1.9;color:var(--text-2)}
  @media(min-width:861px) and (max-width:1100px){ .feat-grid{grid-template-columns:1fr 1fr} }

  .final{text-align:center;max-width:900px}
  .final-title{font-size:var(--fs-h1);font-weight:900;margin:0} .final-sub{font-size:var(--fs-h3);color:var(--text-2);margin:14px 0 30px}
  .final-cta{display:flex;gap:14px;justify-content:center;flex-wrap:wrap}

  .foot{max-width:1180px;margin:0 auto;padding:40px clamp(20px,5vw,48px);display:flex;align-items:center;justify-content:space-between;gap:20px;flex-wrap:wrap;border-top:1px solid var(--line)}
  .foot-brand{display:flex;align-items:center;gap:8px;font-size:22px} .foot-links{display:flex;gap:20px} .foot-a{color:var(--text-2);text-decoration:none;font-weight:700} .foot-a:hover{color:var(--text)}

  .page{min-height:100dvh} .center-page{display:grid;place-items:center;padding:90px 20px}
  .page-card{width:100%;max-width:440px;padding:clamp(26px,5vw,40px);display:flex;flex-direction:column;gap:14px;text-align:center}
  .page-title{font-size:var(--fs-h1);font-weight:900;margin:6px 0} .page-title.big{font-size:var(--fs-display)}
  .page-sub{line-height:1.7} .create-tips{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin:6px 0}
  .tip{display:flex;align-items:center;gap:8px;font-weight:700;color:var(--text-2);background:var(--surface);border:1px solid var(--line-2);border-radius:var(--r-pill);padding:8px 14px}
  .back-link{color:var(--muted);text-decoration:none;font-weight:700;margin-top:4px}
  .join-form{display:flex;flex-direction:column;gap:12px} .j-err{color:var(--red);font-weight:800;min-height:20px}
  #code{direction:ltr;unicode-bidi:isolate;text-align:center}

  .howto{max-width:820px;margin:0 auto;padding:100px 20px 40px} .howto-hero{text-align:center;margin-bottom:40px}
  .howto-steps{display:flex;flex-direction:column;gap:14px}
  .hstep{display:flex;gap:16px;align-items:flex-start;padding:20px;border-radius:var(--r-2);background:var(--surface);border:1px solid var(--line-2)}
  .hstep-n{width:44px;height:44px;flex:0 0 auto;border-radius:12px;display:grid;place-items:center;font-weight:900;font-size:20px;background:var(--surface-3);color:var(--gold)}
  .hstep h3{margin:0 0 4px;font-size:var(--fs-h3)}
  .howto-actions{margin-top:36px;text-align:center;display:flex;flex-direction:column;gap:20px}
  .ha-actions{display:flex;gap:20px;justify-content:center;flex-wrap:wrap;font-size:var(--fs-h3)}
  .howto-cta{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
  .ht-block{margin-bottom:clamp(48px,8vh,88px)}
  .ht-head{margin-bottom:22px} .ht-head .scene-title{margin-top:8px;font-size:var(--fs-h2)}
  .hphases{display:flex;flex-direction:column;gap:12px}
  .hphase{display:flex;gap:16px;align-items:center;padding:18px 20px;border-radius:var(--r-2);background:var(--surface);border:1px solid var(--line-2);border-inline-start:3px solid var(--c)}
  .hp-n{width:40px;height:40px;flex:0 0 auto;border-radius:12px;display:grid;place-items:center;font-weight:900;font-size:19px;background:color-mix(in srgb,var(--c) 16%,var(--surface-2));color:var(--c)}
  .hphase h3{margin:0 0 3px;font-size:var(--fs-h3)}
  .ht-split{display:grid;grid-template-columns:1fr 1fr;gap:16px}
  .ht-side{padding:22px;border-radius:var(--r-2);background:var(--surface);border:1px solid var(--line-2)}
  .ht-side.secret{border-color:color-mix(in srgb,var(--violet) 40%,transparent)}
  .ht-side.public{border-color:color-mix(in srgb,var(--gold) 40%,transparent)}
  .ht-side ul{margin:12px 0 0;padding-inline-start:18px;display:flex;flex-direction:column;gap:8px;color:var(--text-2);line-height:1.5}
  .hs-badge{display:inline-block;font-weight:800;font-size:13px;letter-spacing:.06em;color:var(--violet)} .hs-badge.gold{color:var(--gold)}
  .ht-p{font-size:var(--fs-h3);line-height:1.85;color:var(--text-2)}
  .actcards{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
  .actcard{display:flex;flex-direction:column;align-items:center;gap:8px;text-align:center;padding:24px 14px;border-radius:var(--r-2);background:var(--surface);border:1px solid var(--line-2);border-top:3px solid var(--c)}
  .actcard .ac-ic{color:var(--c)} .actcard b{font-size:var(--fs-h3)}
  .ht-cta-final{text-align:center;padding:24px 0 8px} .ht-cta-final .scene-title{margin-bottom:20px}
  @media(max-width:640px){ .ht-split,.actcards{grid-template-columns:1fr} }

  @media(max-width:860px){
    .hero{min-height:auto;display:flex;flex-direction:column;text-align:center;padding:42px 18px 70px;gap:18px}
    .hero::after{inset:20px 10px 30px;border-radius:28px}
    .hero-copy{order:1;width:100%;padding:18px 8px 0;background:none;border:0;max-width:620px}
    .hero-bgart{order:2;position:relative;inset:auto;top:auto;transform:none;width:min(92vw,520px);margin-top:6px}
    .hero-sub{margin-inline:auto}.hero-cta{justify-content:center}.scroll-hint{display:none}
    .concept-grid,.betray,.steps-grid,.feat-grid{grid-template-columns:1fr}
    .betray-art{order:-1}
  }
  @media(max-width:480px){
    .hero{padding-top:26px}.hero-kicker{margin-bottom:8px}.hero-tag{font-size:clamp(25px,8vw,34px)}
    .hero-sub{font-size:15px;line-height:1.72;margin-bottom:20px}.hero-cta{display:grid;grid-template-columns:1fr 1fr;gap:10px}.hero-cta .btn{padding-inline:12px}
    .hero-bgart{width:min(96vw,430px)}.scene{padding-block:72px}.cycle{height:280vh}
  }
  `}
//# sourceMappingURL=bundle.js.map
