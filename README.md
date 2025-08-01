# Bus Scheduling App

This is a [Next.js](https://nextjs.org) application for managing bus schedules, drivers, routes, and shifts. It features role-based access control for administrators, dispatchers, and viewers.

## Getting Started

Follow these instructions to get the project running on your local machine.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [PostgreSQL](https://www.postgresql.org/)

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd bus-scheduling-app
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    - Copy the `.env.example` file to a new file named `.env.local`.
    - Update `.env.local` with your PostgreSQL database connection string and a secure JWT secret.

4.  **Run database migrations:**
    This will create the necessary tables in your database based on the schema defined in `src/db/schema.ts`.
    ```bash
    npx drizzle-kit migrate
    ```

5.  **Seed the database:**
    This command populates the database with initial sample data, including test users, drivers, buses, and routes.
    ```bash
    npm run db:seed
    ```

6.  **Run the development server:**
    ```bash
    npm run dev
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

---

### Test Users

You can use the following credentials to log in with different roles. The passwords are set in the seed script (`src/db/seed.ts`).

-   **Admin:**
    -   **Username:** `admin`
    -   **Password:** `admin123`
-   **Dispatcher:**
    -   **Username:** `dispatcher`
    -   **Password:** `dispatcher123`
-   **Viewer:**
    -   **Username:** `viewer`
    -   **Password:** `viewer123`

---

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.