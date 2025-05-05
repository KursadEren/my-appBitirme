function generateTimeSlots() {
    const slots = [];
    const startHour = 11;
    const endHour   = 20;
    const interval  = 10;
  
    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minute = 0; minute < 60; minute += interval) {
        // 20:00’i aşmamak için:
        if (hour === endHour && minute > 0) {
          break;
        }
        // “HH:MM” formatı için pad
        const hh = String(hour).padStart(2, '0');
        const mm = String(minute).padStart(2, '0');
        slots.push(`${hh}:${mm}`);
      }
    }
  
    return slots;
  }
  export default generateTimeSlots;