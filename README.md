# DEMP 2 Frontend

A modern event management frontend built with Next.js, TypeScript, Tailwind CSS, and ESLint. Features include user authentication, event creation, profile management, and a responsive UI.

## Getting Started

1. **Clone the Repository**
   ```sh
   git clone <repo-url>
   cd <directory>
   ```

2. **Install Dependencies**
   ```sh
   npm install
   ```

3. **Run the Development Server**
   ```sh
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser to view the app.

## Features

- Next.js (TypeScript)
- ESLint
- Tailwind CSS
- Import Aliases
- Signup and Login functionality (Test folder)
- TypeScript interfaces for type safety

## Folder Structure

```
frontend/

├── README.md
├── public/
│   ├── icons/
│   └── images/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── Login/
│   │   │   │   ├── layout.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── reset-password/
│   │   │   │   ├── layout.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── Signup/
│   │   │   │   ├── layout.tsx
│   │   │   │   └── page.tsx
│   │   │   └── verify-email/
│   │   │       └── page.tsx
│   │   ├── dashboard/
│   │   │   ├── edit-profile/
│   │   │   │   ├── layout.tsx
│   │   │   │   └── page.tsx
│   │   │   └── view/
│   │   │       ├── bookmarked/
│   │   │       │   └── page.tsx
│   │   │       ├── created/
│   │   │       │   └── page.tsx
│   │   │       ├── past-attended/
│   │   │       │   └── page.tsx
│   │   │       ├── past-organised/
│   │   │       │   └── page.tsx
│   │   │       └── registered/
│   │   │           └── page.tsx
│   │   ├── event/
│   │   │   ├── create-event/
│   │   │   │   └── page.tsx
│   │   │   └── [id]/
│   │   │       ├── edit-event/
│   │   │       │   └── page.tsx
│   │   │       ├── register/
│   │   │       │   └── page.tsx
│   │   │       ├── ticket/
│   │   │       │   └── page.tsx
│   │   │       └── page.tsx
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── cards/
│   │   │   ├── eventCard.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── numbersCard.tsx
│   │   │   └── SearchBar.tsx
│   │   ├── event-form/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── event-list/
│   │   │   └── page.jsx
│   │   ├── footer/
│   │   │   └── footer.tsx
│   │   └── sections/
│   │       ├── IntroSection.tsx
│   │       ├── TrendingEvents.tsx
│   │       └── upcommingEvents.tsx
│   ├── interfaces/
│   │   └── auth.d.ts
│   └── utils/
│       └── decryptToken.ts
└── test/
    └── src/
```

- `src/` - Main application source code
  - `app/` - Application pages and routing (all files and folders included)
  - `components/` - Reusable UI components (all files and folders included)
  - `interfaces/` - TypeScript interfaces
  - `utils/` - Utility functions
- `test/` - Test folder with Signup and Login functionality
- `public/` - Static assets (icons, images)

## Contributions

**Pavan**
- Created interface files and folders for TypeScript.
- Home Page UI, carousels for upcoming/trending events (mobile responsive).
- Footer, Event card, Navbar components.
- User settings panel UI and Delete user-account option.

**Sreelakshmi**
- Updated loading UI and standardized naming across frontend.
- Event Create Page with form and preview (responsive, interactive).
- Edit Profile UI (name, email, change-password, profile image).
- Used LightHouse tool to analyze and optimize the performance. 

## Snapshots

- **Login Page:**  
  ![Login Page](https://github.com/user-attachments/assets/5c9bab7a-a72a-465f-b674-7f27fd1431bb)
- **Forgot Page:**  
  ![Forgot Page](https://github.com/user-attachments/assets/ef0af1a4-f219-43d8-b758-f4fb72da402e)
- **Sign-Up Page:**  
  ![Sign-Up Page](https://github.com/user-attachments/assets/6c8bd47b-95db-4c18-a162-a464b2cf099a)
- **Home Page:**  
  ![Home Page](https://github.com/user-attachments/assets/4fb9f6b4-8d5d-486d-ae09-cfe92fc72270)
- **Create Event Page:**  
  ![Create Event Page](https://github.com/user-attachments/assets/dac4b877-519e-48f9-bd25-1649cf24ae6c)
- **User Profile:**  
  ![User Profile](https://github.com/user-attachments/assets/df7c53f7-23d0-41a2-a813-16e178dfaecb)
- **Edit User Profile:**  
  ![Edit User Profile](https://github.com/user-attachments/assets/64f4f55a-3cc8-479e-b2cb-69cc1a6e8324)
- **Dashboard:**  
  ![Dashboard](https://github.com/user-attachments/assets/df78b171-0adb-43e3-86a1-1671847c91ba)

