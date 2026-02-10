const relayConnections: { [key: string]: WebSocket } = {};

const getRelayConnection = (relay: string): WebSocket => {
  if (!relayConnections[relay]) {
    relayConnections[relay] = new WebSocket(relay);
  }
  return relayConnections[relay];
}

interface Filter {
  ids?: string[];
  authors?: string[];
  kinds?: number[];
}

export const subscribe = (relay: string, filter: Filter, callback: (event: any) => void) => {
  const subscriptionId = Math.random().toString(36).substring(2, 15);
  const message = JSON.stringify(["REQ", subscriptionId, filter]);
    const relayWs = getRelayConnection(relay);
    
    relayWs.onopen = () => {
      relayWs.send(message);
    };
    
    relayWs.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data[0] === "EVENT" && data[1] === subscriptionId) {
        callback(data[2]);
      }
    };
    
    relayWs.onerror = () => {};
    relayWs.onclose = () => {};

  return () => {
    relayWs.close();
  }
}

export const connectAndMeasure = (relay: string): Promise<number> => {
  return new Promise((resolve) => {
    if (!relay.startsWith("wss://")) {
      resolve(Infinity);
      return;
    }
    const subId = "speed-test";
    const startTime = performance.now();
    let ws: WebSocket;
    try {
      ws = new WebSocket(relay);
    } catch {
      resolve(Infinity);
      return;
    }
    const timeout = setTimeout(() => {
      ws.close();
      resolve(Infinity);
    }, 5000);
    ws.onopen = () => {
      ws.send(JSON.stringify(["REQ", subId, { kinds: [1], limit: 1 }]));
    };
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data[1] === subId) {
        clearTimeout(timeout);
        ws.close();
        resolve(performance.now() - startTime);
      }
    };
    ws.onerror = () => {
      clearTimeout(timeout);
      ws.close();
      resolve(Infinity);
    };
  });
}

