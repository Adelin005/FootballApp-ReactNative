// ISO Alpha-2 Country Codes for filtering by continent
// These are standard 2-letter codes used by the Soccer Football Info API and FlagCDN

const EUROPE = new Set([
  'AL', 'AD', 'AT', 'BY', 'BE', 'BA', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FO', 'FI', 'FR', 'GE', 'DE', 'GI', 'GR', 'HU', 'IS', 'IE', 'IT', 'KZ', 'LV', 'LI', 'LT', 'LU', 'MT', 'MD', 'MC', 'ME', 'NL', 'MK', 'NO', 'PL', 'PT', 'RO', 'RU', 'SM', 'RS', 'SK', 'SI', 'ES', 'SE', 'CH', 'TR', 'UA', 'GB', 'VA', 'GB-ENG', 'GB-SCT', 'GB-WLS', 'GB-NIR'
]);

const AMERICA = new Set([
  'AI', 'AG', 'AR', 'AW', 'BS', 'BB', 'BZ', 'BM', 'BO', 'BR', 'VG', 'CA', 'KY', 'CL', 'CO', 'CR', 'CU', 'CW', 'DM', 'DO', 'EC', 'SV', 'FK', 'GF', 'GL', 'GD', 'GP', 'GU', 'GT', 'GY', 'HT', 'HN', 'JM', 'MQ', 'MX', 'MS', 'NI', 'PA', 'PY', 'PE', 'PR', 'KN', 'LC', 'PM', 'VC', 'SX', 'SR', 'TT', 'TC', 'VI', 'US', 'UY', 'VE'
]);

const ASIA = new Set([
  'AF', 'AM', 'AZ', 'BH', 'BD', 'BT', 'BN', 'KH', 'CN', 'CX', 'CC', 'HK', 'IN', 'ID', 'IR', 'IQ', 'IL', 'JP', 'JO', 'KP', 'KR', 'KW', 'KG', 'LA', 'LB', 'MO', 'MY', 'MV', 'MN', 'MM', 'NP', 'OM', 'PK', 'PS', 'PH', 'QA', 'SA', 'SG', 'LK', 'SY', 'TW', 'TJ', 'TH', 'TL', 'TM', 'UZ', 'VN', 'YE', 'AU'
]);

const AFRICA = new Set([
  'DZ', 'AO', 'BJ', 'BW', 'BF', 'BI', 'CV', 'CM', 'CF', 'TD', 'KM', 'CD', 'CG', 'DJ', 'EG', 'GQ', 'ER', 'SZ', 'ET', 'GA', 'GM', 'GH', 'GN', 'GW', 'CI', 'KE', 'LS', 'LR', 'LY', 'MG', 'MW', 'ML', 'MR', 'MU', 'YT', 'MA', 'MZ', 'NA', 'NE', 'NG', 'RE', 'RW', 'ST', 'SN', 'SC', 'SL', 'SO', 'ZA', 'SS', 'SD', 'TZ', 'TG', 'TN', 'UG', 'EH', 'ZM', 'ZW'
]);

export const getContinentFromCode = (code: string): string => {
  if (!code) return 'Other';
  const c = code.toUpperCase();
  if (EUROPE.has(c)) return 'Europe';
  if (AMERICA.has(c)) return 'America';
  if (ASIA.has(c)) return 'Asia';
  if (AFRICA.has(c)) return 'Africa';
  return 'Other';
};

/**
 * Returns the FlagCDN URL for a given 2-letter country code.
 */
export const getFlagUrl = (code: string): string => {
  if (!code) return 'https://flagcdn.com/w160/un.png';
  
  // Normalize code for flagcdn
  let finalCode = code.toLowerCase();
  
  // Specific mappings for flagcdn (e.g., UK components)
  if (finalCode === 'gb-eng') finalCode = 'gb-eng';
  if (finalCode === 'gb-sct') finalCode = 'gb-sct';
  if (finalCode === 'gb-wls') finalCode = 'gb-wls';
  if (finalCode === 'gb-nir') finalCode = 'gb-nir';
  
  return `https://flagcdn.com/w160/${finalCode}.png`;
};
