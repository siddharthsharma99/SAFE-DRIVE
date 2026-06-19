import { useState } from 'react';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { toast } from 'sonner';
import { Shield, Lock, Mail, UserPlus, LogIn } from 'lucide-react';
import { motion } from 'motion/react';

export default function AuthPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  const handleGoogleAuth = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      // Save user to Firestore if new
      await setDoc(doc(db, 'users', result.user.uid), {
        email: result.user.email,
        displayName: result.user.displayName,
        phoneNumber: result.user.phoneNumber || "",
        createdAt: new Date().toISOString()
      }, { merge: true });
      toast.success('System Authenticated Successfully');
    } catch (error: any) {
      toast.error('Authentication Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (type: 'signup' | 'login') => {
    setLoading(true);
    try {
      if (type === 'signup') {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, 'users', result.user.uid), {
          email: result.user.email,
          phoneNumber: phone,
          createdAt: new Date().toISOString()
        });
        toast.success('Registration Complete');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success('Access Granted');
      }
    } catch (error: any) {
      toast.error('Identity Verification Failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-foreground rounded-none flex items-center justify-center text-background">
            <Shield className="w-10 h-10" />
          </div>
        </div>

        <Card className="rounded-none border-border bg-card shadow-none">
          <CardHeader className="text-center font-mono uppercase tracking-widest text-foreground">
            <CardTitle>Security Clearance</CardTitle>
            <CardDescription className="italic text-foreground/60">Authorization Required for System Access</CardDescription>
          </CardHeader>
          
          <CardContent className="p-6">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 rounded-none bg-foreground/10 mb-6 font-mono text-xs uppercase">
                <TabsTrigger value="login" className="rounded-none data-[state=active]:bg-foreground data-[state=active]:text-background">
                  <LogIn className="w-3 h-3 mr-2" /> Login
                </TabsTrigger>
                <TabsTrigger value="register" className="rounded-none data-[state=active]:bg-foreground data-[state=active]:text-background">
                  <UserPlus className="w-3 h-3 mr-2" /> Register
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="font-mono text-[10px] uppercase opacity-50 text-foreground">Identity Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 opacity-50 text-foreground" />
                      <Input 
                        type="email" 
                        placeholder="admin@system.io" 
                        className="pl-10 rounded-none border-border bg-transparent focus-visible:ring-0 text-foreground" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-mono text-[10px] uppercase opacity-50 text-foreground">Auth Key (Password)</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-4 h-4 opacity-50 text-foreground" />
                      <Input 
                        type="password" 
                        placeholder="••••••••" 
                        className="pl-10 rounded-none border-border bg-transparent focus-visible:ring-0 text-foreground" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button 
                    className="w-full rounded-none bg-foreground text-background hover:bg-foreground/90 font-mono uppercase text-xs" 
                    onClick={() => handleEmailAuth('login')}
                    disabled={loading}
                  >
                    Initiate Connection
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="register">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="font-mono text-[10px] uppercase opacity-50 text-foreground">Primary Email</Label>
                    <Input 
                      type="email" 
                      placeholder="user@domain.com" 
                      className="rounded-none border-border bg-transparent focus-visible:ring-0 text-foreground" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-mono text-[10px] uppercase opacity-50 text-foreground">Phone Number (For Alerts)</Label>
                    <Input 
                      type="tel" 
                      placeholder="+1234567890" 
                      className="rounded-none border-border bg-transparent focus-visible:ring-0 text-foreground" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-mono text-[10px] uppercase opacity-50 text-foreground">Security Phrase (Password)</Label>
                    <Input 
                      type="password" 
                      placeholder="••••••••" 
                      className="rounded-none border-border bg-transparent focus-visible:ring-0 text-foreground" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <Button 
                    className="w-full rounded-none bg-foreground text-background hover:bg-foreground/90 font-mono uppercase text-xs" 
                    onClick={() => handleEmailAuth('signup')}
                    disabled={loading}
                  >
                    Register Identity
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/10" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-mono">
                <span className="bg-card px-2 text-foreground/60">Or alternative</span>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              className="w-full rounded-none border-border text-foreground hover:bg-foreground hover:text-background font-mono text-xs uppercase transition-colors"
              onClick={handleGoogleAuth}
              disabled={loading}
            >
              Sign in with Google
            </Button>
          </CardFooter>
        </Card>

        <p className="mt-8 text-center text-[10px] font-mono uppercase opacity-40 text-foreground">
          Encrypted Session Active | Asia-Southeast1 Region
        </p>
      </motion.div>
    </div>
  );
}
