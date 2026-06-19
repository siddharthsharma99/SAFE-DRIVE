import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { Severity } from '../types';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter 
} from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { 
  ShieldAlert, 
  ChevronRight, 
  Navigation,
  Activity,
  Zap,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { auth, db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function DetectionPage() {
  const [loading, setLoading] = useState(false);
  const [speed, setSpeed] = useState('65');
  const [accelData, setAccelData] = useState('1.2, 2.5, -0.5, 4.0');
  const [impactData, setImpactData] = useState('0.1, 0.2, 0.5');
  const [prediction, setPrediction] = useState<{ severity: Severity; confidence: number; location?: any } | null>(null);
  const [userPhone, setUserPhone] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserPhone() {
      if (auth.currentUser) {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          setUserPhone(userDoc.data().phoneNumber || null);
        }
      }
    }
    fetchUserPhone();
  }, []);

  const handleSimulate = async () => {
    setLoading(true);
    setPrediction(null);
    
    try {
      const currentSpeed = parseFloat(speed);
      const data = {
        speed: currentSpeed,
        acceleration: accelData.split(',').map(s => parseFloat(s.trim())),
        impact: impactData.split(',').map(s => parseFloat(s.trim())),
        phoneNumber: userPhone || undefined
      };

      const result = await apiService.detectAccident(data);
      
      if (currentSpeed > 80 && userPhone) {
        toast.warning(`⚠️ Overspeed detected! SMS alert sent to ${userPhone}.`);
      }

      setPrediction(result);
      
      // If critical, save to history and simulation alerts
      if (result.severity !== 'Low') {
        const id = await apiService.saveAccident({
          severity: result.severity,
          location: result.location || { lat: 0, lng: 0, address: 'Unknown' },
          speed: data.speed,
          acceleration: data.acceleration
        });

        if (result.severity === 'Critical') {
            toast.error('CRITICAL INCIDENT DETECTED. Emergency procedures initiated.');
            await apiService.saveAlert({
                accidentId: id!,
                message: `Critical accident detected at ${data.speed} KM/H.`,
                sentTo: ['Emergency Contact Node Priority 1']
            });
        } else {
            toast.warning('MODERATE INCIDENT DETECTED. Monitoring status alert.');
        }
      } else {
        toast.info('Detection complete: Low severity. No action required.');
      }
    } catch (error: any) {
      toast.error('Simulation Matrix Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-20">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-mono font-bold tracking-tighter uppercase italic text-foreground">Manual Simulation</h2>
        <p className="font-mono text-xs opacity-50 uppercase text-foreground">Trigger sensor parameters for model verification</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="rounded-none border-border bg-card shadow-sm">
            <CardHeader shadow-sm>
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-foreground" />
                <CardTitle className="font-mono uppercase text-sm tracking-widest text-foreground">Input Parameters</CardTitle>
              </div>
              <CardDescription className="italic font-mono text-[10px] text-foreground/70">Supply raw telemetric data streams</CardDescription>
            </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="font-mono text-[10px] uppercase opacity-60 text-foreground">Velocity (KM/H)</Label>
              <div className="relative">
                 <Navigation className="absolute left-3 top-3 w-4 h-4 opacity-50 text-foreground" />
                 <Input 
                  type="number" 
                  value={speed} 
                  onChange={e => setSpeed(e.target.value)}
                  className="pl-10 rounded-none border-border bg-transparent focus-visible:ring-0 font-mono text-foreground"
                 />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-mono text-[10px] uppercase opacity-60 text-foreground">Acceleration Array (m/s²)</Label>
              <Input 
                value={accelData} 
                onChange={e => setAccelData(e.target.value)}
                placeholder="Comma separated values"
                className="rounded-none border-border bg-transparent focus-visible:ring-0 font-mono text-foreground"
              />
              <p className="text-[9px] font-mono opacity-50 italic text-foreground">Raw accelerometer X, Y, Z, G values</p>
            </div>

            <div className="space-y-2">
              <Label className="font-mono text-[10px] uppercase opacity-60 text-foreground">Impact Sensors (Impact/J)</Label>
              <Input 
                value={impactData} 
                onChange={e => setImpactData(e.target.value)}
                placeholder="Comma separated values"
                className="rounded-none border-border bg-transparent focus-visible:ring-0 font-mono text-foreground"
              />
            </div>
          </CardContent>
          <CardFooter className="bg-foreground/5 p-6">
            <Button 
              className="w-full rounded-none bg-foreground text-background hover:bg-foreground/90 font-mono uppercase text-xs gap-2"
              onClick={handleSimulate}
              disabled={loading}
            >
              {loading ? 'Processing Array...' : 'Run Prediction Model'}
              <ChevronRight className="w-4 h-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="space-y-6">
          <AnimatePresence mode="wait">
            {prediction ? (
              <motion.div
                key="prediction"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-4"
              >
                <div className={cn(
                  "p-8 border rounded-none text-center font-mono",
                  prediction.severity === 'Critical' ? "border-red-600 bg-red-600/10" : 
                  prediction.severity === 'Moderate' ? "border-yellow-600 bg-yellow-600/10" : "border-green-600 bg-green-600/10"
                )}>
                  <div className="text-[10px] uppercase opacity-60 mb-2 font-bold tracking-widest">Model Prediction Result</div>
                  <div className={cn(
                    "text-5xl font-black uppercase italic mb-4",
                    prediction.severity === 'Critical' ? "text-red-600" : 
                    prediction.severity === 'Moderate' ? "text-yellow-600" : "text-green-600"
                  )}>
                    {prediction.severity}
                  </div>
                  <div className="text-[10px] uppercase opacity-40">Classification Confidence: {prediction.confidence.toFixed(4)}</div>
                </div>

                <Alert className="rounded-none border-border bg-card">
                  <Zap className="h-4 w-4 text-foreground" />
                  <AlertTitle className="font-mono text-xs uppercase font-bold text-foreground">Action Protocol</AlertTitle>
                  <AlertDescription className="font-mono text-[10px] opacity-70 text-foreground">
                    {prediction.severity === 'Critical' 
                      ? 'EMERGENCY: Dispatching alerts to primary contacts and local rescue nodes.' 
                      : prediction.severity === 'Moderate' 
                      ? 'ALERT: Notifying system owner' 
                      : 'NORMAL: No anomalies detected. Logging event for data training.'}
                  </AlertDescription>
                </Alert>
              </motion.div>
            ) : (
              <div key="placeholder" className="h-full flex items-center justify-center border-2 border-dashed border-border/20 p-12 text-center opacity-30">
                <div className="space-y-4">
                  <ShieldAlert className="w-12 h-12 mx-auto text-foreground" />
                  <p className="font-mono text-sm uppercase text-foreground">Awaiting telemetric data to perform inference</p>
                </div>
              </div>
            )}
          </AnimatePresence>

          <Card className="rounded-none border-border bg-card/50 shadow-none border-dashed">
             <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 opacity-50 text-foreground" />
                  <span className="font-mono text-[10px] uppercase opacity-50 font-bold text-foreground">Inference Documentation</span>
                </div>
             </CardHeader>
             <CardContent className="font-mono text-[9px] uppercase space-y-2 opacity-50 leading-relaxed text-foreground">
                <p>• Critical: Triggered by impact forces &gt; 15J or rapid deceleration.</p>
                <p>• Moderate: Alert state for unusual vehicle metrics.</p>
                <p>• Low: Daily operational driving patterns.</p>
             </CardContent>
          </Card>
        </div>
    </div>
  );
}
