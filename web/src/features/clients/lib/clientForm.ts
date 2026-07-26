import type { ClientDetails, ClientPayload } from '../types'

export interface ClientFormValues {
  firstName: string
  lastName: string
  companyName: string
  nationalId: string
  dateOfBirth: string
  email: string
  phone: string
  country: string
  city: string
  street: string
  postalCode: string
  tags: string[]
  notes: string
}

export type ClientFormField = keyof Omit<ClientFormValues, 'tags'>

export type ClientFormErrors = Partial<Record<ClientFormField, string>>

export const REQUIRED_CLIENT_FIELDS: ClientFormField[] = [
  'firstName',
  'lastName',
  'email',
  'phone',
]

export const emptyClientFormValues: ClientFormValues = {
  firstName: '',
  lastName: '',
  companyName: '',
  nationalId: '',
  dateOfBirth: '',
  email: '',
  phone: '',
  country: '',
  city: '',
  street: '',
  postalCode: '',
  tags: [],
  notes: '',
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i
const PHONE_ALLOWED = /^[+()\-.\s\d]+$/
const MIN_PHONE_DIGITS = 7
const MAX_PHONE_DIGITS = 15

export function validateClientForm(values: ClientFormValues): ClientFormErrors {
  const errors: ClientFormErrors = {}

  if (!values.firstName.trim()) errors.firstName = 'First name is required.'
  if (!values.lastName.trim()) errors.lastName = 'Last name is required.'

  const email = values.email.trim()
  if (!email) {
    errors.email = 'Email address is required.'
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = 'Enter a valid email address.'
  }

  const phone = values.phone.trim()
  const phoneDigits = phone.replace(/\D/g, '')
  if (!phone) {
    errors.phone = 'Phone number is required.'
  } else if (!PHONE_ALLOWED.test(phone)) {
    errors.phone = 'Use digits, spaces and + ( ) - only.'
  } else if (
    phoneDigits.length < MIN_PHONE_DIGITS ||
    phoneDigits.length > MAX_PHONE_DIGITS
  ) {
    errors.phone = `Enter between ${MIN_PHONE_DIGITS} and ${MAX_PHONE_DIGITS} digits.`
  }

  if (values.dateOfBirth) {
    const date = new Date(values.dateOfBirth)

    if (Number.isNaN(date.getTime())) {
      errors.dateOfBirth = 'Enter a valid date.'
    } else if (date.getTime() > Date.now()) {
      errors.dateOfBirth = 'Date of birth cannot be in the future.'
    } else if (date.getFullYear() < 1900) {
      errors.dateOfBirth = 'Enter a year after 1900.'
    }
  }

  if (values.postalCode && !/^[\w\s-]{2,12}$/.test(values.postalCode.trim())) {
    errors.postalCode = 'Enter a valid postal code.'
  }

  return errors
}

export function isClientFormValid(values: ClientFormValues) {
  return Object.keys(validateClientForm(values)).length === 0
}

export function toClientPayload(values: ClientFormValues): ClientPayload {
  return {
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    companyName: values.companyName.trim(),
    nationalId: values.nationalId.trim(),
    dateOfBirth: values.dateOfBirth,
    email: values.email.trim(),
    phone: values.phone.trim(),
    address: {
      country: values.country,
      city: values.city.trim(),
      street: values.street.trim(),
      postalCode: values.postalCode.trim(),
    },
    tags: values.tags,
    notes: values.notes.trim(),
  }
}

export function toClientFormValues(client: ClientDetails): ClientFormValues {
  return {
    firstName: client.firstName,
    lastName: client.lastName,
    companyName: client.companyName ?? '',
    nationalId: client.nationalId ?? '',
    dateOfBirth: client.dateOfBirth ? client.dateOfBirth.slice(0, 10) : '',
    email: client.email,
    phone: client.phone,
    country: client.address.country ?? '',
    city: client.address.city ?? '',
    street: client.address.street ?? '',
    postalCode: client.address.postalCode ?? '',
    tags: client.tags.map((tag) => tag.label),
    notes: client.notes ?? '',
  }
}
