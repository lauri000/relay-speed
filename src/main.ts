import "./style.css";
import { subscribe, connectAndMeasure } from "./relay.ts";

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
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
`

const relays: RelayEntry[] = [];

let results: { url: string; reportedLatency: number | null; measuredLatency: number }[] = [];

const renderResults = () => {
  const resultsBody = document.getElementById("results-body")!;
  resultsBody.innerHTML = "";
  results.sort((a, b) => a.measuredLatency - b.measuredLatency);
  for (let i = 0; i < Math.min(results.length, 21); i++) {
    const result = results[i]!;
    const row = document.createElement("tr");
    const rankCell = document.createElement("td");
    rankCell.textContent = String(i + 1);
    row.appendChild(rankCell);
    const urlCell = document.createElement("td");
    urlCell.textContent = result.url;
    const reportedCell = document.createElement("td");
    reportedCell.textContent = result.reportedLatency !== null ? result.reportedLatency.toFixed(2) : "—";
    const measuredCell = document.createElement("td");
    measuredCell.textContent = result.measuredLatency.toFixed(2);
    row.appendChild(urlCell);
    row.appendChild(reportedCell);
    row.appendChild(measuredCell);
    resultsBody.appendChild(row);
  }
}

const statusEl = document.getElementById("status")!;

const renderDiscoveryStatus = () => {
  statusEl.textContent = `Discovering relays... (${relays.length} found)`;
}

const renderMeasuringIndicator = () => {
  statusEl.textContent = `Measuring ${relays.length} relays...`;
}

const removeMeasuringIndicator = () => {
  statusEl.textContent = `Done. Measured ${results.length} of ${relays.length} relays.`;
}

const connectRelays = async () => {
  renderMeasuringIndicator();
  const relayCopy = [...relays];
  await Promise.all(relayCopy.map(async (relay) => {
    const measuredLatency = await connectAndMeasure(relay.url);
    if (!Number.isFinite(measuredLatency)) return;
    results.push({ url: relay.url, reportedLatency: relay.reportedLatency, measuredLatency });
    renderResults();
  }));
  removeMeasuringIndicator();
}


let timeout: number | null = null;
const setReady = () => {
  if (timeout) clearTimeout(timeout);
  timeout = setTimeout(() => {
    connectRelays();
    unsubscribes.forEach((fn) => fn());
  }, 500);
}


const initialRelays = [
  "wss://relay.damus.io",
  "wss://nos.lol",
  "wss://relay.nostr.band",
  "wss://relay.snort.social",
  "wss://nostr.wine",
];

const requireReported = new URLSearchParams(window.location.search).has("reported");

const toggleLink = document.getElementById("toggle-reported") as HTMLAnchorElement;
if (requireReported) {
  toggleLink.href = window.location.pathname;
  toggleLink.textContent = "Show all relays";
} else {
  toggleLink.href = "?reported";
  toggleLink.textContent = "Show just relays with reported open-rtt";
}

interface RelayEntry {
  url: string;
  reportedLatency: number | null;
}

const seenUrls = new Set<string>();

const onEvent = (event: { tags: string[][]; content: string }) => {
  const dTag = event.tags.find((tag) => tag[0] === "d");

  const url = dTag?.[1];
  if (!url) return;
  if (seenUrls.has(url)) return;
  seenUrls.add(url);

  const network = event.tags.find((tag) => tag[0] === "n");
  if (network && network[1] !== "clearnet") return;

  const rttValue = event.tags.find((tag) => tag[0] === "rtt-open")?.[1];
  if (requireReported && rttValue === undefined) return;
  const reportedLatency = rttValue !== undefined ? Number(rttValue) : null;
  if (reportedLatency !== null && !Number.isFinite(reportedLatency)) return;

  relays.push({ url, reportedLatency });
  renderDiscoveryStatus();
  setReady();
};

const unsubscribes = initialRelays.map((relay) =>
  subscribe(relay, { kinds: [30166] }, onEvent)
);




