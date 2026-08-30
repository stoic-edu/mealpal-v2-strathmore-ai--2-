import type { Order, OrderItem, PlateLine } from "@/lib/mock-data";
import { getServingsFor, formatPortionLabel } from "@/lib/mock-data";

const STORAGE_KEY = "meal_buddy_orders";
export const ORDER_UPDATE_EVENT = "meal_buddy_order_update";
// Once a student confirms they're on the way, the kitchen only ever prepares this
// many orders at once so the line doesn't get overwhelmed.
export const KITCHEN_CONCURRENT_LIMIT = 4;
// How many people ahead of you triggers the "head to the cafeteria" nudge.
export const NOTIFY_AT_PEOPLE_AHEAD = 3;

export function createOrderFromPlate(lines: PlateLine[], cafeteria: string, paymentMethod: string): Order {
  const items: OrderItem[] = lines.map((l) => {
    const info = getServingsFor(l.food, l.portion);
    return {
      name: formatPortionLabel(l.food, l.portion),
      portion: l.portion,
      quantity: l.quantity,
      price: info.price * l.quantity,
      calories: info.calories * l.quantity,
      allergens: l.food.allergens,
    };
  });
  const total = items.reduce((sum, i) => sum + i.price, 0);
  const startingPeopleAhead = 6 + Math.floor(Math.random() * 6); // 6–11 people ahead

  return {
    id: `ord-${Date.now()}`,
    referenceCode: `MB-STU-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 89999)}`,
    status: "queued",
    items,
    total,
    cafeteria,
    peopleAhead: startingPeopleAhead,
    startingPeopleAhead,
    notified3Ahead: false,
    pickupEta: `~${Math.max(5, startingPeopleAhead * 2)} min`,
    createdAt: new Date().toISOString(),
    paymentMethod,
  };
}

export function getStoredOrders(): Order[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Order[]) : [];
  } catch {
    return [];
  }
}

export function saveOrders(orders: Order[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  window.dispatchEvent(new Event(ORDER_UPDATE_EVENT));
}

export function addOrder(order: Order) {
  const existing = getStoredOrders();
  saveOrders([order, ...existing]);
}

export function updateOrder(orderId: string, patch: Partial<Order>) {
  const existing = getStoredOrders();
  saveOrders(existing.map((o) => (o.id === orderId ? { ...o, ...patch } : o)));
}

/** Orders the kitchen should actively be preparing right now: only ones the student
 *  has confirmed they're on the way for, oldest-confirmed first, capped so the
 *  kitchen is never juggling more than KITCHEN_CONCURRENT_LIMIT at once. */
export function getKitchenActiveOrders(orders: Order[]): Order[] {
  return orders
    .filter((o) => o.status === "on_the_way")
    .sort((a, b) => new Date(a.onTheWaySince || a.createdAt).getTime() - new Date(b.onTheWaySince || b.createdAt).getTime())
    .slice(0, KITCHEN_CONCURRENT_LIMIT);
}
