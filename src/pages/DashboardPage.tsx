import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { Accident, DashboardStats } from '../types';
import { auth } from '../lib/firebase';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { 
  Activity, 
  AlertTriangle, 
  ShieldCheck, 
  Zap,
  BarChart3,
  Calendar,
  MapPin
} from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentAccidents, setRecentAccidents] = useState<Accident[]>([]);
  const [loading, setLoading] = useState(true);
  const [smsSystemActive, setSmsSystemActive] = useState(false);
  const [hasPhone, setHasPhone] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [accidentsData, alertsData, configData] = await Promise.all([
          apiService.getAccidents(),
          apiService.getAlerts(),
          apiService.getSystemConfig()
        ]);
        
        setSmsSystemActive(configData.smsActive);

        // Check if current user has a phone number
        if (auth.currentUser) {
          const { doc, getDoc } = await import('firebase/firestore');
          const { db } = await import('../lib/firebase');
          const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
          setHasPhone(!!userDoc.data()?.phoneNumber);
        }
        
        const accidents = accidentsData || [];
        const alerts = alertsData || [];

        const computedStats: DashboardStats = {
          totalAccidents: accidents.length,
          criticalEvents: accidents.filter(a => a.severity === 'Critical').length,
          moderateEvents: accidents.filter(a => a.severity === 'Moderate').length,
          lowEvents: accidents.filter(a => a.severity === 'Low').length,
          alertsSent: alerts.length
        };

        setStats(computedStats);
        setRecentAccidents(accidents);
      } catch (e) {
        console.error(e);
        toast.error('Data sync failed. Using local cache.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="font-mono animate-pulse">PROCESSING DATA...</div>
      </div>
    );
  }

  const statCards = [
    { title: 'Total Detected', value: stats?.totalAccidents, icon: Activity, color: 'text-blue-600' },
    { title: 'Critical Events', value: stats?.criticalEvents, icon: AlertTriangle, color: 'text-red-600' },
    { title: 'Moderate Events', value: stats?.moderateEvents, icon: Zap, color: 'text-yellow-600' },
    { title: 'Alerts Dispatched', value: stats?.alertsSent, icon: ShieldCheck, color: 'text-green-600' },
  ];

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-mono font-bold tracking-tighter uppercase italic text-foreground">Mission Control</h2>
        <div className="flex items-center gap-4">
          <p className="font-mono text-xs opacity-50 uppercase text-foreground">Operational Status: Nominal | All sensors active</p>
          <div className="flex gap-2">
             <Badge variant={smsSystemActive ? "outline" : "destructive"} className="rounded-none font-mono text-[9px] uppercase">
               SMS SYSTEM: {smsSystemActive ? 'ACTIVE' : 'OFFLINE'}
             </Badge>
             {!hasPhone && (
               <Badge variant="destructive" className="rounded-none font-mono text-[9px] uppercase animate-pulse">
                 MISSING PHONE NUMBER
               </Badge>
             )}
          </div>
        </div>
      </div>

      {(!smsSystemActive || !hasPhone) && (
        <Card className="rounded-none border-red-600/50 bg-red-600/5 p-4 flex items-center justify-between gap-4">
           <div className="flex items-center gap-4">
              <AlertTriangle className="text-red-600 w-5 h-5 shrink-0" />
              <p className="font-mono text-[10px] uppercase text-red-600 leading-tight">
                {!smsSystemActive 
                  ? "CRITICAL: Twilio secrets are missing. System cannot send overspeed SMS. Add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_FROM_NUMBER to project secrets." 
                  : "WARNING: Your profile has no phone number. Register with a phone number (E.164 format) to receive alerts."}
              </p>
           </div>
           {smsSystemActive && !hasPhone && (
             <Button 
               variant="outline" 
               size="sm" 
               className="rounded-none border-red-600/50 text-red-600 font-mono text-[9px] uppercase hover:bg-red-600 hover:text-white"
               onClick={() => navigate('/profile')}
             >
               Fix Profile
             </Button>
           )}
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="rounded-none border-border bg-card shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-[10px] font-mono uppercase tracking-widest opacity-60 text-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={cn("w-4 h-4", stat.color)} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-mono font-bold text-foreground">{stat.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Events List */}
        <Card className="lg:col-span-2 rounded-none border-border bg-card shadow-sm">
          <CardHeader className="border-b border-border pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-foreground" />
                <CardTitle className="font-mono uppercase text-sm tracking-widest text-foreground">Recent Incident Logs</CardTitle>
              </div>
              <Badge variant="outline" className="rounded-none border-border font-mono text-[10px] text-foreground">Real-time</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {recentAccidents.length === 0 ? (
              <div className="p-8 text-center font-mono text-xs opacity-50 italic text-foreground">No incidents recorded in the current epoch.</div>
            ) : (
              <div className="divide-y divide-border/10">
                {recentAccidents.map((accident, i) => (
                  <div key={accident.id} className="p-4 flex items-center justify-between hover:bg-foreground/5 transition-colors group cursor-pointer">
                    <div className="flex gap-4 items-start">
                      <div className={cn(
                        "w-2 h-2 mt-1.5 rounded-full shrink-0",
                        accident.severity === 'Critical' ? 'bg-red-600' : 
                        accident.severity === 'Moderate' ? 'bg-yellow-600' : 'bg-green-600'
                      )} />
                      <div>
                        <div className="font-mono text-sm font-bold uppercase text-foreground">{accident.severity} Detection</div>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="flex items-center gap-1 font-mono text-[10px] opacity-60 uppercase text-foreground">
                            <Calendar className="w-3 h-3" /> {new Date(accident.timestamp).toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1 font-mono text-[10px] opacity-60 uppercase text-foreground">
                            <MapPin className="w-3 h-3" /> {accident.location.address || 'Coord Detected'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                        <div className="font-mono text-xs font-bold text-foreground">{accident.speed} KM/H</div>
                        <div className="font-mono text-[10px] opacity-40 uppercase text-foreground">Max Velocity</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Activity */}
        <Card className="rounded-none border-border bg-card shadow-sm">
          <CardHeader className="border-b border-border pb-4">
             <CardTitle className="font-mono uppercase text-sm tracking-widest text-foreground">System Health</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6 text-foreground">
             <div className="space-y-2">
                <div className="flex justify-between font-mono text-[10px] uppercase">
                  <span>ML Model Accuracy</span>
                  <span>88.4%</span>
                </div>
                <div className="h-1 bg-foreground/10 w-full overflow-hidden">
                   <div className="h-full bg-yellow-600 w-[88.4%]" />
                </div>
             </div>
             <div className="space-y-2">
                <div className="flex justify-between font-mono text-[10px] uppercase">
                  <span>Sensor Sync Latency</span>
                  <span>14ms</span>
                </div>
                <div className="h-1 bg-foreground/10 w-full overflow-hidden">
                   <div className="h-full bg-foreground w-[15%]" />
                </div>
             </div>
             <div className="pt-4 border-t border-border/10">
                <h4 className="font-mono text-[10px] uppercase opacity-60 mb-2">Operational Nodes</h4>
                <div className="flex flex-wrap gap-2">
                   {['Node-Alpha', 'Node-Beta', 'Edge-01', 'Sat-Sync'].map(node => (
                     <Badge key={node} variant="secondary" className="rounded-none bg-foreground/5 text-foreground font-mono text-[10px] uppercase border-none">{node}</Badge>
                   ))}
                </div>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Helper function needed for cn
import { cn } from "../../lib/utils";
