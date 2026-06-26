import { auth } from "./auth";
export const BUSINESS_DATA_UPDATED = "NexBiz_business_data_updated";
export const NEW_NOTIFICATION = "NexBiz_new_notification";
export interface Order {
    id: string;
    customer: string;
    date: string;
    total: string;
    rawTotal: number;
    status: "Completed" | "Processing" | "Pending";
    items: number;
    avatar: string;
}
export interface Notification {
    id: string;
    text: string;
    time: string;
    dot: "bg-emerald-500" | "bg-indigo-500" | "bg-amber-500" | "bg-rose-500";
}
export interface BusinessData {
    revenue: number;
    revenueGoal: number;
    sales: number;
    activeUsers: number;
    conversion: number;
    previousRevenue?: number;
    previousSales?: number;
    previousActiveUsers?: number;
    previousConversion?: number;
    orders: Order[];
    notifications: Notification[];
    chartData: {
        name: string;
        value: number;
    }[];
    chartDataPeriods: {
        week: {
            name: string;
            value: number;
        }[];
        month: {
            name: string;
            value: number;
        }[];
        year: {
            name: string;
            value: number;
        }[];
    };
}
const INITIAL_ORDERS: Order[] = [
    { id: "#2890", customer: "Sarah Chen", date: "Jun 09, 2024", total: "$128.50", rawTotal: 128.5, status: "Processing", items: 1, avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" },
    { id: "#2889", customer: "Alex Rivera", date: "Jun 08, 2024", total: "$420.00", rawTotal: 420.0, status: "Completed", items: 3, avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" },
    { id: "#2888", customer: "Marcus Johnson", date: "Jun 07, 2024", total: "$892.00", rawTotal: 892.0, status: "Pending", items: 5, avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" },
];
const INITIAL_NOTIFICATIONS: Notification[] = [
    { id: "n1", text: "New order #2890 received", time: "2m ago", dot: "bg-emerald-500" },
    { id: "n2", text: "Monthly report is ready", time: "1h ago", dot: "bg-indigo-500" },
    { id: "n3", text: "Server usage at 82%", time: "3h ago", dot: "bg-amber-500" },
];
const getBusinessHubKey = () => {
    const email = auth.getCurrentEmail();
    return email ? `NexBiz_business_hub_${email}` : "NexBiz_business_hub";
};
const getCustomersKey = () => {
    const email = auth.getCurrentEmail();
    return email ? `NexBiz_customers_${email}` : "NexBiz_customers";
};
const getNotificationsForCurrentUser = (): Notification[] => {
    const email = auth.getCurrentEmail();
    const key = email ? `NexBiz_notifications_${email}` : "NexBiz_notifications_default";
    const saved = localStorage.getItem(key);
    if (!saved) {
        return INITIAL_NOTIFICATIONS;
    }
    try {
        return JSON.parse(saved);
    }
    catch {
        return INITIAL_NOTIFICATIONS;
    }
};
const saveNotificationsForCurrentUser = (notifications: Notification[]) => {
    const email = auth.getCurrentEmail();
    const key = email ? `NexBiz_notifications_${email}` : "NexBiz_notifications_default";
    localStorage.setItem(key, JSON.stringify(notifications));
};
const DEFAULT_DATA: BusinessData = {
    revenue: 4200,
    revenueGoal: 200000,
    sales: 120,
    activeUsers: 45,
    conversion: 1.25,
    orders: INITIAL_ORDERS,
    notifications: INITIAL_NOTIFICATIONS,
    chartData: [
        { name: "Mon", value: 620 },
        { name: "Tue", value: 940 },
        { name: "Wed", value: 780 },
        { name: "Thu", value: 1350 },
        { name: "Fri", value: 1800 },
        { name: "Sat", value: 2300 },
        { name: "Sun", value: 2100 },
    ],
    chartDataPeriods: {
        week: [
            { name: "Mon", value: 620 },
            { name: "Tue", value: 940 },
            { name: "Wed", value: 780 },
            { name: "Thu", value: 1350 },
            { name: "Fri", value: 1800 },
            { name: "Sat", value: 2300 },
            { name: "Sun", value: 2100 },
        ],
        month: [
            { name: "Wk 1", value: 4200 },
            { name: "Wk 2", value: 7800 },
            { name: "Wk 3", value: 6500 },
            { name: "Wk 4", value: 9100 },
        ],
        year: [
            { name: "Jan", value: 12000 },
            { name: "Feb", value: 18500 },
            { name: "Mar", value: 15200 },
            { name: "Apr", value: 22000 },
            { name: "May", value: 28400 },
            { name: "Jun", value: 35000 },
            { name: "Jul", value: 31000 },
            { name: "Aug", value: 38000 },
            { name: "Sep", value: 42000 },
            { name: "Oct", value: 39000 },
            { name: "Nov", value: 45000 },
            { name: "Dec", value: 51000 },
        ]
    }
};
export const getBusinessData = (): BusinessData => {
    const saved = localStorage.getItem(getBusinessHubKey());
    const savedCustomers = localStorage.getItem(getCustomersKey());
    const customersCount = savedCustomers ? JSON.parse(savedCustomers).length : 3;
    if (!saved) {
        const completedInitialOrders = INITIAL_ORDERS.filter(o => o.status === "Completed");
        const initialRevenue = completedInitialOrders.reduce((sum, o) => sum + o.rawTotal, 0);
        const initialSales = completedInitialOrders.length;
        return {
            ...DEFAULT_DATA,
            revenue: initialRevenue,
            sales: initialSales,
            activeUsers: customersCount,
            conversion: 4.5,
            previousRevenue: initialRevenue * 0.9,
            previousSales: Math.max(0, initialSales - 1),
            previousActiveUsers: Math.max(1, customersCount - 1),
            previousConversion: 4.0,
            notifications: getNotificationsForCurrentUser()
        };
    }
    try {
        const parsed = JSON.parse(saved);
        const completedOrders = (parsed.orders || []).filter((o: Order) => o.status === "Completed");
        const totalRevenue = completedOrders.reduce((sum: number, o: Order) => sum + (o.rawTotal || 0), 0);
        const totalSales = completedOrders.length;
        return {
            ...DEFAULT_DATA,
            ...parsed,
            revenue: totalRevenue,
            sales: totalSales,
            activeUsers: customersCount,
            conversion: parsed.conversion || 4.5,
            previousRevenue: parsed.previousRevenue !== undefined ? parsed.previousRevenue : (totalRevenue * 0.9),
            previousSales: parsed.previousSales !== undefined ? parsed.previousSales : Math.max(0, totalSales - 1),
            previousActiveUsers: parsed.previousActiveUsers !== undefined ? parsed.previousActiveUsers : Math.max(1, customersCount - 1),
            previousConversion: parsed.previousConversion !== undefined ? parsed.previousConversion : (parsed.conversion ? Math.max(1, parsed.conversion - 0.5) : 4.0),
            chartDataPeriods: parsed.chartDataPeriods || DEFAULT_DATA.chartDataPeriods,
            notifications: getNotificationsForCurrentUser()
        };
    }
    catch {
        const completedInitialOrders = INITIAL_ORDERS.filter(o => o.status === "Completed");
        const initialRevenue = completedInitialOrders.reduce((sum, o) => sum + o.rawTotal, 0);
        const initialSales = completedInitialOrders.length;
        return {
            ...DEFAULT_DATA,
            revenue: initialRevenue,
            sales: initialSales,
            activeUsers: customersCount,
            conversion: 4.5,
            previousRevenue: initialRevenue * 0.9,
            previousSales: Math.max(0, initialSales - 1),
            previousActiveUsers: Math.max(1, customersCount - 1),
            previousConversion: 4.0,
            notifications: getNotificationsForCurrentUser()
        };
    }
};
export const addNotification = (notification: Omit<Notification, "id" | "time">) => {
    const data = getBusinessData();
    const newNotification: Notification = {
        ...notification,
        id: `n${Date.now()}`,
        time: "Just now"
    };
    const newNotifications = [newNotification, ...data.notifications].slice(0, 10);
    const updatedData = { ...data, notifications: newNotifications };
    syncStore(updatedData);
    window.dispatchEvent(new CustomEvent(NEW_NOTIFICATION, { detail: newNotification }));
    return updatedData;
};
export const deleteNotification = (id: string) => {
    const data = getBusinessData();
    const newNotifications = data.notifications.filter(n => n.id !== id);
    const updatedData = { ...data, notifications: newNotifications };
    syncStore(updatedData);
    return updatedData;
};
export const clearAllNotifications = () => {
    const data = getBusinessData();
    const updatedData = { ...data, notifications: [] };
    syncStore(updatedData);
    return updatedData;
};
export const syncStore = (data: BusinessData) => {
    const { notifications, ...restData } = data;
    localStorage.setItem(getBusinessHubKey(), JSON.stringify(restData));
    if (notifications) {
        saveNotificationsForCurrentUser(notifications);
    }
    window.dispatchEvent(new CustomEvent(BUSINESS_DATA_UPDATED, { detail: data }));
    return data;
};
export const updateBusinessData = (updates: Partial<BusinessData>) => {
    const data = getBusinessData();
    const nextData = { ...data, ...updates };
    if (updates.conversion !== undefined && updates.conversion !== data.conversion) {
        nextData.previousConversion = data.conversion;
    }
    if (updates.revenue !== undefined && updates.revenue !== data.revenue) {
        nextData.previousRevenue = data.revenue;
    }
    if (updates.sales !== undefined && updates.sales !== data.sales) {
        nextData.previousSales = data.sales;
    }
    if (updates.activeUsers !== undefined && updates.activeUsers !== data.activeUsers) {
        nextData.previousActiveUsers = data.activeUsers;
    }
    return syncStore(nextData);
};
export const updateOrder = (orderId: string, status: Order["status"]) => {
    const data = getBusinessData();
    const orderIndex = data.orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1)
        return data;
    const order = data.orders[orderIndex];
    const oldStatus = order.status;
    const newOrders = [...data.orders];
    newOrders[orderIndex] = { ...order, status };
    let newRevenue = data.revenue;
    let newSales = data.sales;
    let newChartDataPeriods = { ...data.chartDataPeriods };
    let newNotification: Omit<Notification, "id" | "time"> | null = null;
    if (oldStatus !== "Completed" && status === "Completed") {
        newRevenue += order.rawTotal;
        newSales += 1;
        const weekData = [...newChartDataPeriods.week];
        const dayIndex = 6;
        weekData[dayIndex] = { ...weekData[dayIndex], value: weekData[dayIndex].value + order.rawTotal };
        newChartDataPeriods.week = weekData;
        newNotification = {
            text: `Order ${orderId} marked as Completed`,
            dot: "bg-emerald-500"
        };
    }
    else if (oldStatus !== status) {
        newNotification = {
            text: `Order ${orderId} status updated to ${status}`,
            dot: "bg-indigo-500"
        };
    }
    let newNotifications = data.notifications;
    if (newNotification) {
        const notification: Notification = { ...newNotification, id: `n${Date.now()}`, time: "Just now" };
        newNotifications = [notification, ...data.notifications].slice(0, 10);
        window.dispatchEvent(new CustomEvent(NEW_NOTIFICATION, { detail: notification }));
    }
    const nextData: BusinessData = {
        ...data,
        orders: newOrders,
        revenue: newRevenue,
        sales: newSales,
        chartDataPeriods: newChartDataPeriods,
        notifications: newNotifications
    };
    if (newRevenue !== data.revenue) {
        nextData.previousRevenue = data.revenue;
    }
    if (newSales !== data.sales) {
        nextData.previousSales = data.sales;
    }
    return syncStore(nextData);
};
export const syncChartFromOrders = () => {
    const data = getBusinessData();
    const completedOrders = data.orders.filter(o => o.status === "Completed");
    const totalRevenue = completedOrders.reduce((sum, o) => sum + o.rawTotal, 0);
    const totalSales = completedOrders.length;
    const newWeekData = [...DEFAULT_DATA.chartDataPeriods.week];
    const sunIdx = 6;
    newWeekData[sunIdx] = { ...newWeekData[sunIdx], value: newWeekData[sunIdx].value + totalRevenue };
    const nextData: BusinessData = {
        ...data,
        revenue: totalRevenue,
        sales: totalSales,
        chartDataPeriods: {
            ...data.chartDataPeriods,
            week: newWeekData
        }
    };
    if (totalRevenue !== data.revenue) {
        nextData.previousRevenue = data.revenue;
    }
    if (totalSales !== data.sales) {
        nextData.previousSales = data.sales;
    }
    const updatedData = syncStore(nextData);
    addNotification({
        text: "Chart data synced from orders",
        dot: "bg-indigo-500"
    });
    return updatedData;
};
export const addOrder = (order: Order) => {
    const data = getBusinessData();
    const notification: Notification = {
        id: `n${Date.now()}`,
        text: `New order ${order.id} received from ${order.customer}`,
        time: "Just now",
        dot: "bg-emerald-500"
    };
    const newOrders = [order, ...data.orders];
    const completedOrders = newOrders.filter(o => o.status === "Completed");
    const newRevenue = completedOrders.reduce((sum, o) => sum + o.rawTotal, 0);
    const newSales = completedOrders.length;
    const savedCustomers = localStorage.getItem(getCustomersKey());
    const customersCount = savedCustomers ? JSON.parse(savedCustomers).length : 3;
    const nextData: BusinessData = {
        ...data,
        orders: newOrders,
        notifications: [notification, ...data.notifications].slice(0, 10),
        revenue: newRevenue,
        sales: newSales,
        activeUsers: customersCount
    };
    if (newRevenue !== data.revenue) {
        nextData.previousRevenue = data.revenue;
    }
    if (newSales !== data.sales) {
        nextData.previousSales = data.sales;
    }
    if (customersCount !== data.activeUsers) {
        nextData.previousActiveUsers = data.activeUsers;
    }
    syncStore(nextData);
    window.dispatchEvent(new CustomEvent(NEW_NOTIFICATION, { detail: notification }));
    return nextData;
};
export const deleteOrder = (orderId: string) => {
    const data = getBusinessData();
    const notification: Notification = {
        id: `n${Date.now()}`,
        text: `Order ${orderId} deleted`,
        time: "Just now",
        dot: "bg-rose-500"
    };
    const newOrders = data.orders.filter(o => o.id !== orderId);
    const completedOrders = newOrders.filter(o => o.status === "Completed");
    const newRevenue = completedOrders.reduce((sum, o) => sum + o.rawTotal, 0);
    const newSales = completedOrders.length;
    const savedCustomers = localStorage.getItem(getCustomersKey());
    const customersCount = savedCustomers ? JSON.parse(savedCustomers).length : 3;
    const nextData: BusinessData = {
        ...data,
        orders: newOrders,
        notifications: [notification, ...data.notifications].slice(0, 10),
        revenue: newRevenue,
        sales: newSales,
        activeUsers: customersCount
    };
    if (newRevenue !== data.revenue) {
        nextData.previousRevenue = data.revenue;
    }
    if (newSales !== data.sales) {
        nextData.previousSales = data.sales;
    }
    if (customersCount !== data.activeUsers) {
        nextData.previousActiveUsers = data.activeUsers;
    }
    syncStore(nextData);
    window.dispatchEvent(new CustomEvent(NEW_NOTIFICATION, { detail: notification }));
    return nextData;
};
export const applyOptimization = () => {
    const data = getBusinessData();
    const boost = 24500;
    const newRevenue = data.revenue + boost;
    const newConversion = Math.min(10, data.conversion + 1.2);
    const newWeekData = data.chartDataPeriods.week.map(d => ({
        ...d,
        value: Math.round(d.value * 1.15)
    }));
    const updatedData = syncStore({
        ...data,
        revenue: newRevenue,
        conversion: Number(newConversion.toFixed(2)),
        previousRevenue: data.revenue,
        previousConversion: data.conversion,
        chartDataPeriods: {
            ...data.chartDataPeriods,
            week: newWeekData
        }
    });
    addNotification({
        text: "AI optimization applied! Revenue boosted by +$24,500",
        dot: "bg-emerald-500"
    });
    return updatedData;
};
