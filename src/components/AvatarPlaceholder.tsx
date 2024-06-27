import { PersonIcon } from "@radix-ui/react-icons";
import { cn } from "../lib/utils";

export default function AvatarPlaceholder({
  bgClassName,
  iconClassName,
}: {
  bgClassName?: string;
  iconClassName?: string;
}) {
  return (
    <div
      className={cn(
        "flex justify-center items-center bg-slate-700 p-1 rounded-full size-10",
        bgClassName
      )}
    >
      <PersonIcon className={cn("size-5 text-gray-50", iconClassName)} />
    </div>
  );
}
