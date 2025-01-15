type AddressDisplayProps = {
  address: string;
  className?: string;
};

export function AddressDisplay({
  address,
  className = "",
}: AddressDisplayProps) {
  const formattedAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

  return <span className={`text-white ${className}`}>{formattedAddress}</span>;
}
