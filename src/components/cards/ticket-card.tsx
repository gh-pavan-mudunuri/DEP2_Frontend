import { useRef } from "react";
import { MdDownloadForOffline } from "react-icons/md";
import html2canvas from "html2canvas";

export interface TicketCardProps {
	reg: {
		id: number;
		eventId: number;
		userId: number;
		ticketCount: number;
		userEmail?: string;
		qrCode?: string;
		registeredAt: string;
		eventTitle?: string;
	};
}

async function downloadTicketAsImage(node: HTMLElement, filename: string) {
	const canvas = await html2canvas(node, { backgroundColor: null });
	const dataUrl = canvas.toDataURL("image/png");
	const link = document.createElement("a");
	link.href = dataUrl;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
}

export default function TicketCard({ reg }: TicketCardProps) {
	const cardRef = useRef<HTMLDivElement>(null);
	return (
		<div
			ref={cardRef}
			className="relative bg-white rounded-2xl shadow-xl border border-blue-200 overflow-hidden group hover:scale-[1.02] transition-transform duration-200 h-full w-full max-w-xl mx-auto"
		>
			{/* Download icon */}
			<button
				className="absolute top-3 right-3 z-30 hover:text-[#ffd700] transition-colors"
				title="Download Ticket"
				onClick={async (e) => {
					e.preventDefault();
					if (cardRef.current) {
						await downloadTicketAsImage(cardRef.current, `${reg.eventTitle || 'ticket'}_${reg.id}.png`);
					}
				}}
			>
				<MdDownloadForOffline className="h-7 w-7 text-[#ffd700] drop-shadow" />
			</button>
			{/* Header */}
			<div className="bg-[#0a174e] px-6 py-3 text-white text-2xl font-bold tracking-wide text-center">
				{reg.eventTitle || 'Event'}
			</div>
			{/* Main content: 2 columns on md+, stacked on mobile */}
			<div className="flex flex-col md:flex-row gap-4 px-6 py-6 items-center md:items-stretch">
				{/* Details */}
				<div className="flex-1 flex flex-col gap-2 justify-center">
					<div className="text-lg font-semibold text-blue-700">Ticket #{reg.id}</div>
					<div className="text-sm text-gray-600">Event ID: <span className="font-semibold text-gray-800">{reg.eventId}</span></div>
					<div className="text-sm text-gray-600">User ID: <span className="font-semibold text-gray-800">{reg.userId}</span></div>
					<div className="text-sm text-gray-600">Email: <span className="font-semibold text-gray-800">{reg.userEmail || "-"}</span></div>
					<div className="text-sm text-gray-600">Ticket Count: <span className="font-semibold text-gray-800">{reg.ticketCount}</span></div>
					<div className="text-sm text-gray-600">Registered At: <span className="font-semibold text-gray-800">{new Date(reg.registeredAt).toLocaleString()}</span></div>
					<div className="text-xs text-blue-400 mt-2 font-medium tracking-wide">Scan QR at event entry</div>
				</div>
				{/* QR code */}
				{reg.qrCode && (
					<div className="flex flex-col items-center justify-center">
						<div className="relative w-36 h-36">
							<img
								src={`data:image/png;base64,${reg.qrCode}`}
								alt="QR Code"
								className="w-full h-full object-contain border-2 border-blue-300 rounded-lg shadow-md bg-white"
							/>
							<span className="absolute inset-0 flex items-center justify-center text-2xl font-extrabold text-blue-400 opacity-10 select-none pointer-events-none tracking-widest z-20">EventSphere</span>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}