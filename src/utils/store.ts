// Centralized Integrated Data Hub
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
  orders: Order[];
  notifications: Notification[];
  chartData: { name: string; value: number }[]; // Keeping for backward compatibility or Analytics
  chartDataPeriods: {
    week: { name: string; value: number }[];
    month: { name: string; value: number }[];
    year: { name: string; value: number }[];
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
  const saved = localStorage.getItem("NexBiz_business_hub");
  if (!saved) return DEFAULT_DATA;
  try {
    const parsed = JSON.parse(saved);
    // Ensure new fields exist for old data
    return {
      ...DEFAULT_DATA,
      ...parsed,
      chartDataPeriods: parsed.chartDataPeriods || DEFAULT_DATA.chartDataPeriods,
      notifications: parsed.notifications || DEFAULT_DATA.notifications
    };
  } catch {
    return DEFAULT_DATA;
  }
};

export const addNotification = (notification: Omit<Notification, "id" | "time">) => {
  const data = getBusinessData();
  const newNotification: Notification = {
    ...notification,
    id: `n${Date.now()}`,
    time: "Just now"
  };
  const newNotifications = [newNotification, ...data.notifications].slice(0, 10); // Keep only last 10
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
  localStorage.setItem("NexBiz_business_hub", JSON.stringify(data));
  window.dispatchEvent(new CustomEvent(BUSINESS_DATA_UPDATED, { detail: data }));
  return data;
};

export const updateBusinessData = (updates: Partial<BusinessData>) => {
  const data = getBusinessData();
  return syncStore({ ...data, ...updates });
};

export const updateOrder = (orderId: string, status: Order["status"]) => {
  const data = getBusinessData();
  const orderIndex = data.orders.findIndex(o => o.id === orderId);
  if (orderIndex === -1) return data;

  const order = data.orders[orderIndex];
  const oldStatus = order.status;
  
  // Create shallow copies
  const newOrders = [...data.orders];
  newOrders[orderIndex] = { ...order, status };

  let newRevenue = data.revenue;
  let newSales = data.sales;
  let newChartDataPeriods = { ...data.chartDataPeriods };

  // If newly approved
  if (oldStatus !== "Completed" && status === "Completed") {
    newRevenue += order.rawTotal;
    newSales += 1;
    
    // Update Week Data (assuming Sun for now as a simple logic, or matching date)
    // In a real app we'd parse order.date
    const weekData = [...newChartDataPeriods.week];
    const dayIndex = 6; // Sunday
    weekData[dayIndex] = { ...weekData[dayIndex], value: weekData[dayIndex].value + order.rawTotal };
    newChartDataPeriods.week = weekData;
    
    // Add notification
    addNotification({
      text: `Order ${orderId} marked as Completed`,
      dot: "bg-emerald-500"
    });
  } else if (oldStatus !== status) {
    // Add notification for other status changes
    addNotification({
      text: `Order ${orderId} status updated to ${status}`,
      dot: "bg-indigo-500"
    });
  }

  return syncStore({
    ...data,
    orders: newOrders,
    revenue: newRevenue,
    sales: newSales,
    chartDataPeriods: newChartDataPeriods
  });
};

export const syncChartFromOrders = () => {
  const data = getBusinessData();
  const completedOrders = data.orders.filter(o => o.status === "Completed");
  
  // Calculate total revenue from all completed orders
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.rawTotal, 0);
  const totalSales = completedOrders.length;

  // For a simple demo, we'll just distribute the revenue across the week data
  // In a real scenario, you'd group by date.
  const newWeekData = [...DEFAULT_DATA.chartDataPeriods.week];
  // Add actual order totals to the "Sunday" (current day in this mockup)
  const sunIdx = 6;
  newWeekData[sunIdx] = { ...newWeekData[sunIdx], value: newWeekData[sunIdx].value + totalRevenue };

  const updatedData = syncStore({
    ...data,
    revenue: totalRevenue,
    sales: totalSales,
    chartDataPeriods: {
      ...data.chartDataPeriods,
      week: newWeekData
    }
  });
  
  addNotification({
    text: "Chart data synced from orders",
    dot: "bg-indigo-500"
  });
  
  return updatedData;
};

export const addOrder = (order: Order) => {
  const data = getBusinessData();
  const newData = {
    ...data,
    orders: [order, ...data.orders]
  };
  
  addNotification({
    text: `New order ${order.id} received from ${order.customer}`,
    dot: "bg-emerald-500"
  });
  
  return syncStore(newData);
};

export const deleteOrder = (orderId: string) => {
  const data = getBusinessData();
  
  addNotification({
    text: `Order ${orderId} deleted`,
    dot: "bg-rose-500"
  });
  
  return syncStore({
    ...data,
    orders: data.orders.filter(o => o.id !== orderId)
  });
};

export const applyOptimization = () => {
  const data = getBusinessData();
  // Simulate optimization impact
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
