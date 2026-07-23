import { Bell } from 'lucide-react';

interface Props {
  title?: string;
  subtitle?: string;
  right?: React.ReactNode;
}

export default function PreviewHeader({ title = 'สวัสดี, ผู้ดูแลระบบ', subtitle = 'ยินดีต้อนรับกลับมา 👋', right }: Props) {
  return (
    <header className="flex items-center justify-between px-8 py-5">
      <div>
        <h1 className="text-2xl font-bold text-[#2B1D14]">{title}</h1>
        {subtitle && <p className="text-sm text-[#8A7563] mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-4">
        {right}
        <span className="text-sm text-[#4A3A2E]">19:30 น.</span>
        <button className="relative w-9 h-9 rounded-full bg-white border border-[#F0E7D8] flex items-center justify-center">
          <Bell className="w-4 h-4 text-[#4A3A2E]" />
          <span className="absolute -top-1 -right-1 bg-[#E85A6B] text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">3</span>
        </button>
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#C7A98A] to-[#8B6A4E]" />
      </div>
    </header>
  );
}
