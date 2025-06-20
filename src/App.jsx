import { useState } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Layout from './layout/Layout'
import Home from './components/pages/Home/Home'
// import Community from './pages/Community'
// import Discovery from './pages/Discovery'
// import ComingSoon from './pages/ComingSoon'
// import Profile from './pages/Profile'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <Home />,
      },
    //   {
    //     path: '/community',
    //     element: <Community />,
    //   },
    //   {
    //     path: '/discovery',
    //     element: <Discovery />,
    //   },
    //   {
    //     path: '/coming-soon',
    //     element: <ComingSoon />,
    //   },
    //   {
    //     path: '/profile',
    //     element: <Profile />,
    //   },
    //   {
    //     path: '/friend',
    //     element: <Friend />,
    //   },
    //   {
    //     path: '/media',
    //     element: <Media />,
    //   },
    //   {
    //     path: '/settings',
    //     element: <Settings />,
    //   },
    //   {
    //     path: '/help',
    //     element: <Help />,
    //   },
    ],
  },
])
function App() {
  return (
      <RouterProvider router={router} />

  )
}

export default App
