// Real-time Event Bus for Instant Multi-Tab and Cross-Window Synchronization

type SyncEventType = 
  | 'ORDER_CREATED'
  | 'ORDER_STATUS_CHANGED'
  | 'ORDER_PAID'
  | 'STATE_SYNC';

interface SyncMessage {
  type: SyncEventType;
  payload: any;
  senderTabId: string;
  timestamp: number;
}

const CHANNEL_NAME = 'kopidesondoro_realtime_sync_v1';
const TAB_ID = `tab_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

class RealtimeSyncBus {
  private channel: BroadcastChannel | null = null;
  private listeners: ((message: SyncMessage) => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel(CHANNEL_NAME);
        this.channel.onmessage = (event) => {
          const msg = event.data as SyncMessage;
          if (msg && msg.senderTabId !== TAB_ID) {
            this.notifyListeners(msg);
          }
        };
      } catch (err) {
        console.warn('BroadcastChannel initialization error:', err);
      }
    }

    // Fallback: Listen to localStorage storage events across windows
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === 'kopidesondoro_storage_event_signal' && e.newValue) {
          try {
            const parsed = JSON.parse(e.newValue) as SyncMessage;
            if (parsed && parsed.senderTabId !== TAB_ID) {
              this.notifyListeners(parsed);
            }
          } catch {
            // ignore
          }
        }
      });
    }
  }

  public broadcast(type: SyncEventType, payload: any) {
    const message: SyncMessage = {
      type,
      payload,
      senderTabId: TAB_ID,
      timestamp: Date.now(),
    };

    // 1. Send via BroadcastChannel (0ms delay)
    if (this.channel) {
      try {
        this.channel.postMessage(message);
      } catch {
        // channel closed fallback
      }
    }

    // 2. Send via localStorage signal
    try {
      localStorage.setItem('kopidesondoro_storage_event_signal', JSON.stringify(message));
    } catch {
      // quota fallback
    }
  }

  public subscribe(callback: (message: SyncMessage) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  private notifyListeners(message: SyncMessage) {
    this.listeners.forEach((listener) => {
      try {
        listener(message);
      } catch (err) {
        console.error('Error in sync listener:', err);
      }
    });
  }
}

export const syncBus = new RealtimeSyncBus();
