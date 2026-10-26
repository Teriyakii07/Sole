# 👟 Sole — Shoe E-Commerce Platform

> **Sole** is a shoe e-commerce platform designed to provide customers with a convenient way to browse, search, and purchase footwear online. It features product discovery, shopping cart management, checkout, order tracking, and customer account management, along with an administrative dashboard for managing products, inventory, orders, promotions, and sales reports.

---

## ✨ Features

### 🛍️ Customer Features

- 🏠 **Homepage** — Hero slideshow, product categories, featured products, new arrivals, best sellers, and promotions
- 🔎 **Product Catalog** — Browse, search, filter, and sort footwear by category, brand, size, and price
- ❤️ **Favorites** — Save products for later and view saved items
- 🛒 **Shopping Cart** — Manage selected products, shoe sizes, colors, and quantities
- 🔐 **Authentication** — Customer registration, login, and password recovery
- 💳 **Checkout and Payments** — Review orders and pay through supported PayMongo payment methods
- 📦 **Order Tracking** — View order history and track order status
- 👤 **Customer Account** — Manage profiles, delivery addresses, and account settings
- 📱 **Responsive Design** — Support desktop and mobile devices

### 🧑‍💼 Admin Features

- 📊 **Dashboard** — Overview of sales, orders, revenue, and customers
- 👟 **Product Management** — Add, edit, view, and archive products
- 📦 **Inventory Management** — Track stock by shoe size, color, and product variant
- 🧾 **Order Management** — Review orders and update fulfillment status
- 💰 **Payment Management** — Monitor payment statuses and transaction references
- 🏷️ **Promotions** — Manage discount codes, sales, and promotional banners
- 📈 **Sales Reports** — Generate sales, order, and inventory reports
- 👥 **Customer Management** — View customer profiles and order histories
- ⭐ **Reviews Management** — Moderate product reviews and reported content
- 📩 **Notifications** — Configure email and SMS notifications

> **Note:** Features will be implemented in phases. The final scope depends on development progress and the team's requirements.

---

## 🧰 Tech Stack

| **Layer** | **Technology** | 
|---|---|---|
| **Frontend Framework** | [React](https://react.dev/) |
| **Programming Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) |
| **Build Tool** | [Vite](https://vite.dev/) |
| **Backend Runtime** | [Node.js](https://nodejs.org/) |
| **Code Quality** | [ESLint](https://eslint.org/) | 
| **Payment Gateway** | [PayMongo](https://www.paymongo.com/) |
| **Email Service** | [Mailjet](https://www.mailjet.com/) |
| **SMS Service** | [PhilSMS](https://philsms.com/) |
| **Database** | [Supabase] |

---

## 🛠️ Prerequisites

Before running the project, make sure the following tools are installed:

- **[Node.js](https://nodejs.org/)** — Use a version compatible with the project's dependencies.
- **pnpm** — Package manager included with Node.js.
- **[Git](https://git-scm.com/)** — Version control.

---
## 📦 Package Manager & Development Commands

Sole uses **pnpm** to manage project dependencies and **Vite** to run the frontend development server. ESLint is used to identify potential errors and maintain code quality.

### 🛠️ Installation

#### 1. Install pnpm

```bash
npm install -g pnpm
pnpm -v
```

#### 2. Install Project Dependencies

```bash
pnpm create vite frontend --template react-ts
cd frontend
pnpm install
```

#### 3. Install Vite
```bash
pnpm add -D vite
```

#### 4. Install ESLint
```bash
pnpm add -D eslint @eslint/js typescript-eslint
pnpm add -D eslint-plugin-react-hooks eslint-plugin-react-refresh
```

### 🚀 Development Commands

Run these commands inside the frontend project directory.

| **Command** | **Description** |
|---|---|
| `pnpm install` | Install project dependencies |
| `pnpm dev` | Start the Vite development server, if configured in `package.json` |
| `pnpm build` | Build the project for production, if configured |
| `pnpm lint` | Run ESLint, if configured |
| `pnpm add <package>` | Install a production dependency |
| `pnpm add -D <package>` | Install a development dependency |
| `pnpm remove <package>` | Remove a dependency |
| `pnpm update` | Update dependencies within the allowed version ranges |

### 🧹 ESLint Commands

Check the project for linting issues:

```bash
pnpm lint
```

If no `lint` script exists in `package.json`, you can run ESLint directly:

```bash
pnpm exec eslint .
```

Automatically fix supported linting issues:

```bash
pnpm exec eslint . --fix
```
Review the changes after running automatic fixes before committing your code.

---
## 📜 Git Workflow & Commit Conventions

Use consistent commit messages to make the project's development history easier to understand and maintain.

---

### Commit Types

| **Type** | **Purpose** | **Example** |
|---|---|---|
| `feat` | Introduces a new feature | `feat: add product catalog` |
| `fix` | Fixes a bug | `fix: correct cart quantity validation` |
| `docs` | Updates documentation | `docs: update project README` |
| `style` | Changes formatting without affecting functionality | `style: format product components` |
| `refactor` | Improves code structure without changing intended behavior | `refactor: simplify checkout service` |
| `test` | Adds or updates tests | `test: add payment validation tests` |
| `chore` | Handles maintenance tasks | `chore: update dependencies` |

---

### Branching Guidelines

Use descriptive branch names for individual tasks. Create a separate branch for each feature or fix, and submit a pull request according to the team's review process.

**Branch Naming Examples:**

```text
feature/product-catalog
feature/payment-integration
feature/customer-authentication
```
---

### Recommended Workflow

1. Create a branch.
2. Implement the assigned feature.
3. Test the changes locally.
4. Commit using the agreed commit message format.
5. Push the branch to GitHub.
6. Open a pull request for review.
7. Merge after approval.

---

## 📄 License

The project license has not yet been determined. Add a `LICENSE` file and update this section once the team has agreed on the licensing terms.