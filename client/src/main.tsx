import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import {NextUIProvider} from '@nextui-org/react'
import './index.css'
import {
    createBrowserRouter,
    RouterProvider,
} from "react-router-dom";
import { Scraper } from './routes/Scraper';

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
    },
    {
        path: "/scrape",
        element: <Scraper  />
    }
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
      <NextUIProvider>
          <RouterProvider router={router}/>
      </NextUIProvider>
  </React.StrictMode>,
)
