import type { Department, UserPayload, UserProfile, UserStatus } from '../types'

export interface UserFormValues {
  firstName: string
  lastName: string
  email: string
  phone: string
  department: Department | ''
  roleId: string
  roleName: string
  jobTitle: string
  status: UserStatus | ''
  password: string
  confirmPassword: string
  bio: string
  practiceArea: string
  officeLocation: string
  skills: string
  avatarFileName: string
}

export type UserFormField = keyof UserFormValues
export type UserFormErrors = Partial<Record<UserFormField, string>>

export const emptyUserFormValues: UserFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  department: '',
  roleId: '',
  roleName: '',
  jobTitle: '',
  status: 'ACTIVE',
  password: '',
  confirmPassword: '',
  bio: '',
  practiceArea: '',
  officeLocation: '',
  skills: '',
  avatarFileName: '',
}

export function validateUserForm(
  values: UserFormValues,
  options: { requirePassword: boolean },
): UserFormErrors {
  const errors: UserFormErrors = {}

  if (!values.firstName.trim()) errors.firstName = 'First name is required.'
  if (!values.lastName.trim()) errors.lastName = 'Last name is required.'

  if (!values.email.trim()) errors.email = 'Email is required.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = 'Enter a valid email address.'
  }

  if (!values.department) errors.department = 'Select a department.'
  if (!values.roleId) errors.roleId = 'Select a role.'
  if (!values.status) errors.status = 'Select a status.'

  if (options.requirePassword || values.password || values.confirmPassword) {
    if (!values.password) errors.password = 'Password is required.'
    else if (values.password.length < 8) {
      errors.password = 'Use at least 8 characters.'
    }
    if (!values.confirmPassword) {
      errors.confirmPassword = 'Confirm the password.'
    } else if (values.password !== values.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.'
    }
  }

  return errors
}

export function toUserPayload(
  values: UserFormValues,
  options: { sendInvite?: boolean } = {},
): UserPayload {
  return {
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    email: values.email.trim(),
    phone: values.phone.trim(),
    department: values.department as Department,
    roleId: values.roleId,
    jobTitle: values.jobTitle.trim(),
    status: values.status as UserStatus,
    password: values.password || undefined,
    bio: values.bio.trim() || undefined,
    practiceArea: values.practiceArea.trim() || undefined,
    officeLocation: values.officeLocation.trim() || undefined,
    skills: values.skills
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean),
    sendInvite: options.sendInvite,
  }
}

export function toUserFormValues(user: UserProfile): UserFormValues {
  return {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone ?? '',
    department: user.department,
    roleId: user.roleId,
    roleName: user.roleName,
    jobTitle: user.jobTitle ?? '',
    status: user.status,
    password: '',
    confirmPassword: '',
    bio: user.bio ?? '',
    practiceArea: user.practiceArea ?? '',
    officeLocation: user.officeLocation ?? '',
    skills: user.skills.map((skill) => skill.label).join(', '),
    avatarFileName: '',
  }
}
