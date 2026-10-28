const channelName = 'mmm-session-changes';
const changedMessage = 'session-changed';

function openChannel() {
  try {
    return typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel(channelName);
  } catch {
    return null;
  }
}

export function notifySessionChanged() {
  const channel = openChannel();
  try {
    channel?.postMessage(changedMessage);
  } catch {
    // Focus/visibility revalidation remains available if messaging is blocked.
  } finally {
    channel?.close();
  }
}

// Messages are only revalidation hints; the account API remains authoritative.
export function subscribeToSessionChanges(revalidate: () => void) {
  const channel = openChannel();
  const onMessage = (event: MessageEvent<unknown>) => {
    if (event.data === changedMessage) revalidate();
  };
  const onVisible = () => {
    if (document.visibilityState === 'visible') revalidate();
  };
  channel?.addEventListener('message', onMessage);
  window.addEventListener('focus', revalidate);
  window.addEventListener('pageshow', revalidate);
  document.addEventListener('visibilitychange', onVisible);
  return () => {
    channel?.removeEventListener('message', onMessage);
    channel?.close();
    window.removeEventListener('focus', revalidate);
    window.removeEventListener('pageshow', revalidate);
    document.removeEventListener('visibilitychange', onVisible);
  };
}
