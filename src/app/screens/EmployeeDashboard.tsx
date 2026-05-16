import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { BottomNav } from "../components/BottomNav";
import { useAuth } from "../context/AuthContext";
import { orders } from "../data/mockData";
import { Clock, CheckCircle2, Package, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router";
import { StatusChip } from "../components/ui/StatusChip";

export function EmployeeDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const myOrders = orders.filter((o) => o.assignedTo === user?.id);
  const pendingOrders = myOrders.filter((o) => o.status === "placed");
  const inProgressOrders = myOrders.filter((o) => o.status === "in_progress");
  const completedToday = myOrders.filter(
    (o) =>
      o.status === "done" &&
      o.updatedAt.toDateString() === new Date().toDateString(),
  );

  return (
    <div className="min-h-screen bg-background pb-20 overflow-x-hidden">
      <header className="bg-primary text-primary-foreground px-4 py-5 sticky top-0 z-40 shadow-md">
        <div className="max-w-lg mx-auto">
          <p className="text-sm text-primary-foreground/70">Welcome,</p>
          <h1 className="text-xl font-bold">{user?.name}</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 space-y-5">
        {/* Overview stats */}
        <section>
          <h2 className="text-base font-bold text-foreground mb-3">
            Today's Overview
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-3 gap-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-warning/10 rounded-xl shrink-0">
                  <Clock className="text-warning" size={20} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground leading-none">
                    {pendingOrders.length}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Pending
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-3 gap-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-info/10 rounded-xl shrink-0">
                  <TrendingUp className="text-info" size={20} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground leading-none">
                    {inProgressOrders.length}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    In Progress
                  </p>
                </div>
              </div>
            </Card>

            <Card className="col-span-2 p-3 gap-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-success/10 rounded-xl shrink-0">
                  <CheckCircle2 className="text-success" size={20} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground leading-none">
                    {completedToday.length}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Completed Today
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Quick actions */}
        <section>
          <h2 className="text-base font-bold text-foreground mb-3">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Button
              className="h-20 flex flex-col gap-1.5 rounded-2xl"
              onClick={() => navigate("/employee/orders")}
            >
              <Package size={24} />
              <span className="text-sm">My Orders</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col gap-1.5 rounded-2xl"
              onClick={() => navigate("/inventory")}
            >
              <Package size={24} />
              <span className="text-sm">Inventory</span>
            </Button>
          </div>
        </section>

        {/* Assigned orders */}
        <section>
          <h2 className="text-base font-bold text-foreground mb-3">
            Assigned Orders
          </h2>
          <div className="space-y-3">
            {myOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Package size={40} className="text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">
                  No orders assigned yet
                </p>
              </div>
            ) : (
              myOrders.slice(0, 5).map((order) => (
                <button
                  key={order.id}
                  onClick={() => navigate(`/employee/orders/${order.id}`)}
                  className="w-full text-left bg-card border border-border rounded-2xl p-3 flex gap-3 shadow-sm active:scale-[0.98] transition-transform"
                >
                  <img
                    src={order.productImage}
                    alt={order.productName}
                    className="w-16 h-16 rounded-xl object-cover shrink-0 bg-secondary"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="font-semibold text-foreground text-sm truncate flex-1 min-w-0">
                        {order.productName}
                      </p>
                      <StatusChip status={order.status} className="shrink-0" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {order.id} &bull; {order.quantity} pcs
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
