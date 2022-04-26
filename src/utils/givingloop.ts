const openGivingLoopPopup = (monthly = true, amount = 50) => {
  // @ts-ignore
  if (window.givingloop) {
    // @ts-ignore
    window.givingloop('donate', {
      amount,
      monthly,
    });
  }
};

export default openGivingLoopPopup;
