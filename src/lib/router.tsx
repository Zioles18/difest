import React, { createContext, useContext, useState } from "react";
export type Route = "/login" | "/" | "/profile" | "/orders" | "/customers" | "/analytics" | "/settings";
interface RouterContextType {
    route: Route;
    navigate: (to: Route) => void;
    outletContext: any;
    setOutletContext: (ctx: any) => void;
}
const RouterCtx = createContext<RouterContextType>({
    route: "/login",
    navigate: () => { },
    outletContext: {},
    setOutletContext: () => { },
});
export function RouterProvider({ children }: {
    children: React.ReactNode;
}) {
    const [route, setRoute] = useState<Route>(() => {
        const stored = localStorage.getItem("NexBiz_auth");
        return stored === "true" ? "/" : "/login";
    });
    const [outletContext, setOutletContext] = useState<any>({});
    const navigate = (to: Route) => setRoute(to);
    return (<RouterCtx.Provider value={{ route, navigate, outletContext, setOutletContext }}>
      {children}
    </RouterCtx.Provider>);
}
export function useNavigate() {
    return useContext(RouterCtx).navigate;
}
export function useLocation() {
    const { route } = useContext(RouterCtx);
    return { pathname: route, search: "", hash: "" };
}
export function useOutletContext<T = any>() {
    return useContext(RouterCtx).outletContext as T;
}
export function useSetOutletContext() {
    const { setOutletContext } = useContext(RouterCtx);
    return setOutletContext;
}
export function Outlet() {
    return null;
}
export function Link({ to, children, className, onClick, ...rest }: {
    to: string;
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    [key: string]: any;
}) {
    const { navigate } = useContext(RouterCtx);
    return (<button type="button" className={className} onClick={() => { navigate(to as Route); onClick?.(); }} {...rest}>
      {children}
    </button>);
}
export function NavLink({ to, children, className, onClick, end, ...rest }: {
    to: string;
    children: React.ReactNode | ((props: {
        isActive: boolean;
    }) => React.ReactNode);
    className?: string | ((props: {
        isActive: boolean;
    }) => string);
    onClick?: () => void;
    end?: boolean;
    [key: string]: any;
}) {
    const { route, navigate } = useContext(RouterCtx);
    const isActive = end ? route === to : route.startsWith(to);
    const cls = typeof className === "function" ? className({ isActive }) : className;
    const childContent = typeof children === "function" ? (children as Function)({ isActive }) : children;
    return (<button type="button" className={cls} onClick={() => { navigate(to as Route); onClick?.(); }} {...rest}>
      {childContent}
    </button>);
}
export function Navigate({ to }: {
    to: string;
}) {
    const { navigate } = useContext(RouterCtx);
    React.useEffect(() => { navigate(to); }, []);
    return null;
}
