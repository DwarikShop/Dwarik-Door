import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';

export function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/home');
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="h-screen w-full bg-gradient-to-br from-primary via-primary/90 to-primary/80 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23F5E6D3" fill-opacity="1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        }} />
      </div>

      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10"
      >
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="bg-accent/20 rounded-3xl p-8 mb-8"
        >
          <svg
            width="120"
            height="120"
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-primary-foreground"
          >
            <rect x="20" y="10" width="80" height="100" rx="4" fill="currentColor" opacity="0.3" />
            <rect x="25" y="15" width="70" height="90" rx="3" fill="currentColor" opacity="0.5" />
            <rect x="30" y="20" width="60" height="80" rx="2" fill="currentColor" />
            <circle cx="60" cy="60" r="8" fill="#C89B3C" />
            <rect x="45" y="35" width="30" height="3" fill="#C89B3C" opacity="0.6" />
            <rect x="45" y="85" width="30" height="3" fill="#C89B3C" opacity="0.6" />
          </svg>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold text-primary-foreground mb-2 tracking-wide">
            DWARIK DOOR
          </h1>
          <p className="text-primary-foreground/80 text-lg">
            Premium Door Manufacturing
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ delay: 1, duration: 1.5, repeat: Infinity }}
          className="mt-12"
        >
          <div className="flex justify-center gap-2">
            <div className="w-2 h-2 bg-accent rounded-full" />
            <div className="w-2 h-2 bg-accent rounded-full" />
            <div className="w-2 h-2 bg-accent rounded-full" />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
