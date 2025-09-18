# Database Schema Documentation

## User
- **name**: User's full name
- **email**: Unique email address (used for login)
- **passwordHash**: Encrypted password
- **role**: One of: 'staff', 'manager', 'director', 'hr', 'sm' (senior management)
- **teamId**: Team membership (required for staff and manager roles)
- **departmentId**: Department association (required for all except HR and SM)
- **resetToken**: Password reset token (optional)
- **resetTokenExpiry**: When the reset token expires (optional)
- **timestamps**: Records creation and update times

## Team
- **name**: Team name (unique within a department)
- **departmentId**: Associated department
- **managerId**: Team manager (User reference)
- **description**: Team description
- **timestamps**: Records creation and update times

## Department
- **name**: Department name (unique)
- **description**: Department description
- **directorId**: Department director (User reference)
- **timestamps**: Records creation and update times

## Project
- **name**: Project name
- **description**: Project details
- **ownerId**: Project owner (User reference)
- **deadline**: Project due date
- **departmentId**: Associated department
- **collaborators**: List of users working on the project
- **isArchived**: Whether project is archived
- **hasContainedTasks**: Whether project has any tasks
- **timestamps**: Records creation and update times

## Task
- **title**: Task name
- **description**: Task details
- **dueDate**: Task deadline
- **status**: One of: 'unassigned', 'ongoing', 'under_review', 'completed'
- **createdBy**: User who created the task
- **assigneeId**: User assigned to the task
- **projectId**: Associated project
- **attachments**: List of files:
  - filename: Name of file
  - path: File location
  - uploadedBy: User who uploaded
  - uploadedAt: Upload time
- **collaborators**: List of users working on the task
- **lastStatusUpdate**: Last status change:
  - status: New status
  - updatedBy: User who updated
  - updatedAt: Update time
- **isDeleted**: Soft delete flag
- **timestamps**: Records creation and update times

## Subtask
- **parentTaskId**: Parent task reference
- **title**: Subtask name
- **description**: Subtask details
- **dueDate**: Subtask deadline
- **status**: One of: 'unassigned', 'ongoing', 'under_review', 'completed'
- **assigneeId**: User assigned to subtask
- **collaborators**: List of users working on subtask
- **timestamps**: Records creation and update times

## Comment
- **taskId**: Associated task
- **userId**: User who commented
- **content**: Comment text
- **attachments**: List of files:
  - filename: Name of file
  - path: File location
  - uploadedAt: Upload time
- **timestamps**: Records creation and update times

## ActivityLog
- **taskId**: Associated task
- **userId**: User who performed the action
- **action**: Type of activity:
  - created: Task created
  - updated: Task updated
  - status_changed: Status changed
  - assigned: Task assigned
  - collaborator_added: New collaborator added
  - collaborator_removed: Collaborator removed
  - comment_added: New comment
  - attachment_added: File attached
  - attachment_removed: File removed
  - subtask_added: New subtask
  - subtask_completed: Subtask finished
  - subtask_removed: Subtask deleted
- **details**: Additional information about the activity
- **timestamps**: Records creation and update times

## Relationships
- Users can belong to one Team and one Department (based on role)
- Departments have one Director and multiple Teams
- Teams have one Manager and belong to one Department
- Projects belong to one Department and have multiple Tasks
- Tasks belong to one Project and can have multiple Subtasks
- Tasks and Subtasks can have multiple Collaborators
- Comments and ActivityLogs are linked to Tasks and Users
