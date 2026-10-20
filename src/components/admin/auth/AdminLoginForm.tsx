import { useState, type FormEvent, type FocusEvent, type ChangeEvent } from "react";
import { Lock, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminAuth } from "@/context/admin-auth-context";
import { loginSchema } from "@/lib/validations/admin-schemas";

interface AdminLoginFormProps {
  onSuccess?: () => void;
}

/**
 * Formulario de inicio de sesión seguro para el Panel de Administración.
 * (RF-01, CA-01.1 a CA-01.5, RNF-P4-01, CL-12)
 *
 * Características de seguridad:
 * - Autocompletado nativo permitido (ASVS 2.1.12).
 * - Validación híbrida Fail-Fast (onBlur y onSubmit con Zod).
 * - Errores opacos sin revelar si falló email o contraseña.
 * - Deshabilitación de submit con garantía en bloque finally.
 */
export function AdminLoginForm({ onSuccess }: AdminLoginFormProps) {
  const { login } = useAdminAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const validateField = (field: "email" | "password", value: string) => {
    const partialData = { ...formData, [field]: value };
    const result = loginSchema.safeParse(partialData);

    if (!result.success) {
      const error = result.error.errors.find((e) => e.path.includes(field));
      setFieldErrors((prev) => ({ ...prev, [field]: error ? error.message : undefined }));
    } else {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleBlur = (field: "email" | "password") => (e: FocusEvent<HTMLInputElement>) => {
    validateField(field, e.target.value);
  };

  const handleChange = (field: "email" | "password") => (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      validateField(field, value);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validación completa con Zod antes de mutar
    const result = loginSchema.safeParse(formData);
    if (!result.success) {
      const errors: { email?: string; password?: string } = {};
      for (const err of result.error.errors) {
        if (err.path.includes("email") && !errors.email) {
          errors.email = err.message;
        }
        if (err.path.includes("password") && !errors.password) {
          errors.password = err.message;
        }
      }
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const loginResult = await login(result.data);
      if (loginResult.success) {
        if (onSuccess) {
          onSuccess();
        }
      } else {
        setFormError(loginResult.error || "Credenciales incorrectas");
      }
    } catch {
      setFormError("Ocurrió un error inesperado al procesar el inicio de sesión");
    } finally {
      // Garantía obligatoria de restablecimiento de estado (CL-12)
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-5"
      aria-label="Formulario de inicio de sesión"
    >
      {formError && (
        <div
          role="alert"
          aria-live="polite"
          className="flex items-center gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-3.5 text-sm text-destructive"
        >
          <AlertCircle className="size-5 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="admin-email">Correo electrónico</Label>
        <Input
          id="admin-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="admin@laboratoriodiesel.com"
          value={formData.email}
          onChange={handleChange("email")}
          onBlur={handleBlur("email")}
          disabled={isSubmitting}
          className={fieldErrors.email ? "border-destructive focus-visible:ring-destructive" : ""}
          aria-invalid={Boolean(fieldErrors.email)}
          aria-describedby={fieldErrors.email ? "admin-email-error" : undefined}
        />
        {fieldErrors.email && (
          <p id="admin-email-error" role="alert" className="text-xs text-destructive">
            {fieldErrors.email}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="admin-password">Contraseña</Label>
        <Input
          id="admin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={formData.password}
          onChange={handleChange("password")}
          onBlur={handleBlur("password")}
          disabled={isSubmitting}
          className={
            fieldErrors.password ? "border-destructive focus-visible:ring-destructive" : ""
          }
          aria-invalid={Boolean(fieldErrors.password)}
          aria-describedby={fieldErrors.password ? "admin-password-error" : undefined}
        />
        {fieldErrors.password && (
          <p id="admin-password-error" role="alert" className="text-xs text-destructive">
            {fieldErrors.password}
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-11 text-base font-semibold transition-all"
        variant="industrial"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Iniciando sesión...
          </>
        ) : (
          <>
            <Lock className="mr-2 size-4" />
            Iniciar Sesión
          </>
        )}
      </Button>
    </form>
  );
}
