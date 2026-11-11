
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
    Package,
    LayoutDashboard,
    Building2,
    Users,
    FileClock,
    AlertTriangle,
    ClipboardCheck,
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
        url: '/empresas',
        icon: Building2,
        permission: 'companies.view',
    },
    {
        title: 'Gerentes',
        url: '/gerentes',
        icon: Users,
        permission: 'managers.view',
    },
    {
        title: 'Reportes e historial',
        url: '/reportes',
        icon: FileClock,
        permission: 'reports.view',
    },
    {
        title: 'Edición de emergencia',
        url: '/emergencias',
        icon: AlertTriangle,
        permission: 'emergency.view',
    },
    {
        title: 'Auditoría',
        url: '/auditoria',
        icon: ClipboardCheck,
        permission: 'audit.view',
    },
];

export function AppSidebar() {
    const { url, props } = usePage<PageProps>();

    const permissions = props.auth.user?.permissions ?? [];

    const filteredNavItems = mainNavItems.filter((item) =>
        permissions.includes(item.permission)
    );
    console.log('auth props:', props.auth);

    return (
        <Sidebar
            collapsible="icon"
            variant="inset"
            className="
                border-none
                [&_[data-sidebar=sidebar]]:bg-[#10242F]
                [&_[data-sidebar=sidebar]]:text-white
            "
        >
            {/* LOGO */}
            <SidebarHeader className="bg-[#10242F] px-3 pt-5">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            asChild
                            className="h-auto text-white hover:bg-transparent hover:text-white"
                        >
                            <Link href="/dashboard">
                                <Package className="!size-5 text-[#A9C6D3]" />

                                <div className="flex flex-col gap-1">
                                    <span className="text-lg font-bold tracking-tight text-white">
                                        DASHBOX
                                    </span>

                                    <span className="text-[9px] font-medium uppercase tracking-wider text-white/50">
                                        Gestión de envíos
                                    </span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            {/* CONTENIDO */}
            <SidebarContent className="bg-[#10242F] px-2 pt-5">

                {/* ADMINISTRADOR */}
                <SidebarGroup className="p-0">
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    tooltip="Administrador"
                                    className="
                                        h-11
                                        bg-[#1D4050]
                                        text-white
                                        hover:bg-[#1D4050]
                                        hover:text-white
                                    "
                                >
                                    <Users className="size-4" />

                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-xs font-semibold">
                                            Administrador
                                        </span>

                                        <span className="text-[9px] text-white/60">
                                            Operaciones generales
                                        </span>
                                    </div>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* MENÚ PRINCIPAL */}
                <SidebarGroup className="mt-4 p-0">
                    <SidebarGroupLabel className="mb-2 px-3 text-[9px] font-semibold uppercase tracking-widest text-white/40">
                        Principal
                    </SidebarGroupLabel>

                    <SidebarGroupContent>
                        <SidebarMenu>
                            {filteredNavItems.map((item) => {
                                const isActive =
                                    url === item.url ||
                                    (item.url !== '/dashboard' &&
                                        url.startsWith(item.url + '/'));

                                const Icon = item.icon;

                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={isActive}
                                            tooltip={item.title}
                                            className="
                                                h-9
                                                text-white/70
                                                hover:bg-[#1D4050]
                                                hover:text-white
                                                data-[active=true]:bg-[#1D4050]
                                                data-[active=true]:text-white
                                            "
                                        >
                                            <Link href={item.url}>
                                                <Icon className="size-4" />

                                                <span className="text-xs">
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
            <SidebarFooter className="mt-auto border-t border-white/10 bg-[#10242F] px-2 py-3">
                <NavUser />
            </SidebarFooter>

        </Sidebar>
    );
}
