# Requirements Document

## Introduction

Members Only is a Node.js/Express/PostgreSQL web application that implements a clubhouse-style message board with tiered authentication and authorization. Unauthenticated visitors can read message titles and text but cannot see author details or timestamps. Logged-in members who have joined the club can see the full message details. Admin users can delete messages. The project is intended as a study application for learning authentication concepts with clean, well-commented code.

## Glossary

- **System**: The Members Only web application
- **User**: Any person interacting with the web application
- **Guest**: An unauthenticated visitor with no session
- **Member**: A registered User who has successfully entered the membership passcode
- **Admin**: A registered User who has been granted administrative privileges via a secret admin passcode or the sign-up checkbox
- **Message**: A board post consisting of a title, text body, timestamp, and a reference to its author
- **Membership Passcode**: A secret string configured in the environment that grants membership status when entered by a logged-in User
- **Admin Passcode**: A secret string configured in the environment that grants admin status when entered by a logged-in User
- **Session**: A server-side authenticated session managed by Passport.js
- **Hash**: A bcrypt-derived irreversible representation of a password stored in the database

## Requirements

### Requirement 1: User Registration

**User Story:** As a Guest, I want to register for an account, so that I can log in and participate in the clubhouse.

#### Acceptance Criteria

1. THE System SHALL provide a sign-up form with fields for first name, last name, username (email address), password, confirm-password, and an optional admin checkbox.
2. WHEN a Guest submits the sign-up form, THE System SHALL validate that the password field and the confirm-password field contain identical values before creating the account.
3. IF the password and confirm-password fields do not match, THEN THE System SHALL re-render the sign-up form with a descriptive error message and preserve the non-password field values.
4. WHEN a Guest submits a valid sign-up form, THE System SHALL hash the password using bcrypt before storing any User data in the database.
5. WHEN a Guest submits a valid sign-up form, THE System SHALL store a new User record with first name, last name, username, hashed password, membership status defaulting to false, and admin status reflecting the checkbox value.
6. IF a Guest submits a sign-up form with a username that already exists in the database, THEN THE System SHALL re-render the sign-up form with an error message stating the username is already taken.
7. WHEN a User account is successfully created, THE System SHALL redirect the User to the login page.

### Requirement 2: User Authentication

**User Story:** As a registered User, I want to log in and log out, so that I can access member features securely.

#### Acceptance Criteria

1. THE System SHALL provide a login form with username and password fields.
2. WHEN a User submits the login form, THE System SHALL authenticate the credentials using Passport.js local strategy by comparing the submitted password against the stored bcrypt Hash.
3. IF the login credentials are invalid, THEN THE System SHALL re-render the login form with an error message indicating invalid username or password.
4. WHEN a User successfully authenticates, THE System SHALL establish a Session and redirect the User to the home page.
5. WHEN a logged-in User requests logout, THE System SHALL destroy the Session and redirect the User to the home page.
6. WHILE a Session is active, THE System SHALL make the current User object available to all views via res.locals.

### Requirement 3: Message Board — Home Page

**User Story:** As a User, I want to view messages on the home page, so that I can read clubhouse content at my membership level.

#### Acceptance Criteria

1. THE System SHALL display all Messages on the home page ordered by timestamp descending (newest first).
2. WHILE a User is a Guest or non-member, THE System SHALL display only the title and text body of each Message, hiding the author name and timestamp.
3. WHILE a User is a Member, THE System SHALL display the title, text body, author full name, and formatted timestamp of each Message.
4. WHILE a User is an Admin, THE System SHALL display all Message details and a delete button beside each Message.
5. WHEN a Guest views the home page, THE System SHALL display links to the login and sign-up pages.
6. WHEN a logged-in User views the home page, THE System SHALL display a logout link and a link to create a new message.

### Requirement 4: Membership — Join the Club

**User Story:** As a logged-in non-member, I want to join the club by entering the secret passcode, so that I can see full message details.

#### Acceptance Criteria

