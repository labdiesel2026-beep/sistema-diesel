import { z } from "zod";
//#region src/lib/validations/admin-schemas.ts
/**
* Esquemas de Validación Fail-Fast para el Panel de Administración (Backoffice).
* (RF-01, RF-05, RF-08, RF-10, RF-12, RNF-P4-02, AGENTS.MD §3)
*
* Todos los esquemas aplican .strict() para garantizar que cargas maliciosas
* o propiedades no mapeadas sean rechazadas en la frontera de entrada.
*/
var loginSchema = z.object({
	email: z.string({ required_error: "El correo electrónico es obligatorio" }).trim().min(1, "El correo electrónico es obligatorio").email("Formato de correo electrónico inválido"),
	password: z.string({ required_error: "La contraseña es obligatoria" }).min(1, "La contraseña es obligatoria")
}).strict();
var imageMetadataSchema = z.object({
	name: z.string({ required_error: "Nombre de archivo requerido" }).min(1, "Nombre de archivo requerido"),
	size: z.number({ required_error: "Tamaño de archivo requerido" }).max(5 * 1024 * 1024, "El archivo excede el tamaño máximo permitido de 5 MB"),
	type: z.enum([
		"image/jpeg",
		"image/png",
		"image/webp"
	], { errorMap: () => ({ message: "Solo se permiten imágenes en formato .jpg, .png o .webp" }) })
}).strict();
var categoryFormSchema = z.object({
	name: z.string({ required_error: "El nombre de la categoría es obligatorio" }).trim().min(2, "El nombre de la categoría debe tener al menos 2 caracteres"),
	parentId: z.string().uuid("Identificador de categoría padre inválido").nullable().default(null)
}).strict();
var brandFormSchema = z.object({ name: z.string({ required_error: "El nombre de la marca es obligatorio" }).trim().min(2, "El nombre de la marca debe tener al menos 2 caracteres") }).strict();
var PRODUCT_CONDITIONS = [
	"Nuevo",
	"Reacondicionado",
	"Usado"
];
var productFormSchema = z.object({
	name: z.string({ required_error: "El nombre es obligatorio" }).trim().min(3, "El nombre debe contener al menos 3 caracteres"),
	description: z.string({ required_error: "La descripción es obligatoria" }).trim().min(5, "La descripción debe contener al menos 5 caracteres"),
	imageUrl: z.string({ required_error: "La foto del producto es obligatoria" }).min(1, "Debe seleccionar una foto para el producto"),
	categoryIds: z.array(z.string().uuid("Identificador de categoría inválido")).min(1, "Debe seleccionar al menos una categoría"),
	brandId: z.string({ required_error: "Debe seleccionar una marca" }).uuid("Identificador de marca inválido"),
	vehicleCompatibility: z.string().trim().optional().default(""),
	condition: z.enum(PRODUCT_CONDITIONS, { errorMap: () => ({ message: "Condición debe ser 'Nuevo', 'Reacondicionado' o 'Usado'" }) }),
	price: z.number({ invalid_type_error: "El precio debe ser un número válido" }).nonnegative("El precio no puede ser negativo (admite $0)").nullable(),
	showPrice: z.boolean().default(true),
	visible: z.boolean().default(true),
	oem: z.string().trim().optional().default(""),
	isFeatured: z.boolean().default(false)
}).strict();
var DELETE_CONFIRMATION_WORD = "ELIMINAR";
z.string({ required_error: "La confirmación es obligatoria" }).trim().refine((val) => val === DELETE_CONFIRMATION_WORD, { message: "Debe ingresar exactamente la palabra \"ELIMINAR\"" });
//#endregion
export { loginSchema as a, imageMetadataSchema as i, brandFormSchema as n, productFormSchema as o, categoryFormSchema as r, PRODUCT_CONDITIONS as t };
