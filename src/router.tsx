import { createBrowserRouter } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { Home } from "./pages/Home";
import { Modules } from "./pages/Modules";
import { ModuleDetail } from "./pages/ModuleDetail";
import { ExperimentPage } from "./pages/ExperimentPage";
import { About } from "./pages/About";
import { NotFound } from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: "modules", element: <Modules /> },
      { path: "modules/:moduleId", element: <ModuleDetail /> },
      { path: "experiments/:experimentId", element: <ExperimentPage /> },
      { path: "about", element: <About /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);