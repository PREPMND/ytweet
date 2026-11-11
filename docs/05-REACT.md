# 5 — React & The Frontend

---

## 5.1 Rendering, reconciliation, keys

React re-renders a component when its state or props change. It builds a new
element tree, **diffs** it against the previous one, and applies the minimal
set of real DOM mutations.

The diff uses two heuristics:

1. Different element **type** at the same position → destroy the subtree and
   rebuild it.
2. Children are matched by **key**.

```jsx
{videos.map((video) => (
    <div key={video._id}>…</div>
))}
```

### Why `key={index}` is a bug

With index keys, deleting the first item renumbers everything. React thinks
item 0 "changed from A to B" rather than "A was removed", so it **reuses the
DOM node and its component state**. An input's typed value, a playing
`<video>`, a half-finished animation — all attach to the wrong row.

Use a stable id from the data. Index keys are only safe for a list that is
append-only and never reordered or filtered.

Note the toast host:

```js
const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
```

`Date.now()` alone collides when two toasts fire in the same millisecond, and
React warns about duplicate keys.

---

## 5.2 The hooks rules, and why

1. **Only call hooks at the top level** — never in a condition, loop or
   nested function.
2. **Only call hooks from React functions.**

React stores hook state in a **linked list per component instance**, indexed by
call order. There are no names — the first `useState` is slot 0, the second is
slot 1. Skip one conditionally and every subsequent hook reads the wrong slot.

```jsx
// ❌ breaks the slot order
if (loading) { const [x] = useState(0); }
```

This is also why `Protected` returns *after* all its hooks have run — an early
`return` before a hook would change the count between renders.

---

## 5.3 `useEffect` dependencies and stale closures

```jsx
// frontend/src/components/navbar.jsx — debounce
useEffect(() => {
    const timer = setTimeout(() => setDebouncedTerm(searchTerm.trim()), 350);
    return () => clearTimeout(timer);
}, [searchTerm]);
```

The **cleanup function runs before the next effect** and on unmount. So each
keystroke cancels the pending timer and starts a new one: the query fires only
once, 350 ms after typing stops.

Without it, every keystroke fired a request — and the server's rate limiter
(10 requests / 20 s at the time) returned 429 after about ten characters.

### Debounce vs throttle

| | fires |
|---|---|
| **debounce** | once, T after activity *stops* — search-as-you-type |
| **throttle** | at most once every T *during* activity — scroll, resize |

### The stale-closure trap

```jsx
useEffect(() => {
    const id = setInterval(() => console.log(count), 1000);
    return () => clearInterval(id);
}, []);        // ← `count` is captured once, at mount, forever
```

The effect closes over `count` from the first render. Fixes: add `count` to
the deps, or use the functional updater `setCount(c => c + 1)`, which never
needs to read the current value.

```jsx
// This is why the thumbnail tracker uses the updater form:
setLoadedThumbs((prev) => (prev[id] ? prev : { ...prev, [id]: true }));
```

Returning `prev` **unchanged** when nothing happened is also deliberate —
React bails out of the re-render when the reference is identical, which stops
the `ref` callback from triggering an infinite loop.

### `useEffectEvent` — a real bug in this repo

```jsx
import { useState, useEffect, useEffectEvent } from "react";   // ❌
```

`useEffectEvent` is **experimental** and is not exported from the stable React
build. Because React ships as CommonJS and Vite's interop does not throw on a
missing named export, this silently evaluated to `undefined`. It would only
have blown up at the call site. Removed.

---

## 5.4 `useRef` — two different jobs

```jsx
const loadMoreRef = useRef(null);   // 1. a DOM handle
const toasted     = useRef(false);  // 2. mutable value that must NOT re-render
```

A ref is a stable box whose `.current` can change without triggering a render.

```jsx
// frontend/src/components/protected.jsx
if (!checking && !user && !toasted.current) {
    toasted.current = true;
    toast("Log in to open that page");
}
```

