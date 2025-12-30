import { Calendar } from '@/modules/calendar/pages/Calendar'
import { Activities } from '@/modules/core-time/pages/Activities'
import { Dashboard } from '@/modules/dashboard/pages/Dashboard'
import { Habits } from '@/modules/habits/pages/Habits'
import { Statistics } from '@/modules/insights/pages/Statistics'
import { Settings } from '@/modules/settings/pages/Settings'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppLayout } from './layouts/AppLayout'
import { ThemeProvider } from './providers/ThemeProvider'

export function App() {
    return (
        <ThemeProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<AppLayout />}>
                        <Route index element={<Dashboard />} />
                        <Route path="calendar" element={<Calendar />} />
                        <Route path="statistics" element={<Statistics />} />
                        <Route path="activities" element={<Activities />} />
                        <Route path="habits" element={<Habits />} />
                        <Route path="settings" element={<Settings />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </ThemeProvider>
    )
}
