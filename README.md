# Ticket Management System

This is a full-stack Ticket Management System built with a robust backend using Node.js & PostgreSQL (Neon) and a dynamic, responsive frontend using Next.js.

## Submission Deliverables & Links
- **Full Git Repository**: Fully committed and pushed.
- **Database Schema and Migrations**: Handled exclusively on startup via `Sequelize.sync({ alter: true })`. Schemas are strictly defined in `backend/models/*.js`.
- **Seed Script for 10k tickets**: Available locally via UI trigger (Click "Seed Tickets" on the Tickets table if logged in as Admin/Owner) or by executing `node backend/seed/seedTicket.js`.
- **README with Setup Instructions**: Detailed in the "Setup & Testing Guide" section at the bottom of this file.
- **Engineering Notes Document**: Detailed in the "Engineering Notes & Architecture" sections below.

---

## Engineering Notes & Architecture


### Backend
- **Node.js & Express**: Core backend framework for API routing.
- **PostgreSQL (Neon)**: Chosen as the online relational database given its robust constraint ecosystem, ACID compliance, scaling flexibility limit, and ease of set up.
- **Sequelize**: ORM for easily mapping Postgres data models, relationships, and advanced filtering.
- **Multer**: Employed for handling `multipart/form-data` to enable file/attachment uploads via APIs.
- **Cloudinary**: Cloud-based media storage. Integrated using the Cloudinary SDK to efficiently offload large static asset hosting.
- **Faker.js**: Leveraged for mass data seeding. Specifically used to seed dummy tickets to test UI infinite scrolling, loading states, and pagination capabilities.

### Frontend
- **Next.js (Latest)**: Utilizes the App Router framework.
- **Tailwind CSS**: For responsive UI and sleek, dark-theme styling aesthetics.
- **Axios**: HTTP client for interacting with the backend API.
- **Lucide-React**: Modular, dynamic iconography.
- **React Toastify**: In-app pop-up notifications and error alerts.

---

## Backend Architecture & Decisions

### Utilities (`/utils`)
To enforce the DRY (Don't Repeat Yourself) principle, critical logic was extracted into independent utility modules:
- **`tokenGenerate.js`**: Centralized logic for signing JWT tokens securely across login and invites.
- **`inviteValidator.js`**: Encapsulates error handling for decoding and strictly validating invite tokens prior to database insertions (checks expirations, spoofing, etc.).
- **`response.js`**: Standardizes the JSON payload shape (`successResponse` and `errorResponse`) to maintain frontend predictability.
- **`auditLog.js`**: Dedicated service for capturing a reliable organizational trail (e.g., ticket edits, role upgrades, member ejections).
- **`inviteEmail.js` / `cloudinary.js`**: Isolates integration configuration for third-party platforms from standard controller logic.

### Middleware (`/middleware`)
- **Authentication & Authorization**: Handled via `verifyToken.js`. Verifies incoming cookies globally, blocks unauthorized users, and leverages Role-Based Access Control (RBAC) layers ensuring protected actions like user removal or settings execution are securely limited.
- **Rate Limiting** (`rateLimit.js`): Deployed on Auth endpoints to mitigate abuse and strictly regulate API usage logic.

### Models & Index
- **Models (`/models`)**: Defines structure, validation constraints, default states, and table relationships (User, Invite, Ticket, Membership, AuditLog, Organization) allowing Sequelize to enforce referential integrity automatically.
- **App/Index File**: Bootstraps the application, mounts all overarching RESTful routes, applies configuration middleware, and syncs the models with Neon DB on startup.

---

## Frontend Architecture & Decisions

### Strongly Typed via `types` Folder
Created to dictate global TypeScript interfaces (e.g., `Ticket`, `Member`, `Membership`). Defining rigorous typings ensures robust data integrity, enables comprehensive IDE intellisense, and dramatically decreases runtime errors.

### Component Logic Abstraction via `hooks` Folder
Created distinct Custom Hooks (e.g., `useMember`, `useOrganizations`, `useTickets`) to handle side-effects and backend data transactions. 
- **Purpose**: It cleanly separates complex data-fetching protocols, caching, state, and pagination constraints from the visual UI logic, allowing individual Visual Components to remain extremely sleek and lean.

### Global Interceptors in `lib/api.js`
Serves as our overarching Axios configuration file.
- **Purpose**: Pre-appends our base endpoints, attaches credentials automatically to all requests, and most importantly, listens passively on a global level. If any network request suddenly receives a `401 Unauthorized` or `403 Forbidden` response, this interceptor forcefully clears local storage variables and sweeps the user backward to `/login` universally.

### Next.js Native `middleware.ts`
Operates purely on the Next.js network edge, evaluating route pathings inherently _before_ React component loads.
- **Purpose**: Evaluates immediate token validation natively. It prevents users executing raw paths logic while unauthenticated, preventing brief UI flashing where data isn't present, and smoothly funnels incoming route requests effectively.

---

## Constraints & Missing Implementations

### Real-Time Update Systems (Socket.io)
While functional, active real-time cross-client syncing via **WebSockets/Socket.io** is unfortunately incomplete.
- **Explanation**: Setting up a production scalable, authenticated Socket.io channel bridging through multi-tenant Organizations effectively necessitates ample debugging bandwidth. Due directly to time constraints, focus was pivoted entirely toward flawlessly managing the dense core jobs (Authorization pipelines, Advanced Sequelize Filtering algorithms, Complex UI architectures). 
- **Future Steps**: My intention, Inshallah, is to entirely revise and study the system upon joining and immediately prioritize contributing and expanding my real-time data expertise seamlessly into the team core ecosystem.

---

## Setup & Testing Guide

### 1. Database Start & Configuration
Make sure you have created an online Database using **Neon PostgreSQL**. You will need to extract the connection string and Cloudinary API Tokens. 

### 2. Backend Initialization
1. Open a terminal and direct it into the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Craft a `.env` file in the root of `/backend`. Match the examples:
   ```env
   PORT=5000
   FRONTEND_URL=http://localhost:3000
   POSTGRES_URL=your_neon_db_url

   JWT_SECRET_KEY=some_very_secret_string

   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   EMAIL_USER=your_email
   EMAIL_PASS=your_email_password
   ```
4. Start the backend development server. Sequelize will automatically perform `sync` and build your DB schemas for you.
   ```bash
   npm run dev
   ```

### 3. Frontend Initialization
1. In a separate terminal session, traverse to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Boot the Next.js development environment:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate manually to [http://localhost:3000](http://localhost:3000)

_**Note on Testing UI Seed Data**_: Once registered, log onto the App and navigate to **Tickets**. If your role is set to `Owner` or `Admin`, a "Seed Tickets" button should be distinctly visible to mass-populate records via Faker.js for visualization logic testing.
