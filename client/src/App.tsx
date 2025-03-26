import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Profile from "@/pages/Profile";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./hooks/use-auth";

// Protected route component that redirects to login if not authenticated
function ProtectedRoute({ component: Component, ...rest }: { component: React.ComponentType<any>, [x: string]: any }) {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  // While checking auth state, show nothing
  if (loading) return null;

  // If not authenticated, redirect to login
  if (!user) {
    setLocation("/login");
    return null;
  }

  // If authenticated, render the protected component
  return <Component {...rest} />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => <ProtectedRoute component={Home} />} />
      <Route path="/profile/:username" component={(params) => <ProtectedRoute component={Profile} username={params.username} />} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
