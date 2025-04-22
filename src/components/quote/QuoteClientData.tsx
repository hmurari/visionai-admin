import { ClientInfo, Branding } from '@/types/quote';

interface QuoteClientDataProps {
  clientInfo: ClientInfo;
  branding: Branding;
}

export function QuoteClientData({ clientInfo, branding }: QuoteClientDataProps) {
  return (
    <div className="grid grid-cols-2 gap-4 mb-8 border border-gray-200 rounded-md overflow-hidden quote-section quote-client-data">
      <div className="p-4 border-r border-gray-200">
        <h3 className="text-sm font-bold mb-2" style={{ color: branding.primaryColor }}>
          FROM
        </h3>
        <p className="text-sm">Visionify, Inc.</p>
        <p className="text-sm">1499, W 120th Ave, Ste 110</p>
        <p className="text-sm">Westminster, CO 80234</p>
        <p className="text-sm">Ph: 720-449-1124</p>
        <p className="text-sm">Email: sales@visionify.ai</p>
      </div>
      <div className="p-4">
        <h3 className="text-sm font-bold mb-2" style={{ color: branding.primaryColor }}>
          TO
        </h3>
        <p className="text-sm">{clientInfo.name}</p>
        <p className="text-sm">{clientInfo.company}</p>
        <p className="text-sm">{clientInfo.address}</p>
        <p className="text-sm">{clientInfo.city} {clientInfo.state} {clientInfo.zip}</p>
        <p className="text-sm">{clientInfo.email}</p>
      </div>
    </div>
  );
} 