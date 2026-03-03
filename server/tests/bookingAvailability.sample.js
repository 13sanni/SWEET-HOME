// Sample test case for room quantity overlap logic.
// Run manually with: node tests/bookingAvailability.sample.js

import assert from "node:assert/strict";

const isOverlap = (aStart, aEnd, bStart, bEnd) => aStart < bEnd && aEnd > bStart;

const availableRooms = ({ totalRooms, bookings, checkIn, checkOut }) => {
  const overlappingBooked = bookings.reduce((sum, item) => {
    if (isOverlap(checkIn, checkOut, item.checkIn, item.checkOut)) {
      return sum + item.roomsBooked;
    }
    return sum;
  }, 0);

  return totalRooms - overlappingBooked;
};

const room = {
  totalRooms: 15,
  bookings: [
    { checkIn: new Date("2026-03-01"), checkOut: new Date("2026-03-05"), roomsBooked: 2 },
    { checkIn: new Date("2026-03-02"), checkOut: new Date("2026-03-04"), roomsBooked: 3 },
  ],
};

assert.equal(
  availableRooms({
    ...room,
    checkIn: new Date("2026-03-03"),
    checkOut: new Date("2026-03-04"),
  }),
  10
);

assert.equal(
  availableRooms({
    ...room,
    checkIn: new Date("2026-03-05"),
    checkOut: new Date("2026-03-06"),
  }),
  15
);

console.log("Sample booking availability checks passed.");
