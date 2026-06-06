import React, { createContext, useContext, useState, useEffect } from 'react';

interface NavigateOptions {
  replace?: boolean;
}

interface RouterContextType {
  path: string;
  navigate: (to: string, options?: NavigateOptions) => void;
}

const RouterContext = createContext<RouterContextType>({
  path: window.location.pathname,
  navigate: () => {},
});

function splitRoute(to: string) {
  const queryIndex = to.indexOf('?');
  if (queryIndex === -1) {
    return { pathname: to, href: to };
  }
  return {
    pathname: to.slice(0, queryIndex),
    href: to,
  };
}

export function RouterProvider({ children }: { children: React.ReactNode }) {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (to: string, options?: NavigateOptions) => {
    const { pathname, href } = splitRoute(to);
    const nextSearch = href.includes('?') ? href.slice(href.indexOf('?')) : '';

    if (window.location.pathname !== pathname || window.location.search !== nextSearch) {
      if (options?.replace) {
        window.history.replaceState(null, '', href);
      } else {
        window.history.pushState(null, '', href);
      }
      setPath(pathname);
    }
  };

  return (
    <RouterContext.Provider value={{ path, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  return useContext(RouterContext);
}

export function useNavigate() {
  const { navigate } = useRouter();
  return navigate;
}

interface RouteProps {
  path: string;
  element: React.ReactNode;
}

export function Route({ path, element }: RouteProps) {
  const { path: currentPath } = useRouter();
  if (currentPath === path) {
    return <>{element}</>;
  }
  return null;
}

interface LinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
}

export function Link({ to, children, className }: LinkProps) {
  const { navigate } = useRouter();
  return (
    <a
      href={to}
      className={className}
      onClick={(e) => {
        e.preventDefault();
        navigate(to);
      }}
    >
      {children}
    </a>
  );
}
