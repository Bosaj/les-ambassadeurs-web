# Ambassadors of Good Association (Association des Ambassadeurs du Bien)

![Project Banner](/public/images/new_ABV.jpg)

[![Netlify Status](https://api.netlify.com/api/v1/badges/ee33b656-05db-4629-b6ec-55ed881b3d90/deploy-status)](https://app.netlify.com/sites/les-ambassadeurs-web-demo/deploys)
**Live Site:** [les-ambassadeurs-web-demo.netlify.app](https://les-ambassadeurs-web-demo.netlify.app)

## 🌍 About The Project

**Les Ambassadeurs du Bien** is a modern, responsive web application designed for a non-profit organization dedicated to fostering community welfare, social solidarity, and humanitarian aid. This platform serves as the digital hub for the association, enabling them to:

*   **Raise Awareness:** share news, success stories, and upcoming events.
*   **Recruit Volunteers:** streamline the volunteer application process.
*   **Collect Donations:** provide secure and diverse options for financial contributions.
*   **Showcase Impact:** highlight the dedicated team and trusted partners driving the mission.

## ✨ Key Features

This project is built with a focus on user experience, accessibility, and modern web standards.

*   **🔐 Robust Authentication System**:
    *   Secure Login & Signup flows.
    *   Role-based access control (User/Admin).
    *   Protected routes for sensitive areas.

*   **🌙 System-Wide Dark Mode**:
    *   Fully integrated dark theme toggle.
    *   Persists user preference via standard local storage.
    *   Adaptive UI components (cards, forms, inputs) for visual comfort.

*   **🌐 Multilingual Support (i18n)**:
    *   Seamless switching between **English**, **French**, and **Arabic**.
    *   RTL (Right-to-Left) layout support for Arabic.
    *   Context-aware translations for all site content.

*   **📱 Responsive & Interactive UI**:
    *   **Mobile-First Design**: Built with Tailwind CSS for perfect rendering on all devices.
    *   **3D Team Carousel**: Interactive swiper to showcase leadership.
    *   **Animations**: Smooth transitions and entry effects using Framer Motion.

*   **🤝 Engagement Tools**:
    *   **Volunteer Portal**: easy-to-use application forms.
    *   **Donation Center**: support for bank transfers, PayPal, and online payments.

## 🛠️ Technology Stack

*   **Frontend Framework**: [React.js](https://reactjs.org/) (v18)
*   **Build Tool**: [Vite](https://vitejs.dev/) - for lightning-fast HMR and building.
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/) - utility-first CSS framework.
*   **Routing**: [React Router DOM](https://reactrouter.com/) (v6).
*   **Animations**: [Framer Motion](https://www.framer.com/motion/).
*   **Icons**: [React Icons](https://react-icons.github.io/react-icons/).
*   **Carousels**: [Swiper.js](https://swiperjs.com/).
*   **Notifications**: [React Hot Toast](https://react-hot-toast.com/).

## 🚀 Getting Started

Follow these steps to get a local copy up and running.

### Prerequisites

*   Node.js (v16 or higher)
*   npm or yarn

### Installation

1.  **Clone the repository**
    ```sh
    git clone https://github.com/your-username/les-ambassadeurs-web.git
    cd les-ambassadeurs-web
    ```

2.  **Install dependencies**
    ```sh
    npm install
    # or
    yarn install
    ```

3.  **Start the development server**
    ```sh
    npm run dev
    ```

4.  **Open your browser**
    Navigate to `http://localhost:5173` to view the application.

## 📂 Project Structure

```bash
src/
├── assets/         # Static assets (images, icons)
├── components/     # Reusable UI components (Header, Footer, Team, etc.)
├── context/        # Global state (AuthContext, LanguageContext, ThemeContext)
├── hooks/          # Custom React hooks
├── pages/          # Page components (Home, Volunteer, Donate, Login, etc.)
├── translations/   # JSON content for i18n
├── App.jsx         # Main application component with Routing
└── main.jsx        # Entry point
```

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<p align="center">
  Built with ❤️ by the Tech Team @ Ambassadors of Good
</p>
