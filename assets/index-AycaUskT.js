(function(){const r=document.createElement("link").relList;if(r&&r.supports&&r.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))s(e);new MutationObserver(e=>{for(const t of e)if(t.type==="childList")for(const c of t.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&s(c)}).observe(document,{childList:!0,subtree:!0});function o(e){const t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?t.credentials="include":e.crossOrigin==="anonymous"?t.credentials="omit":t.credentials="same-origin",t}function s(e){if(e.ep)return;e.ep=!0;const t=o(e);fetch(e.href,t)}})();const l={},f=n=>(l[n]||(l[n]=new WebSocket(n)),l[n]),h=(n,r,o)=>{const s=Math.random().toString(36).substring(2,15),e=JSON.stringify(["REQ",s,r]),t=f(n);return t.onopen=()=>{t.send(e)},t.onmessage=c=>{const i=JSON.parse(c.data);i[0]==="EVENT"&&i[1]===s&&o(i[2])},t.onerror=()=>{},t.onclose=()=>{},()=>{t.close()}},g=n=>new Promise(r=>{if(!n.startsWith("wss://")){r(1/0);return}const o="speed-test",s=performance.now();let e;try{e=new WebSocket(n)}catch{r(1/0);return}const t=setTimeout(()=>{e.close(),r(1/0)},5e3);e.onopen=()=>{e.send(JSON.stringify(["REQ",o,{kinds:[1],limit:1}]))},e.onmessage=c=>{JSON.parse(c.data)[1]===o&&(clearTimeout(t),e.close(),r(performance.now()-s))},e.onerror=()=>{clearTimeout(t),e.close(),r(1/0)}});document.querySelector("#app").innerHTML=`
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
`;const p=[];let d=[];const w=()=>{const n=document.getElementById("results-body");n.innerHTML="",d.sort((r,o)=>r.measuredLatency-o.measuredLatency);for(let r=0;r<Math.min(d.length,21);r++){const o=d[r],s=document.createElement("tr"),e=document.createElement("td");e.textContent=String(r+1),s.appendChild(e);const t=document.createElement("td");t.textContent=o.url;const c=document.createElement("td");c.textContent=o.reportedLatency!==null?o.reportedLatency.toFixed(2):"—";const i=document.createElement("td");i.textContent=o.measuredLatency.toFixed(2),s.appendChild(t),s.appendChild(c),s.appendChild(i),n.appendChild(s)}},b=()=>{const n=document.getElementById("relay-count");n.textContent="Measuring best 21 relays..."},C=()=>{const n=document.getElementById("relay-count");n.textContent="Measured best 21 relays."},L=async()=>{b();const n=[...p];await Promise.all(n.map(async r=>{const o=await g(r.url);Number.isFinite(o)&&(d.push({url:r.url,reportedLatency:r.reportedLatency,measuredLatency:o}),w())})),C()};let u=null;const E=()=>{u&&clearTimeout(u),u=setTimeout(()=>{L(),R.forEach(n=>n())},500)},S=["wss://relay.damus.io","wss://nos.lol","wss://relay.nostr.band","wss://relay.snort.social","wss://nostr.wine"],y=new URLSearchParams(window.location.search).has("reported"),a=document.getElementById("toggle-reported");y?(a.href=window.location.pathname,a.textContent="Show all relays"):(a.href="?reported",a.textContent="Show just relays with reported open-rtt");const m=new Set,I=n=>{const o=n.tags.find(s=>s[0]==="d")?.[1];if(o&&!m.has(o)){m.add(o);{const s=n.tags.find(c=>c[0]==="n");if(s&&s[1]!=="clearnet")return;const e=n.tags.find(c=>c[0]==="rtt-open")?.[1];if(y&&e===void 0)return;const t=e!==void 0?Number(e):null;if(t!==null&&!Number.isFinite(t))return;p.push({url:o,reportedLatency:t}),E()}}},R=S.map(n=>h(n,{kinds:[30166]},I));
