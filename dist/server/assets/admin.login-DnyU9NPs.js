import { i as Button } from "./api-DBBCsKQc.js";
import { a as loginSchema } from "./admin-schemas-ItK5u1ge.js";
import { n as Input, t as Label } from "./label-Cl3PIWKB.js";
import { n as useAdminAuth } from "./AuthContext-DQLJcYU0.js";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { AlertCircle, ArrowLeft, Loader2, Lock, SlidersHorizontal } from "lucide-react";
//#region src/components/admin/auth/AdminLoginForm.tsx
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
function AdminLoginForm({ onSuccess }) {
	const { login } = useAdminAuth();
	const [formData, setFormData] = useState({
		email: "",
		password: ""
	});
	const [fieldErrors, setFieldErrors] = useState({});
	const [formError, setFormError] = useState(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const validateField = (field, value) => {
		const partialData = {
			...formData,
			[field]: value
		};
		const result = loginSchema.safeParse(partialData);
		if (!result.success) {
			const error = result.error.errors.find((e) => e.path.includes(field));
			setFieldErrors((prev) => ({
				...prev,
				[field]: error ? error.message : void 0
			}));
		} else setFieldErrors((prev) => ({
			...prev,
			[field]: void 0
		}));
	};
	const handleBlur = (field) => (e) => {
		validateField(field, e.target.value);
	};
	const handleChange = (field) => (e) => {
		const value = e.target.value;
		setFormData((prev) => ({
			...prev,
			[field]: value
		}));
		if (fieldErrors[field]) validateField(field, value);
	};
	const handleSubmit = async (e) => {
		e.preventDefault();
		setFormError(null);
		const result = loginSchema.safeParse(formData);
		if (!result.success) {
			const errors = {};
			for (const err of result.error.errors) {
				if (err.path.includes("email") && !errors.email) errors.email = err.message;
				if (err.path.includes("password") && !errors.password) errors.password = err.message;
			}
			setFieldErrors(errors);
			return;
		}
		setFieldErrors({});
		setIsSubmitting(true);
		try {
			const loginResult = await login(result.data);
			if (loginResult.success) {
				if (onSuccess) onSuccess();
			} else setFormError(loginResult.error || "Credenciales incorrectas");
		} catch {
			setFormError("Ocurrió un error inesperado al procesar el inicio de sesión");
		} finally {
			setIsSubmitting(false);
		}
	};
	return /* @__PURE__ */ jsxs("form", {
		onSubmit: handleSubmit,
		noValidate: true,
		className: "space-y-5",
		"aria-label": "Formulario de inicio de sesión",
		children: [
			formError && /* @__PURE__ */ jsxs("div", {
				role: "alert",
				"aria-live": "polite",
				className: "flex items-center gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-3.5 text-sm text-destructive",
				children: [/* @__PURE__ */ jsx(AlertCircle, { className: "size-5 shrink-0" }), /* @__PURE__ */ jsx("span", { children: formError })]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "space-y-2",
				children: [
					/* @__PURE__ */ jsx(Label, {
						htmlFor: "admin-email",
						children: "Correo electrónico"
					}),
					/* @__PURE__ */ jsx(Input, {
						id: "admin-email",
						name: "email",
						type: "email",
						autoComplete: "email",
						placeholder: "admin@laboratoriodiesel.com",
						value: formData.email,
						onChange: handleChange("email"),
						onBlur: handleBlur("email"),
						disabled: isSubmitting,
						className: fieldErrors.email ? "border-destructive focus-visible:ring-destructive" : "",
						"aria-invalid": Boolean(fieldErrors.email),
						"aria-describedby": fieldErrors.email ? "admin-email-error" : void 0
					}),
					fieldErrors.email && /* @__PURE__ */ jsx("p", {
						id: "admin-email-error",
						role: "alert",
						className: "text-xs text-destructive",
						children: fieldErrors.email
					})
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "space-y-2",
				children: [
					/* @__PURE__ */ jsx(Label, {
						htmlFor: "admin-password",
						children: "Contraseña"
					}),
					/* @__PURE__ */ jsx(Input, {
						id: "admin-password",
						name: "password",
						type: "password",
						autoComplete: "current-password",
						placeholder: "••••••••",
						value: formData.password,
						onChange: handleChange("password"),
						onBlur: handleBlur("password"),
						disabled: isSubmitting,
						className: fieldErrors.password ? "border-destructive focus-visible:ring-destructive" : "",
						"aria-invalid": Boolean(fieldErrors.password),
						"aria-describedby": fieldErrors.password ? "admin-password-error" : void 0
					}),
					fieldErrors.password && /* @__PURE__ */ jsx("p", {
						id: "admin-password-error",
						role: "alert",
						className: "text-xs text-destructive",
						children: fieldErrors.password
					})
				]
			}),
			/* @__PURE__ */ jsx(Button, {
				type: "submit",
				disabled: isSubmitting,
				className: "w-full h-11 text-base font-semibold transition-all",
				variant: "industrial",
				children: isSubmitting ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Loader2, { className: "mr-2 size-4 animate-spin" }), "Iniciando sesión..."] }) : /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Lock, { className: "mr-2 size-4" }), "Iniciar Sesión"] })
			})
		]
	});
}
//#endregion
//#region src/routes/admin.login.tsx?tsr-split=component
function AdminLoginPage() {
	const { isAuthenticated } = useAdminAuth();
	const navigate = useNavigate();
	useEffect(() => {
		if (isAuthenticated) navigate({ to: "/admin" });
	}, [isAuthenticated, navigate]);
	const handleSuccess = () => {
		navigate({ to: "/admin" });
	};
	return /* @__PURE__ */ jsx("div", {
		className: "flex min-h-[calc(100dvh-5rem)] w-full items-center justify-center p-4",
		children: /* @__PURE__ */ jsxs("div", {
			className: "w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl sm:p-8",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "mb-6 text-center",
					children: [
						/* @__PURE__ */ jsx("div", {
							className: "mx-auto mb-3 flex size-12 items-center justify-center rounded-xl bg-industrial/10 text-industrial",
							children: /* @__PURE__ */ jsx(SlidersHorizontal, { className: "size-6" })
						}),
						/* @__PURE__ */ jsx("h1", {
							className: "font-display text-2xl font-bold tracking-tight",
							children: "Laboratorio Diésel"
						}),
						/* @__PURE__ */ jsx("p", {
							className: "mt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground",
							children: "Acceso al Backoffice"
						})
					]
				}),
				/* @__PURE__ */ jsx(AdminLoginForm, { onSuccess: handleSuccess }),
				/* @__PURE__ */ jsx("div", {
					className: "mt-6 border-t border-border pt-4 text-center",
					children: /* @__PURE__ */ jsxs(Link, {
						to: "/",
						className: "inline-flex items-center gap-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground",
						children: [/* @__PURE__ */ jsx(ArrowLeft, { className: "size-3.5" }), "Volver al sitio público"]
					})
				})
			]
		})
	});
}
//#endregion
export { AdminLoginPage as component };
