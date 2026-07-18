declare const DASS_PUBLIC_ORIGIN: string;

export const configuredPublicOrigin = (typeof DASS_PUBLIC_ORIGIN === 'undefined' ? '' : DASS_PUBLIC_ORIGIN).replace(/\/$/, '');
