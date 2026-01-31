/**
 * Helper to get localized string from a content object.
 * @param {string|object} contentObj - The content to localize (string or object with en/fr/ar keys)
 * @param {string} lang - The target language code ('en', 'fr', 'ar')
 * @returns {string} - The localized string or fallback
 */
export const getLocalizedContent = (contentObj, lang = 'en') => {
    if (!contentObj) return '';
    if (typeof contentObj === 'string') return contentObj; // Backwards compatibility
    return contentObj[lang] || contentObj['en'] || Object.values(contentObj)[0] || '';
};
