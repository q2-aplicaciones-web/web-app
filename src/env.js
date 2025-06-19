export const env = {
    apiBaseUrl: import.meta.env.VITE_FAKE_API_BASE_URL || "http://localhost:3000",
    defaultUserId: import.meta.env.VITE_DEFAULT_USER_ID,
    designLabPath: import.meta.env.VITE_DESIGN_LAB_PATH || "/design-lab",
    currencyCode: import.meta.env.VITE_CURRENCY_CODE || 'USD',
    defaultRedirectPath: import.meta.env.VITE_DEFAULT_REDIRECT_PATH || '/home',
    customerUserId: import.meta.env.VITE_CUSTOMER_USER_ID || 'user-1',
    manufacturerUserId: import.meta.env.VITE_MANUFACTURER_USER_ID || 'user-2',
    adminUserId: import.meta.env.VITE_ADMIN_USER_ID || 'user-3'
}