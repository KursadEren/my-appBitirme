// src/constants/timeSlots.js
export const TIME_SLOTS = (() => {
    const slots = [];
    for (let h = 9; h <= 20; h++) {
      slots.push({ hour: h, minute: 0 });
      slots.push({ hour: h, minute: 30 });
    }
    return slots;
  })();
  