import * as React from 'react';
import { useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { User, Phone, ShieldCheck, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  useEffect(() => {
    async function fetchProfile() {
      if (auth.currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setDisplayName(data.displayName || '');
            setPhoneNumber(data.phoneNumber || '');
          }
        } catch (error) {
          toast.error('Failed to load profile');
        } finally {
          setLoading(false);
        }
      }
    }
    fetchProfile();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        displayName,
        phoneNumber,
        updatedAt: new Date().toISOString()
      });
      toast.success('Identity profile updated. Alert systems synced.');
    } catch (error: any) {
      toast.error('Sync failed: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-20 text-center font-mono opacity-20 animate-pulse text-foreground">RETRIEVING IDENTITY BYTES...</div>;
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto pb-20">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-mono font-bold tracking-tighter uppercase italic text-foreground">Identity Management</h2>
        <p className="font-mono text-xs opacity-50 uppercase text-foreground">Manage your system credentials and alert endpoint</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="rounded-none border-border bg-card shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-foreground" />
              <CardTitle className="font-mono uppercase text-sm tracking-widest text-foreground">Profile Configuration</CardTitle>
            </div>
            <CardDescription className="font-mono text-[10px] italic opacity-60 text-foreground">Update your information to ensure seamless emergency notification</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="space-y-2">
                <Label className="font-mono text-[10px] uppercase opacity-60 text-foreground">Display Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 opacity-50 text-foreground" />
                  <Input 
                    value={displayName} 
                    onChange={e => setDisplayName(e.target.value)}
                    placeholder="Enter your name"
                    className="pl-10 rounded-none border-border bg-transparent focus-visible:ring-0 font-mono text-foreground"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-mono text-[10px] uppercase opacity-60 text-foreground">Emergency Alert Number (E.164 Format)</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-4 h-4 opacity-50 text-foreground" />
                  <Input 
                    value={phoneNumber} 
                    onChange={e => setPhoneNumber(e.target.value)}
                    placeholder="+1234567890"
                    required
                    className="pl-10 rounded-none border-border bg-transparent focus-visible:ring-0 font-mono text-foreground"
                  />
                </div>
                <p className="text-[9px] font-mono opacity-50 italic text-foreground">Crucial for overspeed SMS alerts. Must include country code.</p>
              </div>

              <Button 
                type="submit" 
                className="w-full rounded-none bg-foreground text-background font-mono uppercase text-xs h-12"
                disabled={saving}
              >
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Commit Updates to System
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-8 p-4 border border-dashed border-border/20 rounded-none bg-foreground/5">
           <h4 className="font-mono text-[10px] uppercase opacity-60 font-bold mb-2 text-foreground">Protocol Status</h4>
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                 <p className="font-mono text-[9px] opacity-40 uppercase">Identity Verified</p>
                 <p className="font-mono text-[10px] uppercase text-green-600 font-bold">YES</p>
              </div>
              <div className="space-y-1">
                 <p className="font-mono text-[9px] opacity-40 uppercase">Alert Connectivity</p>
                 <p className="font-mono text-[10px] uppercase text-blue-600 font-bold">{phoneNumber ? 'READY' : 'OFFLINE'}</p>
              </div>
           </div>
        </div>
      </motion.div>
    </div>
  );
}
