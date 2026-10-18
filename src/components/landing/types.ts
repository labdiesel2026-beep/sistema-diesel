/**
 * Tipos e interfaces para el formulario de contacto y componentes de la Landing Page.
 * (RF-06, CL-03)
 */

export interface ContactFormData {
  nombre: string;
  contacto: string;
  mensaje: string;
}

export interface ContactFormErrors {
  nombre?: string;
  contacto?: string;
  mensaje?: string;
}

export type FormFieldKey = keyof ContactFormData;

export interface ValidationRule {
  minLength: number;
  maxLength: number;
  requiredMessage: string;
  lengthMessage: string;
}

export const INITIAL_CONTACT_FORM_DATA: ContactFormData = {
  nombre: "",
  contacto: "",
  mensaje: "",
};

export const FORM_VALIDATION_RULES: Record<FormFieldKey, ValidationRule> = {
  nombre: {
    minLength: 2,
    maxLength: 100,
    requiredMessage: "El nombre es obligatorio.",
    lengthMessage: "El nombre debe tener entre 2 y 100 caracteres.",
  },
  contacto: {
    minLength: 5,
    maxLength: 100,
    requiredMessage: "Indique un teléfono o correo electrónico de contacto.",
    lengthMessage: "El dato de contacto debe tener entre 5 y 100 caracteres.",
  },
  mensaje: {
    minLength: 10,
    maxLength: 1000,
    requiredMessage: "El mensaje no puede estar vacío.",
    lengthMessage: "El mensaje debe tener entre 10 y 1000 caracteres.",
  },
};
