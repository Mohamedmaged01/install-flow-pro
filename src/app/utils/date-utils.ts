/**
 * Date utility functions — all dates displayed in UTC+3 (Arabia Standard Time).
 */

const UTC3_OFFSET_MS = 3 * 60 * 60 * 1000;

/**
 * Converts a date string from the API to a Date adjusted for UTC+3.
 */
function toUTC3(dateStr: string): Date {
    const d = new Date(dateStr);
    // Get UTC milliseconds, then add 3 hours
    return new Date(d.getTime() + UTC3_OFFSET_MS);
}

/**
 * Format a date string to "YYYY-MM-DD" in UTC+3.
 */
export function formatDateUTC3(dateStr: string | null | undefined): string {
    if (!dateStr) return '—';
    const d = toUTC3(dateStr);
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

/**
 * Format a date string to "YYYY-MM-DD HH:mm" in UTC+3.
 */
export function formatDateTimeUTC3(dateStr: string | null | undefined): string {
    if (!dateStr) return '—';
    const d = toUTC3(dateStr);
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    const h = String(d.getUTCHours()).padStart(2, '0');
    const min = String(d.getUTCMinutes()).padStart(2, '0');
    return `${y}-${m}-${day} ${h}:${min}`;
}

/**
 * Returns a human-readable "time ago" string, based on UTC+3 "now".
 */
export function getTimeAgoUTC3(dateStr: string): string {
    const nowUTC3 = Date.now() + UTC3_OFFSET_MS;
    const thenUTC3 = new Date(dateStr).getTime() + UTC3_OFFSET_MS;
    const diff = nowUTC3 - thenUTC3;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'الآن';
    if (mins < 60) return `منذ ${mins} دقيقة`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `منذ ${hours} ساعة`;
    const days = Math.floor(hours / 24);
    return `منذ ${days} يوم`;
}
