type SplitResult = {
  splits: { address: string; amount: number; percentage?: number }[];
  debts: { from: string; to: string; amount: number }[];
};

export function splitter(
  splitType: "equal" | "percentage" | "custom",
  totalAmount: number,
  addresses: string[],
  paidBy: string,
  customPercentages?: { [key: string]: number }
): SplitResult {
  const splits = [];
  const debts = [];
  const numberOfPeople = addresses.length;

  switch (splitType) {
    case "equal":
      const equalShare = totalAmount / numberOfPeople;

      // Calculate splits
      for (const addr of addresses) {
        if (addr === paidBy) {
          // Payer's split is negative (total amount) plus their share
          splits.push({
            address: addr,
            amount: -totalAmount + equalShare,
          });
        } else {
          // Others just owe their share
          splits.push({
            address: addr,
            amount: equalShare,
          });
          // Add to debts
          debts.push({
            from: addr,
            to: paidBy,
            amount: equalShare,
          });
        }
      }
      break;

    case "percentage":
      // If custom percentages provided, use them, otherwise split equally
      const percentages =
        customPercentages ||
        Object.fromEntries(
          addresses.map((addr) => [addr, 100 / numberOfPeople])
        );

      // Validate percentages sum to 100
      const totalPercentage = Object.values(percentages).reduce(
        (sum, p) => sum + p,
        0
      );
      if (Math.abs(totalPercentage - 100) > 0.01) {
        throw new Error("Percentages must sum to 100");
      }

      for (const addr of addresses) {
        const percentage = percentages[addr];
        const share = (totalAmount * percentage) / 100;

        if (addr === paidBy) {
          splits.push({
            address: addr,
            amount: -totalAmount + share,
            percentage,
          });
        } else {
          splits.push({
            address: addr,
            amount: share,
            percentage,
          });
          debts.push({
            from: addr,
            to: paidBy,
            amount: share,
          });
        }
      }
      break;

    case "custom":
      // For custom, we'll just initialize with 0 amounts
      for (const addr of addresses) {
        splits.push({
          address: addr,
          amount: 0,
        });
      }
      break;
  }

  return { splits, debts };
}
