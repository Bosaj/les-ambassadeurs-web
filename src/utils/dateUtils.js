export const formatDateRange = (startDateStr, endDateStr, language) => {
    if (!startDateStr) return '';
    const start = new Date(startDateStr);
    const end = endDateStr ? new Date(endDateStr) : null;
    const options = { day: 'numeric', month: 'short', year: 'numeric' };

    let formattedStart = start.toLocaleDateString(language === 'ar' ? 'ar-MA' : language === 'fr' ? 'fr-FR' : 'en-US', options);

    if (!end) return formattedStart;

    let formattedEnd = end.toLocaleDateString(language === 'ar' ? 'ar-MA' : language === 'fr' ? 'fr-FR' : 'en-US', options);

    return `${formattedStart} - ${formattedEnd}`;
};

export const calculateDuration = (startDateStr, endDateStr, t) => {
    if (!startDateStr || !endDateStr) return null;
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) return `1 ${t.days}`; // Handle 1 day or same day

    if (diffDays < 7) {
        return `${diffDays} ${t.days}`;
    } else if (diffDays < 30) {
        const weeks = Math.round(diffDays / 7);
        return `${weeks} ${t.weeks}`;
    } else {
        const months = Math.round(diffDays / 30);
        return `${months} ${t.months}`;
    }
};
