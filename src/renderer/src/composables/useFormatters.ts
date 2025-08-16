import { ref, onMounted, onUnmounted, readonly } from 'vue';
import dayjs from 'dayjs';

// Create reactive refs for the formats
const dateFormat = ref('YYYY-MM-DD');
const timeFormat = ref('24');

/**
 * Updates the format settings from localStorage.
 */
function updateFormats() {
    try {
        const saved = JSON.parse(localStorage.getItem('appSettings') || '{}');
        dateFormat.value = saved?.locale?.dateFormat || 'YYYY-MM-DD';
        timeFormat.value = saved?.locale?.timeFormat || '24';
    } catch (e) {
        console.error("Failed to parse settings for formatters:", e);
        // Fallback to defaults
        dateFormat.value = 'YYYY-MM-DD';
        timeFormat.value = '24';
    }
}

// Initial load
updateFormats();

// Listen for changes that happen in other tabs/windows
window.addEventListener('storage', (event) => {
    if (event.key === 'appSettings') {
        updateFormats();
    }
});

/**
 * A composable that provides a reactive date formatting function.
 */
export function useFormatters() {

    const formatDate = (dateString: string | Date | undefined | null): string => {
        if (!dateString) return '';

        const timeFmt = timeFormat.value === '12' ? 'hh:mm:ss A' : 'HH:mm:ss';
        const fullFormat = `${dateFormat.value} ${timeFmt}`;
        
        return dayjs(dateString).format(fullFormat);
    };

    return {
        formatDate,
        // Expose readonly refs if components need to react to format changes directly
        dateFormat: readonly(dateFormat),
        timeFormat: readonly(timeFormat),
    };
}
