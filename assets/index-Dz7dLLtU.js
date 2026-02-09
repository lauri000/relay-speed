(function(){const r=document.createElement("link").relList;if(r&&r.supports&&r.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))s(t);new MutationObserver(t=>{for(const e of t)if(e.type==="childList")for(const c of e.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&s(c)}).observe(document,{childList:!0,subtree:!0});function o(t){const e={};return t.integrity&&(e.integrity=t.integrity),t.referrerPolicy&&(e.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?e.credentials="include":t.crossOrigin==="anonymous"?e.credentials="omit":e.credentials="same-origin",e}function s(t){if(t.ep)return;t.ep=!0;const e=o(t);fetch(t.href,e)}})();const l={},f=n=>(l[n]||(l[n]=new WebSocket(n)),l[n]),h=(n,r,o)=>{const s=Math.random().toString(36).substring(2,15),t=JSON.stringify(["REQ",s,r]),e=f(n);return e.onopen=()=>{e.send(t)},e.onmessage=c=>{const a=JSON.parse(c.data);a[0]==="EVENT"&&a[1]===s&&o(a[2])},e.onerror=()=>{},e.onclose=()=>{},()=>{e.close()}},g=n=>new Promise(r=>{const o="speed-test",s=performance.now(),t=setTimeout(()=>{e.close(),r(1/0)},5e3),e=new WebSocket(n);e.onopen=()=>{e.send(JSON.stringify(["REQ",o,{kinds:[1],limit:1}]))},e.onmessage=c=>{JSON.parse(c.data)[1]===o&&(clearTimeout(t),e.close(),r(performance.now()-s))},e.onerror=()=>{clearTimeout(t),e.close(),r(1/0)}});document.querySelector("#app").innerHTML=`
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
`;const p=[];let d=[];const w=()=>{const n=document.getElementById("results-body");n.innerHTML="",d.sort((r,o)=>r.measuredLatency-o.measuredLatency);for(let r=0;r<Math.min(d.length,21);r++){const o=d[r],s=document.createElement("tr"),t=document.createElement("td");t.textContent=String(r+1),s.appendChild(t);const e=document.createElement("td");e.textContent=o.url;const c=document.createElement("td");c.textContent=o.reportedLatency!==null?o.reportedLatency.toFixed(2):"—";const a=document.createElement("td");a.textContent=o.measuredLatency.toFixed(2),s.appendChild(e),s.appendChild(c),s.appendChild(a),n.appendChild(s)}},b=()=>{const n=document.getElementById("relay-count");n.textContent="Measuring best 21 relays..."},C=()=>{const n=document.getElementById("relay-count");n.textContent="Measured best 21 relays."},L=async()=>{b();const n=[...p];await Promise.all(n.map(async r=>{const o=await g(r.url);Number.isFinite(o)&&(d.push({url:r.url,reportedLatency:r.reportedLatency,measuredLatency:o}),w())})),C()};let u=null;const E=()=>{u&&clearTimeout(u),u=setTimeout(()=>{L(),I.forEach(n=>n())},500)},S=["wss://relay.damus.io","wss://nos.lol","wss://relay.nostr.band","wss://relay.snort.social","wss://nostr.wine"],y=new URLSearchParams(window.location.search).has("reported"),i=document.getElementById("toggle-reported");y?(i.href=window.location.pathname,i.textContent="Show all relays"):(i.href="?reported",i.textContent="Show just relays with reported open-rtt");const m=new Set,R=n=>{const o=n.tags.find(s=>s[0]==="d")?.[1];if(o&&!m.has(o)){m.add(o);{const s=n.tags.find(c=>c[0]==="n");if(s&&s[1]!=="clearnet")return;const t=n.tags.find(c=>c[0]==="rtt-open")?.[1];if(y&&t===void 0)return;const e=t!==void 0?Number(t):null;if(e!==null&&!Number.isFinite(e))return;p.push({url:o,reportedLatency:e}),E()}}},I=S.map(n=>h(n,{kinds:[30166]},R));
