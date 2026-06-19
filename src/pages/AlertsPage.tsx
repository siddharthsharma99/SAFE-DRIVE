import { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { Alert } from '../types';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '../../components/ui/card';
import { 
  Bell, 
  ShieldAlert, 
  Clock, 
  CheckCircle2,
  Mail,
  Smartphone
} from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
  }, []);

  async function loadAlerts() {
    try {
      const data = await apiService.getAlerts();
      setAlerts(data || []);
    } catch (e) {
      toast.error('Alert index retrieval failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-mono font-bold tracking-tighter uppercase italic text-foreground">Alert Registry</h2>
        <p className="font-mono text-xs opacity-50 uppercase text-foreground">Transmission logs for all disseminated emergency signals</p>
      </div>

      <div className="max-w-4xl">
        {loading ? (
          <div className="p-20 text-center font-mono opacity-20 animate-pulse text-foreground">SCANNING TRANSMISSION LOGS...</div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert, i) => (
              <Card key={alert.id} className="rounded-none border-border bg-card shadow-sm overflow-hidden group">
                <div className="flex">
                   <div className="w-1 bg-foreground" />
                   <div className="flex-1 p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 bg-foreground/5 flex items-center justify-center shrink-0">
                              <Bell className="w-5 h-5 text-foreground" />
                           </div>
                           <div className="text-foreground">
                              <div className="flex items-center gap-2">
                                 <h3 className="font-mono font-bold uppercase text-sm">Emergency Signal TX-{alert.id?.slice(-4)}</h3>
                                 <Badge variant="outline" className="rounded-none border-green-600/50 text-green-600 font-mono text-[9px] uppercase">
                                   Delivered
                                 </Badge>
                              </div>
                              <p className="font-mono text-xs mt-1 italic opacity-80">"{alert.message}"</p>
                           </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                           <div className="flex items-center gap-1 font-mono text-[10px] uppercase opacity-50 text-foreground">
                              <Clock className="w-3 h-3" /> {new Date(alert.timestamp).toLocaleString()}
                           </div>
                           <div className="flex items-center gap-1 font-mono text-[10px] uppercase text-green-600">
                              <CheckCircle2 className="w-3 h-3" /> Protocol Complete
                           </div>
                        </div>
                      </div>

                      <div className="mt-6 pt-6 border-t border-border/10 flex flex-wrap gap-4 text-foreground">
                        <div className="flex items-center gap-2">
                           <ShieldAlert className="w-4 h-4 opacity-40" />
                           <span className="font-mono text-[10px] uppercase opacity-40 font-bold">Relational Logic:</span>
                           <span className="font-mono text-[10px] uppercase opacity-60">Manual Verification Required</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <Smartphone className="w-4 h-4 opacity-40" />
                           <span className="font-mono text-[10px] uppercase opacity-40 font-bold">Dispatched To:</span>
                           <div className="flex gap-1">
                              {alert.sentTo.map(to => (
                                <Badge key={to} variant="outline" className="rounded-none border-border/20 font-mono text-[9px] uppercase text-foreground">{to}</Badge>
                              ))}
                           </div>
                        </div>
                      </div>
                   </div>
                </div>
              </Card>
            ))}

            {alerts.length === 0 && (
              <div className="border border-dashed border-border/20 p-20 text-center">
                 <div className="opacity-20 space-y-4">
                    <Mail className="w-12 h-12 mx-auto text-foreground" />
                    <p className="font-mono text-sm uppercase text-foreground">Archive is current empty. No emergency transmissions recorded.</p>
                 </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
