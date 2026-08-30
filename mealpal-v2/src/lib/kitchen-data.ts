export interface KitchenOrder {
  id: string;
  referenceCode: string;
  items: {
    name: string;
    quantity: number;
    notes?: string;
    allergens?: string[];
  }[];
  placedAt: string;
  servedAt?: string;
  servedBy?: string;
  status: "active" | "served";
  soundPlayed?: boolean;
}

export const kitchenOrders: KitchenOrder[] = [
  {
    id: "ord-001",
    referenceCode: "MP-UTM-2026-39284",
    items: [
      { name: "Grilled Chicken Rice", quantity: 1, notes: "Extra vegetables, less oil" },
      { name: "Iced Lemon Tea", quantity: 1 },
    ],
    placedAt: "2026-07-05T12:05:00Z",
    status: "active",
  },
  {
    id: "ord-002",
    referenceCode: "MP-UTM-2026-39285",
    items: [
      { name: "Vegetable Stir-Fry", quantity: 1, notes: "No garlic, extra tofu", allergens: ["Peanuts"] },
    ],
    placedAt: "2026-07-05T12:12:00Z",
    status: "active",
  },
  {
    id: "ord-003",
    referenceCode: "MP-UTM-2026-39286",
    items: [
      { name: "Beef Nasi Lemak", quantity: 2, notes: "Extra sambal, no cucumber" },
    ],
    placedAt: "2026-07-05T12:18:00Z",
    status: "active",
  },
  {
    id: "ord-004",
    referenceCode: "MP-UTM-2026-39287",
    items: [
      { name: "Salmon Teriyaki Bowl", quantity: 1, notes: "Extra sauce on side", allergens: ["Fish", "Soy"] },
    ],
    placedAt: "2026-07-05T12:02:00Z",
    status: "active",
  },
  {
    id: "ord-005",
    referenceCode: "MP-UTM-2026-39288",
    items: [
      { name: "Chicken Wrap", quantity: 1, notes: "No onion, extra sauce", allergens: ["Dairy"] },
      { name: "Mineral Water", quantity: 1 },
    ],
    placedAt: "2026-07-05T11:55:00Z",
    status: "active",
  },
  {
    id: "ord-006",
    referenceCode: "MP-UTM-2026-39289",
    items: [
      { name: "Vegetable Biryani", quantity: 1, notes: "Mild spice, extra raita" },
    ],
    placedAt: "2026-07-05T11:48:00Z",
    servedAt: "2026-07-05T12:08:00Z",
    servedBy: "Chef Ali",
    status: "served",
  },
  {
    id: "ord-007",
    referenceCode: "MP-UTM-2026-39290",
    items: [
      { name: "Tom Yam Soup", quantity: 1 },
      { name: "Steam Rice", quantity: 1 },
    ],
    placedAt: "2026-07-05T12:00:00Z",
    servedAt: "2026-07-05T12:15:00Z",
    servedBy: "Chef Ali",
    status: "served",
  },
  {
    id: "ord-008",
    referenceCode: "MP-UTM-2026-39291",
    items: [
      { name: "Mee Goreng", quantity: 1, notes: "No egg" },
    ],
    placedAt: "2026-07-05T12:10:00Z",
    status: "active",
  },
];

export function getWaitSeconds(placedAt: string): number {
  return Math.floor((Date.now() - new Date(placedAt).getTime()) / 1000);
}

export function formatWaitTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins >= 60) {
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `${hrs}h ${remMins}m ${secs}s`;
  }
  return `${mins}m ${secs.toString().padStart(2, "0")}s`;
}

export function formatPlacedTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
}

export function getHourBucket(iso: string): number {
  return new Date(iso).getHours();
}