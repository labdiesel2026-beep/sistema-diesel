import { i as Button } from "./api-Db5K75is.js";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./dialog-BJoneSxt.js";
import { n as useAdmin } from "./admin-context-Cs20CvQF.js";
import { t as Badge } from "./badge-BVGYlUau.js";
import { n as brandFormSchema } from "./admin-schemas-ItK5u1ge.js";
import { n as Input, t as Label } from "./label-BaOiJ9Kw.js";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-CT6u-FNV.js";
import { useEffect, useState } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { AlertCircle, AlertTriangle, BadgeCheck, Loader2, Package, Pencil, Plus, ShieldAlert, Trash2 } from "lucide-react";
//#region src/components/admin/brands/BrandList.tsx
/**
* Tabla de listado de marcas con conteo relacional en tiempo real de repuestos vinculados.
* (RF-12, CA-12.1, CL-09)
*/
function BrandList({ onEdit, onDelete }) {
	const { brands, getBrandProductCount } = useAdmin();
	if (brands.length === 0) return /* @__PURE__ */ jsxs("div", {
		"data-testid": "brand-list-empty",
		className: "flex min-h-60 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card p-8 text-center",
		children: [
			/* @__PURE__ */ jsx("div", {
				className: "flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground",
				children: /* @__PURE__ */ jsx(BadgeCheck, { className: "size-6" })
			}),
			/* @__PURE__ */ jsx("h3", {
				className: "mt-4 font-display text-lg font-semibold text-foreground",
				children: "No hay marcas registradas"
			}),
			/* @__PURE__ */ jsx("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: "Comience agregando una nueva marca de fabricante al catálogo."
			})
		]
	});
	return /* @__PURE__ */ jsx("div", {
		"data-testid": "brand-list-container",
		className: "overflow-hidden rounded-xl border border-border bg-card shadow-sm",
		children: /* @__PURE__ */ jsxs(Table, { children: [/* @__PURE__ */ jsx(TableHeader, {
			className: "bg-muted/40",
			children: /* @__PURE__ */ jsxs(TableRow, {
				className: "border-border hover:bg-transparent",
				children: [
					/* @__PURE__ */ jsx(TableHead, {
						className: "w-[45%] px-6 py-4 font-semibold text-foreground",
						children: "Marca / Fabricante"
					}),
					/* @__PURE__ */ jsx(TableHead, {
						className: "px-6 py-4 font-semibold text-foreground",
						children: "Repuestos Vinculados"
					}),
					/* @__PURE__ */ jsx(TableHead, {
						className: "px-6 py-4 text-right font-semibold text-foreground",
						children: "Acciones"
					})
				]
			})
		}), /* @__PURE__ */ jsx(TableBody, { children: brands.map((brand) => {
			const productCount = getBrandProductCount(brand.id);
			return /* @__PURE__ */ jsxs(TableRow, {
				"data-testid": `brand-row-${brand.id}`,
				className: "border-border transition-colors hover:bg-muted/30",
				children: [
					/* @__PURE__ */ jsx(TableCell, {
						className: "px-6 py-4",
						children: /* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ jsx("div", {
								className: "flex size-8 shrink-0 items-center justify-center rounded-lg bg-industrial/10 text-industrial",
								children: /* @__PURE__ */ jsx(BadgeCheck, { className: "size-4" })
							}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
								className: "font-semibold text-foreground",
								"data-testid": `brand-name-${brand.id}`,
								children: brand.name
							}), /* @__PURE__ */ jsx("span", {
								className: "block text-[11px] font-mono text-muted-foreground",
								children: brand.id
							})] })]
						})
					}),
					/* @__PURE__ */ jsx(TableCell, {
						className: "px-6 py-4",
						children: /* @__PURE__ */ jsx("div", {
							className: "flex items-center gap-2",
							children: /* @__PURE__ */ jsxs(Badge, {
								variant: productCount > 0 ? "secondary" : "outline",
								className: "gap-1.5 font-medium",
								"data-testid": `brand-count-${brand.id}`,
								children: [/* @__PURE__ */ jsx(Package, { className: "size-3 text-muted-foreground" }), /* @__PURE__ */ jsxs("span", { children: [
									productCount,
									" ",
									productCount === 1 ? "repuesto" : "repuestos"
								] })]
							})
						})
					}),
					/* @__PURE__ */ jsx(TableCell, {
						className: "px-6 py-4 text-right",
						children: /* @__PURE__ */ jsxs("div", {
							className: "flex items-center justify-end gap-1.5",
							children: [/* @__PURE__ */ jsx(Button, {
								variant: "ghost",
								size: "sm",
								onClick: () => onEdit?.(brand),
								"aria-label": `Editar marca ${brand.name}`,
								title: `Editar ${brand.name}`,
								className: "size-8 p-0 text-muted-foreground hover:text-foreground",
								"data-testid": `brand-edit-btn-${brand.id}`,
								children: /* @__PURE__ */ jsx(Pencil, { className: "size-4" })
							}), /* @__PURE__ */ jsx(Button, {
								variant: "ghost",
								size: "sm",
								onClick: () => onDelete?.(brand),
								"aria-label": `Eliminar marca ${brand.name}`,
								title: `Eliminar ${brand.name}`,
								className: "size-8 p-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive",
								"data-testid": `brand-delete-btn-${brand.id}`,
								children: /* @__PURE__ */ jsx(Trash2, { className: "size-4" })
							})]
						})
					})
				]
			}, brand.id);
		}) })] })
	});
}
//#endregion
//#region src/components/admin/brands/BrandFormModal.tsx
/**
* Modal de Creación y Edición de Marcas.
* (RF-12, CA-12.1, CA-12.2, D-12, CL-12)
*
* Características:
* - Validación client-side con Zod en `onBlur` y `onSubmit` (mínimo 2 caracteres).
* - Control de duplicados case-insensitive con `trim()`.
* - Manejo asíncrono seguro con bloque `finally` para restablecer `isSubmitting`.
* - Soporte bimodal: Alta o Edición relacional por UUID.
*/
function BrandFormModal({ open, onOpenChange, brandToEdit, onSuccess }) {
	const { createBrand, updateBrand } = useAdmin();
	const isEditing = Boolean(brandToEdit);
	const [name, setName] = useState("");
	const [fieldError, setFieldError] = useState(void 0);
	const [formError, setFormError] = useState(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	useEffect(() => {
		if (open) {
			setName(brandToEdit ? brandToEdit.name : "");
			setFieldError(void 0);
			setFormError(null);
			setIsSubmitting(false);
		}
	}, [open, brandToEdit]);
	const validateField = (value) => {
		const result = brandFormSchema.safeParse({ name: value });
		if (!result.success) {
			const err = result.error.errors.find((e) => e.path.includes("name"));
			setFieldError(err?.message || "Nombre inválido");
			return false;
		}
		setFieldError(void 0);
		return true;
	};
	const handleBlur = (e) => {
		validateField(e.target.value);
	};
	const handleChange = (e) => {
		const val = e.target.value;
		setName(val);
		if (fieldError) validateField(val);
		if (formError) setFormError(null);
	};
	const handleSubmit = async (e) => {
		e.preventDefault();
		setFormError(null);
		if (!validateField(name)) return;
		setIsSubmitting(true);
		try {
			if (isEditing && brandToEdit) {
				const result = await updateBrand(brandToEdit.id, { name });
				if (result.success) {
					onOpenChange(false);
					onSuccess?.();
				} else setFormError(result.reason || "Error al actualizar la marca");
			} else {
				const result = await createBrand({ name });
				if (result.success) {
					onOpenChange(false);
					onSuccess?.();
				} else setFormError(result.reason || "Error al registrar la marca");
			}
		} catch {
			setFormError("Ocurrió un error inesperado al guardar la marca");
		} finally {
			setIsSubmitting(false);
		}
	};
	return /* @__PURE__ */ jsx(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ jsxs(DialogContent, {
			className: "sm:max-w-md",
			"data-testid": "brand-form-modal",
			"aria-describedby": "brand-form-description",
			children: [/* @__PURE__ */ jsxs(DialogHeader, { children: [
				/* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-2 text-industrial mb-1",
					children: [/* @__PURE__ */ jsx(BadgeCheck, { className: "size-5" }), /* @__PURE__ */ jsx("span", {
						className: "text-xs font-bold uppercase tracking-wider",
						children: isEditing ? "Modificación" : "Alta de Fabricante"
					})]
				}),
				/* @__PURE__ */ jsx(DialogTitle, {
					className: "text-xl font-bold font-display",
					children: isEditing ? "Editar Marca" : "Nueva Marca"
				}),
				/* @__PURE__ */ jsx(DialogDescription, {
					id: "brand-form-description",
					children: isEditing ? "Modifique el nombre de la marca. Los productos vinculados actualizarán su visualización relacional automáticamente." : "Ingrese el nombre del fabricante o marca para clasificar repuestos en el catálogo."
				})
			] }), /* @__PURE__ */ jsxs("form", {
				onSubmit: handleSubmit,
				noValidate: true,
				className: "space-y-4 pt-2",
				children: [
					formError && /* @__PURE__ */ jsxs("div", {
						role: "alert",
						"aria-live": "polite",
						"data-testid": "brand-form-alert-error",
						className: "flex items-center gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-3.5 text-sm text-destructive",
						children: [/* @__PURE__ */ jsx(AlertCircle, { className: "size-5 shrink-0" }), /* @__PURE__ */ jsx("span", { children: formError })]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "space-y-2",
						children: [
							/* @__PURE__ */ jsx(Label, {
								htmlFor: "brand-name",
								children: "Nombre de la Marca"
							}),
							/* @__PURE__ */ jsx(Input, {
								id: "brand-name",
								name: "name",
								type: "text",
								placeholder: "Ej. Bosch, Delphi, Denso...",
								value: name,
								onChange: handleChange,
								onBlur: handleBlur,
								disabled: isSubmitting,
								autoFocus: true,
								className: fieldError ? "border-destructive focus-visible:ring-destructive" : "",
								"aria-invalid": Boolean(fieldError),
								"aria-describedby": fieldError ? "brand-name-error" : void 0,
								"data-testid": "brand-name-input"
							}),
							fieldError && /* @__PURE__ */ jsx("p", {
								id: "brand-name-error",
								role: "alert",
								"data-testid": "brand-name-field-error",
								className: "text-xs text-destructive font-medium",
								children: fieldError
							})
						]
					}),
					/* @__PURE__ */ jsxs(DialogFooter, {
						className: "gap-2 sm:gap-0 pt-4",
						children: [/* @__PURE__ */ jsx(Button, {
							type: "button",
							variant: "outline",
							onClick: () => onOpenChange(false),
							disabled: isSubmitting,
							"data-testid": "brand-form-cancel-btn",
							children: "Cancelar"
						}), /* @__PURE__ */ jsx(Button, {
							type: "submit",
							variant: "industrial",
							disabled: isSubmitting,
							"data-testid": "brand-form-submit-btn",
							className: "min-w-28",
							children: isSubmitting ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Loader2, { className: "mr-2 size-4 animate-spin" }), "Guardando..."] }) : isEditing ? "Guardar Cambios" : "Crear Marca"
						})]
					})
				]
			})]
		})
	});
}
//#endregion
//#region src/components/admin/brands/BrandDeleteModal.tsx
/**
* Modal de Eliminación de Marcas con Bloqueo Referencial Estricto.
* (RF-12, CA-12.3, CA-12.5, CL-06, CL-12)
*
* Comportamiento:
* - Si la marca posee 1 o más repuestos vinculados (brandId), bloquea de manera
*   impeditiva la eliminación, listando los productos afectados (CA-12.3, CL-06).
* - Si la marca está libre de productos, presenta confirmación explícita con botón
*   rojo destructivo (CA-12.5).
*/
function BrandDeleteModal({ open, onOpenChange, brand, onSuccess }) {
	const { canDeleteBrand, deleteBrand } = useAdmin();
	const [isDeleting, setIsDeleting] = useState(false);
	const [error, setError] = useState(null);
	if (!brand) return null;
	const integrity = canDeleteBrand(brand.id);
	const isBlocked = !integrity.allowed;
	const handleConfirmDelete = async () => {
		setError(null);
		setIsDeleting(true);
		try {
			const res = await deleteBrand(brand.id);
			if (res.success) {
				onOpenChange(false);
				onSuccess?.();
			} else setError(res.reason || "No se pudo eliminar la marca.");
		} catch {
			setError("Ocurrió un error inesperado al procesar la eliminación.");
		} finally {
			setIsDeleting(false);
		}
	};
	return /* @__PURE__ */ jsx(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ jsxs(DialogContent, {
			className: "sm:max-w-md",
			"data-testid": "brand-delete-modal",
			"aria-describedby": "brand-delete-description",
			children: [
				/* @__PURE__ */ jsxs(DialogHeader, { children: [/* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-2 mb-1",
					children: [isBlocked ? /* @__PURE__ */ jsx("div", {
						className: "flex size-9 items-center justify-center rounded-full bg-destructive/10 text-destructive",
						children: /* @__PURE__ */ jsx(ShieldAlert, { className: "size-5" })
					}) : /* @__PURE__ */ jsx("div", {
						className: "flex size-9 items-center justify-center rounded-full bg-destructive/10 text-destructive",
						children: /* @__PURE__ */ jsx(AlertTriangle, { className: "size-5" })
					}), /* @__PURE__ */ jsx(DialogTitle, {
						className: "text-lg font-bold font-display",
						"data-testid": "brand-delete-modal-title",
						children: isBlocked ? "No se puede eliminar la marca" : "¿Eliminar marca permanentemente?"
					})]
				}), /* @__PURE__ */ jsx(DialogDescription, {
					id: "brand-delete-description",
					children: isBlocked ? "Existen productos del catálogo asociados a este fabricante. Para proteger la integridad referencial, debe reasignar o eliminar los productos antes de poder borrar la marca." : `Esta acción eliminará definitivamente la marca "${brand.name}". Los datos no podrán recuperarse.`
				})] }),
				error && /* @__PURE__ */ jsx("div", {
					role: "alert",
					"data-testid": "brand-delete-error",
					className: "rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-xs text-destructive",
					children: error
				}),
				isBlocked && /* @__PURE__ */ jsxs("div", {
					"data-testid": "brand-deletion-blocked-alert",
					className: "space-y-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "flex items-start gap-2 text-destructive font-semibold text-xs uppercase tracking-wider",
							children: [/* @__PURE__ */ jsx(ShieldAlert, { className: "size-4 shrink-0 mt-0.5" }), /* @__PURE__ */ jsx("span", { children: "Bloqueo Impeditivo de Integridad" })]
						}),
						/* @__PURE__ */ jsx("p", {
							className: "text-xs text-muted-foreground",
							children: integrity.reason
						}),
						integrity.affectedProducts && integrity.affectedProducts.length > 0 && /* @__PURE__ */ jsxs("div", {
							className: "mt-2 space-y-1.5 border-t border-destructive/20 pt-2",
							children: [/* @__PURE__ */ jsxs("span", {
								className: "text-[11px] font-semibold text-foreground uppercase tracking-wider",
								children: [
									"Productos afectados (",
									integrity.affectedProducts.length,
									"):"
								]
							}), /* @__PURE__ */ jsx("ul", {
								"data-testid": "brand-affected-products-list",
								className: "max-h-32 overflow-y-auto space-y-1 text-xs text-muted-foreground pl-1",
								children: integrity.affectedProducts.map((prodName) => /* @__PURE__ */ jsxs("li", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ jsx(Package, { className: "size-3 text-muted-foreground shrink-0" }), /* @__PURE__ */ jsx("span", {
										className: "truncate",
										children: prodName
									})]
								}, prodName))
							})]
						})
					]
				}),
				/* @__PURE__ */ jsx(DialogFooter, {
					className: "gap-2 sm:gap-0 pt-4",
					children: isBlocked ? /* @__PURE__ */ jsx(Button, {
						type: "button",
						variant: "outline",
						onClick: () => onOpenChange(false),
						"data-testid": "brand-delete-close-btn",
						className: "w-full sm:w-auto",
						children: "Entendido"
					}) : /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Button, {
						type: "button",
						variant: "outline",
						disabled: isDeleting,
						onClick: () => onOpenChange(false),
						"data-testid": "brand-delete-cancel-btn",
						children: "Cancelar"
					}), /* @__PURE__ */ jsx(Button, {
						type: "button",
						variant: "destructive",
						disabled: isDeleting,
						onClick: handleConfirmDelete,
						"data-testid": "brand-delete-confirm-btn",
						className: "gap-2",
						children: isDeleting ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Loader2, { className: "size-4 animate-spin" }), /* @__PURE__ */ jsx("span", { children: "Eliminando..." })] }) : /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Trash2, { className: "size-4" }), /* @__PURE__ */ jsx("span", { children: "Eliminar Marca" })] })
					})] })
				})
			]
		})
	});
}
//#endregion
//#region src/routes/admin.marcas.tsx?tsr-split=component
function AdminMarcasPage() {
	const [formOpen, setFormOpen] = useState(false);
	const [brandToEdit, setBrandToEdit] = useState(null);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [brandToDelete, setBrandToDelete] = useState(null);
	const handleCreate = () => {
		setBrandToEdit(null);
		setFormOpen(true);
	};
	const handleEdit = (brand) => {
		setBrandToEdit(brand);
		setFormOpen(true);
	};
	const handleDelete = (brand) => {
		setBrandToDelete(brand);
		setDeleteOpen(true);
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ jsxs("header", {
				className: "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
				children: [/* @__PURE__ */ jsxs("div", { children: [
					/* @__PURE__ */ jsx("p", {
						className: "eyebrow mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground",
						children: "Administración / Catálogo"
					}),
					/* @__PURE__ */ jsx("h1", {
						className: "font-display text-3xl font-bold tracking-tight text-foreground",
						children: "Marcas y Fabricantes"
					}),
					/* @__PURE__ */ jsx("p", {
						className: "mt-1 text-sm text-muted-foreground",
						children: "Gestión normalizada de marcas comerciales por identificadores UUIDv4."
					})
				] }), /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs(Button, {
					onClick: handleCreate,
					variant: "industrial",
					className: "gap-2 shadow-sm font-semibold",
					"data-testid": "admin-new-brand-btn",
					children: [/* @__PURE__ */ jsx(Plus, { className: "size-4" }), /* @__PURE__ */ jsx("span", { children: "Nueva Marca" })]
				}) })]
			}),
			/* @__PURE__ */ jsx(BrandList, {
				onEdit: handleEdit,
				onDelete: handleDelete
			}),
			/* @__PURE__ */ jsx(BrandFormModal, {
				open: formOpen,
				onOpenChange: setFormOpen,
				brandToEdit
			}),
			/* @__PURE__ */ jsx(BrandDeleteModal, {
				open: deleteOpen,
				onOpenChange: setDeleteOpen,
				brand: brandToDelete
			})
		]
	});
}
//#endregion
export { AdminMarcasPage as component };
