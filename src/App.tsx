import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from './login/Login';
import Layout from './bar/Layout';
import GuildBar from './guild/GuildBar';
import Guild from './guild/Guild';

function App() {
  if (localStorage.getItem('token') === null && window.location.pathname !== '/login') {
    window.location.href = '/login';
  }

  return (
    <div className="flex h-screen max-h-screen w-screen select-none overflow-hidden text-white">
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<Layout />}>
            <Route path="/test" element={<span className="text-black">Test</span>} />
            <Route path="/guilds/:guildId" element={<GuildBar />}>
              <Route path=":channelId" element={<Guild />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
