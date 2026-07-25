'use client';

import Link from 'next/link';

const roleConfig: Record<string, { title: string; links: { label: string; href: string }[] }> = {
  CEO: {
    title: 'مدیر عامل',
    links: [
      { label: 'داشبورد', href: '/dashboard/ceo' },
      { label: 'مدیریت کاربران', href: '/dashboard/ceo/users' },
      { label: 'گزارشات', href: '/dashboard/ceo/reports' },
    ],
  },
  HR_MANAGER: {
    title: 'مدیر منابع انسانی',
    links: [
      { label: 'داشبورد', href: '/dashboard/hr' },
      { label: 'مدیریت پرسنل', href: '/dashboard/hr/staff' },
      { label: 'حضور و غیاب', href: '/dashboard/hr/attendance' },
    ],
  },
  TECHNICAL_MANAGER: {
    title: 'مدیر فنی',
    links: [
      { label: 'داشبورد', href: '/dashboard/tech' },
      { label: 'پروژه‌ها', href: '/dashboard/tech/projects' },
      { label: 'تیم‌ها', href: '/dashboard/tech/teams' },
    ],
  },
  DEPARTMENT_MANAGER: {
    title: 'مدیر دپارتمان',
    links: [
      { label: 'داشبورد', href: '/dashboard/dept' },
      { label: 'وظایف', href: '/dashboard/dept/tasks' },
      { label: 'گزارشات', href: '/dashboard/dept/reports' },
    ],
  },
  EMPLOYEE: {
    title: 'کارمند',
    links: [
      { label: 'داشبورد', href: '/dashboard/employee' },
      { label: 'وظایف من', href: '/dashboard/employee/tasks' },
      { label: 'درخواست‌ها', href: '/dashboard/employee/requests' },
    ],
  },
  CUSTOMER: {
    title: 'مشتری',
    links: [
      { label: 'داشبورد', href: '/dashboard/customer' },
      { label: 'سفارشات', href: '/dashboard/customer/orders' },
      { label: 'تیکت‌ها', href: '/dashboard/customer/tickets' },
    ],
  },
};

export default function Sidebar({ role, onLogout }: { role: string; onLogout: () => void }) {
  const config = roleConfig[role] || roleConfig.EMPLOYEE;

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-bold">{config.title}</h2>
        <p className="text-sm text-gray-400 mt-1">پنل مدیریت</p>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {config.links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="block px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm"
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={onLogout}
          className="w-full px-4 py-2 text-sm bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
        >
          خروج
        </button>
      </div>
    </aside>
  );
}
