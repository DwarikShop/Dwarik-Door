import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { StatusChip } from "../components/ui/StatusChip";
import { orders } from "../data/mockData";
import { ArrowLeft, Play, Check, Truck, X } from "lucide-react";
import { toast } from "sonner";

export function EmployeeOrderWorkflow() {
  const { id } = useParams();
  const navigate = useNavigate();
  const order = orders.find((o) => o.id === id);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState<"damaged" | "other">(
    "damaged",
  );
  const [rejectComment, setRejectComment] = useState("");

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Order not found</p>
      </div>
    );
  }

  const handleStartWork = () => {
    toast.success("Order moved to In Progress");
    navigate(-1);
  };

  const handleMarkDone = () => {
    toast.success("Order marked as Done");
    navigate(-1);
  };

  const handleShip = () => {
    toast.success("Order marked as Shipped");
    navigate(-1);
  };

  const handleReject = () => {
    if (!rejectComment.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    if (rejectReason === "damaged") {
      toast.info("Inventory marked as damaged");
    } else {
      toast.info("Stock returned to inventory");
    }
    toast.success("Order rejected");
    setShowRejectModal(false);
    navigate(-1);
  };

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
          <h1 className="text-xl font-bold">Order Workflow</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Order summary */}
        <Card className="p-4 gap-0">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-xs text-muted-foreground">Order ID</p>
              <p className="text-lg font-bold text-foreground">{order.id}</p>
            </div>
            <StatusChip status={order.status} />
          </div>

          <div className="flex gap-3">
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
            <div className="mt-3 p-3 bg-warning/5 border border-warning/20 rounded-xl">
              <p className="text-xs font-semibold text-warning mb-1">
                ⚠️ Customization Required
              </p>
              <p className="text-sm text-foreground">{order.customization}</p>
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

        {/* Actions */}
        <Card className="p-4 gap-0">
          <h3 className="font-bold text-foreground mb-3">Actions</h3>
          <div className="space-y-3">
            {order.status === "placed" && (
              <>
                <Button className="w-full gap-2" onClick={handleStartWork}>
                  <Play size={18} />
                  Start Work
                </Button>
                <Button
                  variant="destructive"
                  className="w-full gap-2"
                  onClick={() => setShowRejectModal(true)}
                >
                  <X size={18} />
                  Reject Order
                </Button>
              </>
            )}

            {order.status === "in_progress" && (
              <>
                <Button
                  className="w-full gap-2 bg-success hover:bg-success/90 text-success-foreground"
                  onClick={handleMarkDone}
                >
                  <Check size={18} />
                  Mark as Done
                </Button>
                <Button
                  variant="destructive"
                  className="w-full gap-2"
                  onClick={() => setShowRejectModal(true)}
                >
                  <X size={18} />
                  Reject Order
                </Button>
              </>
            )}

            {order.status === "done" && (
              <Button className="w-full gap-2" onClick={handleShip}>
                <Truck size={18} />
                Mark as Shipped
              </Button>
            )}

            {order.status === "shipped" && (
              <div className="flex flex-col items-center py-6 text-center">
                <Check className="text-success mb-2" size={40} />
                <p className="text-sm text-muted-foreground">
                  This order has been shipped
                </p>
              </div>
            )}
          </div>
        </Card>
      </main>

      {/* Reject modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl p-5 w-full max-w-md shadow-xl border border-border">
            <h2 className="text-lg font-bold text-foreground mb-4">
              Reject Order
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Reason
                </label>
                <div className="space-y-2">
                  {(["damaged", "other"] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setRejectReason(r)}
                      className={`w-full py-2.5 px-4 rounded-xl font-medium text-sm transition-all text-left border-2 ${
                        rejectReason === r
                          ? "bg-destructive/10 border-destructive text-destructive"
                          : "bg-secondary text-secondary-foreground border-transparent"
                      }`}
                    >
                      {r === "damaged" ? "Damaged Inventory" : "Other Reason"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Comment <span className="text-destructive">*</span>
                </label>
                <textarea
                  placeholder="Provide detailed reason for rejection"
                  value={rejectComment}
                  onChange={(e) => setRejectComment(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-input bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none text-sm"
                  rows={3}
                />
              </div>

              <div className="p-3 bg-secondary rounded-xl">
                <p className="text-xs text-muted-foreground">
                  {rejectReason === "damaged"
                    ? "⚠️ Items will be added to damaged inventory"
                    : "ℹ️ Stock will be returned to available inventory"}
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowRejectModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={handleReject}
                >
                  Reject
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
