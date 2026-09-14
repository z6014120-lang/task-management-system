# User Guide

## Authentication workflows
1. Navigate to `/docs` in your browser.
2. Under Authentication, expand `POST /auth/register` and create an account.
3. Click the "Authorize" button at the top of the Swagger UI. Provide your username and password to log in.
4. Now you are authenticated and can interact with other protected endpoints.

## Managing Projects
1. Go to `POST /projects/` to create a new project.
2. You can view all projects using `GET /projects/`.

## Managing Tasks
1. Under Tasks, go to `POST /tasks/`.
2. Provide a title and the `project_id` for the project you created.
3. You can retrieve tasks and filter them by project, assignee, status, or priority using `GET /tasks/`.

## Dashboard
- Use `GET /dashboard/summary` to view an overview of all projects, tasks, and aggregate metrics.
