/**
 * Small view preferences that outlive a session.
 *
 * Storage can throw outright in a locked-down browser, so every access is
 * guarded: a preference that cannot be saved simply does not persist.
 */
function read(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function write(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch {
    // Private browsing: the preference simply does not persist.
  }
}

function loadFlag(key: string, fallback: boolean): boolean {
  const stored = read(key)
  return stored === null ? fallback : stored === 'on'
}

const saveFlag = (key: string, on: boolean) => write(key, on ? 'on' : 'off')

/**
 * Whether diagrams animate. A viewer who has asked their system for reduced
 * motion is handled in the diagram stylesheet instead, so the guarantee holds
 * for exported HTML too.
 */
export const loadMotionPreference = () => loadFlag('mp.motion', true)
export const saveMotionPreference = (on: boolean) => saveFlag('mp.motion', on)

/** Whether exports leave the canvas out and come back with a clear background. */
export const loadTransparentExport = () => loadFlag('mp.transparentExport', false)
export const saveTransparentExport = (on: boolean) => saveFlag('mp.transparentExport', on)
