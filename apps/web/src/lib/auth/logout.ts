import { signOut } from '../api/auth';

// Local to this document: another tab's logout must still redirect private pages to login.
let leavingAfterLogout = false;

export function redirectAfterSessionLoss() {
  if (!leavingAfterLogout) window.location.replace('/login');
}

export async function logoutAndGoHome() {
  if (leavingAfterLogout) return;
  leavingAfterLogout = true;
  try {
    await signOut();
    // Discard cached session-dependent pages once the server has cleared the cookie.
    window.location.replace('/');
  } catch (error) {
    leavingAfterLogout = false;
    throw error;
  }
}
