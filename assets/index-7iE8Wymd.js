(function(){const o=document.createElement("link").relList;if(o&&o.supports&&o.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))s(n);new MutationObserver(n=>{for(const e of n)if(e.type==="childList")for(const c of e.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&s(c)}).observe(document,{childList:!0,subtree:!0});function r(n){const e={};return n.integrity&&(e.integrity=n.integrity),n.referrerPolicy&&(e.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?e.credentials="include":n.crossOrigin==="anonymous"?e.credentials="omit":e.credentials="same-origin",e}function s(n){if(n.ep)return;n.ep=!0;const e=r(n);fetch(n.href,e)}})();const l={},f=t=>(l[t]||(l[t]=new WebSocket(t)),l[t]),h=(t,o,r)=>{const s=Math.random().toString(36).substring(2,15),n=JSON.stringify(["REQ",s,o]),e=f(t);return e.onopen=()=>{e.send(n)},e.onmessage=c=>{const i=JSON.parse(c.data);i[0]==="EVENT"&&i[1]===s&&r(i[2])},e.onerror=c=>{console.error(`Error connecting to relay ${t}:`,c)},e.onclose=()=>{console.log(`Connection to relay ${t} closed.`)},()=>{const c=new WebSocket(t);c.onopen=()=>{c.send(JSON.stringify(["CLOSE",s]))}}},g=t=>new Promise(o=>{const r="speed-test",s=performance.now(),n=setTimeout(()=>{e.close(),o(1/0)},5e3),e=new WebSocket(t);e.onopen=()=>{e.send(JSON.stringify(["REQ",r,{kinds:[1],limit:1}]))},e.onmessage=c=>{JSON.parse(c.data)[1]===r&&(clearTimeout(n),e.close(),o(performance.now()-s))},e.onerror=()=>{clearTimeout(n),o(1/0)}});document.querySelector("#app").innerHTML=`
  <div>
    <h1>relay-speed</h1>
    <p><a id="toggle-reported" href=""></a></p>
    <p id="relay-count"></p>
    <div class="card">
      <table id="results-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Relay URL</th>
          <th>Reported (ms)</th>
          <th>Measured (ms)</th>
        </tr>
      </thead>
      <tbody id="results-body">
      </tbody>
    </div>
  </div>
`;const p=[];let d=[];const w=()=>{const t=document.getElementById("results-body");t.innerHTML="",d.sort((o,r)=>o.measuredLatency-r.measuredLatency);for(let o=0;o<Math.min(d.length,21);o++){const r=d[o],s=document.createElement("tr"),n=document.createElement("td");n.textContent=String(o+1),s.appendChild(n);const e=document.createElement("td");e.textContent=r.url;const c=document.createElement("td");c.textContent=r.reportedLatency!==null?r.reportedLatency.toFixed(2):"—";const i=document.createElement("td");i.textContent=r.measuredLatency.toFixed(2),s.appendChild(e),s.appendChild(c),s.appendChild(i),t.appendChild(s)}},b=()=>{const t=document.getElementById("relay-count");t.textContent="Measuring best 21 relays..."},C=()=>{const t=document.getElementById("relay-count");t.textContent="Measured best 21 relays."},L=async()=>{b();const t=[...p];await Promise.all(t.map(async o=>{const r=await g(o.url);Number.isFinite(r)&&(d.push({url:o.url,reportedLatency:o.reportedLatency,measuredLatency:r}),w())})),C()};let u=null;const E=()=>{u&&clearTimeout(u),u=setTimeout(()=>{L(),O.forEach(t=>t())},500)},S=["wss://relay.damus.io","wss://nos.lol","wss://relay.nostr.band","wss://relay.snort.social","wss://nostr.wine"],y=new URLSearchParams(window.location.search).has("reported"),a=document.getElementById("toggle-reported");y?(a.href=window.location.pathname,a.textContent="Show all relays"):(a.href="?reported",a.textContent="Show just relays with reported open-rtt");const m=new Set,N=t=>{const r=t.tags.find(s=>s[0]==="d")?.[1];if(r&&!m.has(r)){m.add(r);{const s=t.tags.find(c=>c[0]==="n");if(s&&s[1]!=="clearnet")return;const n=t.tags.find(c=>c[0]==="rtt-open")?.[1];if(y&&n===void 0)return;const e=n!==void 0?Number(n):null;if(e!==null&&!Number.isFinite(e))return;p.push({url:r,reportedLatency:e}),E()}}},O=S.map(t=>h(t,{kinds:[30166]},N));