Using `useState` here would re-render on every toast, which would re-run the
effect, which would toast again. The ref breaks that cycle.

### The infinite-scroll bug

```jsx
// BROKEN
{videos.map((video) => (
    <div key={video._id} ref={loadMoreRef}>…</div>      // ref on EVERY card
))}
```

A ref holds one value. After rendering, `loadMoreRef.current` pointed at
whichever card React committed last — and crucially, reassigning `.current`
does **not** re-run the effect that called `observer.observe()`. So the
observer kept watching a node that had already scrolled far out of view, and
loading page 3 onwards was unreliable.

```jsx
// FIXED — one sentinel below the grid
{videos.map(...)}
<div ref={loadMoreRef} className="h-px w-full" aria-hidden="true" />
```

### `IntersectionObserver`

```jsx
const observer = new IntersectionObserver(
    ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage();
    },
    { root: scrollContainer, threshold: 0.1, rootMargin: "400px" }
);
```

`rootMargin: "400px"` inflates the viewport, so the next page starts loading
400 px *before* the sentinel is visible — the user never sees the spinner.
Far cheaper than a scroll listener, because the callback fires only on
threshold crossings instead of on every scroll frame.

Always `unobserve`/`disconnect` in the cleanup, or you leak the observer and
the detached node it holds.

---

## 5.5 TanStack Query — server state is not UI state

```jsx
const { data } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
    staleTime: 1000 * 60,
    retry: false,
});
```

The core idea: data that lives on a server is **not** component state. It is a
cache with freshness rules. Query gives you deduplication, caching,
background refetch, and loading/error states for free.

| Option | Meaning |
|---|---|
| `queryKey` | cache identity. Same key across components = **one** request |
| `staleTime` | how long data is considered fresh (no refetch) |
| `gcTime` | how long unused data stays in memory |
| `retry: false` | don't retry — a 401 means "not logged in", not "try again" |
| `placeholderData: prev => prev` | keep the old list visible during the next fetch |

The navbar, `App`, and `Protected` all use `["currentUser"]`. Because the key
matches, that is **one** network request shared by three components — not
three.

### `invalidateQueries` after a mutation

```jsx
// frontend/src/pages/saved.jsx
const remove = useMutation({
    mutationFn: toggleWatchLater,
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["watchLater"] });
        queryClient.invalidateQueries({ queryKey: ["library"] });
    },
});
```

Both must be invalidated. `watchLater` drives this page's list; `library`
drives the feed's "Remove from Watch later" label. Forgetting the second one
leaves the two views disagreeing — a classic cache-coherence bug.

The same reasoning applies after login:

```jsx
await queryClient.invalidateQueries({ queryKey: ["currentUser"] });
navigate(location.state?.from || "/", { replace: true });
```

Without it, the cached *signed-out* result is still fresh for another minute,
so the navbar and `Protected` would both still believe nobody is logged in.

### Optimistic updates

```jsx
function handleNotInterested(video) {
    setHiddenIds((prev) => new Set(prev).add(video._id));   // hide immediately
    toast("You won't see this again");
    notInterestedMutation.mutate(video._id);
}
```

with a rollback when the server disagrees:

```jsx
onError: (err, videoId) => {
    setHiddenIds((prev) => { const next = new Set(prev); next.delete(videoId); return next; });
}
```

The card disappears instantly instead of after a round trip. **Optimistic UI
without a rollback path is just a lie** — the rollback is the non-optional
half.

---

## 5.6 `useInfiniteQuery`

```jsx
const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
        queryKey: ["videos"],
        queryFn: fetchVideos,
        getNextPageParam: (lastPage) =>
            lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    });
```

`getNextPageParam` returning `undefined` is what sets `hasNextPage` to false.
`data.pages` is an array of page results, flattened for rendering:

```jsx
data?.pages?.flatMap((page) => page.docs)
```

---

## 5.7 Code splitting — 330 kB → 78 kB gzip

