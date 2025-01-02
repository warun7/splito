type AddressDisplayProps = {
  address: string;
  className?: string;
};

export function AddressDisplay({
  address,
  className = "",
}: AddressDisplayProps) {
  // Create Ethereum address display with first 4 and last 4 characters
  const formattedAddress = `${address.slice(0, 4)}...${address.slice(-4)}`;

  return (
    <span
      className={`font-mono bg-white/5 px-2 py-1 rounded-md text-sm ${className}`}
      title={address} // Show full address on hover
    >
      {formattedAddress}
    </span>
  );
}
