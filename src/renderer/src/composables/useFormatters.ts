import { ref, watch, readonly } from 'vue';
import dayjs from 'dayjs';
import { useSettingsStore } from '@/stores/settingsStore';

// Create reactive refs for the formats
const dateFormat = ref('YYYY-MM-DD');
const timeFormat = ref('24');

/**
 * A composable that provides a reactive date formatting function.
 */
export function useFormatters() {
    const settingsStore = useSettingsStore();

    // Function to update formats from the store
    const updateFormatsFromStore = () => {
        const settings = settingsStore.appSettings;
        dateFormat.value = settings?.locale?.dateFormat || 'YYYY-MM-DD';
        timeFormat.value = settings?.locale?.timeFormat || '24';
    };

    // Initial load from store
    updateFormatsFromStore();

    // Watch for changes in the store
    watch(() => settingsStore.appSettings, (newSettings) => {
        dateFormat.value = newSettings?.locale?.dateFormat || 'YYYY-MM-DD';
        timeFormat.value = newSettings?.locale?.timeFormat || '24';
    }, { deep: true });

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
