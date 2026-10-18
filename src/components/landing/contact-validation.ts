/**
 * Lógica pura de validación client-side para el formulario de contacto.
 * Cumple con Fail-Fast a nivel frontend, sanitizando datos previamente
 * con .trim() e impidiendo envíos con campos vacíos o longitudes fuera de rango.
 * (RF-06, CL-03)
 */

import {
  FORM_VALIDATION_RULES,
  type ContactFormData,
  type ContactFormErrors,
} from "./types";

export interface ValidationResult {
  isValid: boolean;
  errors: ContactFormErrors;
  cleanedValues: ContactFormData;
}

/**
 * Valida un formulario de contacto tras aplicar .trim() a todos los campos.
 *
 * @param values Datos sin procesar provenientes de los inputs
 * @returns Resultado con bandera isValid, diccionario de errores y valores saneados
 */
export function validateContactForm(values: ContactFormData): ValidationResult {
  const errors: ContactFormErrors = {};

  // Sanitización obligatoria con .trim() (RF-06 y Caso Límite CL-03)
  const cleanedValues: ContactFormData = {
    nombre: (values.nombre ?? "").trim(),
    contacto: (values.contacto ?? "").trim(),
    mensaje: (values.mensaje ?? "").trim(),
  };

  // 1. Validación: Nombre (2 a 100 caracteres)
  if (!cleanedValues.nombre) {
    errors.nombre = FORM_VALIDATION_RULES.nombre.requiredMessage;
  } else if (
    cleanedValues.nombre.length < FORM_VALIDATION_RULES.nombre.minLength ||
    cleanedValues.nombre.length > FORM_VALIDATION_RULES.nombre.maxLength
  ) {
    errors.nombre = FORM_VALIDATION_RULES.nombre.lengthMessage;
  }

  // 2. Validación: Teléfono / Email (5 a 100 caracteres)
  if (!cleanedValues.contacto) {
    errors.contacto = FORM_VALIDATION_RULES.contacto.requiredMessage;
  } else if (
    cleanedValues.contacto.length < FORM_VALIDATION_RULES.contacto.minLength ||
    cleanedValues.contacto.length > FORM_VALIDATION_RULES.contacto.maxLength
  ) {
    errors.contacto = FORM_VALIDATION_RULES.contacto.lengthMessage;
  }

  // 3. Validación: Mensaje (10 a 1000 caracteres)
  if (!cleanedValues.mensaje) {
    errors.mensaje = FORM_VALIDATION_RULES.mensaje.requiredMessage;
  } else if (
    cleanedValues.mensaje.length < FORM_VALIDATION_RULES.mensaje.minLength ||
    cleanedValues.mensaje.length > FORM_VALIDATION_RULES.mensaje.maxLength
  ) {
    errors.mensaje = FORM_VALIDATION_RULES.mensaje.lengthMessage;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    cleanedValues,
  };
}
