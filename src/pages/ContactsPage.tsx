import * as React from 'react';
import { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { Contact } from '../types';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { 
  Users, 
  Trash2, 
  Plus, 
  User, 
  Phone, 
  Heart,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { Badge } from '../../components/ui/badge';

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  
  // New contact form
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relation, setRelation] = useState('');

  useEffect(() => {
    loadContacts();
  }, []);

  async function loadContacts() {
    setLoading(true);
    try {
      const data = await apiService.getContacts();
      setContacts(data || []);
    } catch (e) {
      toast.error('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    try {
      await apiService.addContact({ name, phone, relation });
      toast.success('Emergency contact registered');
      setName('');
      setPhone('');
      setRelation('');
      loadContacts();
    } catch (error: any) {
      toast.error('Registration failed: ' + error.message);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-mono font-bold tracking-tighter uppercase italic text-foreground">Rescue Nodes</h2>
        <p className="font-mono text-xs opacity-50 uppercase text-foreground">Primary emergency contact registry for automated escalation</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Registration Form */}
        <Card className="rounded-none border-border bg-card shadow-sm h-fit">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-foreground" />
              <CardTitle className="font-mono uppercase text-sm tracking-widest text-foreground">Add Primary Node</CardTitle>
            </div>
            <CardDescription className="font-mono text-[10px] italic text-foreground/70">Register a trusted recipient for system alerts</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-2">
                <Label className="font-mono text-[10px] uppercase opacity-60 text-foreground">Full Identity Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 opacity-50 text-foreground" />
                  <Input 
                    value={name} 
                    onChange={e => setName(e.target.value)}
                    required
                    className="pl-10 rounded-none border-border bg-transparent focus-visible:ring-0 font-mono text-sm text-foreground" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="font-mono text-[10px] uppercase opacity-60 text-foreground">Signal Connection (Phone)</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-4 h-4 opacity-50 text-foreground" />
                  <Input 
                    value={phone} 
                    onChange={e => setPhone(e.target.value)}
                    required
                    className="pl-10 rounded-none border-border bg-transparent focus-visible:ring-0 font-mono text-sm text-foreground" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="font-mono text-[10px] uppercase opacity-60 text-foreground">Node Relation</Label>
                <div className="relative">
                  <Heart className="absolute left-3 top-3 w-4 h-4 opacity-50 text-foreground" />
                  <Input 
                    value={relation} 
                    onChange={e => setRelation(e.target.value)}
                    placeholder="e.g. Family, Partner"
                    required
                    className="pl-10 rounded-none border-border bg-transparent focus-visible:ring-0 font-mono text-sm text-foreground" 
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full rounded-none bg-foreground text-background font-mono text-xs uppercase"
                disabled={adding}
              >
                {adding && <Loader2 className="w-3 h-3 mr-2 animate-spin" />}
                Sync Node to Network
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Contact List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-mono font-bold uppercase text-xs tracking-widest flex items-center gap-2">
              <Users className="w-4 h-4" /> Registered Network ({contacts.length})
            </h3>
          </div>

          {loading ? (
            <div className="p-20 text-center font-mono opacity-20 animate-pulse text-foreground">INDEXING NODES...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AnimatePresence>
                {contacts.map((contact, i) => (
                  <motion.div
                    key={contact.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card className="rounded-none border-border bg-card hover:bg-foreground/5 transition-colors group cursor-default">
                      <CardContent className="p-4 flex justify-between items-start">
                        <div className="space-y-2 text-foreground">
                           <Badge className="rounded-none bg-foreground text-background font-mono text-[9px] uppercase border-none">Node {i+1}</Badge>
                           <div className="font-mono font-bold uppercase text-base">{contact.name}</div>
                           <div className="space-y-1">
                              <p className="font-mono text-[10px] opacity-60 uppercase flex items-center gap-2 text-foreground">
                                <Phone className="w-2.5 h-2.5" /> {contact.phone}
                              </p>
                              <p className="font-mono text-[10px] opacity-60 uppercase flex items-center gap-2 text-foreground">
                                <Heart className="w-2.5 h-2.5" /> {contact.relation}
                              </p>
                           </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700 hover:bg-transparent"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {contacts.length === 0 && (
                <div className="col-span-full border border-dashed border-border/20 p-12 text-center">
                  <p className="font-mono text-xs uppercase opacity-30 italic text-foreground">No primary nodes registered in this quadrant.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
