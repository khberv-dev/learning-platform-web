export const adminStats = [
    { tone: "blue", icon: "#i-users", label: "Teachers", value: "12", sub: "+2 this month" },
    { tone: "purple", icon: "#i-book", label: "Courses", value: "34", sub: "6 draft" },
    { tone: "green", icon: "#i-hat", label: "Students", value: "248", sub: "Active this week" },
    { tone: "yellow", icon: "#i-video", label: "Video Lessons", value: "186", sub: "Total uploaded" },
  ] as const;
  
  export const teacherStats = [
    { tone: "blue", icon: "#i-hat", label: "My Students", value: "62", sub: "In 3 groups" },
    { tone: "green", icon: "#i-radio", label: "Live Sessions", value: "2", sub: "Upcoming today" },
    { tone: "purple", icon: "#i-msg", label: "New Messages", value: "5", sub: "Unread" },
    { tone: "yellow", icon: "#i-book", label: "Courses", value: "4", sub: "Active" },
  ] as const;
  
  export const recentTeachers = [
    { initials: "SM", tone: "purple", name: "Sara Mitchell", courses: 4, students: 62, status: "Active" },
    { initials: "JK", tone: "green", name: "James Kim", courses: 2, students: 38, status: "Active" },
    { initials: "LP", tone: "blue", name: "Laura Pérez", courses: 3, students: 55, status: "Pending" },
  ] as const;
  
  export const popularCourses = [
    { name: "Algebra II", enrolled: 74, completion: 72 },
    { name: "Chemistry Basics", enrolled: 56, completion: 58 },
    { name: "Python Intro", enrolled: 92, completion: 85 },
  ] as const;
  
  export const teacherTable = [
    { initials: "SM", tone: "purple", name: "Sara Mitchell", dept: "Mathematics", email: "s.mitchell@edu.com", courses: 4, students: 62, status: "Active" },
    { initials: "JK", tone: "green", name: "James Kim", dept: "Sciences", email: "j.kim@edu.com", courses: 2, students: 38, status: "Active" },
    { initials: "LP", tone: "blue", name: "Laura Pérez", dept: "Computer Science", email: "l.perez@edu.com", courses: 3, students: 55, status: "Pending" },
    { initials: "RW", tone: "red", name: "Robert Walsh", dept: "History", email: "r.walsh@edu.com", courses: 1, students: 22, status: "Inactive" },
  ] as const;
  
  export const studentTable = [
    { initials: "AT", tone: "blue", name: "Alex Turner", enrolled: 3, progress: 80, last: "Today", status: "Active" },
    { initials: "MR", tone: "green", name: "Mia Rodriguez", enrolled: 2, progress: 55, last: "2 days ago", status: "Active" },
    { initials: "CL", tone: "purple", name: "Chris Lee", enrolled: 1, progress: 30, last: "1 week ago", status: "Inactive" },
  ] as const;