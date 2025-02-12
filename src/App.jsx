// Create a new file: src/components/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';

// Modified App.jsx
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ThemeProvider } from "@/contexts/theme-context";
import Layout from "@/routes/layout";
import DashboardPage from "@/routes/dashboard/page";
import UserPage from "./routes/user/page";
import LoginPage from "./routes/login/page";
import CoursesPage from "./routes/courses/page";
import LessionPage from "./routes/lesson/page";
import Exercises from "./routes/exercises/ExercisesPage";
import QuestionPage from "./routes/questions/QuestionPage";
import ExerciseInfoPage from './routes/exercises/ExerciseInfoPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
    const router = createBrowserRouter([
        {
            path: "/login",
            element: <LoginPage />,
        },
        {
            path: "/",
            element: (
                <ProtectedRoute>
                    <Layout />
                </ProtectedRoute>
            ),
            children: [
                {
                    index: true,
                    element: <DashboardPage />,
                },
                {
                    path: "users",
                    element: <UserPage />,
                },
                {
                    path: "courses",
                    element: <CoursesPage/>,
                },
                {
                    path: "customers",
                    element: <h1 className="title">Customers</h1>,
                },
                {
                    path: "lession",
                    element: <LessionPage/>,
                },
                {
                    path: "exercises",
                    element: <Exercises/>,
                },
                {
                    path: "exercise-info/:id",
                    element: <ExerciseInfoPage/>,
                },
                {
                    path: "/questions",
                    element: <QuestionPage/>,
                },
                {
                    path: "products",
                    element: <h1 className="title">Products</h1>,
                },
                {
                    path: "new-product",
                    element: <h1 className="title">New Product</h1>,
                },
                {
                    path: "inventory",
                    element: <h1 className="title">Inventory</h1>,
                },
                {
                    path: "settings",
                    element: <h1 className="title">Settings</h1>,
                },
            ],
        },
    ]);

    return (
        <ThemeProvider storageKey="theme">
            <RouterProvider router={router} />
        </ThemeProvider>
    );
}

export default App;