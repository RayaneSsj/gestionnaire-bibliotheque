import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function passwordStrength(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) {
      return null;
    }

    const hasMinLength = value.length >= 8;
    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumeric = /[0-9]/.test(value);

    const passwordValid = hasMinLength && hasUpperCase && hasLowerCase && hasNumeric;

    if (!passwordValid) {
      const errors: ValidationErrors = {};

      if (!hasMinLength) {
        errors['minLength'] = 'Le mot de passe doit contenir au moins 8 caractères';
      }
      if (!hasUpperCase) {
        errors['upperCase'] = 'Le mot de passe doit contenir au moins une majuscule';
      }
      if (!hasLowerCase) {
        errors['lowerCase'] = 'Le mot de passe doit contenir au moins une minuscule';
      }
      if (!hasNumeric) {
        errors['numeric'] = 'Le mot de passe doit contenir au moins un chiffre';
      }

      return { passwordStrength: errors };
    }

    return null;
  };
}

export function matchPassword(passwordField: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.parent?.get(passwordField);
    const confirmPassword = control;

    if (!password || !confirmPassword) {
      return null;
    }

    if (password.value !== confirmPassword.value) {
      return { matchPassword: 'Les mots de passe ne correspondent pas' };
    }

    return null;
  };
}