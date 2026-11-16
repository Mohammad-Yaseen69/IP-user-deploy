import { motion } from "framer-motion";
import styles from "./styles.module.css";

/** Splits a pose into what the outer wrapper moves and what the inner one scales. */
const split = ({ scale, ...move } = {}) => [move, scale === undefined ? {} : { scale }];

const Orb = ({
  initial,
  animate,
  transition,
  float = 0,
  wink = false,
  className = "",
  children,
  ...rest
}) => {
  const [initialMove, initialScale] = split(initial);
  const [move, scale] = split(animate);

  return (
    <motion.div
      className={`${styles.orb} ${className}`.trim()}
      initial={initialMove}
      animate={move}
      transition={transition}
      aria-hidden="true"
      data-testid="assistant-orb"
      data-wink={wink ? "true" : undefined}
      {...rest}
    >
      <motion.div
        className={styles.orbScale}
        initial={initialScale}
        animate={scale}
        transition={transition}
      >
        <motion.div
          className={styles.orbBody}
          animate={{ y: float ? [0, -float, 0] : 0 }}
          transition={
            float ? { duration: 2.6, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3 }
          }
        >
          <span className={styles.orbEyes}>
            <span className={styles.orbEye} />
            <span className={styles.orbEye} />
          </span>
        </motion.div>
      </motion.div>
      {children}
    </motion.div>
  );
};

export default Orb;
