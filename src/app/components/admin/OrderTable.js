import React from "react";

export default function OrderTable({
  setSelectedOrderId,
  currentOrdersSlice,
  setItemPage,
  selectedOrder
}) {
  return (
    <div>
      <table className="min-w-[700px] xl:min-w-full text-left border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-slate-400 font-semibold tracking-wider text-xs uppercase bg-slate-50/50 sticky top-0 backdrop-blur-sm z-10">
            <th className="p-3">Order ID</th>
            <th className="p-3">Customer</th>
            <th className="p-3">Date</th>
            <th className="p-3">Payment</th>
            <th className="p-3">Fulfillment</th>
            <th className="p-3 text-right">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {currentOrdersSlice.length === 0 ? (
            <tr>
              <td
                colSpan={6}
                className="p-8 text-center text-slate-400 font-medium"
              >
                No records match this filter.
              </td>
            </tr>
          ) : (
            currentOrdersSlice.map((order) => (
              <tr
                key={order.id}
                onClick={() => {
                  setSelectedOrderId(order.id);
                  setItemPage(1); // 👈 Resets item pagination when switching orders
                }}
                className={`cursor-pointer transition-colors ${
                  selectedOrder?.id === order.id
                    ? "bg-orange-50/40"
                    : "hover:bg-slate-50"
                }`}
              >
                <td className="p-3 font-bold text-orange-600">{order.id}</td>
                <td className="p-3 font-medium text-slate-700">
                  <div className="truncate max-w-[160px]">
                    {order.customerName}
                  </div>
                  <div className="text-xs text-slate-400 font-normal truncate max-w-[160px]">
                    {order.customerEmail}
                  </div>
                </td>
                <td className="p-3 text-slate-500 whitespace-nowrap">
                  {new Date(order.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </td>
                <td className="p-3">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-bold ${
                      order.paymentStatus === "Paid"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {order.paymentStatus}
                  </span>
                </td>
                <td className="p-3">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
                      order.status === "Delivered"
                        ? "bg-[#111827] text-white"
                        : order.status === "Shipped"
                          ? "bg-slate-100 text-[#111827]"
                          : order.status === "Cancelled"
                            ? "bg-slate-200 text-slate-500 line-through"
                            : "bg-orange-50 text-orange-700"
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="p-3 text-right font-black text-[#111827]">
                  ${Number(order.totalAmount).toFixed(2)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