```jsx
const Login       = lazy(() => import("../auth/login"));
const Register    = lazy(() => import("../auth/register"));
const Messages    = lazy(() => import("../pages/message.jsx"));
const MessageList = lazy(() => import("../pages/messageList.jsx"));
```

`lazy()` takes a function returning a dynamic `import()`. The bundler sees the
dynamic import and emits a **separate chunk**, fetched on first navigation.

`Suspense` is mandatory around lazy components — while the chunk is in flight
the component suspends, and with no boundary that propagates as an error.

```jsx
<Suspense fallback={<BlockLoader darkMode={darkMode} text="Loading" />}>
```

### The bigger win: dead imports

The build was 1,207 kB. Two unused imports accounted for most of it:

```js
import Aurora from "../assets/aurora.jsx";       // never rendered → pulls in `ogl`
import { GridScan } from "../assets/gridscan.jsx"; // never rendered → three.js,
                                                   // face-api.js, postprocessing
```

**A static `import` runs the module and bundles it whether or not you use the
binding.** Tree-shaking cannot help: these modules have side effects and the
bundler must assume they matter. Roughly 600 kB of JavaScript was downloaded
by every visitor for two components that were never on screen.

| | before | after |
|---|---|---|
| main chunk | 1,207 kB (330 kB gz) | **273 kB (80 kB gz)** |
| socket.io | in main | own chunk, 188 kB |
| login / register / chat | in main | 5–6 kB chunks each |

**Interview-ready claim:** "I cut the initial JS payload by about 4× — mostly
by deleting two imports that were never rendered, then route-level code
splitting for the rest."

---

## 5.8 Error boundaries

```jsx
export default class ErrorBoundary extends Component {
    static getDerivedStateFromError(error) { return { error }; }      // render phase
    componentDidCatch(error, info) { console.error(error, info); }    // commit phase
}
```

**Must be a class** — there is no hook equivalent, because these two lifecycle
methods have no hook API.

| Catches | Does not catch |
|---|---|
| render | event handlers |
| lifecycle methods | `setTimeout` / promises |
| child constructors | SSR, and errors in the boundary itself |

Why it was added: `videos.map is not a function` on the watch page unmounted
the **entire** React tree and left a blank white screen. With a boundary, the
failure is contained and the user gets a "Try again" button.

---

## 5.9 The axios interceptor: single-flight refresh + circuit breaker

```js
// frontend/src/api/api.jsx
let refreshPromise = null;
let refreshBlockedUntil = 0;
const REFRESH_COOLDOWN_MS = 30_000;
```

Three distinct problems, three mechanisms:

**1. Thundering herd.** Ten requests 401 at once. Without sharing, each fires
its own refresh, each rotates the token, and nine are invalidated by the
tenth — logging the user out.

```js
if (!refreshPromise) {
    refreshPromise = api.post("/users/refreshtoken")
        .finally(() => { refreshPromise = null; });
}
await refreshPromise;
```

`.finally` rather than `.then` so a *failed* refresh also clears the slot —
otherwise every later request awaits a permanently-rejected promise.

**2. Infinite loop.** The refresh call itself 401s → triggers a refresh →
repeat.

```js
const isAuthRoute = ["/users/refreshtoken", "/users/login", "/users/register"]
    .some((route) => url.includes(route));
```

plus `originalRequest._retry` so each request is retried at most once.

**3. Pointless storms.** An anonymous visitor produced ~90 requests per page:
every page calls `/currentuser`, every 401 triggers a refresh, the refresh
401s because there is no session, and the next navigation repeats it.

```js
catch (refreshError) {
    refreshBlockedUntil = Date.now() + REFRESH_COOLDOWN_MS;   // trip the breaker
    window.dispatchEvent(new Event("logout"));
}
```

A **circuit breaker**: once we know there is no session, stop asking for 30
seconds. `resetAuthState()` clears it on successful login.

---

## 5.10 Images: the pop-in fix

