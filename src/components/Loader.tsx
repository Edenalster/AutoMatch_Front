import React from "react";

const Loader = () => {
  return (
    <div style={styles.container}>
      <div style={styles.loader}>$</div>
      <style>
        {`
          @keyframes coin-flip {
            0%, 100% {
              animation-timing-function: cubic-bezier(0.5, 0, 1, 0.5);
            }
            0% {
              transform: rotateY(0deg);
            }
            50% {
              transform: rotateY(1800deg);
              animation-timing-function: cubic-bezier(0, 0.5, 0.5, 1);
            }
            100% {
              transform: rotateY(3600deg);
            }
          }
        `}
      </style>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },
  loader: {
    display: "inline-block",
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    textAlign: "center",
    lineHeight: "40px",
    fontSize: "32px",
    fontWeight: "bold",
    background: "#FFD700",
    color: "#DAA520",
    border: "4px double",
    boxSizing: "border-box",
    boxShadow: "2px 2px 2px 1px rgba(0, 0, 0, .1)",
    animation: "coin-flip 4s cubic-bezier(0, 0.2, 0.8, 1) infinite",
  },
};

export default Loader;
