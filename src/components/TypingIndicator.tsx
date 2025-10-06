import { motion } from "framer-motion";

export default function TypingIndicator({ user }: { user: string }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
      <motion.div
        className="flex items-center gap-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <strong>{user}</strong>
        <motion.span
          className="inline-flex gap-1 ml-1"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0.4 },
            visible: {
              opacity: [0.4, 1, 0.4],
              transition: { repeat: Infinity, duration: 1 },
            },
          }}
        >
          <span className="animate-bounce">.</span>
          <span className="animate-bounce delay-150">.</span>
          <span className="animate-bounce delay-300">.</span>
        </motion.span>
      </motion.div>
    </div>
  );
}
