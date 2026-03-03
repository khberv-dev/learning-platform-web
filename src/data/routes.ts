export const routeMeta: Record<string, { title: string; crumb: string }> = {
    "/admin/dashboard": { title: "Dashboard", crumb: "Admin Dashboard" },
    "/admin/teachers": { title: "Teachers", crumb: "Admin Teachers" },
    "/admin/courses": { title: "Courses", crumb: "Admin Courses" },
    "/admin/builder": { title: "Course Builder", crumb: "Admin Builder" },
    "/admin/students": { title: "Students", crumb: "Admin Students" },
  
    "/teacher/dashboard": { title: "Dashboard", crumb: "Teacher Dashboard" },
    "/teacher/students": { title: "My Students", crumb: "Teacher Students" },
    "/teacher/groups": { title: "Groups", crumb: "Teacher Groups" },
    "/teacher/live": { title: "Live Sessions", crumb: "Teacher Live" },
    "/teacher/chat": { title: "Messages", crumb: "Teacher Chat" },
  
    "/settings": { title: "Settings", crumb: "Settings" },
  };
  
  type NavItem = { label: string; to: string; icon: string; badge?: string; badgeTone?: "green" };
  type NavSection = { label: string; items: NavItem[] };
  
  export const adminNav: NavSection[] = [
    {
      label: "Overview",
      items: [{ label: "Dashboard", to: "/admin/dashboard", icon: "#i-grid" }],
    },
    {
      label: "Management",
      items: [
        { label: "Teachers", to: "/admin/teachers", icon: "#i-users", badge: "12" },
        { label: "Courses", to: "/admin/courses", icon: "#i-book" },
        { label: "Students", to: "/admin/students", icon: "#i-hat", badge: "248" },
      ],
    },
    {
      label: "System",
      items: [
        { label: "Analytics", to: "/admin/dashboard", icon: "#i-chart" },
        { label: "Settings", to: "/settings", icon: "#i-cog" },
      ],
    },
  ];
  
  export const teacherNav: NavSection[] = [
    {
      label: "Overview",
      items: [{ label: "Dashboard", to: "/teacher/dashboard", icon: "#i-grid" }],
    },
    {
      label: "Teaching",
      items: [
        { label: "My Students", to: "/teacher/students", icon: "#i-hat" },
        { label: "Groups", to: "/teacher/groups", icon: "#i-people" },
        { label: "Live Sessions", to: "/teacher/live", icon: "#i-radio", badge: "2", badgeTone: "green" },
        { label: "Messages", to: "/teacher/chat", icon: "#i-msg", badge: "5" },
      ],
    },
    {
      label: "System",
      items: [{ label: "Settings", to: "/settings", icon: "#i-cog" }],
    },
  ];