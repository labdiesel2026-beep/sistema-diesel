import { Link, Outlet, createFileRoute, useRouterState } from '@tanstack/react-router';
import { useState } from 'react';
import { LayoutDashboard, Package, Tags, PanelLeftClose, PanelLeftOpen, LogOut, SlidersHorizontal, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AdminProvider } from '@/components/admin-data';

export const Route = createFileRoute('/admin')({ component: AdminLayout });

function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = useRouterState({ select: state => state.location.pathname });
  const links = [{ to: '/admin/dashboard', title: 'Dashboard', icon: LayoutDashboard }, { to: '/admin', title: 'Productos', icon: Package }, { to: '/admin/categorias', title: 'Categorías', icon: Tags }] as const;
  return <AdminProvider><div className="flex min-h-dvh w-full bg-background">
    <aside className={`sticky top-0 flex h-dvh shrink-0 flex-col border-r border-hero-border bg-hero text-hero-foreground ${collapsed ? 'w-16' : 'w-16 md:w-60'}`} aria-label="Administración">
      <Link to="/" title="Laboratorio Diésel, inicio" className="flex h-20 items-center gap-3 border-b border-hero-border px-4"><SlidersHorizontal className="size-6 shrink-0 text-primary" />{!collapsed && <span className="hidden font-display text-xl font-bold leading-tight md:block">Laboratorio<br />Diésel<span className="text-primary">.</span></span>}</Link>
      {!collapsed && <p className="hidden px-6 pb-2 pt-7 text-[10px] font-bold uppercase text-hero-muted md:block">Backoffice</p>}
      <nav className="space-y-2 px-2 py-5" aria-label="Panel de administrador">{links.map(item => <Button key={item.title} variant="technical" asChild className={`h-12 w-full justify-start border-transparent px-3 ${pathname === item.to ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-transparent text-hero-muted'}`}><Link to={item.to} activeOptions={{ exact: true }} activeProps={{ 'aria-current': 'page' }} title={item.title}><item.icon />{!collapsed && <span className="hidden md:inline">{item.title}</span>}</Link></Button>)}</nav>
      <div className="mt-auto border-t border-hero-border px-2 py-5"><Button variant="technical" asChild className="h-11 w-full justify-start border-transparent bg-transparent px-3"><Link to="/catalogo" title="Ver catálogo"><ArrowUpRight />{!collapsed && <span className="hidden md:inline">Ver tienda</span>}</Link></Button></div>
    </aside>
    <div className="flex min-w-0 flex-1 flex-col"><header className="flex min-h-20 flex-wrap items-center justify-between gap-3 border-b border-border bg-card px-4 py-3 md:px-8"><div className="flex items-center gap-3"><Button size="icon" variant="ghost" title={collapsed ? 'Expandir sidebar' : 'Contraer sidebar'} aria-label={collapsed ? 'Expandir sidebar' : 'Contraer sidebar'} onClick={() => setCollapsed(!collapsed)}>{collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}</Button><span className="hidden text-sm font-semibold sm:inline">Panel de administrador</span><span className="rounded-md border border-border bg-secondary px-2 py-1 text-[10px] font-bold text-muted-foreground">DEMO</span></div><Button variant="outline" asChild><Link to="/"><LogOut />Cerrar Sesión</Link></Button></header>
      <main className="min-w-0 flex-1 p-4 py-7 md:p-8 lg:p-10"><Outlet /></main>
    </div>
  </div></AdminProvider>;
}