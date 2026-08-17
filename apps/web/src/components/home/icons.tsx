// Re-exports over lucide-react (generic UI icons) and react-icons/si
// (Simple Icons — real brand marks) so every call site imports from one
// place instead of reaching into two different packages directly.
export {
  Zap as BoltIcon,
  ShieldCheck as ShieldIcon,
  Headset as HeadsetIcon,
  Star as StarIcon,
  Gamepad2 as GamepadIcon,
  Gift as GiftIcon,
  Wallet as WalletIcon,
  RotateCw as RefreshIcon,
} from "lucide-react";
export { SiWhatsapp as WhatsAppIcon, SiApple as AppleIcon, SiGoogleplay as PlayStoreIcon } from "react-icons/si";

import { Gamepad2, Gift, Wallet, RotateCw } from "lucide-react";

export const categoryIconCycle = [Gamepad2, Gift, Wallet, RotateCw];