Three separate causes, worth knowing individually.

```jsx
<img loading="lazy" decoding="async" fetchPriority="low" />   // ❌
```

1. **`fetchPriority="low"`** told the browser to deprioritise every thumbnail,
   so they arrived late while scrolling. `loading="lazy"` alone already defers
   off-screen images, and the browser starts them ~1250 px ahead.
2. **The `<img>` was unmounted** when the hover preview started and remounted
   on mouse-out, so the thumbnail had to decode again from scratch. It now
   stays mounted and the `<video>` layers on top.
3. **No placeholder** — an undecoded image showed as a hard black rectangle
   that snapped to the picture. Now it fades in over a shimmer.

### The cached-image race

```jsx
<img
    ref={(node) => { if (node?.complete && node.naturalWidth > 0) markThumbLoaded(id); }}
    onLoad={() => markThumbLoaded(id)}
    onError={() => markThumbLoaded(id)}
/>
```

An image served from the HTTP cache can finish loading **before React attaches
the `onLoad` handler**. The event never fires and the element stays at
`opacity-0` forever. `complete && naturalWidth > 0` is the reliable check —
`complete` alone is also true for a *failed* load.

`onError` is there so a broken URL doesn't leave a permanent shimmer.

### Layout shift

```jsx
<div className="relative flex h-[102px] items-start gap-3 px-2 py-3">
```

The meta block has a fixed height and the views/age row is `absolute bottom-3`.
CSS grid rows size to their tallest item, so without a reservation a one-line
title made that card shorter and the whole row shifted as data streamed in.
The skeleton uses the identical `h-[102px]`, so swapping placeholder for real
content causes **zero** layout shift.

---

## 5.11 Where `localStorage` goes wrong

```jsx
const [darkMode, setDarkMode] = useState(() => {
    try {
        return JSON.parse(localStorage.getItem("darkMode")) ?? false;
    } catch {
        return false;
    }
});
```

Two failure modes the original ignored:

1. `JSON.parse(null)` is `null` (fine), but `JSON.parse("undefined")`
   **throws** — and a throw inside a `useState` initialiser blanks the entire
   app.
2. `localStorage` access itself throws in private mode or when site data is
   blocked.

```jsx
function readStoredTheme() {
    const stored = localStorage.getItem("themeSelected");
    const known = Object.values(themeObject).flatMap((g) => Object.values(g));
    return known.includes(stored) ? stored : DEFAULT_THEME;
}
```

The persisted value was an **asset URL**, and Vite fingerprints asset URLs at
build time (`/PCSmall1.jpg` in dev, `/assets/PCSmall1-a1b2c3.jpg` in prod).
A URL stored before a deploy pointed at a 404 afterwards. Validating against
the themes that currently exist makes it self-heal.

**General rule: never persist a value whose meaning can change between
builds.** Persist a stable key and resolve it at runtime.

---

## 5.12 Lifting state vs prop drilling — an honest critique

`App.jsx` holds `menubar`, `darkMode`, `themeSelected`, `profileSelected`,
`currentId`, `videoIdSelected`, `isLoggedIn` and passes all of them through
`AppRoutes` into `MainLayout` into `Navbar`.

That is **prop drilling**, and it is the main thing a reviewer would flag.

The fix is Context — ideally split so unrelated updates do not re-render
everything:

```jsx
<ThemeContext.Provider value={{ darkMode, setDarkMode }}>
<UIContext.Provider value={{ menubar, setMenubar }}>
```

Separate contexts matter: **any** context value change re-renders every
consumer, so one giant `AppContext` is barely better than drilling. Memoise
the value object too, or a new object literal each render defeats the point.

Note that `isLoggedIn` is now redundant — TanStack Query's `["currentUser"]`
cache is the single source of truth, and `Protected` reads it directly.
Keeping a duplicate boolean in `App` state is exactly the kind of derived
state that drifts out of sync.

---

Next: **[06 — Authentication](./06-AUTH.md)**
