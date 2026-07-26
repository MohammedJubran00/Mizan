import type { SelectOption } from '@/shared/components/Select'

const REGION_CODES = [
  'AE', 'AF', 'AL', 'AM', 'AO', 'AR', 'AT', 'AU', 'AZ', 'BA', 'BD', 'BE', 'BF',
  'BG', 'BH', 'BI', 'BJ', 'BN', 'BO', 'BR', 'BS', 'BT', 'BW', 'BY', 'BZ', 'CA',
  'CD', 'CF', 'CG', 'CH', 'CI', 'CL', 'CM', 'CN', 'CO', 'CR', 'CU', 'CV', 'CY',
  'CZ', 'DE', 'DJ', 'DK', 'DO', 'DZ', 'EC', 'EE', 'EG', 'ER', 'ES', 'ET', 'FI',
  'FJ', 'FR', 'GA', 'GB', 'GE', 'GH', 'GM', 'GN', 'GQ', 'GR', 'GT', 'GW', 'GY',
  'HN', 'HR', 'HT', 'HU', 'ID', 'IE', 'IL', 'IN', 'IQ', 'IR', 'IS', 'IT', 'JM',
  'JO', 'JP', 'KE', 'KG', 'KH', 'KM', 'KP', 'KR', 'KW', 'KZ', 'LA', 'LB', 'LK',
  'LR', 'LS', 'LT', 'LU', 'LV', 'LY', 'MA', 'MD', 'ME', 'MG', 'MK', 'ML', 'MM',
  'MN', 'MR', 'MT', 'MU', 'MV', 'MW', 'MX', 'MY', 'MZ', 'NA', 'NE', 'NG', 'NI',
  'NL', 'NO', 'NP', 'NZ', 'OM', 'PA', 'PE', 'PG', 'PH', 'PK', 'PL', 'PS', 'PT',
  'PY', 'QA', 'RO', 'RS', 'RU', 'RW', 'SA', 'SD', 'SE', 'SG', 'SI', 'SK', 'SL',
  'SN', 'SO', 'SR', 'SS', 'SV', 'SY', 'SZ', 'TD', 'TG', 'TH', 'TJ', 'TL', 'TM',
  'TN', 'TR', 'TT', 'TW', 'TZ', 'UA', 'UG', 'US', 'UY', 'UZ', 'VE', 'VN', 'YE',
  'ZA', 'ZM', 'ZW',
]

function buildCountryOptions(): SelectOption[] {
  let display: Intl.DisplayNames | null = null

  try {
    display = new Intl.DisplayNames(undefined, { type: 'region' })
  } catch {
    display = null
  }

  return REGION_CODES.map((code) => ({
    value: code,
    label: display?.of(code) ?? code,
  })).sort((a, b) => a.label.localeCompare(b.label))
}

/** Reference data for the address country field (not client data). */
export const countryOptions = buildCountryOptions()

export function countryLabel(code?: string | null) {
  if (!code) return ''
  return countryOptions.find((option) => option.value === code)?.label ?? code
}
