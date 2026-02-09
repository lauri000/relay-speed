(function(){const r=document.createElement("link").relList;if(r&&r.supports&&r.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))o(e);new MutationObserver(e=>{for(const t of e)if(t.type==="childList")for(const i of t.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&o(i)}).observe(document,{childList:!0,subtree:!0});function s(e){const t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?t.credentials="include":e.crossOrigin==="anonymous"?t.credentials="omit":t.credentials="same-origin",t}function o(e){if(e.ep)return;e.ep=!0;const t=s(e);fetch(e.href,t)}})();const u={},h=n=>(u[n]||(u[n]=new WebSocket(n)),u[n]),g=(n,r,s)=>{const o=Math.random().toString(36).substring(2,15),e=JSON.stringify(["REQ",o,r]),t=h(n);return t.onopen=()=>{t.send(e)},t.onmessage=i=>{const a=JSON.parse(i.data);a[0]==="EVENT"&&a[1]===o&&s(a[2])},t.onerror=()=>{},t.onclose=()=>{},()=>{t.close()}},w=n=>new Promise(r=>{if(!n.startsWith("wss://")){r(1/0);return}const s="speed-test",o=performance.now();let e;try{e=new WebSocket(n)}catch{r(1/0);return}const t=setTimeout(()=>{e.close(),r(1/0)},5e3);e.onopen=()=>{e.send(JSON.stringify(["REQ",s,{kinds:[1],limit:1}]))},e.onmessage=i=>{JSON.parse(i.data)[1]===s&&(clearTimeout(t),e.close(),r(performance.now()-o))},e.onerror=()=>{clearTimeout(t),e.close(),r(1/0)}});document.querySelector("#app").innerHTML=`
  <div>
    <h1>relay-speed</h1>
    <p><a id="toggle-reported" href=""></a></p>
    <p id="status"></p>
    <p class="note">Brave users: disable Shields for this page if results are slow or incomplete.</p>
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
`;const d=[];let c=[];const b=()=>{const n=document.getElementById("results-body");n.innerHTML="",c.sort((r,s)=>r.measuredLatency-s.measuredLatency);for(let r=0;r<Math.min(c.length,21);r++){const s=c[r],o=document.createElement("tr"),e=document.createElement("td");e.textContent=String(r+1),o.appendChild(e);const t=document.createElement("td");t.textContent=s.url;const i=document.createElement("td");i.textContent=s.reportedLatency!==null?s.reportedLatency.toFixed(2):"—";const a=document.createElement("td");a.textContent=s.measuredLatency.toFixed(2),o.appendChild(t),o.appendChild(i),o.appendChild(a),n.appendChild(o)}},m=document.getElementById("status"),C=()=>{m.textContent=`Discovering relays... (${d.length} found)`},L=()=>{m.textContent=`Measuring ${d.length} relays...`},E=()=>{m.textContent=`Done. Measured ${c.length} of ${d.length} relays.`},S=async()=>{L();const n=[...d];await Promise.all(n.map(async r=>{const s=await w(r.url);Number.isFinite(s)&&(c.push({url:r.url,reportedLatency:r.reportedLatency,measuredLatency:s}),b())})),E()};let p=null;const I=()=>{p&&clearTimeout(p),p=setTimeout(()=>{S(),M.forEach(n=>n())},500)},R=["wss://relay.damus.io","wss://nos.lol","wss://relay.nostr.band","wss://relay.snort.social","wss://nostr.wine"],y=new URLSearchParams(window.location.search).has("reported"),l=document.getElementById("toggle-reported");y?(l.href=window.location.pathname,l.textContent="Show all relays"):(l.href="?reported",l.textContent="Show just relays with reported open-rtt");const f=new Set,x=n=>{const s=n.tags.find(o=>o[0]==="d")?.[1];if(s&&!f.has(s)){f.add(s);{const o=n.tags.find(i=>i[0]==="n");if(o&&o[1]!=="clearnet")return;const e=n.tags.find(i=>i[0]==="rtt-open")?.[1];if(y&&e===void 0)return;const t=e!==void 0?Number(e):null;if(t!==null&&!Number.isFinite(t))return;d.push({url:s,reportedLatency:t}),C(),I()}}},M=R.map(n=>g(n,{kinds:[30166]},x));
