export function average(numbers: number[]) {
  const sum = numbers.reduce((acc, value) => acc + value, 0); // Sum up all the numbers
  return sum / numbers.length; // Divide by the total number of elements
}
