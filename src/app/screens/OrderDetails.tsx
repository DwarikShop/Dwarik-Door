import { useParams, useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { StatusChip } from "../components/ui/StatusChip";
import { orders } from "../data/mockData";
import { ArrowLeft, Check, Truck, X } from "lucide-react";
import { toast } from "sonner";

export function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const order = orders.find((o) => o.id === id);

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Order not found</p>
      </div>
    );
  }

  const canCancel = order.status === "placed";

  const timeline = [
    { status: "placed", label: "Placed", active: true },
    {
      status: "in_progress",
      label: "In Progress",
      active: ["in_progress", "done", "shipped"].includes(order.status),
    },
    {
      status: "done",
      label: "Done",
      active: ["done", "shipped"].includes(order.status),
    },
    { status: "shipped", label: "Shipped", active: order.status === "shipped" },
  ];

  return (
    <div className="min-h-screen bg-background pb-8 overflow-x-hidden">
      <header className="bg-primary text-primary-foreground px-4 py-4 sticky top-0 z-40 shadow-md">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-primary-foreground/10 rounded-full transition-colors"
          >
            <ArrowLeft size={22} />
          </button>
          <h1 className="text-xl font-bold">Order Details</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Product card */}
        <Card className="p-4 gap-0">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-xs text-muted-foreground">Order ID</p>
              <p className="text-lg font-bold text-foreground">{order.id}</p>
            </div>
            <StatusChip status={order.status} />
          </div>

          <div className="flex gap-3 mb-3">
            <img
              src={order.productImage}
              alt={order.productName}
              className="w-20 h-20 rounded-xl object-cover shrink-0 bg-secondary"
            />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-foreground truncate">
                {order.productName}
              </p>
              <p className="text-xs text-muted-foreground mb-2">
                {order.productId}
              </p>
              <div className="space-y-0.5 text-sm">
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">Size:</span>{" "}
                  {order.height} × {order.width} {order.unit}
                </p>
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">Qty:</span>{" "}
                  {order.quantity} pcs
                </p>
              </div>
            </div>
          </div>

          {order.customization && (
            <div className="p-3 bg-secondary/60 rounded-xl">
              <p className="text-xs font-semibold text-foreground mb-1">
                Customization
              </p>
              <p className="text-sm text-muted-foreground">
                {order.customization}
              </p>
            </div>
          )}
        </Card>

        {/* Customer details */}
        <Card className="p-4 gap-0">
          <h3 className="font-bold text-foreground mb-3">Customer Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name</span>
              <span className="font-semibold text-foreground">
                {order.customerName || "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phone</span>
              <span className="font-semibold text-foreground">
                {order.customerPhone || "N/A"}
              </span>
            </div>
          </div>
        </Card>

        {/* Timeline */}
        <Card className="p-4 gap-0">
          <h3 className="font-bold text-foreground mb-4">Order Timeline</h3>
          <div className="relative">
            {timeline.map((step, index) => (
              <div
                key={step.status}
                className="flex gap-3 relative pb-5 last:pb-0"
              >
                {index < timeline.length - 1 && (
                  <div
                    className={`absolute left-3.5 top-8 w-0.5 h-full ${
                      step.active ? "bg-accent" : "bg-border"
                    }`}
                  />
                )}
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 ${
                    step.active
                      ? "bg-accent text-accent-foreground"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {step.active && <Check size={14} />}
                </div>
                <div className="flex-1 pt-0.5">
                  <p
                    className={`text-sm font-semibold ${
                      step.active ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {step.label}
                  </p>
                  {step.status === order.status && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {order.updatedAt.toLocaleDateString("en-IN")} at{" "}
                      {order.updatedAt.toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Order info */}
        <Card className="p-4 gap-0">
          <h3 className="font-bold text-foreground mb-3">Order Information</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Created</span>
              <span className="font-semibold text-foreground">
                {order.createdAt.toLocaleDateString("en-IN")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Updated</span>
              <span className="font-semibold text-foreground">
                {order.updatedAt.toLocaleDateString("en-IN")}
              </span>
            </div>
            {order.assignedTo && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Assigned To</span>
                <span className="font-semibold text-foreground">
                  {order.assignedTo}
                </span>
              </div>
            )}
          </div>
        </Card>

        {/* Actions */}
        {canCancel && (
          <Button
            variant="destructive"
            className="w-full"
            size="lg"
            onClick={() => {
              toast.success("Order cancelled");
              navigate(-1);
            }}
          >
            <X size={18} className="mr-2" />
            Cancel Order
          </Button>
        )}
      </main>
    </div>
  );
}
