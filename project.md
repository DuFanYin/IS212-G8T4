  
User Authorisation and 
Authentication 
Allows users to securely access the system using their  login credentials. Depending on their role (e.g., staff,  manager, director, HR), they will be granted access to  different features and information. This ensures that  
data is protected and accessible only to the appropriate  people.
Task Management 
Users can create new tasks/subtasks (can be in a  project or standalone), view their current  
tasks/subtasks, update task/subtask details, and update their statuses. Tasks can include deadlines, notes,  invited collaborators, and status tracking. Managers  and above can assign tasks/subtasks to their staff,  transferring ownership to them. This forms the  foundation for personal and team productivity. 

Task Grouping and Organisation 
Users can create projects to house their tasks and  subtasks. Collaborators can be invited to work on  projects. This ensures that there are proper  organisation and navigation for projects, as most staff  work on multiple.






1. User Authorization & Authentication
 
Login & Roles
Local authentication is sufficient.
Roles: Staff, Manager, Director, HR, Senior Management (SM).
Hierarchy: SM (org head) → Director (dept head, also SM) → Manager (team head) → Staff.
Role-Based Permissions
Staff: can create projects/tasks/subtasks, manage own tasks, cannot assign tasks.
Manager/Director: can assign tasks downwards; can create unassigned tasks; can update tasks they are collaborators of.
HR/SM: full company visibility and reporting.
Other Security Features
Session timeout for inactivity (QoL feature).
Failed login attempt lockout + password reset (team to decide).
No “admin” dashboard/role needed.
Audit logs for login attempts (future consideration).


2. Task Management
 
Task Basics
Fields: Title, Description, Due Date (mandatory). Attachments & collaborators optional.
Components: Status, Deadline, Attachments, Comments, Subtasks, Collaborators.
Task Statuses
Unassigned, Ongoing, Under Review, Completed.
Under Review = work submitted & being reviewed by a collaborator (usually manager).
Assignment & Ownership
Staff auto-own tasks they create.
Assignment transfers ownership.
Managers/Directors can assign tasks to lower roles only.
Assignment = no accept/decline by staff, auto-added.
Subtasks
Must all be completed before parent task is marked complete.
Subtasks can have their own deadlines and appear in calendar.
Subtask collaborators must be a subset of task collaborators.
Editing & Updates
Staff can only edit tasks they created (title, due date, collaborators).
Status change ≠ edit (it’s an update).
Managers must be collaborators to update task status.
Deletion & Archiving
Tasks should not disappear permanently.
Archive/unarchive = not for first release.
Avoid deletion for first release.
Activity History
All task activity stored permanently.
Constraints
No recurring tasks.
No approval required for completion.
 
 
3. Task Grouping & Organization
 
Projects
Tasks can be standalone or belong to projects.
Projects have ownership but cannot be assigned.
Projects can have deadlines but no status (no % completion required).
Cannot delete projects that once contained tasks, even if empty.
Completed/deleted tasks inside project → project remains (for audit).
Collaborators
Project collaborators = superset; task collaborators = subset of project collaborators; subtask collaborators = subset of task collaborators.
All project task owners & collaborators are also collaborators of the project.
Team & Department
User belongs to one team (subset of a department).
Teams are within departments; departments = functional groups (e.g., Sales).
Project team = people in that project (not necessarily org chart team).
Visibility
Staff: see own tasks, teammates’ tasks, project tasks they’re in.
Manager: see team tasks.
Director: see department tasks.
HR/SM: see all tasks/projects.

MONGO_URL=mongodb+srv://hangzhengyang1010_db_user:p44ooEWAnB76OzX3@cluster0.dra7z8p.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
PORT=3000
JWT_SECRET=a9372d93311b5f5b7955015cd095dfd8a36cd34e5cce9a343447a50488c3758fef3142386fd021a89cdf85aadf5dcd5d5e10a7be09bb903db6d5ae91c1739a08
NODE_ENV=development
GMAIL=hang.zhengyang1010@gmail.com
GMAIL_PASSWORD=lhtcfbtpofsnibgh