1. THE System SHALL provide a "Join the Club" page accessible only to logged-in Users.
2. IF a Guest navigates to the Join the Club page, THEN THE System SHALL redirect the Guest to the login page.
3. WHEN a logged-in User submits the correct Membership Passcode on the Join the Club page, THE System SHALL update the User's membership status to true in the database and redirect the User to the home page.
4. IF a logged-in User submits an incorrect Membership Passcode, THEN THE System SHALL re-render the Join the Club page with an error message stating the passcode is incorrect.
5. WHILE a User already has membership status true, THE System SHALL still render the Join the Club page without error (idempotent operation).

### Requirement 5: Message Creation

**User Story:** As a logged-in User, I want to create new messages, so that I can share content with the clubhouse.

#### Acceptance Criteria

1. THE System SHALL provide a new message form page accessible only to logged-in Users.
2. IF a Guest navigates to the new message form, THEN THE System SHALL redirect the Guest to the login page.
3. THE new message form SHALL contain fields for message title and message text body.
4. WHEN a logged-in User submits a valid new message form, THE System SHALL create a Message record in the database with the provided title, text, the current timestamp, and the logged-in User's ID as the author reference.
5. WHEN a Message is successfully created, THE System SHALL redirect the User to the home page.
6. IF a logged-in User submits a new message form with an empty title or empty text body, THEN THE System SHALL re-render the form with an error message indicating which fields are required.

### Requirement 6: Admin — Message Deletion

**User Story:** As an Admin, I want to delete messages, so that I can moderate clubhouse content.

#### Acceptance Criteria

1. THE System SHALL provide a delete action for each Message, visible only to Admin Users on the home page.
2. IF a non-Admin User attempts to delete a Message, THEN THE System SHALL return a 403 Forbidden response.
3. WHEN an Admin User submits a delete request for a Message, THE System SHALL remove the Message record from the database.
4. WHEN a Message is successfully deleted, THE System SHALL redirect the Admin to the home page.

### Requirement 7: Admin Elevation

**User Story:** As a registered User, I want to gain admin status via a secret passcode or a sign-up checkbox, so that I can moderate the clubhouse.

#### Acceptance Criteria

1. THE System SHALL provide an "Admin Upgrade" page accessible only to logged-in Users.
2. IF a Guest navigates to the Admin Upgrade page, THEN THE System SHALL redirect the Guest to the login page.
3. WHEN a logged-in User submits the correct Admin Passcode on the Admin Upgrade page, THE System SHALL update the User's admin status to true in the database and redirect the User to the home page.
4. IF a logged-in User submits an incorrect Admin Passcode, THEN THE System SHALL re-render the Admin Upgrade page with an error message stating the passcode is incorrect.
5. WHERE a User checks the admin checkbox on the sign-up form, THE System SHALL set the User's admin status to true during account creation.

### Requirement 8: Security and Configuration

**User Story:** As a developer, I want the application to follow secure coding practices, so that user credentials and secrets are protected.

#### Acceptance Criteria

1. THE System SHALL store all passwords exclusively as bcrypt Hashes with a cost factor of at least 10.
2. THE System SHALL read the Membership Passcode, Admin Passcode, session secret, and database connection string exclusively from environment variables.
3. THE System SHALL use parameterized queries or an ORM for all database interactions to prevent SQL injection.
4. WHEN a Session cookie is configured, THE System SHALL set the httpOnly flag to true.
5. THE System SHALL include a `.env.example` file documenting all required environment variables without exposing their values.

### Requirement 9: Code Quality and Learnability

**User Story:** As a student developer, I want the codebase to be clean and well-commented, so that I can understand authentication patterns and use this as a reference.

#### Acceptance Criteria

1. THE System SHALL include inline comments on all authentication-related code explaining the purpose of each step (bcrypt hashing, Passport strategy, session serialization/deserialization).
2. THE System SHALL organize code into clearly named modules: routes, controllers/handlers, models, middleware, and views.
3. THE System SHALL include a README with setup instructions, environment variable descriptions, and an explanation of the membership and admin mechanics.
