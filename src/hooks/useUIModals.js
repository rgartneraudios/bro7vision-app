// src/hooks/useUIModals.js

import { useState } from 'react';

export const useUIModals = () => {
  const [showLegal, setShowLegal]             = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showBooster, setShowBooster]         = useState(false);
  const [isShopOpen, setIsShopOpen]           = useState(false);
  const [isLeftOpen, setIsLeftOpen]           = useState(false);
  const [isRightOpen, setIsRightOpen]         = useState(false);

  return {
    showLegal, setShowLegal,
    showWalletModal, setShowWalletModal,
    showBooster, setShowBooster,
    isShopOpen, setIsShopOpen,
    isLeftOpen, setIsLeftOpen,
    isRightOpen, setIsRightOpen,
  };
};
