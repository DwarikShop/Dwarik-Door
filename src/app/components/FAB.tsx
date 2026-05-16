import { Plus } from 'lucide-react';
import { Link } from 'react-router';

export function FAB() {
  return (
    <Link
      to="/place-order"
      className="fixed bottom-20 right-6 z-40 bg-accent text-accent-foreground rounded-full p-4 shadow-lg hover:shadow-xl transition-all active:scale-95"
    >
      <Plus size={28} strokeWidth={2.5} />
    </Link>
  );
}
