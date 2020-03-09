!function(e){var t={};function n(r){if(t[r])return t[r].exports;var i=t[r]={i:r,l:!1,exports:{}};return e[r].call(i.exports,i,i.exports,n),i.l=!0,i.exports}n.m=e,n.c=t,n.d=function(e,t,r){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var i in e)n.d(r,i,function(t){return e[t]}.bind(null,i));return r},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="https://peritext.github.io/ovide/build/",n(n.s=0)}([function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.findProspectionMatches=void 0;var r,i=n(1);const o=new((r=i)&&r.__esModule?r:{default:r}).default({concurrency:1}),s=t.findProspectionMatches=({contents:e,sectionId:t,contentId:n,searchTerm:r,contextualizations:i,resources:o})=>{if(!r.length)return[];const s=new RegExp(r,"gi");let u=0;return e.blocks.filter(e=>"atomic"!==e.type).reduce((a,l,c)=>{const h=[];let f=null;const p=l.text;do{if(f=s.exec(p)){const s=f.index,a=f.index+r.length;let p=!0;l.entityRanges&&l.entityRanges.length&&l.entityRanges.find(t=>{const{key:n}=t,u=e.entityMap[n];if(u&&"INLINE_ASSET"===u.type&&(t.offset===s&&t.length===r.length||s>=t.offset&&s<=t.offset+t.length||a>=t.offset&&a<=t.offset+t.length)){const e=u.data.asset.id,t=i[e];if(t&&o[t.sourceId])return p=!1,!0}}),p&&(u++,h.push({sectionId:t,contentId:n,blockIndex:c,offset:s,id:u,endIndex:a,length:r.length}))}}while(f);return[...a,...h]},[])};self.onmessage=({data:e})=>{const{type:t,payload:n}=e;if(t&&n)switch(t){case"BUILD_PROSPECTIONS":(e=>new Promise((t,n)=>{o.add(e).then((function(){t(...arguments)})).catch(n)}))(()=>new Promise(e=>{const r=(({production:e,searchTerm:t})=>{const{contextualizations:n,resources:r}=e;return Object.keys(e.resources).filter(t=>e.resources[t].data.contents&&e.resources[t].data.contents.contents&&e.resources[t].data.contents.contents.blocks).reduce((i,o)=>{const u=e.resources[o];return[...i,...s({contents:u.data.contents.contents,sectionId:o,contentId:"main",searchTerm:t,contextualizations:n,resources:r}),...u.data.contents.notesOrder.reduce((e,i)=>[...e,...s({contents:u.data.contents.notes[i].contents,sectionId:o,noteId:i,searchTerm:t,contextualizations:n,resources:r})],[])]},[])})(n);self.postMessage({type:t,response:{prospections:r}}),e()}))}}},function(e,t,n){"use strict";const r=n(2);class i{constructor(){this._queue=[]}enqueue(e,t){const n={priority:(t=Object.assign({priority:0},t)).priority,run:e};if(this.size&&this._queue[this.size-1].priority>=t.priority)return void this._queue.push(n);const r=function(e,t,n){let r=0,i=e.length;for(;i>0;){const o=i/2|0;let s=r+o;n(e[s],t)<=0?(r=++s,i-=o+1):i=o}return r}(this._queue,n,(e,t)=>t.priority-e.priority);this._queue.splice(r,0,n)}dequeue(){return this._queue.shift().run}get size(){return this._queue.length}}class o extends r{constructor(e){if(super(),!("number"==typeof(e=Object.assign({carryoverConcurrencyCount:!1,intervalCap:1/0,interval:0,concurrency:1/0,autoStart:!0,queueClass:i},e)).concurrency&&e.concurrency>=1))throw new TypeError(`Expected \`concurrency\` to be a number from 1 and up, got \`${e.concurrency}\` (${typeof e.concurrency})`);if(!("number"==typeof e.intervalCap&&e.intervalCap>=1))throw new TypeError(`Expected \`intervalCap\` to be a number from 1 and up, got \`${e.intervalCap}\` (${typeof e.intervalCap})`);if(!(Number.isFinite(e.interval)&&e.interval>=0))throw new TypeError(`Expected \`interval\` to be a finite number >= 0, got \`${e.interval}\` (${typeof e.interval})`);this._carryoverConcurrencyCount=e.carryoverConcurrencyCount,this._isIntervalIgnored=e.intervalCap===1/0||0===e.interval,this._intervalCount=0,this._intervalCap=e.intervalCap,this._interval=e.interval,this._intervalId=null,this._intervalEnd=0,this._timeoutId=null,this.queue=new e.queueClass,this._queueClass=e.queueClass,this._pendingCount=0,this._concurrency=e.concurrency,this._isPaused=!1===e.autoStart,this._resolveEmpty=()=>{},this._resolveIdle=()=>{}}get _doesIntervalAllowAnother(){return this._isIntervalIgnored||this._intervalCount<this._intervalCap}get _doesConcurrentAllowAnother(){return this._pendingCount<this._concurrency}_next(){this._pendingCount--,this._tryToStartAnother()}_resolvePromises(){this._resolveEmpty(),this._resolveEmpty=()=>{},0===this._pendingCount&&(this._resolveIdle(),this._resolveIdle=()=>{})}_onResumeInterval(){this._onInterval(),this._initializeIntervalIfNeeded(),this._timeoutId=null}_intervalPaused(){const e=Date.now();if(null===this._intervalId){const t=this._intervalEnd-e;if(!(t<0))return null===this._timeoutId&&(this._timeoutId=setTimeout(()=>this._onResumeInterval(),t)),!0;this._intervalCount=this._carryoverConcurrencyCount?this._pendingCount:0}return!1}_tryToStartAnother(){if(0===this.queue.size)return clearInterval(this._intervalId),this._intervalId=null,this._resolvePromises(),!1;if(!this._isPaused){const e=!this._intervalPaused();if(this._doesIntervalAllowAnother&&this._doesConcurrentAllowAnother)return this.emit("active"),this.queue.dequeue()(),e&&this._initializeIntervalIfNeeded(),!0}return!1}_initializeIntervalIfNeeded(){this._isIntervalIgnored||null!==this._intervalId||(this._intervalId=setInterval(()=>this._onInterval(),this._interval),this._intervalEnd=Date.now()+this._interval)}_onInterval(){for(0===this._intervalCount&&0===this._pendingCount&&(clearInterval(this._intervalId),this._intervalId=null),this._intervalCount=this._carryoverConcurrencyCount?this._pendingCount:0;this._tryToStartAnother(););}add(e,t){return new Promise((n,r)=>{this.queue.enqueue(()=>{this._pendingCount++,this._intervalCount++;try{Promise.resolve(e()).then(e=>{n(e),this._next()},e=>{r(e),this._next()})}catch(e){r(e),this._next()}},t),this._tryToStartAnother()})}addAll(e,t){return Promise.all(e.map(e=>this.add(e,t)))}start(){if(this._isPaused)for(this._isPaused=!1;this._tryToStartAnother(););}pause(){this._isPaused=!0}clear(){this.queue=new this._queueClass}onEmpty(){return 0===this.queue.size?Promise.resolve():new Promise(e=>{const t=this._resolveEmpty;this._resolveEmpty=()=>{t(),e()}})}onIdle(){return 0===this._pendingCount&&0===this.queue.size?Promise.resolve():new Promise(e=>{const t=this._resolveIdle;this._resolveIdle=()=>{t(),e()}})}get size(){return this.queue.size}get pending(){return this._pendingCount}get isPaused(){return this._isPaused}}e.exports=o,e.exports.default=o},function(e,t,n){"use strict";var r,i="object"==typeof Reflect?Reflect:null,o=i&&"function"==typeof i.apply?i.apply:function(e,t,n){return Function.prototype.apply.call(e,t,n)};r=i&&"function"==typeof i.ownKeys?i.ownKeys:Object.getOwnPropertySymbols?function(e){return Object.getOwnPropertyNames(e).concat(Object.getOwnPropertySymbols(e))}:function(e){return Object.getOwnPropertyNames(e)};var s=Number.isNaN||function(e){return e!=e};function u(){u.init.call(this)}e.exports=u,u.EventEmitter=u,u.prototype._events=void 0,u.prototype._eventsCount=0,u.prototype._maxListeners=void 0;var a=10;function l(e){return void 0===e._maxListeners?u.defaultMaxListeners:e._maxListeners}function c(e,t,n,r){var i,o,s,u;if("function"!=typeof n)throw new TypeError('The "listener" argument must be of type Function. Received type '+typeof n);if(void 0===(o=e._events)?(o=e._events=Object.create(null),e._eventsCount=0):(void 0!==o.newListener&&(e.emit("newListener",t,n.listener?n.listener:n),o=e._events),s=o[t]),void 0===s)s=o[t]=n,++e._eventsCount;else if("function"==typeof s?s=o[t]=r?[n,s]:[s,n]:r?s.unshift(n):s.push(n),(i=l(e))>0&&s.length>i&&!s.warned){s.warned=!0;var a=new Error("Possible EventEmitter memory leak detected. "+s.length+" "+String(t)+" listeners added. Use emitter.setMaxListeners() to increase limit");a.name="MaxListenersExceededWarning",a.emitter=e,a.type=t,a.count=s.length,u=a,console&&console.warn&&console.warn(u)}return e}function h(){for(var e=[],t=0;t<arguments.length;t++)e.push(arguments[t]);this.fired||(this.target.removeListener(this.type,this.wrapFn),this.fired=!0,o(this.listener,this.target,e))}function f(e,t,n){var r={fired:!1,wrapFn:void 0,target:e,type:t,listener:n},i=h.bind(r);return i.listener=n,r.wrapFn=i,i}function p(e,t,n){var r=e._events;if(void 0===r)return[];var i=r[t];return void 0===i?[]:"function"==typeof i?n?[i.listener||i]:[i]:n?function(e){for(var t=new Array(e.length),n=0;n<t.length;++n)t[n]=e[n].listener||e[n];return t}(i):d(i,i.length)}function v(e){var t=this._events;if(void 0!==t){var n=t[e];if("function"==typeof n)return 1;if(void 0!==n)return n.length}return 0}function d(e,t){for(var n=new Array(t),r=0;r<t;++r)n[r]=e[r];return n}Object.defineProperty(u,"defaultMaxListeners",{enumerable:!0,get:function(){return a},set:function(e){if("number"!=typeof e||e<0||s(e))throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received '+e+".");a=e}}),u.init=function(){void 0!==this._events&&this._events!==Object.getPrototypeOf(this)._events||(this._events=Object.create(null),this._eventsCount=0),this._maxListeners=this._maxListeners||void 0},u.prototype.setMaxListeners=function(e){if("number"!=typeof e||e<0||s(e))throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received '+e+".");return this._maxListeners=e,this},u.prototype.getMaxListeners=function(){return l(this)},u.prototype.emit=function(e){for(var t=[],n=1;n<arguments.length;n++)t.push(arguments[n]);var r="error"===e,i=this._events;if(void 0!==i)r=r&&void 0===i.error;else if(!r)return!1;if(r){var s;if(t.length>0&&(s=t[0]),s instanceof Error)throw s;var u=new Error("Unhandled error."+(s?" ("+s.message+")":""));throw u.context=s,u}var a=i[e];if(void 0===a)return!1;if("function"==typeof a)o(a,this,t);else{var l=a.length,c=d(a,l);for(n=0;n<l;++n)o(c[n],this,t)}return!0},u.prototype.addListener=function(e,t){return c(this,e,t,!1)},u.prototype.on=u.prototype.addListener,u.prototype.prependListener=function(e,t){return c(this,e,t,!0)},u.prototype.once=function(e,t){if("function"!=typeof t)throw new TypeError('The "listener" argument must be of type Function. Received type '+typeof t);return this.on(e,f(this,e,t)),this},u.prototype.prependOnceListener=function(e,t){if("function"!=typeof t)throw new TypeError('The "listener" argument must be of type Function. Received type '+typeof t);return this.prependListener(e,f(this,e,t)),this},u.prototype.removeListener=function(e,t){var n,r,i,o,s;if("function"!=typeof t)throw new TypeError('The "listener" argument must be of type Function. Received type '+typeof t);if(void 0===(r=this._events))return this;if(void 0===(n=r[e]))return this;if(n===t||n.listener===t)0==--this._eventsCount?this._events=Object.create(null):(delete r[e],r.removeListener&&this.emit("removeListener",e,n.listener||t));else if("function"!=typeof n){for(i=-1,o=n.length-1;o>=0;o--)if(n[o]===t||n[o].listener===t){s=n[o].listener,i=o;break}if(i<0)return this;0===i?n.shift():function(e,t){for(;t+1<e.length;t++)e[t]=e[t+1];e.pop()}(n,i),1===n.length&&(r[e]=n[0]),void 0!==r.removeListener&&this.emit("removeListener",e,s||t)}return this},u.prototype.off=u.prototype.removeListener,u.prototype.removeAllListeners=function(e){var t,n,r;if(void 0===(n=this._events))return this;if(void 0===n.removeListener)return 0===arguments.length?(this._events=Object.create(null),this._eventsCount=0):void 0!==n[e]&&(0==--this._eventsCount?this._events=Object.create(null):delete n[e]),this;if(0===arguments.length){var i,o=Object.keys(n);for(r=0;r<o.length;++r)"removeListener"!==(i=o[r])&&this.removeAllListeners(i);return this.removeAllListeners("removeListener"),this._events=Object.create(null),this._eventsCount=0,this}if("function"==typeof(t=n[e]))this.removeListener(e,t);else if(void 0!==t)for(r=t.length-1;r>=0;r--)this.removeListener(e,t[r]);return this},u.prototype.listeners=function(e){return p(this,e,!0)},u.prototype.rawListeners=function(e){return p(this,e,!1)},u.listenerCount=function(e,t){return"function"==typeof e.listenerCount?e.listenerCount(t):v.call(e,t)},u.prototype.listenerCount=v,u.prototype.eventNames=function(){return this._eventsCount>0?r(this._events):[]}}]);