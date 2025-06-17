export const env = {
    apiBaseUrl: import.meta.env.VITE_FAKE_API_BASE_URL || "http://localhost:3000",
    defaultUserId: import.meta.env.VITE_DEFAULT_USER_ID,
    designLabPath: import.meta.env.VITE_DESIGN_LAB_PATH || "/design-lab",
    currencyCode: 'USD',
}