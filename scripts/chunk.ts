export function chunkArray<T>(inputArray: T[], chunkSize: number): T[][] {
  if (chunkSize <= 0) {
      throw new Error("chunkSize must be greater than 0");
  }

  const result: T[][] = [];
  for (let i = 0; i < inputArray.length; i += chunkSize) {
      const chunk = inputArray.slice(i, i + chunkSize);
      result.push(chunk);
  }
  return result;
}