!function(t){var e={};function n(r){if(e[r])return e[r].exports;var o=e[r]={i:r,l:!1,exports:{}};return t[r].call(o.exports,o,o.exports,n),o.l=!0,o.exports}n.m=t,n.c=e,n.d=function(t,e,r){n.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:r})},n.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},n.t=function(t,e){if(1&e&&(t=n(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var o in t)n.d(r,o,function(e){return t[e]}.bind(null,o));return r},n.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return n.d(e,"a",e),e},n.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},n.p="https://peritext.github.io/ovide/build/",n(n.s=47)}([function(t,e){var n=t.exports={version:"2.6.11"};"number"==typeof __e&&(__e=n)},function(t,e){var n=t.exports="undefined"!=typeof window&&window.Math==Math?window:"undefined"!=typeof self&&self.Math==Math?self:Function("return this")();"number"==typeof __g&&(__g=n)},function(t,e,n){var r=n(31)("wks"),o=n(32),i=n(1).Symbol,s="function"==typeof i;(t.exports=function(t){return r[t]||(r[t]=s&&i[t]||(s?i:o)("Symbol."+t))}).store=r},function(t,e,n){var r=n(1),o=n(0),i=n(9),s=n(6),u=n(13),c=function(t,e,n){var a,f,l,p=t&c.F,v=t&c.G,h=t&c.S,d=t&c.P,y=t&c.B,_=t&c.W,m=v?o:o[e]||(o[e]={}),g=m.prototype,x=v?r:h?r[e]:(r[e]||{}).prototype;for(a in v&&(n=e),n)(f=!p&&x&&void 0!==x[a])&&u(m,a)||(l=f?x[a]:n[a],m[a]=v&&"function"!=typeof x[a]?n[a]:y&&f?i(l,r):_&&x[a]==l?function(t){var e=function(e,n,r){if(this instanceof t){switch(arguments.length){case 0:return new t;case 1:return new t(e);case 2:return new t(e,n)}return new t(e,n,r)}return t.apply(this,arguments)};return e.prototype=t.prototype,e}(l):d&&"function"==typeof l?i(Function.call,l):l,d&&((m.virtual||(m.virtual={}))[a]=l,t&c.R&&g&&!g[a]&&s(g,a,l)))};c.F=1,c.G=2,c.S=4,c.P=8,c.B=16,c.W=32,c.U=64,c.R=128,t.exports=c},function(t,e,n){var r=n(11);t.exports=function(t){if(!r(t))throw TypeError(t+" is not an object!");return t}},function(t,e,n){var r=n(57),o=n(62),i=n(79);t.exports=function(t){return r(t)||o(t)||i()}},function(t,e,n){var r=n(10),o=n(24);t.exports=n(12)?function(t,e,n){return r.f(t,e,o(1,n))}:function(t,e,n){return t[e]=n,t}},function(t,e){t.exports={}},function(t,e){var n={}.toString;t.exports=function(t){return n.call(t).slice(8,-1)}},function(t,e,n){var r=n(14);t.exports=function(t,e,n){if(r(t),void 0===e)return t;switch(n){case 1:return function(n){return t.call(e,n)};case 2:return function(n,r){return t.call(e,n,r)};case 3:return function(n,r,o){return t.call(e,n,r,o)}}return function(){return t.apply(e,arguments)}}},function(t,e,n){var r=n(4),o=n(55),i=n(56),s=Object.defineProperty;e.f=n(12)?Object.defineProperty:function(t,e,n){if(r(t),e=i(e,!0),r(n),o)try{return s(t,e,n)}catch(t){}if("get"in n||"set"in n)throw TypeError("Accessors not supported!");return"value"in n&&(t[e]=n.value),t}},function(t,e){t.exports=function(t){return"object"==typeof t?null!==t:"function"==typeof t}},function(t,e,n){t.exports=!n(22)((function(){return 7!=Object.defineProperty({},"a",{get:function(){return 7}}).a}))},function(t,e){var n={}.hasOwnProperty;t.exports=function(t,e){return n.call(t,e)}},function(t,e){t.exports=function(t){if("function"!=typeof t)throw TypeError(t+" is not a function!");return t}},function(t,e,n){var r=n(16);t.exports=function(t){return Object(r(t))}},function(t,e){t.exports=function(t){if(null==t)throw TypeError("Can't call method on  "+t);return t}},function(t,e,n){var r=n(51),o=n(16);t.exports=function(t){return r(o(t))}},function(t,e,n){var r=n(19),o=Math.min;t.exports=function(t){return t>0?o(r(t),9007199254740991):0}},function(t,e){var n=Math.ceil,r=Math.floor;t.exports=function(t){return isNaN(t=+t)?0:(t>0?r:n)(t)}},function(t,e,n){var r=n(31)("keys"),o=n(32);t.exports=function(t){return r[t]||(r[t]=o(t))}},function(t,e){t.exports=!0},function(t,e){t.exports=function(t){try{return!!t()}catch(t){return!0}}},function(t,e,n){var r=n(11),o=n(1).document,i=r(o)&&r(o.createElement);t.exports=function(t){return i?o.createElement(t):{}}},function(t,e){t.exports=function(t,e){return{enumerable:!(1&t),configurable:!(2&t),writable:!(4&t),value:e}}},function(t,e,n){"use strict";var r=n(65)(!0);n(34)(String,"String",(function(t){this._t=String(t),this._i=0}),(function(){var t,e=this._t,n=this._i;return n>=e.length?{value:void 0,done:!0}:(t=r(e,n),this._i+=t.length,{value:t,done:!1})}))},function(t,e,n){var r=n(10).f,o=n(13),i=n(2)("toStringTag");t.exports=function(t,e,n){t&&!o(t=n?t:t.prototype,i)&&r(t,i,{configurable:!0,value:e})}},function(t,e,n){var r=n(8),o=n(2)("toStringTag"),i="Arguments"==r(function(){return arguments}());t.exports=function(t){var e,n,s;return void 0===t?"Undefined":null===t?"Null":"string"==typeof(n=function(t,e){try{return t[e]}catch(t){}}(e=Object(t),o))?n:i?r(e):"Object"==(s=r(e))&&"function"==typeof e.callee?"Arguments":s}},function(t,e,n){"use strict";var r=n(14);function o(t){var e,n;this.promise=new t((function(t,r){if(void 0!==e||void 0!==n)throw TypeError("Bad Promise constructor");e=t,n=r})),this.resolve=r(e),this.reject=r(n)}t.exports.f=function(t){return new o(t)}},function(t,e,n){t.exports=n(80)},function(t,e,n){var r=n(50),o=n(33);t.exports=Object.keys||function(t){return r(t,o)}},function(t,e,n){var r=n(0),o=n(1),i=o["__core-js_shared__"]||(o["__core-js_shared__"]={});(t.exports=function(t,e){return i[t]||(i[t]=void 0!==e?e:{})})("versions",[]).push({version:r.version,mode:n(21)?"pure":"global",copyright:"© 2019 Denis Pushkarev (zloirock.ru)"})},function(t,e){var n=0,r=Math.random();t.exports=function(t){return"Symbol(".concat(void 0===t?"":t,")_",(++n+r).toString(36))}},function(t,e){t.exports="constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf".split(",")},function(t,e,n){"use strict";var r=n(21),o=n(3),i=n(66),s=n(6),u=n(7),c=n(67),a=n(26),f=n(70),l=n(2)("iterator"),p=!([].keys&&"next"in[].keys()),v=function(){return this};t.exports=function(t,e,n,h,d,y,_){c(n,e,h);var m,g,x,w=function(t){if(!p&&t in C)return C[t];switch(t){case"keys":case"values":return function(){return new n(this,t)}}return function(){return new n(this,t)}},b=e+" Iterator",O="values"==d,P=!1,C=t.prototype,I=C[l]||C["@@iterator"]||d&&C[d],j=I||w(d),L=d?O?w("entries"):j:void 0,S="Array"==e&&C.entries||I;if(S&&(x=f(S.call(new t)))!==Object.prototype&&x.next&&(a(x,b,!0),r||"function"==typeof x[l]||s(x,l,v)),O&&I&&"values"!==I.name&&(P=!0,j=function(){return I.call(this)}),r&&!_||!p&&!P&&C[l]||s(C,l,j),u[e]=j,u[b]=v,d)if(m={values:O?j:w("values"),keys:y?j:w("keys"),entries:L},_)for(g in m)g in C||i(C,g,m[g]);else o(o.P+o.F*(p||P),e,m);return m}},function(t,e,n){var r=n(1).document;t.exports=r&&r.documentElement},function(t,e,n){var r=n(4);t.exports=function(t,e,n,o){try{return o?e(r(n)[0],n[1]):e(n)}catch(e){var i=t.return;throw void 0!==i&&r(i.call(t)),e}}},function(t,e,n){var r=n(7),o=n(2)("iterator"),i=Array.prototype;t.exports=function(t){return void 0!==t&&(r.Array===t||i[o]===t)}},function(t,e,n){var r=n(27),o=n(2)("iterator"),i=n(7);t.exports=n(0).getIteratorMethod=function(t){if(null!=t)return t[o]||t["@@iterator"]||i[r(t)]}},function(t,e,n){var r=n(2)("iterator"),o=!1;try{var i=[7][r]();i.return=function(){o=!0},Array.from(i,(function(){throw 2}))}catch(t){}t.exports=function(t,e){if(!e&&!o)return!1;var n=!1;try{var i=[7],s=i[r]();s.next=function(){return{done:n=!0}},i[r]=function(){return s},t(i)}catch(t){}return n}},function(t,e,n){n(75);for(var r=n(1),o=n(6),i=n(7),s=n(2)("toStringTag"),u="CSSRuleList,CSSStyleDeclaration,CSSValueList,ClientRectList,DOMRectList,DOMStringList,DOMTokenList,DataTransferItemList,FileList,HTMLAllCollection,HTMLCollection,HTMLFormElement,HTMLSelectElement,MediaList,MimeTypeArray,NamedNodeMap,NodeList,PaintRequestList,Plugin,PluginArray,SVGLengthList,SVGNumberList,SVGPathSegList,SVGPointList,SVGStringList,SVGTransformList,SourceBufferList,StyleSheetList,TextTrackCueList,TextTrackList,TouchList".split(","),c=0;c<u.length;c++){var a=u[c],f=r[a],l=f&&f.prototype;l&&!l[s]&&o(l,s,a),i[a]=i.Array}},function(t,e,n){var r=n(4),o=n(14),i=n(2)("species");t.exports=function(t,e){var n,s=r(t).constructor;return void 0===s||null==(n=r(s)[i])?e:o(n)}},function(t,e,n){var r,o,i,s=n(9),u=n(85),c=n(35),a=n(23),f=n(1),l=f.process,p=f.setImmediate,v=f.clearImmediate,h=f.MessageChannel,d=f.Dispatch,y=0,_={},m=function(){var t=+this;if(_.hasOwnProperty(t)){var e=_[t];delete _[t],e()}},g=function(t){m.call(t.data)};p&&v||(p=function(t){for(var e=[],n=1;arguments.length>n;)e.push(arguments[n++]);return _[++y]=function(){u("function"==typeof t?t:Function(t),e)},r(y),y},v=function(t){delete _[t]},"process"==n(8)(l)?r=function(t){l.nextTick(s(m,t,1))}:d&&d.now?r=function(t){d.now(s(m,t,1))}:h?(i=(o=new h).port2,o.port1.onmessage=g,r=s(i.postMessage,i,1)):f.addEventListener&&"function"==typeof postMessage&&!f.importScripts?(r=function(t){f.postMessage(t+"","*")},f.addEventListener("message",g,!1)):r="onreadystatechange"in a("script")?function(t){c.appendChild(a("script")).onreadystatechange=function(){c.removeChild(this),m.call(t)}}:function(t){setTimeout(s(m,t,1),0)}),t.exports={set:p,clear:v}},function(t,e){t.exports=function(t){try{return{e:!1,v:t()}}catch(t){return{e:!0,v:t}}}},function(t,e,n){var r=n(4),o=n(11),i=n(28);t.exports=function(t,e){if(r(t),o(e)&&e.constructor===t)return e;var n=i.f(t);return(0,n.resolve)(e),n.promise}},function(t,e,n){t.exports=n(48)},function(t,e,n){"use strict";const r=n(92);class o{constructor(){this._queue=[]}enqueue(t,e){const n={priority:(e=Object.assign({priority:0},e)).priority,run:t};if(this.size&&this._queue[this.size-1].priority>=e.priority)return void this._queue.push(n);const r=function(t,e,n){let r=0,o=t.length;for(;o>0;){const i=o/2|0;let s=r+i;n(t[s],e)<=0?(r=++s,o-=i+1):o=i}return r}(this._queue,n,(t,e)=>e.priority-t.priority);this._queue.splice(r,0,n)}dequeue(){return this._queue.shift().run}get size(){return this._queue.length}}class i extends r{constructor(t){if(super(),!("number"==typeof(t=Object.assign({carryoverConcurrencyCount:!1,intervalCap:1/0,interval:0,concurrency:1/0,autoStart:!0,queueClass:o},t)).concurrency&&t.concurrency>=1))throw new TypeError(`Expected \`concurrency\` to be a number from 1 and up, got \`${t.concurrency}\` (${typeof t.concurrency})`);if(!("number"==typeof t.intervalCap&&t.intervalCap>=1))throw new TypeError(`Expected \`intervalCap\` to be a number from 1 and up, got \`${t.intervalCap}\` (${typeof t.intervalCap})`);if(!(Number.isFinite(t.interval)&&t.interval>=0))throw new TypeError(`Expected \`interval\` to be a finite number >= 0, got \`${t.interval}\` (${typeof t.interval})`);this._carryoverConcurrencyCount=t.carryoverConcurrencyCount,this._isIntervalIgnored=t.intervalCap===1/0||0===t.interval,this._intervalCount=0,this._intervalCap=t.intervalCap,this._interval=t.interval,this._intervalId=null,this._intervalEnd=0,this._timeoutId=null,this.queue=new t.queueClass,this._queueClass=t.queueClass,this._pendingCount=0,this._concurrency=t.concurrency,this._isPaused=!1===t.autoStart,this._resolveEmpty=()=>{},this._resolveIdle=()=>{}}get _doesIntervalAllowAnother(){return this._isIntervalIgnored||this._intervalCount<this._intervalCap}get _doesConcurrentAllowAnother(){return this._pendingCount<this._concurrency}_next(){this._pendingCount--,this._tryToStartAnother()}_resolvePromises(){this._resolveEmpty(),this._resolveEmpty=()=>{},0===this._pendingCount&&(this._resolveIdle(),this._resolveIdle=()=>{})}_onResumeInterval(){this._onInterval(),this._initializeIntervalIfNeeded(),this._timeoutId=null}_intervalPaused(){const t=Date.now();if(null===this._intervalId){const e=this._intervalEnd-t;if(!(e<0))return null===this._timeoutId&&(this._timeoutId=setTimeout(()=>this._onResumeInterval(),e)),!0;this._intervalCount=this._carryoverConcurrencyCount?this._pendingCount:0}return!1}_tryToStartAnother(){if(0===this.queue.size)return clearInterval(this._intervalId),this._intervalId=null,this._resolvePromises(),!1;if(!this._isPaused){const t=!this._intervalPaused();if(this._doesIntervalAllowAnother&&this._doesConcurrentAllowAnother)return this.emit("active"),this.queue.dequeue()(),t&&this._initializeIntervalIfNeeded(),!0}return!1}_initializeIntervalIfNeeded(){this._isIntervalIgnored||null!==this._intervalId||(this._intervalId=setInterval(()=>this._onInterval(),this._interval),this._intervalEnd=Date.now()+this._interval)}_onInterval(){for(0===this._intervalCount&&0===this._pendingCount&&(clearInterval(this._intervalId),this._intervalId=null),this._intervalCount=this._carryoverConcurrencyCount?this._pendingCount:0;this._tryToStartAnother(););}add(t,e){return new Promise((n,r)=>{this.queue.enqueue(()=>{this._pendingCount++,this._intervalCount++;try{Promise.resolve(t()).then(t=>{n(t),this._next()},t=>{r(t),this._next()})}catch(t){r(t),this._next()}},e),this._tryToStartAnother()})}addAll(t,e){return Promise.all(t.map(t=>this.add(t,e)))}start(){if(this._isPaused)for(this._isPaused=!1;this._tryToStartAnother(););}pause(){this._isPaused=!0}clear(){this.queue=new this._queueClass}onEmpty(){return 0===this.queue.size?Promise.resolve():new Promise(t=>{const e=this._resolveEmpty;this._resolveEmpty=()=>{e(),t()}})}onIdle(){return 0===this._pendingCount&&0===this.queue.size?Promise.resolve():new Promise(t=>{const e=this._resolveIdle;this._resolveIdle=()=>{e(),t()}})}get size(){return this.queue.size}get pending(){return this._pendingCount}get isPaused(){return this._isPaused}}t.exports=i,t.exports.default=i},function(t,e,n){"use strict";n.r(e),n.d(e,"findProspectionMatches",(function(){return l}));var r=n(45),o=n.n(r),i=n(5),s=n.n(i),u=n(29),c=n.n(u),a=n(46),f=new(n.n(a).a)({concurrency:1}),l=function(t){var e=t.contents,n=t.sectionId,r=t.contentId,o=t.searchTerm,i=t.contextualizations,u=t.resources;if(!o.length)return[];var c=new RegExp(o,"gi"),a=0;return e.blocks.filter((function(t){return"atomic"!==t.type})).reduce((function(t,f,l){var p=[],v=null,h=f.text,d=f.key;do{(v=c.exec(h))&&function(){var t=v.index,s=v.index+o.length,c=!0;f.entityRanges&&f.entityRanges.length&&f.entityRanges.find((function(n){var r=n.key,a=e.entityMap[r];if(a&&"INLINE_ASSET"===a.type&&(n.offset===t&&n.length===o.length||t>=n.offset&&t<=n.offset+n.length||s>=n.offset&&s<=n.offset+n.length)){var f=a.data.asset.id,l=i[f];if(l&&u[l.sourceId])return c=!1,!0}})),c&&(a++,p.push({sectionId:n,contentId:r,blockIndex:l,offset:t,id:a,endIndex:s,length:o.length,blockKey:d}))}()}while(v);return[].concat(s()(t),p)}),[])};self.onmessage=function(t){var e,n=t.data,r=n.type,i=n.payload;if(r&&i)switch(r){case"BUILD_PROSPECTIONS":e=function(){return new c.a((function(t){var e,n,u,c,a,f=(n=(e=i).production,u=e.searchTerm,c=n.contextualizations,a=n.resources,o()(n.resources).filter((function(t){return n.resources[t].data.contents&&n.resources[t].data.contents.contents&&n.resources[t].data.contents.contents.blocks})).reduce((function(t,e){var r=n.resources[e];return[].concat(s()(t),s()(l({contents:r.data.contents.contents,sectionId:e,contentId:"main",searchTerm:u,contextualizations:c,resources:a})),s()(r.data.contents.notesOrder.reduce((function(t,n){return[].concat(s()(t),s()(l({contents:r.data.contents.notes[n].contents,sectionId:e,noteId:n,searchTerm:u,contextualizations:c,resources:a})))}),[])))}),[]));self.postMessage({type:r,response:{prospections:f}}),t()}))},new c.a((function(t,n){f.add(e).then((function(){t.apply(void 0,arguments)})).catch(n)}))}}},function(t,e,n){n(49),t.exports=n(0).Object.keys},function(t,e,n){var r=n(15),o=n(30);n(54)("keys",(function(){return function(t){return o(r(t))}}))},function(t,e,n){var r=n(13),o=n(17),i=n(52)(!1),s=n(20)("IE_PROTO");t.exports=function(t,e){var n,u=o(t),c=0,a=[];for(n in u)n!=s&&r(u,n)&&a.push(n);for(;e.length>c;)r(u,n=e[c++])&&(~i(a,n)||a.push(n));return a}},function(t,e,n){var r=n(8);t.exports=Object("z").propertyIsEnumerable(0)?Object:function(t){return"String"==r(t)?t.split(""):Object(t)}},function(t,e,n){var r=n(17),o=n(18),i=n(53);t.exports=function(t){return function(e,n,s){var u,c=r(e),a=o(c.length),f=i(s,a);if(t&&n!=n){for(;a>f;)if((u=c[f++])!=u)return!0}else for(;a>f;f++)if((t||f in c)&&c[f]===n)return t||f||0;return!t&&-1}}},function(t,e,n){var r=n(19),o=Math.max,i=Math.min;t.exports=function(t,e){return(t=r(t))<0?o(t+e,0):i(t,e)}},function(t,e,n){var r=n(3),o=n(0),i=n(22);t.exports=function(t,e){var n=(o.Object||{})[t]||Object[t],s={};s[t]=e(n),r(r.S+r.F*i((function(){n(1)})),"Object",s)}},function(t,e,n){t.exports=!n(12)&&!n(22)((function(){return 7!=Object.defineProperty(n(23)("div"),"a",{get:function(){return 7}}).a}))},function(t,e,n){var r=n(11);t.exports=function(t,e){if(!r(t))return t;var n,o;if(e&&"function"==typeof(n=t.toString)&&!r(o=n.call(t)))return o;if("function"==typeof(n=t.valueOf)&&!r(o=n.call(t)))return o;if(!e&&"function"==typeof(n=t.toString)&&!r(o=n.call(t)))return o;throw TypeError("Can't convert object to primitive value")}},function(t,e,n){var r=n(58);t.exports=function(t){if(r(t)){for(var e=0,n=new Array(t.length);e<t.length;e++)n[e]=t[e];return n}}},function(t,e,n){t.exports=n(59)},function(t,e,n){n(60),t.exports=n(0).Array.isArray},function(t,e,n){var r=n(3);r(r.S,"Array",{isArray:n(61)})},function(t,e,n){var r=n(8);t.exports=Array.isArray||function(t){return"Array"==r(t)}},function(t,e,n){var r=n(63),o=n(73);t.exports=function(t){if(o(Object(t))||"[object Arguments]"===Object.prototype.toString.call(t))return r(t)}},function(t,e,n){t.exports=n(64)},function(t,e,n){n(25),n(71),t.exports=n(0).Array.from},function(t,e,n){var r=n(19),o=n(16);t.exports=function(t){return function(e,n){var i,s,u=String(o(e)),c=r(n),a=u.length;return c<0||c>=a?t?"":void 0:(i=u.charCodeAt(c))<55296||i>56319||c+1===a||(s=u.charCodeAt(c+1))<56320||s>57343?t?u.charAt(c):i:t?u.slice(c,c+2):s-56320+(i-55296<<10)+65536}}},function(t,e,n){t.exports=n(6)},function(t,e,n){"use strict";var r=n(68),o=n(24),i=n(26),s={};n(6)(s,n(2)("iterator"),(function(){return this})),t.exports=function(t,e,n){t.prototype=r(s,{next:o(1,n)}),i(t,e+" Iterator")}},function(t,e,n){var r=n(4),o=n(69),i=n(33),s=n(20)("IE_PROTO"),u=function(){},c=function(){var t,e=n(23)("iframe"),r=i.length;for(e.style.display="none",n(35).appendChild(e),e.src="javascript:",(t=e.contentWindow.document).open(),t.write("<script>document.F=Object<\/script>"),t.close(),c=t.F;r--;)delete c.prototype[i[r]];return c()};t.exports=Object.create||function(t,e){var n;return null!==t?(u.prototype=r(t),n=new u,u.prototype=null,n[s]=t):n=c(),void 0===e?n:o(n,e)}},function(t,e,n){var r=n(10),o=n(4),i=n(30);t.exports=n(12)?Object.defineProperties:function(t,e){o(t);for(var n,s=i(e),u=s.length,c=0;u>c;)r.f(t,n=s[c++],e[n]);return t}},function(t,e,n){var r=n(13),o=n(15),i=n(20)("IE_PROTO"),s=Object.prototype;t.exports=Object.getPrototypeOf||function(t){return t=o(t),r(t,i)?t[i]:"function"==typeof t.constructor&&t instanceof t.constructor?t.constructor.prototype:t instanceof Object?s:null}},function(t,e,n){"use strict";var r=n(9),o=n(3),i=n(15),s=n(36),u=n(37),c=n(18),a=n(72),f=n(38);o(o.S+o.F*!n(39)((function(t){Array.from(t)})),"Array",{from:function(t){var e,n,o,l,p=i(t),v="function"==typeof this?this:Array,h=arguments.length,d=h>1?arguments[1]:void 0,y=void 0!==d,_=0,m=f(p);if(y&&(d=r(d,h>2?arguments[2]:void 0,2)),null==m||v==Array&&u(m))for(n=new v(e=c(p.length));e>_;_++)a(n,_,y?d(p[_],_):p[_]);else for(l=m.call(p),n=new v;!(o=l.next()).done;_++)a(n,_,y?s(l,d,[o.value,_],!0):o.value);return n.length=_,n}})},function(t,e,n){"use strict";var r=n(10),o=n(24);t.exports=function(t,e,n){e in t?r.f(t,e,o(0,n)):t[e]=n}},function(t,e,n){t.exports=n(74)},function(t,e,n){n(40),n(25),t.exports=n(78)},function(t,e,n){"use strict";var r=n(76),o=n(77),i=n(7),s=n(17);t.exports=n(34)(Array,"Array",(function(t,e){this._t=s(t),this._i=0,this._k=e}),(function(){var t=this._t,e=this._k,n=this._i++;return!t||n>=t.length?(this._t=void 0,o(1)):o(0,"keys"==e?n:"values"==e?t[n]:[n,t[n]])}),"values"),i.Arguments=i.Array,r("keys"),r("values"),r("entries")},function(t,e){t.exports=function(){}},function(t,e){t.exports=function(t,e){return{value:e,done:!!t}}},function(t,e,n){var r=n(27),o=n(2)("iterator"),i=n(7);t.exports=n(0).isIterable=function(t){var e=Object(t);return void 0!==e[o]||"@@iterator"in e||i.hasOwnProperty(r(e))}},function(t,e){t.exports=function(){throw new TypeError("Invalid attempt to spread non-iterable instance")}},function(t,e,n){n(81),n(25),n(40),n(82),n(90),n(91),t.exports=n(0).Promise},function(t,e){},function(t,e,n){"use strict";var r,o,i,s,u=n(21),c=n(1),a=n(9),f=n(27),l=n(3),p=n(11),v=n(14),h=n(83),d=n(84),y=n(41),_=n(42).set,m=n(86)(),g=n(28),x=n(43),w=n(87),b=n(44),O=c.TypeError,P=c.process,C=P&&P.versions,I=C&&C.v8||"",j=c.Promise,L="process"==f(P),S=function(){},T=o=g.f,E=!!function(){try{var t=j.resolve(1),e=(t.constructor={})[n(2)("species")]=function(t){t(S,S)};return(L||"function"==typeof PromiseRejectionEvent)&&t.then(S)instanceof e&&0!==I.indexOf("6.6")&&-1===w.indexOf("Chrome/66")}catch(t){}}(),A=function(t){var e;return!(!p(t)||"function"!=typeof(e=t.then))&&e},M=function(t,e){if(!t._n){t._n=!0;var n=t._c;m((function(){for(var r=t._v,o=1==t._s,i=0,s=function(e){var n,i,s,u=o?e.ok:e.fail,c=e.resolve,a=e.reject,f=e.domain;try{u?(o||(2==t._h&&q(t),t._h=1),!0===u?n=r:(f&&f.enter(),n=u(r),f&&(f.exit(),s=!0)),n===e.promise?a(O("Promise-chain cycle")):(i=A(n))?i.call(n,c,a):c(n)):a(r)}catch(t){f&&!s&&f.exit(),a(t)}};n.length>i;)s(n[i++]);t._c=[],t._n=!1,e&&!t._h&&k(t)}))}},k=function(t){_.call(c,(function(){var e,n,r,o=t._v,i=R(t);if(i&&(e=x((function(){L?P.emit("unhandledRejection",o,t):(n=c.onunhandledrejection)?n({promise:t,reason:o}):(r=c.console)&&r.error&&r.error("Unhandled promise rejection",o)})),t._h=L||R(t)?2:1),t._a=void 0,i&&e.e)throw e.v}))},R=function(t){return 1!==t._h&&0===(t._a||t._c).length},q=function(t){_.call(c,(function(){var e;L?P.emit("rejectionHandled",t):(e=c.onrejectionhandled)&&e({promise:t,reason:t._v})}))},F=function(t){var e=this;e._d||(e._d=!0,(e=e._w||e)._v=t,e._s=2,e._a||(e._a=e._c.slice()),M(e,!0))},N=function(t){var e,n=this;if(!n._d){n._d=!0,n=n._w||n;try{if(n===t)throw O("Promise can't be resolved itself");(e=A(t))?m((function(){var r={_w:n,_d:!1};try{e.call(t,a(N,r,1),a(F,r,1))}catch(t){F.call(r,t)}})):(n._v=t,n._s=1,M(n,!1))}catch(t){F.call({_w:n,_d:!1},t)}}};E||(j=function(t){h(this,j,"Promise","_h"),v(t),r.call(this);try{t(a(N,this,1),a(F,this,1))}catch(t){F.call(this,t)}},(r=function(t){this._c=[],this._a=void 0,this._s=0,this._d=!1,this._v=void 0,this._h=0,this._n=!1}).prototype=n(88)(j.prototype,{then:function(t,e){var n=T(y(this,j));return n.ok="function"!=typeof t||t,n.fail="function"==typeof e&&e,n.domain=L?P.domain:void 0,this._c.push(n),this._a&&this._a.push(n),this._s&&M(this,!1),n.promise},catch:function(t){return this.then(void 0,t)}}),i=function(){var t=new r;this.promise=t,this.resolve=a(N,t,1),this.reject=a(F,t,1)},g.f=T=function(t){return t===j||t===s?new i(t):o(t)}),l(l.G+l.W+l.F*!E,{Promise:j}),n(26)(j,"Promise"),n(89)("Promise"),s=n(0).Promise,l(l.S+l.F*!E,"Promise",{reject:function(t){var e=T(this);return(0,e.reject)(t),e.promise}}),l(l.S+l.F*(u||!E),"Promise",{resolve:function(t){return b(u&&this===s?j:this,t)}}),l(l.S+l.F*!(E&&n(39)((function(t){j.all(t).catch(S)}))),"Promise",{all:function(t){var e=this,n=T(e),r=n.resolve,o=n.reject,i=x((function(){var n=[],i=0,s=1;d(t,!1,(function(t){var u=i++,c=!1;n.push(void 0),s++,e.resolve(t).then((function(t){c||(c=!0,n[u]=t,--s||r(n))}),o)})),--s||r(n)}));return i.e&&o(i.v),n.promise},race:function(t){var e=this,n=T(e),r=n.reject,o=x((function(){d(t,!1,(function(t){e.resolve(t).then(n.resolve,r)}))}));return o.e&&r(o.v),n.promise}})},function(t,e){t.exports=function(t,e,n,r){if(!(t instanceof e)||void 0!==r&&r in t)throw TypeError(n+": incorrect invocation!");return t}},function(t,e,n){var r=n(9),o=n(36),i=n(37),s=n(4),u=n(18),c=n(38),a={},f={};(e=t.exports=function(t,e,n,l,p){var v,h,d,y,_=p?function(){return t}:c(t),m=r(n,l,e?2:1),g=0;if("function"!=typeof _)throw TypeError(t+" is not iterable!");if(i(_)){for(v=u(t.length);v>g;g++)if((y=e?m(s(h=t[g])[0],h[1]):m(t[g]))===a||y===f)return y}else for(d=_.call(t);!(h=d.next()).done;)if((y=o(d,m,h.value,e))===a||y===f)return y}).BREAK=a,e.RETURN=f},function(t,e){t.exports=function(t,e,n){var r=void 0===n;switch(e.length){case 0:return r?t():t.call(n);case 1:return r?t(e[0]):t.call(n,e[0]);case 2:return r?t(e[0],e[1]):t.call(n,e[0],e[1]);case 3:return r?t(e[0],e[1],e[2]):t.call(n,e[0],e[1],e[2]);case 4:return r?t(e[0],e[1],e[2],e[3]):t.call(n,e[0],e[1],e[2],e[3])}return t.apply(n,e)}},function(t,e,n){var r=n(1),o=n(42).set,i=r.MutationObserver||r.WebKitMutationObserver,s=r.process,u=r.Promise,c="process"==n(8)(s);t.exports=function(){var t,e,n,a=function(){var r,o;for(c&&(r=s.domain)&&r.exit();t;){o=t.fn,t=t.next;try{o()}catch(r){throw t?n():e=void 0,r}}e=void 0,r&&r.enter()};if(c)n=function(){s.nextTick(a)};else if(!i||r.navigator&&r.navigator.standalone)if(u&&u.resolve){var f=u.resolve(void 0);n=function(){f.then(a)}}else n=function(){o.call(r,a)};else{var l=!0,p=document.createTextNode("");new i(a).observe(p,{characterData:!0}),n=function(){p.data=l=!l}}return function(r){var o={fn:r,next:void 0};e&&(e.next=o),t||(t=o,n()),e=o}}},function(t,e,n){var r=n(1).navigator;t.exports=r&&r.userAgent||""},function(t,e,n){var r=n(6);t.exports=function(t,e,n){for(var o in e)n&&t[o]?t[o]=e[o]:r(t,o,e[o]);return t}},function(t,e,n){"use strict";var r=n(1),o=n(0),i=n(10),s=n(12),u=n(2)("species");t.exports=function(t){var e="function"==typeof o[t]?o[t]:r[t];s&&e&&!e[u]&&i.f(e,u,{configurable:!0,get:function(){return this}})}},function(t,e,n){"use strict";var r=n(3),o=n(0),i=n(1),s=n(41),u=n(44);r(r.P+r.R,"Promise",{finally:function(t){var e=s(this,o.Promise||i.Promise),n="function"==typeof t;return this.then(n?function(n){return u(e,t()).then((function(){return n}))}:t,n?function(n){return u(e,t()).then((function(){throw n}))}:t)}})},function(t,e,n){"use strict";var r=n(3),o=n(28),i=n(43);r(r.S,"Promise",{try:function(t){var e=o.f(this),n=i(t);return(n.e?e.reject:e.resolve)(n.v),e.promise}})},function(t,e,n){"use strict";var r,o="object"==typeof Reflect?Reflect:null,i=o&&"function"==typeof o.apply?o.apply:function(t,e,n){return Function.prototype.apply.call(t,e,n)};r=o&&"function"==typeof o.ownKeys?o.ownKeys:Object.getOwnPropertySymbols?function(t){return Object.getOwnPropertyNames(t).concat(Object.getOwnPropertySymbols(t))}:function(t){return Object.getOwnPropertyNames(t)};var s=Number.isNaN||function(t){return t!=t};function u(){u.init.call(this)}t.exports=u,u.EventEmitter=u,u.prototype._events=void 0,u.prototype._eventsCount=0,u.prototype._maxListeners=void 0;var c=10;function a(t){return void 0===t._maxListeners?u.defaultMaxListeners:t._maxListeners}function f(t,e,n,r){var o,i,s,u;if("function"!=typeof n)throw new TypeError('The "listener" argument must be of type Function. Received type '+typeof n);if(void 0===(i=t._events)?(i=t._events=Object.create(null),t._eventsCount=0):(void 0!==i.newListener&&(t.emit("newListener",e,n.listener?n.listener:n),i=t._events),s=i[e]),void 0===s)s=i[e]=n,++t._eventsCount;else if("function"==typeof s?s=i[e]=r?[n,s]:[s,n]:r?s.unshift(n):s.push(n),(o=a(t))>0&&s.length>o&&!s.warned){s.warned=!0;var c=new Error("Possible EventEmitter memory leak detected. "+s.length+" "+String(e)+" listeners added. Use emitter.setMaxListeners() to increase limit");c.name="MaxListenersExceededWarning",c.emitter=t,c.type=e,c.count=s.length,u=c,console&&console.warn&&console.warn(u)}return t}function l(){for(var t=[],e=0;e<arguments.length;e++)t.push(arguments[e]);this.fired||(this.target.removeListener(this.type,this.wrapFn),this.fired=!0,i(this.listener,this.target,t))}function p(t,e,n){var r={fired:!1,wrapFn:void 0,target:t,type:e,listener:n},o=l.bind(r);return o.listener=n,r.wrapFn=o,o}function v(t,e,n){var r=t._events;if(void 0===r)return[];var o=r[e];return void 0===o?[]:"function"==typeof o?n?[o.listener||o]:[o]:n?function(t){for(var e=new Array(t.length),n=0;n<e.length;++n)e[n]=t[n].listener||t[n];return e}(o):d(o,o.length)}function h(t){var e=this._events;if(void 0!==e){var n=e[t];if("function"==typeof n)return 1;if(void 0!==n)return n.length}return 0}function d(t,e){for(var n=new Array(e),r=0;r<e;++r)n[r]=t[r];return n}Object.defineProperty(u,"defaultMaxListeners",{enumerable:!0,get:function(){return c},set:function(t){if("number"!=typeof t||t<0||s(t))throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received '+t+".");c=t}}),u.init=function(){void 0!==this._events&&this._events!==Object.getPrototypeOf(this)._events||(this._events=Object.create(null),this._eventsCount=0),this._maxListeners=this._maxListeners||void 0},u.prototype.setMaxListeners=function(t){if("number"!=typeof t||t<0||s(t))throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received '+t+".");return this._maxListeners=t,this},u.prototype.getMaxListeners=function(){return a(this)},u.prototype.emit=function(t){for(var e=[],n=1;n<arguments.length;n++)e.push(arguments[n]);var r="error"===t,o=this._events;if(void 0!==o)r=r&&void 0===o.error;else if(!r)return!1;if(r){var s;if(e.length>0&&(s=e[0]),s instanceof Error)throw s;var u=new Error("Unhandled error."+(s?" ("+s.message+")":""));throw u.context=s,u}var c=o[t];if(void 0===c)return!1;if("function"==typeof c)i(c,this,e);else{var a=c.length,f=d(c,a);for(n=0;n<a;++n)i(f[n],this,e)}return!0},u.prototype.addListener=function(t,e){return f(this,t,e,!1)},u.prototype.on=u.prototype.addListener,u.prototype.prependListener=function(t,e){return f(this,t,e,!0)},u.prototype.once=function(t,e){if("function"!=typeof e)throw new TypeError('The "listener" argument must be of type Function. Received type '+typeof e);return this.on(t,p(this,t,e)),this},u.prototype.prependOnceListener=function(t,e){if("function"!=typeof e)throw new TypeError('The "listener" argument must be of type Function. Received type '+typeof e);return this.prependListener(t,p(this,t,e)),this},u.prototype.removeListener=function(t,e){var n,r,o,i,s;if("function"!=typeof e)throw new TypeError('The "listener" argument must be of type Function. Received type '+typeof e);if(void 0===(r=this._events))return this;if(void 0===(n=r[t]))return this;if(n===e||n.listener===e)0==--this._eventsCount?this._events=Object.create(null):(delete r[t],r.removeListener&&this.emit("removeListener",t,n.listener||e));else if("function"!=typeof n){for(o=-1,i=n.length-1;i>=0;i--)if(n[i]===e||n[i].listener===e){s=n[i].listener,o=i;break}if(o<0)return this;0===o?n.shift():function(t,e){for(;e+1<t.length;e++)t[e]=t[e+1];t.pop()}(n,o),1===n.length&&(r[t]=n[0]),void 0!==r.removeListener&&this.emit("removeListener",t,s||e)}return this},u.prototype.off=u.prototype.removeListener,u.prototype.removeAllListeners=function(t){var e,n,r;if(void 0===(n=this._events))return this;if(void 0===n.removeListener)return 0===arguments.length?(this._events=Object.create(null),this._eventsCount=0):void 0!==n[t]&&(0==--this._eventsCount?this._events=Object.create(null):delete n[t]),this;if(0===arguments.length){var o,i=Object.keys(n);for(r=0;r<i.length;++r)"removeListener"!==(o=i[r])&&this.removeAllListeners(o);return this.removeAllListeners("removeListener"),this._events=Object.create(null),this._eventsCount=0,this}if("function"==typeof(e=n[t]))this.removeListener(t,e);else if(void 0!==e)for(r=e.length-1;r>=0;r--)this.removeListener(t,e[r]);return this},u.prototype.listeners=function(t){return v(this,t,!0)},u.prototype.rawListeners=function(t){return v(this,t,!1)},u.listenerCount=function(t,e){return"function"==typeof t.listenerCount?t.listenerCount(e):h.call(t,e)},u.prototype.listenerCount=h,u.prototype.eventNames=function(){return this._eventsCount>0?r(this._events):[]}}]);