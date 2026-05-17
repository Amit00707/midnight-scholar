Role Matrix
===========

Simple access matrix for core frontend pages and backend scopes.

- Roles: `student`, `teacher`, `admin`

| Role | Frontend Sign-in | Frontend Sign-up | Main Dashboard | Teacher tools | Admin tools |
|------|------------------|------------------|----------------|---------------|-------------|
| student | /student/login | /student/signup | /dashboard | view assignments (if enrolled) | - |
| teacher | /teacher/login | /teacher/signup | /teacher/dashboard | create/manage classes, assign books | - |
| admin | /admin/login | /admin/signup | /admin/dashboard | view teacher data | monitoring, user management |

Notes:
- Signup endpoints accept a `role` parameter; frontend pages created under `(auth)` call `signup(..., role)` accordingly.
- Backend enforces role-based access for `/teacher/*` and `/admin/*` routes via dependencies.
- If you want to restrict admin creation, remove or protect `/admin/signup` and instead seed an admin user.

Created by automation — edit to match production rules.
