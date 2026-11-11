import { lazy, Suspense } from "react"
import { Routes, Route } from "react-router-dom"
import MainLayout from "../layout/mainlayout"
import AuthLayout from "../layout/authlayout"
import { BlockLoader } from "../components/loader.jsx"

/*
  CODE SPLITTING.

  `npm run build` was producing a single 1.2 MB JS chunk, because the login
  and register screens import the WebGL backgrounds (ogl, three,
  postprocessing) and face-api.js -- and a static import pulls those into the
  main bundle even for someone who only ever looks at the feed.

  React.lazy + dynamic import() moves each of these into its own chunk that is
  fetched on first navigation. The feed, which is what most visits are, no
  longer pays for any of it.
*/
const Login = lazy(() => import("../auth/login"))
const Register = lazy(() => import("../auth/register"))
const Messages = lazy(() => import("../pages/message.jsx"))
const MessageList = lazy(() => import("../pages/messageList.jsx"))

import Createvideo from "../pages/createvideo.jsx"
import VideoList from "../pages/getvideo.jsx"
import ChannelIndv from "../pages/channelindv.jsx"
import { VideoIndv } from "../pages/videoplayer.jsx"
import ManageVideo from "../pages/managevideo.jsx"
import UpdateVideo from "../pages/updatevideo.jsx"
import AccountPage from "../pages/accountpage.jsx"
import UpdateProfile from "../pages/updateuserdetails.jsx"
import ChangeAvatar from "../pages/updateavatar.jsx"
import ChangePassword from "../pages/changepassword.jsx"
import PracticeVideoPagination from "../practice/practice.video.jsx"
import { TrendingPractice } from "../practice/practice.trending.jsx"
import SearchPage from "../pages/searchIndv.jsx"
import NotFound from "../pages/notfound.jsx"
import SavedPage from "../pages/saved.jsx"
import Protected from "../components/protected.jsx"
import ErrorBoundary from "../components/errorboundary.jsx"

export default function AppRoutes(props) {
    const {
        menubar, setMenubar, darkModenav, setDarkModenav, darkMode, themeSelected,
        setthemeSelected, setDarkMode, profileSelected, currentId, setcurrentId,
        setProfileSelected, setisLoggedIn, isLoggedIn, videoIdSelected, setvideoIdSelected,
    } = props;

    // Shared by every page rendered inside MainLayout.
    const chrome = (
        <MainLayout
            currentId={currentId}
            setcurrentId={setcurrentId}
            menubar={menubar}
            profileSelected={profileSelected}
            setProfileSelected={setProfileSelected}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            setMenubar={setMenubar}
            darkModenav={darkModenav}
            setDarkModenav={setDarkModenav}
            isLoggedIn={isLoggedIn}
            setisLoggedIn={setisLoggedIn}
        />
    );

    return (
        // Suspense is REQUIRED around lazy routes: while a chunk is in flight
        // React suspends, and without a boundary that bubbles up as a crash.
        <ErrorBoundary darkMode={darkMode}>
        <Suspense fallback={<BlockLoader darkMode={darkMode} text="Loading" />}>
        <Routes>
            {/*
              Everything that is part of the signed-in app lives under
              MainLayout so it gets the navbar. Previously only "/" did, and
              every other page rendered with no navigation at all -- once you
              opened a video there was no way back except the browser button.
            */}
            <Route element={chrome}>
                <Route path="/" element={
                    <VideoList
                        setDarkMode={setDarkMode}
                        profileSelected={profileSelected}
                        setProfileSelected={setProfileSelected}
                        darkMode={darkMode}
                        setvideoIdSelected={setvideoIdSelected}
                        videoIdSelected={videoIdSelected}
                    />
                } />

                {/*
                  Pages wrapped in <Protected> need a session. Without it they
                  rendered anyway and every request inside 401'd, leaving a
                  blank page. Now the user gets a toast and a "Log in" panel.
                  The feed, channels and the watch page stay PUBLIC.
                */}
                <Route path="/search" element={
                    <Protected darkMode={darkMode}><SearchPage darkMode={darkMode} /></Protected>
                } />
                <Route path="/saved" element={
                    <Protected darkMode={darkMode}><SavedPage darkMode={darkMode} /></Protected>
                } />

                <Route path="/message" element={
                    <Protected darkMode={darkMode}>
                        <MessageList
                            themeSelected={themeSelected}
                            setthemeSelected={setthemeSelected}
                            currentId={currentId}
                            darkMode={darkMode}
                        />
                    </Protected>
                } />

                <Route path="/watchvideo/:id" element={
                    <VideoIndv
                        profileSelected={profileSelected}
                        setProfileSelected={setProfileSelected}
                        darkMode={darkMode}
                        setDarkMode={setDarkMode}
                        setvideoIdSelected={setvideoIdSelected}
                        videoIdSelected={videoIdSelected}
                    />
                } />

                <Route path="/currentuserdetails" element={
                    <Protected darkMode={darkMode}><AccountPage darkMode={darkMode} /></Protected>
                } />
                <Route path="/updateuserdetails" element={
                    <Protected darkMode={darkMode}><UpdateProfile darkMode={darkMode} /></Protected>
                } />
                <Route path="/updateuserdetails/changeavatar" element={
                    <Protected darkMode={darkMode}><ChangeAvatar darkMode={darkMode} /></Protected>
                } />
                <Route path="/changepassword" element={
                    <Protected darkMode={darkMode}><ChangePassword darkMode={darkMode} /></Protected>
                } />
                <Route path="/managevideo" element={
                    <Protected darkMode={darkMode}><ManageVideo darkMode={darkMode} /></Protected>
                } />
                <Route path="/updatevideo/:id" element={
                    <Protected darkMode={darkMode}><UpdateVideo darkMode={darkMode} /></Protected>
                } />
                <Route path="/createvideo" element={
                    <Protected darkMode={darkMode}><Createvideo darkMode={darkMode} /></Protected>
                } />

                {/* Practice pages, kept as-is. */}
                <Route path="/practice/videos" element={<PracticeVideoPagination darkMode={darkMode} />} />
                <Route path="/practice/trending" element={<TrendingPractice darkMode={darkMode} />} />

                {/*
                  The bare "/:username" channel route MUST be declared after
                  the static paths above. React Router v6+ ranks static
                  segments higher than dynamic ones so this is belt-and-braces,
                  but the ordering also documents the intent.
                */}
                <Route path="/:username" element={
                    <ChannelIndv
                        profileSelected={profileSelected}
                        setProfileSelected={setProfileSelected}
                        darkMode={darkMode}
                        setDarkMode={setDarkMode}
                        setvideoIdSelected={setvideoIdSelected}
                        videoIdSelected={videoIdSelected}
                    />
                } />
            </Route>

            {/*
              Full-bleed pages with no app chrome. The chat view belongs here
              too: it renders its OWN `fixed top-0` header and `fixed bottom-0`
              composer, so a navbar above it would double up.
            */}
            <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register setisLoggedIn={setisLoggedIn} />} />
                <Route path="/message/:receiverId" element={
                    <Protected darkMode={darkMode}>
                        <Messages
                            themeSelected={themeSelected}
                            setthemeSelected={setthemeSelected}
                            darkMode={darkMode}
                            currentId={currentId}
                        />
                    </Protected>
                } />
            </Route>

            <Route path="*" element={<NotFound darkMode={darkMode} />} />
        </Routes>
        </Suspense>
        </ErrorBoundary>
    )
}
