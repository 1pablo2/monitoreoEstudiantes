import { createContext, useContext, useState } from "react";

const DecretoContext = createContext();

export const DecretoProvider = ({ children }) => {
  const [decreto, setDecreto] = useState(null);

  return (
    <DecretoContext.Provider value={{ decreto, setDecreto }}>
      {children}
    </DecretoContext.Provider>
  );
};

export const useDecreto = () => useContext(DecretoContext);