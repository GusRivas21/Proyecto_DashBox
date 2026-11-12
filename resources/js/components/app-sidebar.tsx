import { NavUser } from '@/components/nav-user';

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';

import type { LucideIcon } from 'lucide-react';
import { Link, usePage } from '@inertiajs/react';

import {
    LayoutDashboard,
    Building2,
    UserCog,
    FileClock,
    AlertTriangle,
    ClipboardCheck,
    Truck,
    UserCheck,
    PackageSearch,
    Undo2,
    Users,
    Package,
    ContactRound,
    PackageCheck,
} from 'lucide-react';

type SidebarNavItem = {
    title: string;
    url: string;
    icon: LucideIcon;
    permission: string;
};

type PageProps = {
    auth: {
        user: {
            permissions: string[];
        } | null;
    };
};

const mainNavItems: SidebarNavItem[] = [
    {
        title: 'Dashboard',
        url: '/dashboard',
        icon: LayoutDashboard,
        permission: 'dashboard.view',
    },
    {
        title: 'Empresas',
        url: '/companies',
        icon: Building2,
        permission: 'companies.view',
    },
    {
        title: 'Gerentes',
        url: '/managers',
        icon: UserCog,
        permission: 'managers.view',
    },
    {
        title: 'Reportes e historial',
        url: '/reports',
        icon: FileClock,
        permission: 'reports.view',
    },
    {
        title: 'Edición de emergencia',
        url: '/emergency',
        icon: AlertTriangle,
        permission: 'emergency.view',
    },
    {
        title: 'Auditoría',
        url: '/audit',
        icon: ClipboardCheck,
        permission: 'audit.view',
    },
    {
        title: 'Vehículos',
        url: '/vehicles',
        icon: Truck,
        permission: 'vehicles.view',
    },
    {
        title: 'Transportistas',
        url: '/transporters',
        icon: UserCheck,
        permission: 'transporters.view',
    },
    {
        title: 'Envíos pendientes',
        url: '/unassignedShipments',
        icon: PackageSearch,
        permission: 'unassignedShipments.view',
    },
    {
        title: 'Devoluciones',
        url: '/returns',
        icon: Undo2,
        permission: 'shipments.return',
    },
    {
        title: 'Destinatarios',
        url: '/recipients',
        icon: ContactRound,
        permission: 'recipients.view',
    },
    {
        title: 'Envíos',
        url: '/shipments',
        icon: Package,
        permission: 'shipments.view',
    },
    {
        title: 'Entregas',
        url: '/deliveries',
        icon: PackageCheck,
        permission: 'deliveries.view',
    },
];

const navButtonClass = `
    h-11 gap-3 px-3
    text-sidebar-foreground/70
    hover:bg-sidebar-accent hover:text-sidebar-foreground
    data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-foreground
`;

const adminButtonClass = `
    h-14 gap-3 px-3
    bg-sidebar-accent text-sidebar-foreground
    hover:bg-sidebar-accent hover:text-sidebar-foreground
`;

export function AppSidebar() {
    const { url, props } = usePage<PageProps>();

    const permissions = props.auth.user?.permissions ?? [];

    const filteredNavItems = mainNavItems.filter((item) =>
        permissions.includes(item.permission)
    );

    return (
        <Sidebar collapsible="icon" variant="sidebar" className="border-none">
            {/* LOGO */}
            <SidebarHeader className="px-5 pb-2 pt-7 group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:pt-5">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            asChild
                            className="h-auto gap-3 text-sidebar-foreground hover:bg-transparent hover:text-sidebar-foreground"
                        >
                            <Link href="/dashboard">
                                <Package className="!size-6 text-sidebar-primary" />

                                <div className="flex flex-col gap-1">
                                    <span className="text-xl font-bold tracking-tight text-sidebar-foreground">
                                        DASHBOX
                                    </span>

                                    <span className="text-[11px] font-medium uppercase tracking-wider text-sidebar-foreground/50">
                                        Gestión de envíos
                                    </span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            {/* CONTENIDO */}
            <SidebarContent className="px-4 pt-6 group-data-[collapsible=icon]:px-2">
                {/* ADMINISTRADOR */}
                <SidebarGroup className="p-0">
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    tooltip="Administrador"
                                    className={adminButtonClass}
                                >
                                    <Users className="!size-5 group-data-[collapsible=icon]:!size-4" />

                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-sm font-semibold">
                                            Administrador
                                        </span>

                                        <span className="text-[11px] text-sidebar-foreground/60">
                                            Operaciones generales
                                        </span>
                                    </div>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* MENÚ PRINCIPAL */}
                <SidebarGroup className="mt-6 p-0">
                    <SidebarGroupLabel className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-widest text-sidebar-foreground/40 group-data-[collapsible=icon]:mb-0">
                        Principal
                    </SidebarGroupLabel>

                    <SidebarGroupContent>
                        <SidebarMenu className="gap-1.5">
                            {filteredNavItems.map((item) => {
                                const isActive =
                                    url === item.url ||
                                    (item.url !== '/dashboard' &&
                                        url.startsWith(item.url + '/'));

                                const Icon = item.icon;

                                return (
                                    <SidebarMenuItem key={item.url}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={isActive}
                                            tooltip={item.title}
                                            className={navButtonClass}
                                        >
                                            <Link href={item.url}>
                                                <Icon className="!size-5 group-data-[collapsible=icon]:!size-4" />

                                                <span className="text-sm">
                                                    {item.title}
                                                </span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            {/* ADMINISTRACIÓN DEL USUARIO */}
            <SidebarFooter className="mt-auto border-t border-sidebar-border px-4 py-4 group-data-[collapsible=icon]:px-2">
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}