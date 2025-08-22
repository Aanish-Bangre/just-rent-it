# Just Rent It

"Just Rent It" is a modern, full-stack peer-to-peer rental marketplace built with Next.js and Appwrite. It provides a platform for users to list items for rent, book items from other users, and communicate through a real-time chat feature. The application integrates Razorpay for seamless and secure payments.

## Features

-   **User Authentication:** Secure user sign-up and login functionality.
-   **Item Listings:** Users can create, view, and manage their rental listings.
-   **Booking System:** Users can book items for specific dates.
-   **Real-time Chat:** Integrated chat for communication between renters and item owners.
-   **Payment Integration:** Secure payment processing powered by Razorpay.
-   **User Profiles:** Users can view and manage their profiles.
-   **Notifications:** A system to notify users about booking requests, messages, and other activities.

## Tech Stack

-   **Framework:** [Next.js](https://nextjs.org/)
-   **Language:** [TypeScript](https://www.typescriptlang.org/)
-   **Backend:** [Appwrite](https://appwrite.io/)
-   **Payment Gateway:** [Razorpay](https://razorpay.com/)
-   **Real-time Communication:** [Socket.IO](https://socket.io/)
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/) & [Shadcn/UI](https://ui.shadcn.com/)

## Getting Started

### Prerequisites

-   Node.js (v18.x or later)
-   npm / yarn / pnpm
-   An Appwrite instance
-   Razorpay API keys

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/just-rent-it.git
    cd just-rent-it
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

3.  **Set up environment variables:**

    Create a `.env.local` file in the root of the project and add the following environment variables. You can get these from your Appwrite project settings and Razorpay dashboard.

    ```env
    NEXT_PUBLIC_APPWRITE_PROJECT_ID=<YOUR_APPWRITE_PROJECT_ID>
    NEXT_PUBLIC_APPWRITE_DATABASE_ID=<YOUR_APPWRITE_DATABASE_ID>
    NEXT_PUBLIC_APPWRITE_STORAGE_ID=<YOUR_APPWRITE_STORAGE_ID>
    NEXT_PUBLIC_APPWRITE_USER_COLLECTION_ID=<YOUR_APPWRITE_USER_COLLECTION_ID>
    NEXT_PUBLIC_APPWRITE_LISTING_COLLECTION_ID=<YOUR_APPWRITE_LISTING_COLLECTION_ID>
    NEXT_PUBLIC_APPWRITE_BOOKING_COLLECTION_ID=<YOUR_APPWRITE_BOOKING_COLLECTION_ID>
    NEXT_PUBLIC_APPWRITE_CHAT_COLLECTION_ID=<YOUR_APPWRITE_CHAT_COLLECTION_ID>
    NEXT_PUBLIC_APPWRITE_NOTIFICATION_COLLECTION_ID=<YOUR_APPWRITE_NOTIFICATION_COLLECTION_ID>

    RAZORPAY_KEY_ID=<YOUR_RAZORPAY_KEY_ID>
    RAZORPAY_KEY_SECRET=<YOUR_RAZORPAY_KEY_SECRET>
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

5.  **Run the Socket.IO server:**

    In a separate terminal, run the following command to start the chat server:
    ```bash
    node src/server/socket.js
    ```

## Project Structure

The project follows a standard Next.js App Router structure.

-   `src/app/api/`: Contains all the API routes for backend logic.
-   `src/app/(pages)/`: Contains the UI pages for different routes.
-   `src/components/`: Contains reusable React components.
-   `src/hooks/`: Contains custom React hooks.
-   `src/lib/`: Contains library initializations and utility functions (Appwrite, utils).
-   `src/server/`: Contains the Socket.IO server for real-time chat.