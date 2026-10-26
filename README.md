================================================================================
                         SOLE - SHOE E-COMMERCE PLATFORM
================================================================================

PROJECT OVERVIEW
----------------
Sole is a shoe e-commerce platform designed to provide customers with a
convenient way to browse, search, and purchase footwear online. The platform
will offer product discovery, shopping cart management, secure checkout, order
tracking, and customer account management.

It will also provide an administrative dashboard for managing products,
inventory, orders, customers, promotions, and sales reports.


TECH STACK
----------

FRONTEND
+----------------+-----------------------------------------------------------+
| Technology     | Purpose                                                   |
+----------------+-----------------------------------------------------------+
| TypeScript     | Provides static typing for JavaScript code.               |
| React          | Builds reusable user interface components.               |
| Tailwind CSS   | Provides utility classes for responsive styling.          |
| Vite           | Provides the frontend development server and build tools. |
| ESLint         | Helps identify potential errors and maintain code quality.|
+----------------+-----------------------------------------------------------+

BACKEND
+----------------+-----------------------------------------------------------+
| Technology     | Purpose                                                   |
+----------------+-----------------------------------------------------------+
| Node.js        | Runs server-side code and handles backend operations.    |
+----------------+-----------------------------------------------------------+


API INTEGRATIONS
----------------
+----------------+-----------------------------------------------------------+
| Service        | Purpose                                                   |
+----------------+-----------------------------------------------------------+
| PayMongo       | Payment processing for customer checkout.                |
| Mailjet        | Email delivery for account and order notifications.       |
| PhilSMS        | SMS messaging for customer and order notifications.       |
+----------------+-----------------------------------------------------------+


GIT WORKFLOW & COMMIT CONVENTIONS
---------------------------------
Use consistent commit messages to make the project history easier to understand
and maintain.

COMMIT TYPES
+------------+--------------------------------------+----------------------------------+
| Type       | Purpose                              | Example                          |
+------------+--------------------------------------+----------------------------------+
| feat       | Introduces a new feature.            | feat: add product catalog        |
| fix        | Fixes a bug.                         | fix: correct cart quantity       |
|            |                                      | validation                       |
| docs       | Updates documentation.               | docs: update project README      |
| style      | Changes formatting without affecting| style: format product components |
|            | functionality.                       |                                  |
| refactor   | Improves code structure without      | refactor: simplify checkout      |
|            | changing intended behavior.         | service                          |
| test       | Adds or updates tests.               | test: add payment validation     |
|            |                                      | tests                            |
| chore      | Handles maintenance tasks.           | chore: update dependencies       |
+------------+--------------------------------------+----------------------------------+

BRANCHING GUIDELINES
Use descriptive branch names for individual tasks. Keep feature work in its
own branch and merge it according to the team's review process.

Examples:
  feature/product-catalog
  feature/payment-integration
  docs/update-readme


- Update this README as the project structure and features are finalized.


================================================================================
