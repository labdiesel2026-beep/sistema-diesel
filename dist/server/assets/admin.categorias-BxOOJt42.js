import { i as Button } from "./api-Db5K75is.js";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./dialog-BJoneSxt.js";
import { n as useAdmin } from "./admin-context-Cs20CvQF.js";
import { t as Badge } from "./badge-BVGYlUau.js";
import { r as categoryFormSchema } from "./admin-schemas-ItK5u1ge.js";
import { n as Input, t as Label } from "./label-BaOiJ9Kw.js";
import { useEffect, useState } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { AlertCircle, AlertTriangle, CornerDownRight, Folder, FolderPlus, Info, Layers, Loader2, Package, Pencil, Plus, ShieldAlert, Tags, Trash2 } from "lucide-react";
//#region src/components/admin/categories/CategoryList.tsx
/**
* Lista jerárquica de categorías y subcategorías (1 nivel de anidamiento)
* con indentación visual y conteo relacional de productos.
* (RF-10, CA-10.1, CA-10.2)
*/
function CategoryList({ onEdit, onDelete }) {
	const { categories, getRootCategories, getChildCategories, getCategoryProductCount } = useAdmin();
	const rootCategories = getRootCategories();
	if (categories.length === 0) return /* @__PURE__ */ jsxs("div", {
		"data-testid": "category-list-empty",
		className: "flex min-h-60 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card p-8 text-center",
		children: [
			/* @__PURE__ */ jsx("div", {
				className: "flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground",
				children: /* @__PURE__ */ jsx(Tags, { className: "size-6" })
			}),
			/* @__PURE__ */ jsx("h3", {
				className: "mt-4 font-display text-lg font-semibold text-foreground",
				children: "No hay categorías registradas"
			}),
			/* @__PURE__ */ jsx("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: "Comience creando una categoría principal de nivel raíz."
			})
		]
	});
	return /* @__PURE__ */ jsxs("div", {
		"data-testid": "category-list-container",
		className: "overflow-hidden rounded-xl border border-border bg-card shadow-sm",
		children: [/* @__PURE__ */ jsx("div", {
			className: "border-b border-border bg-muted/40 px-6 py-4",
			children: /* @__PURE__ */ jsxs("div", {
				className: "grid grid-cols-12 text-xs font-semibold text-foreground uppercase tracking-wider",
				children: [
					/* @__PURE__ */ jsx("div", {
						className: "col-span-12 sm:col-span-6",
						children: "Jerarquía / Nombre de Categoría"
					}),
					/* @__PURE__ */ jsx("div", {
						className: "hidden sm:block sm:col-span-3 text-center sm:text-left",
						children: "Repuestos Asociados"
					}),
					/* @__PURE__ */ jsx("div", {
						className: "hidden sm:block sm:col-span-3 text-right",
						children: "Acciones"
					})
				]
			})
		}), /* @__PURE__ */ jsx("div", {
			className: "divide-y divide-border",
			children: rootCategories.map((root) => {
				const children = getChildCategories(root.id);
				const rootProductCount = getCategoryProductCount(root.id);
				return /* @__PURE__ */ jsxs("div", {
					"data-testid": `category-tree-root-${root.id}`,
					className: "transition-colors",
					children: [/* @__PURE__ */ jsxs("div", {
						"data-testid": `category-row-${root.id}`,
						className: "grid grid-cols-12 items-center gap-4 px-6 py-4 hover:bg-muted/20",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "col-span-12 sm:col-span-6 flex items-center gap-3",
								children: [/* @__PURE__ */ jsx("div", {
									className: "flex size-8 shrink-0 items-center justify-center rounded-lg bg-industrial/10 text-industrial",
									children: /* @__PURE__ */ jsx(Folder, { className: "size-4" })
								}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
									className: "flex items-center gap-2",
									children: [
										/* @__PURE__ */ jsx("span", {
											className: "font-semibold text-foreground text-sm",
											"data-testid": `category-name-${root.id}`,
											children: root.name
										}),
										/* @__PURE__ */ jsx(Badge, {
											variant: "outline",
											className: "text-[10px] font-semibold uppercase",
											children: "Raíz"
										}),
										children.length > 0 && /* @__PURE__ */ jsxs("span", {
											className: "text-xs text-muted-foreground font-mono",
											children: [
												"(",
												children.length,
												" ",
												children.length === 1 ? "subcategoría" : "subcategorías",
												")"
											]
										})
									]
								}), /* @__PURE__ */ jsx("span", {
									className: "block text-[11px] font-mono text-muted-foreground",
									children: root.id
								})] })]
							}),
							/* @__PURE__ */ jsx("div", {
								className: "col-span-6 sm:col-span-3",
								children: /* @__PURE__ */ jsxs(Badge, {
									variant: rootProductCount > 0 ? "secondary" : "outline",
									className: "gap-1.5 font-medium",
									"data-testid": `category-count-${root.id}`,
									children: [/* @__PURE__ */ jsx(Package, { className: "size-3 text-muted-foreground" }), /* @__PURE__ */ jsxs("span", { children: [
										rootProductCount,
										" ",
										rootProductCount === 1 ? "repuesto" : "repuestos"
									] })]
								})
							}),
							/* @__PURE__ */ jsx("div", {
								className: "col-span-6 sm:col-span-3 text-right",
								children: /* @__PURE__ */ jsxs("div", {
									className: "flex items-center justify-end gap-1.5",
									children: [/* @__PURE__ */ jsx(Button, {
										variant: "ghost",
										size: "sm",
										onClick: () => onEdit?.(root),
										"aria-label": `Editar categoría ${root.name}`,
										title: `Editar ${root.name}`,
										className: "size-8 p-0 text-muted-foreground hover:text-foreground",
										"data-testid": `category-edit-btn-${root.id}`,
										children: /* @__PURE__ */ jsx(Pencil, { className: "size-4" })
									}), /* @__PURE__ */ jsx(Button, {
										variant: "ghost",
										size: "sm",
										onClick: () => onDelete?.(root),
										"aria-label": `Eliminar categoría ${root.name}`,
										title: `Eliminar ${root.name}`,
										className: "size-8 p-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive",
										"data-testid": `category-delete-btn-${root.id}`,
										children: /* @__PURE__ */ jsx(Trash2, { className: "size-4" })
									})]
								})
							})
						]
					}), children.length > 0 && /* @__PURE__ */ jsx("div", {
						className: "divide-y divide-border/50 bg-muted/10",
						children: children.map((child) => {
							const childProductCount = getCategoryProductCount(child.id);
							return /* @__PURE__ */ jsxs("div", {
								"data-testid": `category-row-${child.id}`,
								className: "grid grid-cols-12 items-center gap-4 py-3 pr-6 pl-12 hover:bg-muted/20",
								children: [
									/* @__PURE__ */ jsxs("div", {
										className: "col-span-12 sm:col-span-6 flex items-center gap-3",
										children: [
											/* @__PURE__ */ jsx(CornerDownRight, { className: "size-4 text-muted-foreground shrink-0" }),
											/* @__PURE__ */ jsx("div", {
												className: "flex size-7 shrink-0 items-center justify-center rounded-md bg-secondary text-secondary-foreground",
												children: /* @__PURE__ */ jsx(Layers, { className: "size-3.5 text-muted-foreground" })
											}),
											/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
												className: "flex items-center gap-2",
												children: [/* @__PURE__ */ jsx("span", {
													className: "font-medium text-foreground text-sm",
													"data-testid": `category-name-${child.id}`,
													children: child.name
												}), /* @__PURE__ */ jsx(Badge, {
													variant: "secondary",
													className: "text-[10px] text-muted-foreground font-normal",
													children: "Subcategoría"
												})]
											}), /* @__PURE__ */ jsx("span", {
												className: "block text-[11px] font-mono text-muted-foreground",
												children: child.id
											})] })
										]
									}),
									/* @__PURE__ */ jsx("div", {
										className: "col-span-6 sm:col-span-3",
										children: /* @__PURE__ */ jsxs(Badge, {
											variant: childProductCount > 0 ? "secondary" : "outline",
											className: "gap-1.5 font-medium",
											"data-testid": `category-count-${child.id}`,
											children: [/* @__PURE__ */ jsx(Package, { className: "size-3 text-muted-foreground" }), /* @__PURE__ */ jsxs("span", { children: [
												childProductCount,
												" ",
												childProductCount === 1 ? "repuesto" : "repuestos"
											] })]
										})
									}),
									/* @__PURE__ */ jsx("div", {
										className: "col-span-6 sm:col-span-3 text-right",
										children: /* @__PURE__ */ jsxs("div", {
											className: "flex items-center justify-end gap-1.5",
											children: [/* @__PURE__ */ jsx(Button, {
												variant: "ghost",
												size: "sm",
												onClick: () => onEdit?.(child),
												"aria-label": `Editar subcategoría ${child.name}`,
												title: `Editar ${child.name}`,
												className: "size-8 p-0 text-muted-foreground hover:text-foreground",
												"data-testid": `category-edit-btn-${child.id}`,
												children: /* @__PURE__ */ jsx(Pencil, { className: "size-4" })
											}), /* @__PURE__ */ jsx(Button, {
												variant: "ghost",
												size: "sm",
												onClick: () => onDelete?.(child),
												"aria-label": `Eliminar subcategoría ${child.name}`,
												title: `Eliminar ${child.name}`,
												className: "size-8 p-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive",
												"data-testid": `category-delete-btn-${child.id}`,
												children: /* @__PURE__ */ jsx(Trash2, { className: "size-4" })
											})]
										})
									})
								]
							}, child.id);
						})
					})]
				}, root.id);
			})
		})]
	});
}
//#endregion
//#region src/components/admin/categories/CategoryFormModal.tsx
/**
* Modal de Creación y Edición de Categorías con Límite de 1 Nivel y Prevención de Ciclos.
* (RF-10, CA-10.1 a CA-10.5, CL-04, CL-05, D-12, CL-12)
*
* Reglas de negocio:
* 1. Límite de 1 nivel: el selector de padre únicamente lista categorías raíz (CA-10.3, CL-04).
* 2. Prevención de ciclos e inversión jerárquica: Si la categoría que se edita posee
*    subcategorías asociadas, el selector de padre se inhabilita por completo (CA-10.4, CL-05).
* 3. Validación Zod con `categoryFormSchema` y unicidad case-insensitive con `trim()`.
* 4. Submit blindado con bloque `finally` para garantizar `isSubmitting: false` (CL-12).
*/
function CategoryFormModal({ open, onOpenChange, categoryToEdit, onSuccess }) {
	const { createCategory, updateCategory, getRootCategories, hasChildren } = useAdmin();
	const isEditing = Boolean(categoryToEdit);
	const categoryHasChildren = Boolean(categoryToEdit && hasChildren(categoryToEdit.id));
	const availableParents = getRootCategories().filter((root) => !categoryToEdit || root.id !== categoryToEdit.id);
	const [name, setName] = useState("");
	const [parentId, setParentId] = useState("");
	const [fieldError, setFieldError] = useState(void 0);
	const [formError, setFormError] = useState(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	useEffect(() => {
		if (open) {
			setName(categoryToEdit ? categoryToEdit.name : "");
			setParentId(categoryToEdit?.parentId ? categoryToEdit.parentId : "");
			setFieldError(void 0);
			setFormError(null);
			setIsSubmitting(false);
		}
	}, [open, categoryToEdit]);
	const validateField = (value) => {
		const parentIdVal = parentId.trim() ? parentId.trim() : null;
		const result = categoryFormSchema.safeParse({
			name: value,
			parentId: parentIdVal
		});
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
	const handleNameChange = (e) => {
		const val = e.target.value;
		setName(val);
		if (fieldError) validateField(val);
		if (formError) setFormError(null);
	};
	const handleParentChange = (e) => {
		setParentId(e.target.value);
		if (formError) setFormError(null);
	};
	const handleSubmit = async (e) => {
		e.preventDefault();
		setFormError(null);
		if (!validateField(name)) return;
		setIsSubmitting(true);
		try {
			const finalParentId = categoryHasChildren ? null : parentId.trim() ? parentId.trim() : null;
			if (isEditing && categoryToEdit) {
				const result = await updateCategory(categoryToEdit.id, {
					name,
					parentId: finalParentId
				});
				if (result.success) {
					onOpenChange(false);
					onSuccess?.();
				} else setFormError(result.reason || "Error al actualizar la categoría.");
			} else {
				const result = await createCategory({
					name,
					parentId: finalParentId
				});
				if (result.success) {
					onOpenChange(false);
					onSuccess?.();
				} else setFormError(result.reason || "Error al registrar la categoría.");
			}
		} catch {
			setFormError("Ocurrió un error inesperado al guardar la categoría.");
		} finally {
			setIsSubmitting(false);
		}
	};
	return /* @__PURE__ */ jsx(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ jsxs(DialogContent, {
			className: "sm:max-w-md",
			"data-testid": "category-form-modal",
			"aria-describedby": "category-form-description",
			children: [/* @__PURE__ */ jsxs(DialogHeader, { children: [
				/* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-2 text-industrial mb-1",
					children: [/* @__PURE__ */ jsx(FolderPlus, { className: "size-5" }), /* @__PURE__ */ jsx("span", {
						className: "text-xs font-bold uppercase tracking-wider",
						children: isEditing ? "Modificación de Taxonomía" : "Alta de Categoría"
					})]
				}),
				/* @__PURE__ */ jsx(DialogTitle, {
					className: "text-xl font-bold font-display",
					children: isEditing ? "Editar Categoría" : "Nueva Categoría"
				}),
				/* @__PURE__ */ jsx(DialogDescription, {
					id: "category-form-description",
					children: isEditing ? "Modifique los datos de la categoría. La jerarquía admite como máximo 1 nivel sin ciclos." : "Defina una categoría principal (raíz) o asigne una categoría padre para crear una subcategoría."
				})
			] }), /* @__PURE__ */ jsxs("form", {
				onSubmit: handleSubmit,
				noValidate: true,
				className: "space-y-4 pt-2",
				children: [
					formError && /* @__PURE__ */ jsxs("div", {
						role: "alert",
						"aria-live": "polite",
						"data-testid": "category-form-alert-error",
						className: "flex items-center gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-3.5 text-sm text-destructive",
						children: [/* @__PURE__ */ jsx(AlertCircle, { className: "size-5 shrink-0" }), /* @__PURE__ */ jsx("span", { children: formError })]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "space-y-2",
						children: [
							/* @__PURE__ */ jsx(Label, {
								htmlFor: "category-name",
								children: "Nombre de la Categoría"
							}),
							/* @__PURE__ */ jsx(Input, {
								id: "category-name",
								name: "name",
								type: "text",
								placeholder: "Ej. Inyección Common Rail, Bombas...",
								value: name,
								onChange: handleNameChange,
								onBlur: handleBlur,
								disabled: isSubmitting,
								autoFocus: true,
								className: fieldError ? "border-destructive focus-visible:ring-destructive" : "",
								"aria-invalid": Boolean(fieldError),
								"aria-describedby": fieldError ? "category-name-error" : void 0,
								"data-testid": "category-name-input"
							}),
							fieldError && /* @__PURE__ */ jsx("p", {
								id: "category-name-error",
								role: "alert",
								"data-testid": "category-name-field-error",
								className: "text-xs text-destructive font-medium",
								children: fieldError
							})
						]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "space-y-2",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ jsx(Label, {
									htmlFor: "category-parent",
									children: "Categoría Padre"
								}), categoryHasChildren && /* @__PURE__ */ jsxs("span", {
									className: "text-[11px] font-semibold text-amber-500 flex items-center gap-1",
									children: [/* @__PURE__ */ jsx(Info, { className: "size-3" }), "Selector bloqueado"]
								})]
							}),
							/* @__PURE__ */ jsxs("select", {
								id: "category-parent",
								name: "parentId",
								value: parentId,
								onChange: handleParentChange,
								disabled: isSubmitting || categoryHasChildren,
								"data-testid": "category-parent-select",
								"aria-describedby": categoryHasChildren ? "category-parent-disabled-hint" : void 0,
								className: "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-foreground",
								children: [/* @__PURE__ */ jsx("option", {
									value: "",
									children: "Ninguna (Categoría Principal / Nivel Raíz)"
								}), availableParents.map((parent) => /* @__PURE__ */ jsx("option", {
									value: parent.id,
									children: parent.name
								}, parent.id))]
							}),
							categoryHasChildren ? /* @__PURE__ */ jsx("p", {
								id: "category-parent-disabled-hint",
								"data-testid": "category-parent-disabled-hint",
								className: "text-xs text-muted-foreground bg-muted/30 p-2 rounded border border-border",
								children: "Esta categoría posee subcategorías vinculadas y no puede transformarse en subcategoría hija (regla CL-05)."
							}) : /* @__PURE__ */ jsx("p", {
								className: "text-[11px] text-muted-foreground",
								children: "Seleccione una categoría raíz para crear una subcategoría de 1 nivel (CA-10.3)."
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
							"data-testid": "category-form-cancel-btn",
							children: "Cancelar"
						}), /* @__PURE__ */ jsx(Button, {
							type: "submit",
							variant: "industrial",
							disabled: isSubmitting,
							"data-testid": "category-form-submit-btn",
							className: "min-w-28",
							children: isSubmitting ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Loader2, { className: "mr-2 size-4 animate-spin" }), "Guardando..."] }) : isEditing ? "Guardar Cambios" : "Crear Categoría"
						})]
					})
				]
			})]
		})
	});
}
//#endregion
//#region src/components/admin/categories/CategoryDeleteModal.tsx
/**
* Modal de Eliminación de Categorías con Bloqueo Referencial Estricto.
* (RF-11, CA-11.1, CA-11.2, CA-11.3, CL-06, CL-12)
*
* Comportamiento:
* - Si la categoría posee repuestos vinculados o subcategorías hijas,
*   bloquea de forma impeditiva el borrado listando los elementos afectados (CA-11.1, CA-11.2, CL-06).
* - Si está libre de dependencias, presenta confirmación con botón rojo destructivo (CA-11.3).
*/
function CategoryDeleteModal({ open, onOpenChange, category, onSuccess }) {
	const { canDeleteCategory, deleteCategory } = useAdmin();
	const [isDeleting, setIsDeleting] = useState(false);
	const [error, setError] = useState(null);
	if (!category) return null;
	const integrity = canDeleteCategory(category.id);
	const isBlocked = !integrity.allowed;
	const handleConfirmDelete = async () => {
		setError(null);
		setIsDeleting(true);
		try {
			const res = await deleteCategory(category.id);
			if (res.success) {
				onOpenChange(false);
				onSuccess?.();
			} else setError(res.reason || "No se pudo eliminar la categoría.");
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
			"data-testid": "category-delete-modal",
			"aria-describedby": "category-delete-description",
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
						"data-testid": "category-delete-modal-title",
						children: isBlocked ? "No se puede eliminar la categoría" : "¿Eliminar categoría permanentemente?"
					})]
				}), /* @__PURE__ */ jsx(DialogDescription, {
					id: "category-delete-description",
					children: isBlocked ? "Para proteger la integridad del catálogo, se impide la eliminación de categorías con dependencias activas." : `Esta acción eliminará definitivamente la categoría "${category.name}". Los datos no podrán recuperarse.`
				})] }),
				error && /* @__PURE__ */ jsx("div", {
					role: "alert",
					"data-testid": "category-delete-error",
					className: "rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-xs text-destructive",
					children: error
				}),
				isBlocked && /* @__PURE__ */ jsxs("div", {
					"data-testid": "category-deletion-blocked-alert",
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
								"data-testid": "category-affected-products-list",
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
						"data-testid": "category-delete-close-btn",
						className: "w-full sm:w-auto",
						children: "Entendido"
					}) : /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Button, {
						type: "button",
						variant: "outline",
						disabled: isDeleting,
						onClick: () => onOpenChange(false),
						"data-testid": "category-delete-cancel-btn",
						children: "Cancelar"
					}), /* @__PURE__ */ jsx(Button, {
						type: "button",
						variant: "destructive",
						disabled: isDeleting,
						onClick: handleConfirmDelete,
						"data-testid": "category-delete-confirm-btn",
						className: "gap-2",
						children: isDeleting ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Loader2, { className: "size-4 animate-spin" }), /* @__PURE__ */ jsx("span", { children: "Eliminando..." })] }) : /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Trash2, { className: "size-4" }), /* @__PURE__ */ jsx("span", { children: "Eliminar Categoría" })] })
					})] })
				})
			]
		})
	});
}
//#endregion
//#region src/routes/admin.categorias.tsx?tsr-split=component
function AdminCategoriasPage() {
	const [formOpen, setFormOpen] = useState(false);
	const [categoryToEdit, setCategoryToEdit] = useState(null);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [categoryToDelete, setCategoryToDelete] = useState(null);
	const handleCreate = () => {
		setCategoryToEdit(null);
		setFormOpen(true);
	};
	const handleEdit = (category) => {
		setCategoryToEdit(category);
		setFormOpen(true);
	};
	const handleDelete = (category) => {
		setCategoryToDelete(category);
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
						children: "Categorías y Subcategorías"
					}),
					/* @__PURE__ */ jsx("p", {
						className: "mt-1 text-sm text-muted-foreground",
						children: "Organización jerárquica de repuestos (máximo 1 nivel) vinculada al inventario técnico."
					})
				] }), /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs(Button, {
					onClick: handleCreate,
					variant: "industrial",
					className: "gap-2 shadow-sm font-semibold",
					"data-testid": "admin-new-category-btn",
					children: [/* @__PURE__ */ jsx(Plus, { className: "size-4" }), /* @__PURE__ */ jsx("span", { children: "Nueva Categoría" })]
				}) })]
			}),
			/* @__PURE__ */ jsx(CategoryList, {
				onEdit: handleEdit,
				onDelete: handleDelete
			}),
			/* @__PURE__ */ jsx(CategoryFormModal, {
				open: formOpen,
				onOpenChange: setFormOpen,
				categoryToEdit
			}),
			/* @__PURE__ */ jsx(CategoryDeleteModal, {
				open: deleteOpen,
				onOpenChange: setDeleteOpen,
				category: categoryToDelete
			})
		]
	});
}
//#endregion
export { AdminCategoriasPage as component };
